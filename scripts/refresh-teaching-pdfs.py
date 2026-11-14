#!/usr/bin/env python3
"""Update student-facing text in existing tutorial PDFs without altering pagination.

The full booklet is modified once; chapter PDFs are recreated from its physical
page ranges in the existing release manifest. Source notices required for
attribution are kept, while editorial/process details are removed.
"""
from __future__ import annotations
import argparse
from collections import Counter
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile
import fitz

MARKER = "teaching-pdf-editorial-v2"
FONT_DIRECTORY = Path("/usr/share/fonts/truetype/dejavu")
FONT_HE = "DejaVuSans-Bold.ttf"
FONT_EN = "DejaVuSans-Bold.ttf"
HE_CLOSINGS = [
 "ניצחון!",
 "באנו, ראינו, כבשנו!!!",
 "וסיימנו. ניצחון!",
 "תנו לי נ'! תנו לי י'! תנו לי צ'!... מה יצא? ניצחון!",
 "עוד אחד מאחורינו. ניצחון!",
 "הגביע נשאר אצלנו. ניצחון!",
 "וזהו. ניצחון!",
 "מי אמר לינארית ולא קיבל? ניצחון!",
 "סגרנו את הפינה. ניצחון!",
 "הקהל בטירוף. ניצחון!",
 "חשבנו, הוכחנו, ניצחנו!",
 "קדימה, עוד אחד לכיס. ניצחון!",
 "נ-י-צ-ח-ו-ן!",
 "באנו להוכיח. יצאנו מנצחים!",
 "תנו כפיים לעצמכם. ניצחון!",
 "יששש! ניצחון!",
]
EN_CLOSINGS = [
 "Victory!",
 "We came, we saw, we conquered!",
 "And we're done. Victory!",
 "Give me a V! Give me an I! Give me a C! Victory!",
 "Another one down. Victory!",
 "The trophy is ours. Victory!",
 "That does it. Victory!",
 "Linear algebra wins again!",
 "All wrapped up. Victory!",
 "The crowd goes wild. Victory!",
 "Think. Prove. Win!",
 "Another one in the bag. Victory!",
 "V-I-C-T-O-R-Y!",
 "Came to prove. Left with a win!",
 "Give yourselves a hand. Victory!",
 "Yesss! Victory!",
]
assert len(HE_CLOSINGS) == len(EN_CLOSINGS) == 16

# The generated PDF stores the RTL exclamation at the beginning of a span.
# Both normal and letter-by-letter victory chants are handled.
def is_victory(text: str, language: str, color: int, font: str, size: float) -> bool:
    if color != 0x087F8C or size < 8.0 or size > 11.5 or "Bold" not in font:
        return False
    if language == "he":
        return ("ניצחון" in text or "ן-ו-ח-צ-י-נ" in text or "ן-ו-ח-צ-י" in text)
    return ("Victory!" in text or "V-I-C-T-O-R-Y" in text or "Think. Prove. Win" in text)


def exam_caption(text: str, language: str) -> str | None:
    if language != "he":
        return None
    if not (("מבחן הקורס" in text or "מקור: המבחן" in text) and ("מועד" in text or "שאלה" in text)):
        return None
    if len(text) > 460:  # avoid touching question bodies or long examples
        return None
    match = re.search(r"תשפ[\"״'][א-ת]", text)
    year = match.group(0).replace('"','״').replace("'",'״') if match else ""
    if "ביו" in text:
        course = "לינארית לביו-רפואה"
    elif "חשמל" in text:
        course = "לינארית לחשמל"
    else:
        course = "לינארית"
    lecturer_match = re.search(r"מרצה\s*:\s*([^;.]+)", text)
    lecturer = lecturer_match.group(1).strip() if lecturer_match else ""
    # A numbered-list marker might share the span with the source citation.
    out = f"מבחן {course}"
    if year:
        out += f", {year}"
    if lecturer:
        out += f". מרצה: {lecturer}"
    return out + "."


def editorial_caption(text: str, language: str) -> tuple[str|None,bool]:
    """Return (replacement, is_process_note). Avoid deleting source attribution."""
    if language == "he":
        if "עיבוד לפי" in text and ("MIT" in text or "Oxford" in text):
            # Preserve source credit; drop the sentence about changed numbers.
            return ("MIT OpenCourseWare, 18.06." if "MIT" in text else "מקור: Oxford."), True
        if ("הנתונים המספריים הוחלפו" in text or
            "המספרים הוחלפו" in text or "מספרים שונו" in text):
            return "", True
    else:
        if ("Adapted from" in text and ("MIT" in text or "Oxford" in text)):
            return ("MIT OpenCourseWare, 18.06." if "MIT" in text else "Source: Oxford."), True
        if ("numerical data were changed" in text.lower() or
            "numerical values have been changed" in text.lower()):
            return "", True
    return None, False


def redaction_rect(span: dict) -> fitz.Rect:
    box = fitz.Rect(span["bbox"])
    return fitz.Rect(box.x0 - .3, box.y0 - .6, box.x1 + .35, box.y1 + .6)


def insert_caption(page: fitz.Page, original: dict, caption: str, language: str,
                   archive: fitz.Archive, *, color: str = "#087f8c") -> None:
    if not caption:
        return
    r = fitz.Rect(original["bbox"])
    # Use the original right alignment so no adjacent equation is displaced.
    size = min(original["size"], 10.0)
    typeface=fitz.Font(fontfile=str(FONT_DIRECTORY/'DejaVuSans-Bold.ttf'))
    requested_width=typeface.text_length(caption,fontsize=size)*1.03 + 6
    right=min(page.rect.width-40,r.x1+1)
    left=max(55,right-requested_width)
    box=fitz.Rect(left,r.y0-2.8,right,r.y1+4.8)
    if language == "he":
        import html
        body = '<div dir="rtl" style="margin:0;padding:0">' + html.escape(caption) + '</div>'
    else:
        import html
        body = '<div dir="ltr" style="margin:0;padding:0">' + html.escape(caption) + '</div>'
    css = ("@font-face{font-family:Teaching;src:url('DejaVuSans-Bold.ttf')}"
           "div{font-family:Teaching;font-weight:700;"
           f"color:{color};font-size:{size}pt;line-height:1.08;"
           + ("text-align:right" if language == "he" else "text-align:left") + "}")
    spare, scale = page.insert_htmlbox(box, body, css=css, archive=archive, scale_low=.65)
    if spare < 0 or scale < .76:
        raise RuntimeError(f"Caption overflow on p.{page.number + 1}: {caption!r}; scale={scale}")


def update_document(input_pdf: Path, language: str) -> dict:
    archive=fitz.Archive(str(FONT_DIRECTORY))
    doc=fitz.open(input_pdf)
    if MARKER in (doc.metadata.get('keywords') or ''):
        pages=len(doc);doc.close();return {"skipped":True,"pages":pages}
    changes=Counter();victory_idx=0
    for page in doc:
        replacements=[]
        for block in page.get_text('dict')['blocks']:
            for line in block.get('lines',[]):
                for span in line.get('spans',[]):
                    text=span['text']
                    if is_victory(text,language,span['color'],span['font'],span['size']):
                        replacement=(HE_CLOSINGS if language=='he' else EN_CLOSINGS)[victory_idx % 16]
                        victory_idx+=1
                        replacements.append((span,replacement,'victory'))
                    else:
                        exam=exam_caption(text,language)
                        if exam is not None:
                            replacements.append((span,exam,'exam'))
                        else:
                            cap,has=editorial_caption(text,language)
                            if has:
                                replacements.append((span,cap,'editorial'))
        if not replacements:
            continue
        for span,_,_ in replacements:
            page.add_redact_annot(redaction_rect(span),fill=(1,1,1))
        page.apply_redactions(images=0,graphics=0,text=0)
        for span,new,kind in replacements:
            if new:
                insert_caption(page,span,new,language,archive,
                               color='#087f8c' if kind=='victory' else '#516475')
            changes[kind]+=1
    md=dict(doc.metadata)
    md['keywords']=(md.get('keywords') or '').strip()+('; ' if md.get('keywords') else '')+MARKER
    doc.set_metadata(md)
    temp=input_pdf.with_name(input_pdf.name+'.tmp.pdf')
    doc.subset_fonts()
    doc.save(temp,garbage=4,deflate=True,deflate_fonts=True)
    pages=len(doc);doc.close()
    with fitz.open(temp) as check:
        assert len(check)==pages
    os.replace(temp,input_pdf)
    return {**changes,'pages':pages}


def count_links(page:fitz.Page)->tuple[int,int]:
    kinds=[link['kind'] for link in page.get_links()]
    return (sum(k==fitz.LINK_GOTO for k in kinds),sum(k==fitz.LINK_URI for k in kinds))


def split_manifest(root:Path, relative:str)->dict:
    path=root/'public'/relative
    data=json.loads(path.read_text(encoding='utf-8'))
    books={}
    for lang,entry in data['full_books'].items():
        pdf=root/'public'/entry['url'].lstrip('/')
        assert pdf.is_file(),pdf
        count=len(fitz.open(pdf))
        assert count==entry['pages'],f'Page count changed for {pdf}: {count} vs {entry["pages"]}'
        entry['sha256']=hashlib.sha256(pdf.read_bytes()).hexdigest()
        if 'bytes' in entry:entry['bytes']=pdf.stat().st_size
        books[lang]=fitz.open(pdf)
    for entry in data['files']:
        src=books[entry['language']]
        lo=entry['source_physical_start']-1
        hi=entry['source_physical_end']-1
        assert 0<=lo<=hi<len(src)
        out=fitz.open()
        out.insert_pdf(src,from_page=lo,to_page=hi,links=True,annots=True)
        orig_start=entry.get('original_page_label_start','')
        # All tutorial and appendix labels in the course manifests are decimal.
        assert orig_start.isdigit(),(entry['url'],orig_start)
        out.set_page_labels([{'startpage':0,'style':'D','prefix':'','firstpagenum':int(orig_start)}])
        assert len(out)==entry['pages']
        assert out[0].get_label()==entry['original_page_label_start']
        assert out[-1].get_label()==entry['original_page_label_end']
        internal=external=0
        for page in out:
            n,m=count_links(page);internal+=n;external+=m
        target=root/'public'/entry['url'].lstrip('/')
        temp=target.with_name(target.name+'.tmp.pdf')
        out.save(temp,garbage=3,deflate=True)
        out.close()
        entry['sha256']=hashlib.sha256(temp.read_bytes()).hexdigest()
        entry['bytes']=temp.stat().st_size
        entry['internal_links']=internal
        entry['external_links']=external
        os.replace(temp,target)
    for b in books.values():b.close()
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return {'files':len(data['files']),'books':len(data['full_books'])}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument('--single-pdf',type=Path)
    parser.add_argument('--lang',choices=['he','en'])
    args=parser.parse_args()
    if args.single_pdf:
        print(json.dumps(update_document(args.single_pdf,args.lang or 'he'),ensure_ascii=False));return
    root=args.root
    mark=root/'.github/teaching-pdf-release-v2.json'
    if mark.exists():
        print('Already applied. To reprocess with a newer algorithm, change the version marker.')
        return
    manifests=['materials/2026-2027/linear-algebra/tutorial-downloads.json',
               'materials/2026-2027/linear-algebra-biomedical/tutorial-downloads.json']
    fullpaths=[]
    for rel in manifests:
        m=json.loads((root/'public'/rel).read_text())
        for lang,b in m['full_books'].items():
            fullpaths.append((root/'public'/b['url'].lstrip('/'),lang))
    log={}
    for pdf,lang in fullpaths:
        log[str(pdf.relative_to(root))]=update_document(pdf,lang)
    for rel in manifests:
        log[rel]=split_manifest(root,rel)
    # Check all chapter text and page labels against the canonical full book.
    for rel in manifests:
        m=json.loads((root/'public'/rel).read_text())
        for f in m['files']:
            src=fitz.open(root/'public'/f['source_url'].lstrip('/'))
            part=fitz.open(root/'public'/f['url'].lstrip('/'))
            st=f['source_physical_start']-1
            assert len(part)==f['pages']
            for i in range(len(part)):
                assert part[i].get_text()==src[st+i].get_text(),f['url']
                assert part[i].get_label()==src[st+i].get_label(),f['url']
            part.close();src.close()
    mark.write_text(json.dumps({'version':MARKER,'files':log},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(log,ensure_ascii=False,indent=2))
if __name__=='__main__':main()