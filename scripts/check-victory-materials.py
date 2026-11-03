#!/usr/bin/env python3
"""Verify the four current booklets and their standalone tutorial PDFs."""
from __future__ import annotations
from pathlib import Path
from html.parser import HTMLParser
import argparse, hashlib, json, re
import fitz

ROOT=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=True);self.links=[];self.resources=[];self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='a' and 'href' in a:self.links.append(a['href'])
        if 'data-pdf-path' in a:self.resources.append(a['data-pdf-path'])
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def registry(path):
    result={}
    for row in re.findall(r'\{[^{}]*\bnumber:\s*\d+[^{}]*\}',path.read_text()):
        number=int(re.search(r'\bnumber:\s*(\d+)',row).group(1))
        he=re.search(r'\bpage:\s*(\d+)',row);en=re.search(r'\benglishPage:\s*(\d+)',row)
        if he and en:result[number]={'he':int(he.group(1)),'en':int(en.group(1))}
    return result

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--dist',type=Path,default=ROOT/'dist')
    ap.add_argument('--report',type=Path,default=ROOT/'reports/victory-release/material-checks.json')
    args=ap.parse_args();checks=0;failures=[];pdf_count=0
    def check(ok,message):
        nonlocal checks
        checks+=1
        if not ok:failures.append(message)
    year=Links((args.dist/'teaching/2026-2027/index.html').read_text())
    for track,folder,total,source in [
        ('electrical','linear-algebra',13,'src/data/academicYear2026.ts'),
        ('biomedical','linear-algebra-biomedical',15,'src/data/biomedicalTutorials2026.ts'),
    ]:
        manifest=json.loads((ROOT/'public/materials/2026-2027'/folder/'tutorial-downloads.json').read_text())
        built_manifest=args.dist/'materials/2026-2027'/folder/'tutorial-downloads.json'
        check(built_manifest.is_file(),track+': built manifest exists')
        if built_manifest.is_file():check(json.loads(built_manifest.read_text())==manifest,track+': built manifest matches canonical')
        records=registry(ROOT/source);check(sorted(records)==list(range(1,total+1)),track+': registry covers all tutorials')
        books={}
        for language,entry in manifest['full_books'].items():
            canonical=ROOT/'public'/entry['url'].lstrip('/');path=args.dist/entry['url'].lstrip('/')
            check(path.is_file(),track+': full book exists '+language)
            if not path.is_file():continue
            check(sha(path)==entry['sha256'],track+': full book manifest SHA '+language)
            check(path.read_bytes()==canonical.read_bytes(),track+': full book canonical bytes '+language)
            books[language]=fitz.open(path);pdf_count+=1
            check(len(books[language])==entry['pages'],track+': full book pages '+language)
        check(len(manifest['files'])==total*2+2,track+': numbered and supplementary PDF count')
        for language in ['he','en']:
            numbered=[e for e in manifest['files'] if e['kind']=='tutorial' and e['language']==language]
            check([e['number'] for e in numbered]==list(range(1,total+1)),track+': all numbered tutorials '+language)
        for entry in manifest['files']:
            canonical=ROOT/'public'/entry['url'].lstrip('/');path=args.dist/entry['url'].lstrip('/')
            check(path.is_file(),track+': split PDF exists '+entry['url'])
            if not path.is_file():continue
            check(sha(path)==entry['sha256'],track+': split PDF manifest SHA '+entry['url'])
            check(path.read_bytes()==canonical.read_bytes(),track+': split PDF canonical bytes '+entry['url'])
            part=fitz.open(path);pdf_count+=1
            check(len(part)==entry['pages'],track+': split PDF pages '+entry['url'])
            book=books.get(entry['language'])
            if book is not None:
                start=entry['source_physical_start']-1;end=entry['source_physical_end']-1
                check(0<=start<=end<len(book),track+': source bounds '+entry['url'])
                check(end-start+1==len(part),track+': split physical page count '+entry['url'])
                if 0<=start<=end<len(book) and end-start+1==len(part):
                    check(all(part[i].get_text()==book[start+i].get_text() for i in range(len(part))),track+': exact split text '+entry['url'])
                    check(all(part[i].get_label()==book[start+i].get_label() for i in range(len(part))),track+': original page labels '+entry['url'])
                check(part[0].get_label()==entry['original_page_label_start'] and part[-1].get_label()==entry['original_page_label_end'],track+': manifest page labels '+entry['url'])
            for page in part:
                check(all(link['kind']==fitz.LINK_URI or (link['kind']==fitz.LINK_GOTO and 0<=link.get('page',-1)<len(part)) for link in page.get_links()),track+': valid split PDF links '+entry['url'])
            if entry['kind']=='tutorial':
                wanted=manifest['full_books'][entry['language']]['url']+'#page='+str(entry['source_physical_start'])
                check(wanted in year.links,track+': year booklet page link '+wanted)
                check(entry['url'] in year.links or entry['url'] in year.resources,track+': year individual PDF link '+entry['url'])
                check(records.get(entry['number'],{}).get(entry['language'])==entry['source_physical_start'],track+': registry booklet page offset '+entry['url'])
            part.close()
        for book in books.values():book.close()
    check(pdf_count==64,'All four booklets and60standalone PDFs verified')
    report={'passed':not failures,'checks':checks,'verified_pdfs':pdf_count,'failures':failures}
    args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));raise SystemExit(bool(failures))
if __name__=='__main__':main()
