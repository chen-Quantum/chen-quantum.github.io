#!/usr/bin/env python3
"""Extract all tutorials from the full course books without changing page content.

Requires PyMuPDF. Run from any directory after updating the full PDF assets.
Chapter ranges come from the books' navigation bookmarks, not fixed offsets.
"""
from pathlib import Path
import hashlib
import json
import tempfile
import fitz

REPO=Path(__file__).resolve().parents[1]
BASE=REPO/'public/materials/2026-2027'
OUT=BASE/'linear-algebra'
ORIGIN='https://chengadi.science'
SOURCES={
 'he':'linear-algebra-engineering-notes.pdf',
 'en':'linear-algebra-engineering-tutorials-en.pdf',
}

def digest(data):return hashlib.sha256(data).hexdigest()

def copy_links(source, target, start, end, full_url):
    internal=external=0
    for index in range(start,end+1):
        page=target[index-start]
        for link in source[index].get_links():
            if link['kind']==fitz.LINK_URI:
                page.insert_link({'kind':fitz.LINK_URI,'from':link['from'],'uri':link['uri']})
                external+=1
            elif link['kind'] in {fitz.LINK_GOTO,fitz.LINK_NAMED} and link.get('page',-1)>=0:
                destination=link['page']
                if start<=destination<=end:
                    point=link.get('to',fitz.Point(0,0))
                    if link['kind']==fitz.LINK_NAMED:
                        # Resolved named destinations expose native PDF coordinates.
                        point=point*source[destination].transformation_matrix
                    page.insert_link({'kind':fitz.LINK_GOTO,'from':link['from'],
                      'page':destination-start,'to':point,
                      'zoom':link.get('zoom',0)})
                    internal+=1
                else:
                    page.insert_link({'kind':fitz.LINK_URI,'from':link['from'],
                      'uri':ORIGIN+full_url+'#page='+str(destination+1)})
                    external+=1
            else:
                raise ValueError(f'Unsupported source link on page {index+1}: {link}')
    return internal,external

def extract(source, start, end, lang, number, title, full_url, name, source_hash):
    doc=fitz.open()
    doc.insert_pdf(source,from_page=start,to_page=end,links=False,annots=True)
    internal,external=copy_links(source,doc,start,end,full_url)
    heading=(f'תרגול {number}: {title}' if lang=='he' else f'Tutorial {number}: {title}') if number else title
    metadata=source.metadata.copy()
    metadata.update(title=heading,author='Chen Gadi',subject=('אלגברה לינארית להנדסות' if lang=='he' else 'Linear Algebra for Engineering'))
    doc.set_metadata(metadata)
    doc.set_toc([[1,heading,1]])
    first_label=source[start].get_label()
    assert first_label.isdecimal(),first_label
    doc.set_page_labels([{'startpage':0,'prefix':'','style':'D','firstpagenum':int(first_label)}])
    # Stable IDs avoid unrelated binary diffs when the same source is extracted again.
    identity=hashlib.md5((source_hash+lang+str(start)+str(end)).encode()).hexdigest()
    doc.xref_set_key(-1,'ID',f'[<{identity}><{identity}>]')
    with tempfile.TemporaryDirectory(prefix='linear_tutorial_') as td:
        native=Path(td)/name
        doc.save(native,garbage=4,deflate=True,no_new_id=True)
        data=native.read_bytes()
    path=OUT/name;path.write_bytes(data)
    result=fitz.open(stream=data,filetype='pdf')
    assert len(result)==end-start+1
    assert result.get_toc()[0][2]==1
    for index,p in enumerate(result):
        original=source[start+index]
        assert p.get_text()==original.get_text(),(name,index,'text changed')
        assert p.rect==original.rect and p.get_label()==original.get_label()
        for link in p.get_links():
            assert link['kind']==fitz.LINK_URI or (link['kind']==fitz.LINK_GOTO and 0<=link['page']<len(result))
    for index in {0,len(result)-1}:
        assert result[index].get_pixmap().samples==source[start+index].get_pixmap().samples,(name,index,'render changed')
    return {'kind':'tutorial' if number else 'appendix','number':number,'language':lang,
      'title':title,'url':'/materials/2026-2027/linear-algebra/'+name,
      'source_url':full_url,'source_physical_start':start+1,'source_physical_end':end+1,
      'pages':len(result),'original_page_label_start':first_label,
      'original_page_label_end':source[end].get_label(),'sha256':digest(data),'bytes':len(data),
      'internal_links':internal,'external_links':external}

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    manifest={'schema_version':1,'full_books':{},'files':[]}
    for lang,name in SOURCES.items():
        raw=(BASE/name).read_bytes();doc=fitz.open(stream=raw,filetype='pdf')
        toc=doc.get_toc();chapters=[x for x in toc if x[0]==1]
        assert len(chapters)==15,(lang,'Expected intro,13tutorials,appendix')
        tutorials=chapters[1:14];appendix=chapters[-1]
        starts=[x[2]-1 for x in tutorials]+[appendix[2]-1,len(doc)]
        assert starts==sorted(set(starts))
        full_url='/materials/2026-2027/'+name
        manifest['full_books'][lang]={'url':full_url,'pages':len(doc),'sha256':digest(raw)}
        for i,entry in enumerate(tutorials):
            filename=f'tutorial-{i+1:02}-{lang}.pdf'
            manifest['files'].append(extract(doc,starts[i],starts[i+1]-1,lang,i+1,entry[1],full_url,filename,digest(raw)))
        manifest['files'].append(extract(doc,starts[13],len(doc)-1,lang,None,appendix[1],full_url,f'logic-appendix-{lang}.pdf',digest(raw)))
    assert len(manifest['files'])==28
    target=OUT/'tutorial-downloads.json'
    target.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'files':len(manifest['files']),'bytes':sum(x['bytes'] for x in manifest['files']),'manifest':str(target)}))

if __name__=='__main__':main()
