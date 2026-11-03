#!/usr/bin/env python3
"""Validate the biomedical release and protect Electrical/International materials."""
from pathlib import Path
import argparse, hashlib, importlib.util, json, re, sys
import fitz
sys.dont_write_bytecode=True
REPO=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('download_checker',REPO/'scripts/check-tutorial-downloads.py')
helper=importlib.util.module_from_spec(spec);spec.loader.exec_module(helper)
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def normalize(text):return re.sub(r'\s+',' ',re.sub(r'\s+data-astro-cid-[\w-]+(?:="[^"]*")?','',text)).strip()
def section(text,suffix):
    m=re.search(r'<section\b[^>]*id="[^"]*'+re.escape(suffix)+r'"[^>]*>',text)
    return text[m.start():text.index('</section>',m.end())+10] if m else ''
def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--dist',type=Path,default=REPO/'dist');ap.add_argument('--baseline',type=Path,default=REPO/'reports/biomedical-release-v1/protected-baseline.json');ap.add_argument('--report',type=Path,default=REPO/'reports/biomedical-release-v1/checks.json');args=ap.parse_args()
    failures=[];checks=0
    def check(ok,message):
        nonlocal checks
        checks+=1
        if not ok:failures.append(message)
    base=json.loads(args.baseline.read_text())
    for name,sha in base['files'].items():check((REPO/name).is_file() and digest(REPO/name)==sha,'Protected source/PDF changed: '+name)
    manifest=json.loads((REPO/'public/materials/2026-2027/linear-algebra-biomedical/tutorial-downloads.json').read_text())
    for language in ['he','en']:
        entries=[e for e in manifest['files'] if e['language']==language and e['kind']=='tutorial'];check([e['number'] for e in entries]==list(range(1,16)),language+': all15 tutorials')
    for entry in list(manifest['full_books'].values())+manifest['files']:
        p=args.dist/entry['url'].lstrip('/');check(p.is_file(),'Missing biomedical asset: '+entry['url'])
        if p.is_file():
            check(digest(p)==entry['sha256'],'Biomedical asset SHA: '+entry['url'])
            with fitz.open(p) as d:check(len(d)==entry['pages'],'Biomedical asset pages: '+entry['url'])
    for name in ['teaching/index.html','teaching/2026-2027/index.html']:
        text=(args.dist/name).read_text();doc=helper.Document(text)
        check(not doc.duplicate_ids,name+': unique anchors')
        check(normalize(section(text,'-electrical'))==base['electrical_sections'].get(name),name+': unchanged Electrical recordings')
        prefix='archive-current-recordings' if name=='teaching/index.html' else 'new-recordings'
        for number in [1,2,3]:
            pattern=r'<article\b[^>]*id="'+prefix+'-biomedical-tutorial-'+str(number)+r'"[^>]*>'
            m=re.search(pattern,text)
            if not m:continue
            article=text[m.start():text.index('</article>',m.end())+10]
            for language in ['he','en']:
                check(f'/linear-algebra-biomedical/tutorial-{number:02d}-{language}.pdf' in article,name+f': biomedical recording{number}/{language}')
            check('/2026-2027/linear-algebra/tutorial-' not in article,name+f': no Electrical PDF in biomedical recording{number}')
        if name.endswith('2026-2027/index.html'):
            numbers=[int(x) for x in re.findall(r'\bdata-biomedical-tutorial="(\d+)"',text)]
            check(numbers==list(range(15,0,-1)),'Biomedical tutorials newest first')
            links=[a['attrs'].get('href','') for a in doc.anchors if 'biomedical-tutorial-downloads' in a.get('ancestors',set())]
            for number in range(1,16):
                for language in ['he','en']:check(any(f'/materials/2026-2027/linear-algebra-biomedical/tutorial-{number:02d}-{language}.pdf'==x for x in links),f'Biomedical download link{number}/{language}')
            for entry in manifest['files']:
                if entry['kind']!='tutorial':continue
                expected=manifest['full_books'][entry['language']]['url']+'#page='+str(entry['source_physical_start'])
                check(expected in links,'Correct biomedical full-book page: '+expected)
    intl=(args.dist/'teaching/international-engineering/index.html').read_text()
    check('/linear-algebra-biomedical/' not in intl and 'linear-algebra-biomedical-notes-' not in intl,'International remains on its original materials')
    check(not re.search(r'[\u0590-\u05ff]',intl),'International remains English only')
    report={'passed':not failures,'checks':checks,'protected_files':len(base['files']),'biomedical_pdf_count':34,'failures':failures};args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False));raise SystemExit(bool(failures))
if __name__=='__main__':main()
