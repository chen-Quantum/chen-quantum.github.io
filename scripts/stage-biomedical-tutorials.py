#!/usr/bin/env python3
"""Stage biomedical PDFs only; retain all existing Electrical/International assets."""
from pathlib import Path
import argparse, hashlib, importlib.util, json, re, shutil, tempfile, sys
import fitz

sys.dont_write_bytecode=True
REPO=Path(__file__).resolve().parents[1]
BASE=REPO/'public/materials/2026-2027'
OUT=BASE/'linear-algebra-biomedical'
SOURCES={'he':'linear-algebra-biomedical-notes-he.pdf','en':'linear-algebra-biomedical-notes-en.pdf'}
spec=importlib.util.spec_from_file_location('existing_pdf_splitter',REPO/'scripts/split-linear-algebra-tutorials.py')
helper=importlib.util.module_from_spec(spec);spec.loader.exec_module(helper)
def digest(data):return hashlib.sha256(data).hexdigest()

def extract(source,start,end,lang,number,title,full_url,name,source_hash):
    doc=fitz.open();doc.insert_pdf(source,from_page=start,to_page=end,links=False,annots=True)
    internal,external=helper.copy_links(source,doc,start,end,full_url)
    heading=(f'תרגול {number}: {title}' if lang=='he' else f'Tutorial {number}: {title}') if number else title
    metadata=source.metadata.copy();metadata.update(title=heading,author='Chen Gadi',subject='אלגברה לינארית להנדסה ביו רפואית' if lang=='he' else 'Linear Algebra for Biomedical Engineering')
    doc.set_metadata(metadata);doc.set_toc([[1,heading,1]])
    first_label=source[start].get_label();assert first_label.isdecimal(),first_label
    doc.set_page_labels([{'startpage':0,'prefix':'','style':'D','firstpagenum':int(first_label)}])
    identity=hashlib.md5((source_hash+lang+str(start)+str(end)).encode()).hexdigest()
    doc.xref_set_key(-1,'ID',f'[<{identity}><{identity}>]')
    with tempfile.TemporaryDirectory(prefix='biomedical_tutorial_') as td:
        p=Path(td)/name;doc.save(p,garbage=4,deflate=True,no_new_id=True);raw=p.read_bytes()
    (OUT/name).write_bytes(raw);result=fitz.open(stream=raw,filetype='pdf')
    assert len(result)==end-start+1
    for index,page in enumerate(result):
        original=source[start+index]
        assert page.get_text()==original.get_text(),(name,index,'text')
        assert page.rect==original.rect and page.get_label()==original.get_label(),(name,index,'labels')
        for link in page.get_links():assert link['kind']==fitz.LINK_URI or (link['kind']==fitz.LINK_GOTO and 0<=link['page']<len(result))
    for index in {0,len(result)-1}:assert result[index].get_pixmap().samples==source[start+index].get_pixmap().samples,(name,index,'render')
    return {'kind':'tutorial' if number else 'enrichment','number':number,'language':lang,'title':title,'url':'/materials/2026-2027/linear-algebra-biomedical/'+name,'source_url':full_url,'source_physical_start':start+1,'source_physical_end':end+1,'pages':len(result),'original_page_label_start':first_label,'original_page_label_end':source[end].get_label(),'sha256':digest(raw),'bytes':len(raw),'internal_links':internal,'external_links':external}

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--he',type=Path,required=True);parser.add_argument('--en',type=Path,required=True);parser.add_argument('--report-dir',type=Path,default=REPO/'reports/biomedical-release-v1');args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True);args.report_dir.mkdir(parents=True,exist_ok=True)
    manifest={'schema_version':1,'track':'biomedical','full_books':{},'files':[]};maps={}
    for lang,input_path in [('he',args.he),('en',args.en)]:
        raw=input_path.read_bytes();assert raw.startswith(b'%PDF-');doc=fitz.open(stream=raw,filetype='pdf')
        chapters=[x for x in doc.get_toc() if x[0]==1];assert len(chapters)>=17,(lang,chapters)
        tutorials=chapters[1:16];assert len(tutorials)==15
        starts=[x[2]-1 for x in tutorials]+[chapters[16][2]-1,len(doc)];assert starts==sorted(set(starts))
        full_url='/materials/2026-2027/'+SOURCES[lang];shutil.copy2(input_path,BASE/SOURCES[lang])
        manifest['full_books'][lang]={'url':full_url,'pages':len(doc),'sha256':digest(raw),'bytes':len(raw)}
        maps[lang]={'starts':[x+1 for x in starts[:15]],'enrichment':starts[15]+1,'pages':len(doc)}
        for i,entry in enumerate(tutorials):manifest['files'].append(extract(doc,starts[i],starts[i+1]-1,lang,i+1,entry[1],full_url,f'tutorial-{i+1:02d}-{lang}.pdf',digest(raw)))
        title='העשרה ותרגול נוסף' if lang=='he' else 'Supplementary Material and Further Practice'
        manifest['files'].append(extract(doc,starts[15],len(doc)-1,lang,None,title,full_url,f'enrichment-{lang}.pdf',digest(raw)))
    assert len(manifest['files'])==32
    target=OUT/'tutorial-downloads.json';target.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    registry=REPO/'src/data/biomedicalTutorials2026.ts';text=registry.read_text();seen=[]
    def update(m):
        entry=m.group(0);number=int(re.search(r'\bnumber:\s*(\d+)',entry).group(1));assert 1<=number<=15
        entry,a=re.subn(r'\bpage:\s*\d+',f'page: {maps["he"]["starts"][number-1]}',entry)
        entry,b=re.subn(r'\benglishPage:\s*\d+',f'englishPage: {maps["en"]["starts"][number-1]}',entry);assert (a,b)==(1,1)
        seen.append(number);return entry
    text=re.sub(r'\{[^{}]*\bnumber:\s*\d+[^{}]*\}',update,text);assert sorted(seen)==list(range(1,16));registry.write_text(text)
    assets=['public'+x['url'] for x in manifest['full_books'].values()]+['public'+x['url'] for x in manifest['files']]+[str(target.relative_to(REPO)),'src/data/biomedicalTutorials2026.ts']
    report={'status':'staged','published':False,'books':manifest['full_books'],'page_map':maps,'tutorials':30,'enrichment_pdfs':2,'assets':assets}
    (args.report_dir/'page-map.json').write_text(json.dumps(maps,ensure_ascii=False,indent=2)+'\n');(args.report_dir/'staging.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'status':'staged','tutorials':30,'enrichment':2,'manifest':str(target)}))
if __name__=='__main__':main()
