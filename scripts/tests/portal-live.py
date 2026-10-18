"""Live API verification. Read temporary QA credentials/class code from stdin.

Creates marked test records. The caller must remove the reported actor hashes
and the temporary auth user afterward. No email is sent by this test.
"""
import hashlib
import json
import secrets
import sys
import termios
import urllib.request
import urllib.error

class HttpResponse:
    def __init__(self, response):
        self.status_code = response.code
        self.headers = response.headers
        self.body = response.read()

    def json(self):
        return json.loads(self.body)

class Http:
    def request(self, method, url, headers=None, json=None, timeout=35):
        data = None if json is None else __import__('json').dumps(json).encode()
        request = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return HttpResponse(response)
        except urllib.error.HTTPError as response:
            return HttpResponse(response)

    def post(self, url, **kwargs): return self.request('POST', url, **kwargs)
    def get(self, url, **kwargs): return self.request('GET', url, **kwargs)
    def options(self, url, **kwargs): return self.request('OPTIONS', url, **kwargs)

requests = Http()

BASE = 'https://ccrthybyqhbnrclxomls.supabase.co'
PUBLIC = 'sb_publishable_ZKc3ePy8loeTC8FNnyc-wg_F1qPai9B'
if sys.stdin.isatty():
    attrs = termios.tcgetattr(sys.stdin)
    attrs[3] &= ~termios.ECHO
    termios.tcsetattr(sys.stdin, termios.TCSANOW, attrs)
print('Ready for private QA JSON on stdin.', flush=True)
settings = json.loads(sys.stdin.readline())
key_a, key_b, key_staff = [secrets.token_hex(32) for _ in range(3)]
actor_hashes = [hashlib.sha256(k.encode()).hexdigest() for k in [key_a,key_b,key_staff]]
print(json.dumps({'cleanup_actor_hashes':actor_hashes}), flush=True)
course = settings['course']
checks = 0

def check(condition, label):
    global checks
    assert condition, label
    checks += 1
    print('PASS '+label, flush=True)

def call(action, key=key_a, expected=200, token=None, **params):
    headers={'Content-Type':'application/json','apikey':PUBLIC,'x-portal-key':key}
    if token:
        headers['Authorization']='Bearer '+token
    response=requests.post(BASE+'/functions/v1/student-portal', headers=headers,
                           json={'action':action,'course':course,**params},timeout=35)
    check(response.status_code==expected, action+' HTTP '+str(expected)+' (actual '+str(response.status_code)+', '+str(response.json().get('error','ok'))+')')
    return response.json()

try:
    config=call('config')
    check(len(config['courses'])==4 and 'access_code' not in json.dumps(config),'config never exposes class codes')
    call('board',expected=403)
    call('join',expected=403,code='WRONG-CODE')
    call('join',code=settings['code'])
    call('join',key=key_b,code=settings['code'])
    check(course in call('memberships')['courses'],'class membership persists')
    question=call('question',expected=201,title='[PORTAL QA] Concept check',body='[PORTAL QA] <img src=x onerror=alert(1)> is inert text.',category='concept')['id']
    call('answer',key=key_b,id=question,body='[PORTAL QA] Anonymous peer answer',official=True)
    board_a=call('board')['questions']
    own=next(q for q in board_a if q['id']==question)
    check(own['own'] and not own['answers'][0]['official'],'student cannot forge an official reply')
    serialized=json.dumps(own)
    check('actor_hash' not in serialized and key_a not in serialized and key_b not in serialized,'public questions and replies contain no identity keys')
    board_b=call('board',key=key_b)['questions']
    check(not next(q for q in board_b if q['id']==question)['own'],'question ownership stays private to each visitor')
    call('vote',key=key_b,id=question,active=True)
    call('vote',key=key_b,id=question,active=True)
    voted=next(q for q in call('board')['questions'] if q['id']==question)
    check(voted['votes']==1,'votes are idempotent per visitor')
    call('moderate_question',key=key_b,id=question,hidden=True,expected=403)
    call('dashboard',expected=403)
    ticket=call('ticket',expected=201,subject='[PORTAL QA] Private request',body='[PORTAL QA] This private content belongs only to A.',student_name='[PORTAL QA]',category='material')['id']
    own_tickets=call('tickets')['tickets']
    check(any(t['id']==ticket for t in own_tickets),'sender can retrieve a private ticket')
    check(all(t['id']!=ticket for t in call('tickets',key=key_b)['tickets']),'another student cannot list a private ticket')
    call('ticket_message',key=key_b,id=ticket,body='Intrusion attempt',expected=404)
    call('ticket_status',id=ticket,status='resolved',expected=403)

    auth=requests.post(BASE+'/auth/v1/token?grant_type=password',headers={'apikey':PUBLIC,'Content-Type':'application/json'},json={'email':settings['staff']['email'],'password':settings['staff']['pass']},timeout=35)
    check(auth.status_code==200,'temporary instructor can sign in without sending email')
    token=auth.json()['access_token']
    dashboard=call('dashboard',key=key_staff,token=token)
    check(dashboard['open_questions']>=1 and dashboard['open_tickets']>=1,'instructor dashboard counts live questions and requests')
    check(any(c.get('access_code')==settings['code'] for c in dashboard['courses']),'class codes are available to verified instructor')
    call('answer',key=key_staff,token=token,id=question,body='[PORTAL QA] Official instructor answer')
    answered=next(q for q in call('board')['questions'] if q['id']==question)
    check(answered['status']=='answered' and any(a['official'] for a in answered['answers']),'instructor reply is official and updates question status')
    call('moderate_question',key=key_staff,token=token,id=question,pinned=True,hidden=True)
    check(all(q['id']!=question for q in call('board')['questions']),'hidden question disappears from student board')
    call('answer',id=question,body='Hidden thread attempt',expected=404)
    call('moderate_question',key=key_staff,token=token,id=question,hidden=False,status='closed')
    call('answer',key=key_b,id=question,body='Closed thread attempt',expected=409)
    call('moderate_question',key=key_staff,token=token,id=question,status='open')
    staff_tickets=call('tickets',key=key_staff,token=token)['tickets']
    check(any(t['id']==ticket for t in staff_tickets),'instructor can read student private requests')
    call('ticket_message',key=key_staff,token=token,id=ticket,body='[PORTAL QA] Private instructor reply')
    private_reply=next(t for t in call('tickets')['tickets'] if t['id']==ticket)
    check(private_reply['messages'][0]['official'] and private_reply['status']=='in_progress','student receives a private official reply with status')
    call('ticket_status',key=key_staff,token=token,id=ticket,status='resolved')
    call('ticket_message',id=ticket,body='[PORTAL QA] Follow-up reopens request')
    check(next(t for t in call('tickets')['tickets'] if t['id']==ticket)['status']=='open','student follow-up reopens resolved request')
    call('join',course='general')
    call('board',course='general',expected=403)
    call('ticket',course='general',expected=201,subject='[PORTAL QA] General inquiry',body='[PORTAL QA] General private contact without class code.',category='other')
    call('answer',id='bad-id',body='Invalid id',expected=400)
    call('dashboard',key=key_b,token='invalid-token',expected=401)
    for table in ['courses','staff','memberships','questions','answers','votes','tickets','ticket_messages','rate_limits']:
        direct=requests.get(BASE+'/rest/v1/student_portal_'+table+'?select=*',headers={'apikey':PUBLIC},timeout=35)
        check(direct.status_code in [401,403],'direct browser access denied: '+table)
    denied=requests.post(BASE+'/functions/v1/student-portal',headers={'Origin':'https://untrusted.example','Content-Type':'application/json'},json={'action':'config'},timeout=35)
    check(denied.status_code==403 and 'Access-Control-Allow-Origin' not in denied.headers,'untrusted browser origin rejected')
    cors=requests.options(BASE+'/functions/v1/student-portal',headers={'Origin':'https://chen-quantum.github.io','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'x-portal-key,content-type'},timeout=35)
    check(cors.status_code==204 and cors.headers.get('Access-Control-Allow-Origin')=='https://chen-quantum.github.io','GitHub Pages CORS preflight succeeds')
    requests.post(BASE+'/auth/v1/logout',headers={'apikey':PUBLIC,'Authorization':'Bearer '+token},timeout=35)
    print(json.dumps({'passed':checks,'cleanup_actor_hashes':actor_hashes}),flush=True)
finally:
    print('QA complete; caller must clean temporary records and auth user.',flush=True)
