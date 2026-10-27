#!/usr/bin/env python3
"""Validate built booklet links and PDFs before publication; performs no network writes."""
from __future__ import annotations
import argparse
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit, parse_qs
from pypdf import PdfReader

ORIGIN = 'https://chengadi.science'
HE_PDF = '/materials/2026-2027/linear-algebra-engineering-notes.pdf'
EN_PDF = '/materials/2026-2027/linear-algebra-engineering-tutorials-en.pdf'
INTERNATIONAL = '/teaching/international-engineering/'
YEAR_PAGE = '/teaching/2026-2027/'

class Document(HTMLParser):
    def __init__(self, text: str):
        super().__init__(convert_charrefs=True)
        self.ids: set[str] = set()
        self.duplicate_ids: list[str] = []
        self.targets: list[tuple[str, str]] = []
        self.anchors: list[dict] = []
        self.text: list[str] = []
        self.stack: list[dict] = []
        self.booklet_section_text: list[str] = []
        self.in_booklet = 0
        self.in_script_style = 0
        self.feed(text)
    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get('id'):
            if attrs['id'] in self.ids:
                self.duplicate_ids.append(attrs['id'])
            self.ids.add(attrs['id'])
        if tag in {'script', 'style'}:
            self.in_script_style += 1
        if tag == 'section' and attrs.get('id') == 'tutorial-booklet':
            self.in_booklet += 1
        for attribute in ('href', 'src', 'poster'):
            if attribute in attrs:
                self.targets.append((f'{tag}[{attribute}]', attrs[attribute]))
        if 'srcset' in attrs:
            for candidate in attrs['srcset'].split(','):
                if candidate.strip():
                    self.targets.append((f'{tag}[srcset]', candidate.strip().split()[0]))
        if tag == 'a':
            self.stack.append({'attrs': attrs, 'text': '', 'in_booklet': bool(self.in_booklet)})
    def handle_endtag(self, tag):
        if tag in {'script', 'style'} and self.in_script_style:
            self.in_script_style -= 1
        if tag == 'section' and self.in_booklet:
            self.in_booklet -= 1
        if tag == 'a' and self.stack:
            self.anchors.append(self.stack.pop())
    def handle_data(self, text):
        if self.in_script_style:
            return
        self.text.append(text)
        if self.in_booklet:
            self.booklet_section_text.append(text)
        for anchor in self.stack:
            anchor['text'] += text

def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dist', type=Path, default=Path('dist'))
    parser.add_argument('--expected-he', type=Path, help='Validated final Hebrew PDF to compare byte-for-byte.')
    parser.add_argument('--expected-en', type=Path, help='Validated final English PDF to compare byte-for-byte.')
    parser.add_argument('--page-map', type=Path, help='Optional JSON with he/en arrays of 13 physical tutorial starts, plus appendix and page-count maps.')
    parser.add_argument('--report', type=Path, help='Optional JSON result destination.')
    args = parser.parse_args()
    dist = args.dist.resolve()
    failures: list[str] = []
    checks = 0
    def check(ok: bool, message: str) -> None:
        nonlocal checks
        checks += 1
        if not ok:
            failures.append(message)
    def path_for(url_path: str) -> Path:
        p = dist / unquote(url_path).lstrip('/')
        return p if p.is_file() else p / 'index.html'
    check(dist.is_dir(), f'Build directory exists: {dist}')
    html_files = sorted(dist.rglob('*.html'))
    docs: dict[Path, Document] = {p: Document(p.read_text()) for p in html_files}
    pdf_pages: dict[Path, int] = {}
    for path, doc in docs.items():
        route = '/' + str(path.relative_to(dist)).removesuffix('index.html')
        check(not doc.duplicate_ids, f'{route}: duplicate IDs {doc.duplicate_ids}')
        for kind, raw in doc.targets:
            if not raw or raw.startswith(('data:', 'blob:', 'mailto:', 'tel:', 'javascript:')):
                continue
            url = urlsplit(urljoin(ORIGIN + route, raw))
            if url.scheme not in {'http', 'https'} or url.netloc != urlsplit(ORIGIN).netloc:
                continue
            target = path_for(url.path)
            check(target.is_file(), f'{route}: missing {kind} destination {raw}')
            if not target.is_file() or not url.fragment:
                continue
            if target.suffix == '.html':
                dest = docs.get(target) or Document(target.read_text())
                check(unquote(url.fragment) in dest.ids, f'{route}: missing HTML fragment {raw}')
            elif target.suffix.lower() == '.pdf':
                fragment = parse_qs(url.fragment)
                if 'page' in fragment:
                    value = fragment['page'][0]
                    check(value.isdigit(), f'{route}: invalid PDF page parameter {raw}')
                    if value.isdigit():
                        if target not in pdf_pages:
                            try:
                                pdf_pages[target] = len(PdfReader(target).pages)
                            except Exception as error:
                                failures.append(f'Cannot parse linked PDF {target}: {error}')
                                continue
                        check(1 <= int(value) <= pdf_pages[target], f'{route}: PDF page out of range {raw}')
    booklet_files = {}
    for language, url, expected in [('he', HE_PDF, args.expected_he), ('en', EN_PDF, args.expected_en)]:
        target = path_for(url)
        check(target.is_file(), f'{language}: final booklet PDF exists at {url}')
        if not target.is_file():
            continue
        check(target.stat().st_size > 1000, f'{language}: PDF is not an empty placeholder')
        check(target.read_bytes().startswith(b'%PDF-'), f'{language}: file has a PDF signature')
        try:
            reader = PdfReader(target)
            pages = len(reader.pages)
            check(pages > 0, f'{language}: booklet contains pages')
            check(not reader.is_encrypted, f'{language}: PDF opens without a password')
            check(bool(reader.outline), f'{language}: PDF contains navigation bookmarks')
            booklet_files[language] = {'url': url, 'bytes': target.stat().st_size, 'pages': pages, 'sha256': sha256(target)}
            if expected is not None:
                check(expected.is_file(), f'{language}: validated source PDF exists')
                if expected.is_file():
                    check(sha256(expected) == sha256(target), f'{language}: published asset differs from the validated final PDF')
        except Exception as error:
            failures.append(f'{language}: cannot parse final booklet PDF: {error}')
    international = docs.get(path_for(INTERNATIONAL))
    year = docs.get(path_for(YEAR_PAGE))
    check(international is not None, 'International Engineering materials page exists')
    check(year is not None, 'Current-year course page exists')
    if international:
        check('tutorial-booklet' in international.ids, 'International materials page has the full-booklet section')
        links = [a for a in international.anchors if a['in_booklet'] and a['attrs'].get('href') == EN_PDF]
        check(bool(links), 'International booklet section links the English edition')
        check(all(a['text'].strip() for a in links), 'International English booklet link has a name')
        check(not any(a['attrs'].get('href') == HE_PDF for a in international.anchors),
              'International course has no Hebrew booklet links')
        text = ' '.join(' '.join(international.text).split())
        check('English translations are available for recitations 1 and 2.' not in text, 'Remove stale partial-translation claim')
        check('The complete handbook below is in Hebrew.' not in text, 'Remove stale Hebrew-only full-book claim')
    if year:
        check(any(a['attrs'].get('href') == EN_PDF for a in year.anchors), 'Current-year page directly links the full English booklet')
    search = dist / 'search-index.json'
    check(search.is_file(), 'Public search index exists')
    if search.is_file():
        entries = json.loads(search.read_text())
        check(any(e.get('url') == INTERNATIONAL + '#tutorial-booklet' for e in entries), 'Public search index includes the full-booklet destination')
    if args.page_map:
        mapping = json.loads(args.page_map.read_text())
        for language in ['he', 'en']:
            starts = mapping.get(language, [])
            check(len(starts) == 13, f'{language}: page map has 13 tutorial starts')
            check(all(type(n) is int for n in starts), f'{language}: page numbers are integers')
            if language in booklet_files and all(type(n) is int for n in starts):
                check(all(1 <= n <= booklet_files[language]['pages'] for n in starts), f'{language}: mapped pages are within PDF bounds')
                check(starts == sorted(starts) and len(set(starts)) == 13, f'{language}: tutorial starts are ordered and distinct')
                if language in mapping.get('pages', {}):
                    check(mapping['pages'][language] == booklet_files[language]['pages'], f'{language}: PDF page count matches the final map')
            if year:
                pdf = HE_PDF if language == 'he' else EN_PDF
                for n in starts:
                    check(any(a['attrs'].get('href') == pdf + '#page=' + str(n) for a in year.anchors), f'Current-year page links {language} tutorial physical page {n}')
                if language in mapping.get('appendix', {}):
                    n = mapping['appendix'][language]
                    check(any(a['attrs'].get('href') == pdf + '#page=' + str(n) for a in year.anchors), f'Current-year page links {language} appendix physical page {n}')
    report = {'checks': checks, 'html_pages': len(html_files), 'booklets': booklet_files, 'failures': failures, 'passed': not failures}
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if not failures else 1)

if __name__ == '__main__':
    main()
