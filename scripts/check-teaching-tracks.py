#!/usr/bin/env python3
"""Check the three current teaching routes and preserve recordings and activities."""
from __future__ import annotations
from pathlib import Path
from html.parser import HTMLParser
import argparse, hashlib, json, re

ROOT = Path(__file__).resolve().parents[1]
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

class Node:
    def __init__(self, tag='', attrs=None, order=0):
        self.tag, self.attrs, self.order = tag, dict(attrs or []), order
        self.children = []
    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node): yield from child.walk()
    def text(self):
        return ''.join(child.text() if isinstance(child, Node) else child for child in self.children)
    def links(self):
        return [x.attrs.get('href','') for x in self.walk() if x.tag == 'a']

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.root = Node(); self.stack = [self.root]; self.counter = 0
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.counter += 1
        node = Node(tag, attrs, self.counter); self.stack[-1].children.append(node)
        if tag not in VOID: self.stack.append(node)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID: self.handle_endtag(tag)
    def handle_endtag(self, tag):
        for index in range(len(self.stack)-1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]; return
    def handle_data(self, text): self.stack[-1].children.append(text)
    def nodes(self): return list(self.root.walk())

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def read_doc(path): return Document(path.read_text())
def recording_map(doc):
    rows = {}
    for node in doc.nodes():
        identifier = node.attrs.get('id','')
        if node.tag == 'article' and re.fullmatch(r'(?:archive-current-recordings|new-recordings)-(?:biomedical|electrical)-tutorial-\d+', identifier):
            rows[identifier] = sorted(x.attrs['data-embed'] for x in node.walk() if 'data-embed' in x.attrs)
    return rows

def capture(dist, baseline):
    result = {'recordings':{}, 'activities':{}, 'international_sources':{}}
    for page in ['teaching/index.html','teaching/2026-2027/index.html']:
        result['recordings'][page] = recording_map(read_doc(dist/page))
    for page in ['teaching/linear-algebra/lab/index.html','teaching/linear-algebra/lab/en/index.html']:
        result['activities'][page] = sorted(x.attrs['id'] for x in read_doc(dist/page).nodes() if re.fullmatch(r'tutorial-\d+',x.attrs.get('id','')))
    for source in ['src/pages/teaching/international-engineering.astro','src/components/FeaturedInternationalEngineering.astro','src/data/youtubeVideos.ts']:
        result['international_sources'][source] = sha(ROOT/source)
    baseline.parent.mkdir(parents=True,exist_ok=True); baseline.write_text(json.dumps(result,indent=2)+'\n')
    unique = sorted({item for rows in result['recordings'].values() for items in rows.values() for item in items})
    print(json.dumps({'captured':True,'unique_current_recordings':len(unique),'lab_activity_counts':{p:len(ids) for p,ids in result['activities'].items()}}))

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dist',type=Path,default=ROOT/'dist')
    parser.add_argument('--baseline',type=Path,default=ROOT/'reports/victory-release/baseline.json')
    parser.add_argument('--report',type=Path,default=ROOT/'reports/victory-release/teaching-tracks-checks.json')
    parser.add_argument('--capture',action='store_true');args=parser.parse_args()
    if args.capture: return capture(args.dist,args.baseline)
    baseline=json.loads(args.baseline.read_text());failures=[];checks=0
    def check(ok, description):
        nonlocal checks
        checks+=1
        if not ok:failures.append(description)
    doc=read_doc(args.dist/'teaching/index.html');nodes=doc.nodes()
    cards=[n for n in nodes if n.attrs.get('data-teaching-track')]
    check([n.attrs['data-teaching-track'] for n in cards]==['biomedical','electrical','international'],'Three visible course cards in the requested order')
    current=[n for n in nodes if n.attrs.get('id')=='archive-current-recordings']
    check(len(current)==1,'Current recordings remain on the landing page')
    if current: check(all(n.order<current[0].order for n in cards),'All three course cards appear before the recordings')
    profiles={
      'biomedical':{'books':['/materials/2026-2027/linear-algebra-biomedical-notes-he.pdf','/materials/2026-2027/linear-algebra-biomedical-notes-en.pdf'],'weekly':'/teaching/2026-2027/#biomedical-tutorial-downloads','recordings':'#archive-current-recordings-biomedical'},
      'electrical':{'books':['/materials/2026-2027/linear-algebra-engineering-notes.pdf','/materials/2026-2027/linear-algebra-engineering-tutorials-en.pdf'],'weekly':'/teaching/2026-2027/#tutorial-downloads','recordings':'#archive-current-recordings-electrical'},
      'international':{'books':['/materials/2026-2027/linear-algebra-engineering-tutorials-en.pdf'],'weekly':'/teaching/international-engineering/#tutorial-downloads','recordings':None},
    }
    for card in cards:
        key=card.attrs['data-teaching-track'];profile=profiles.get(key)
        if not profile:continue
        links=card.links();text=card.text()
        resources=links+[n.attrs['data-pdf-path'] for n in card.walk() if 'data-pdf-path' in n.attrs]
        for book in profile['books']:check(book in resources,key+': correct full-book download '+book)
        check(profile['weekly'] in links,key+': weekly tutorial list')
        if profile['recordings']:check(profile['recordings'] in links,key+': recording section')
        if key=='international':
            check(not re.search(r'[\u0590-\u05ff]',text),'International course card is English only')
            check(not any(re.search(r'(?:-he\.pdf|engineering-notes\.pdf|biomedical)',x) for x in resources),'International card has only its English materials')
    for page,expected in baseline['recordings'].items():
        current_map=recording_map(read_doc(args.dist/page))
        check(current_map==expected,page+': all current recording IDs and embeds preserved')
    for page,expected in baseline['activities'].items():
        activities=sorted(n.attrs['id'] for n in read_doc(args.dist/page).nodes() if re.fullmatch(r'tutorial-\d+',n.attrs.get('id','')))
        check(activities==expected,page+': all 13 activity anchors preserved')
        check(len(activities)==13,page+': thirteen activities')
    for source,expected in baseline['international_sources'].items():check(sha(ROOT/source)==expected,'Preserved source: '+source)
    intl=(args.dist/'teaching/international-engineering/index.html').read_text()
    check(not re.search(r'[\u0590-\u05ff]',intl),'International route remains English only')
    for number in range(1,14):
        check(f'/materials/2026-2027/linear-algebra/tutorial-{number:02d}-en.pdf' in intl,'International tutorial '+str(number)+' remains linked')
    check('tutorial-01-he.pdf' not in intl and 'linear-algebra-biomedical/' not in intl,'International route has no Hebrew or biomedical tutorial links')
    # Generic classroom cards must route each track to its own numbered sheets.
    for name in ['linear-algebra-biomedical','linear-algebra-electrical']:
        classroom=[n for n in nodes if n.attrs.get('data-course-id')==name]
        if classroom:
            wanted='/teaching/2026-2027/#'+('biomedical-tutorial-downloads' if name.endswith('biomedical') else 'tutorial-downloads')
            check(any(wanted in n.links() for n in classroom),name+': classroom card points to its own materials')
    report={'passed':not failures,'checks':checks,'course_cards':[n.attrs['data-teaching-track'] for n in cards],'failures':failures}
    args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));raise SystemExit(bool(failures))
if __name__=='__main__':main()
