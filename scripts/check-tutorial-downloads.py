#!/usr/bin/env python3
"""Validate the built bilingual tutorial downloads before publication.

The optional manifest is an array of asset objects, or an object containing a
``files`` (or ``assets``) array. Each asset has ``url`` (or ``path``), ``sha256``,
and ``pages`` (or ``page_count``); ``bytes`` is optional. A ``full_books`` map
also verifies that the complete books retain their validated hashes and pages.
The checker performs no network writes.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, unquote, urljoin, urlsplit

from pypdf import PdfReader

ORIGIN = "https://chengadi.science"
ASSET_ROOT = "/materials/2026-2027/linear-algebra/"
YEAR = "/teaching/2026-2027/"
INTERNATIONAL = "/teaching/international-engineering/"
FULL_BOOKS = {
    "en": "/materials/2026-2027/linear-algebra-engineering-tutorials-en.pdf",
    "he": "/materials/2026-2027/linear-algebra-engineering-notes.pdf",
}
VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
    "meta", "param", "source", "track", "wbr",
}


class Document(HTMLParser):
    def __init__(self, text: str):
        super().__init__(convert_charrefs=True)
        self.elements: list[dict] = []
        self.anchors: list[dict] = []
        self.targets: list[tuple[str, str]] = []
        self.ids: dict[str, int] = {}
        self.duplicate_ids: list[str] = []
        self.order = 0
        self.feed(text)
        self.close()

    def handle_starttag(self, tag: str, attributes):
        attrs = dict(attributes)
        self.order += 1
        if attrs.get("id"):
            if attrs["id"] in self.ids:
                self.duplicate_ids.append(attrs["id"])
            self.ids[attrs["id"]] = self.order
        element = {"tag": tag, "attrs": attrs, "order": self.order}
        if tag == "a":
            element.update({
                "text": "",
                "ancestors": {e["attrs"]["id"] for e in self.elements if e["attrs"].get("id")},
            })
            self.anchors.append(element)
        for attribute in ("href", "src", "poster"):
            if attrs.get(attribute):
                self.targets.append((f"{tag}[{attribute}]", attrs[attribute]))
        if tag not in VOID_TAGS:
            self.elements.append(element)

    def handle_startendtag(self, tag: str, attributes):
        self.handle_starttag(tag, attributes)
        if tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag: str):
        for index in range(len(self.elements) - 1, -1, -1):
            if self.elements[index]["tag"] == tag:
                del self.elements[index:]
                return

    def handle_data(self, text: str):
        if any(e["tag"] in {"script", "style"} for e in self.elements):
            return
        for element in self.elements:
            if element["tag"] == "a":
                element["text"] += text


def expected_assets() -> list[dict]:
    return [
        {"url": ASSET_ROOT + f"tutorial-{number:02d}-{language}.pdf", "language": language, "tutorial": number}
        for number in range(1, 14)
        for language in ("en", "he")
    ] + [
        {"url": ASSET_ROOT + f"logic-appendix-{language}.pdf", "language": language, "tutorial": None}
        for language in ("en", "he")
    ]


def local_url(raw: str, route: str):
    if not raw or raw.startswith(("data:", "blob:", "mailto:", "tel:", "javascript:")):
        return None
    url = urlsplit(urljoin(ORIGIN + route, raw))
    if url.scheme in {"http", "https"} and url.netloc == urlsplit(ORIGIN).netloc:
        return url
    return None


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dist", type=Path, default=Path("dist"))
    parser.add_argument("--manifest", type=Path)
    parser.add_argument("--report", type=Path)
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
        path = dist / unquote(url_path).lstrip("/")
        return path if path.is_file() else path / "index.html"

    check(dist.is_dir(), f"Build directory exists: {dist}")
    html_files = sorted(dist.rglob("*.html"))
    check(bool(html_files), "Built HTML pages exist")
    docs = {p: Document(p.read_text()) for p in html_files}
    pdf_cache: dict[Path, PdfReader] = {}

    def pdf_reader(path: Path):
        if path not in pdf_cache:
            try:
                pdf_cache[path] = PdfReader(path)
            except Exception as error:
                check(False, f"Cannot parse PDF {path.relative_to(dist)}: {error}")
                return None
        return pdf_cache.get(path)

    for path, doc in docs.items():
        route = "/" + path.relative_to(dist).as_posix().removesuffix("index.html")
        check(not doc.duplicate_ids, f"{route}: duplicate IDs {doc.duplicate_ids}")
        for kind, raw in doc.targets:
            url = local_url(raw, route)
            if url is None:
                continue
            target = path_for(url.path)
            check(target.resolve().is_relative_to(dist), f"{route}: {kind} escapes the build directory: {raw}")
            if not target.resolve().is_relative_to(dist):
                continue
            check(target.is_file(), f"{route}: missing {kind} target {raw}")
            if not target.is_file() or not url.fragment:
                continue
            if target.suffix == ".html":
                destination = docs.get(target) or Document(target.read_text())
                check(unquote(url.fragment) in destination.ids, f"{route}: missing HTML fragment {raw}")
            elif target.suffix.lower() == ".pdf" and "page" in parse_qs(url.fragment):
                page = parse_qs(url.fragment)["page"][0]
                check(page.isdigit(), f"{route}: invalid PDF page in {raw}")
                if page.isdigit():
                    reader = pdf_reader(target)
                    if reader is not None:
                        check(1 <= int(page) <= len(reader.pages), f"{route}: PDF page out of range in {raw}")

    expected = expected_assets()
    asset_reports: dict[str, dict] = {}
    expected_urls = {asset["url"] for asset in expected}
    directory = dist / ASSET_ROOT.lstrip("/")
    check(directory.is_dir(), "Standalone tutorial PDF directory exists")
    actual_urls = {ASSET_ROOT + path.name for path in directory.glob("*.pdf")}
    check(actual_urls == expected_urls, f"PDF directory contains exactly the 28 expected downloads; missing={sorted(expected_urls - actual_urls)}, extra={sorted(actual_urls - expected_urls)}")
    for asset in expected:
        url = asset["url"]
        path = path_for(url)
        check(path.is_file(), f"Standalone PDF exists: {url}")
        if not path.is_file():
            continue
        data = path.read_bytes()
        check(data.startswith(b"%PDF-"), f"PDF signature is valid: {url}")
        reader = pdf_reader(path)
        if reader is None:
            continue
        check(not reader.is_encrypted, f"PDF opens without a password: {url}")
        if reader.is_encrypted:
            continue
        pages = len(reader.pages)
        check(pages > 0, f"PDF contains pages: {url}")
        asset_reports[url] = {"pages": pages, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}

    for route, card_prefix, full_section in [(YEAR, "tutorial-", "linear-algebra"), (INTERNATIONAL, "download-tutorial-", "tutorial-booklet")]:
        doc = docs.get(path_for(route))
        check(doc is not None, f"Course materials page exists: {route}")
        if doc is None:
            continue
        for language, url in FULL_BOOKS.items():
            links = [a for a in doc.anchors if local_url(a["attrs"].get("href", ""), route) and local_url(a["attrs"].get("href", ""), route).path == url and full_section in a["ancestors"]]
            check(bool(links), f"{route}: full {language} booklet remains linked in #{full_section}")
            check(all((a["attrs"].get("aria-label") or a["text"]).strip() for a in links), f"{route}: full {language} booklet links have accessible names")
            list_id = "tutorial-list" if route == YEAR else "tutorial-downloads"
            check(list_id in doc.ids and any(a["order"] < doc.ids[list_id] for a in links), f"{route}: full {language} booklet link precedes individual tutorials")
        if route == INTERNATIONAL:
            check("tutorial-downloads" in doc.ids, "International page contains #tutorial-downloads")
            check(any(local_url(a["attrs"].get("href", ""), route) and local_url(a["attrs"].get("href", ""), route).fragment == "tutorial-downloads" for a in doc.anchors), "International page has a jump link to the tutorial downloads")
        for asset in expected:
            url = asset["url"]
            links = [a for a in doc.anchors if local_url(a["attrs"].get("href", ""), route) and local_url(a["attrs"].get("href", ""), route).path == url]
            check(bool(links), f"{route}: individual PDF is linked: {url}")
            language_words = r"English|אנגלית" if asset["language"] == "en" else r"Hebrew|עברית"
            for anchor in links:
                name = (anchor["attrs"].get("aria-label") or anchor["text"]).strip()
                check(bool(name), f"{route}: download has an accessible name: {url}")
                check(bool(re.search(language_words, name, re.I)), f"{route}: download name identifies its language: {url}")
                check("download" in anchor["attrs"], f"{route}: link offers a standalone download: {url}")
            if asset["tutorial"] is not None:
                card_id = card_prefix + str(asset["tutorial"])
                check(card_id in doc.ids, f"{route}: tutorial card #{card_id} exists")
                check(any(card_id in anchor["ancestors"] for anchor in links), f"{route}: matching PDF is inside #{card_id}: {url}")

    if args.manifest:
        check(args.manifest.is_file(), f"Validation manifest exists: {args.manifest}")
        if args.manifest.is_file():
            try:
                manifest = json.loads(args.manifest.read_text())
                entries = manifest if isinstance(manifest, list) else manifest.get("files", manifest.get("assets", []))
                check(isinstance(entries, list), "Manifest contains an asset array")
                indexed: dict[str, dict] = {}
                for entry in entries if isinstance(entries, list) else []:
                    raw = entry.get("url") or entry.get("path", "")
                    url = urlsplit(raw).path
                    if url.startswith("public/"):
                        url = "/" + url.removeprefix("public/")
                    elif not url.startswith("/"):
                        url = "/" + url
                    check(url not in indexed, f"Manifest has no duplicate asset entry: {url}")
                    indexed[url] = entry
                for url in expected_urls:
                    check(url in indexed, f"Manifest describes the final standalone PDF: {url}")
                    if url not in indexed or url not in asset_reports:
                        continue
                    entry, actual = indexed[url], asset_reports[url]
                    expected_hash = entry.get("sha256", "")
                    expected_pages = entry.get("pages", entry.get("page_count"))
                    check(bool(re.fullmatch(r"[0-9a-f]{64}", expected_hash)), f"Manifest has a SHA256 for {url}")
                    check(actual["sha256"] == expected_hash, f"Built PDF SHA256 matches validated final asset: {url}")
                    check(type(expected_pages) is int and expected_pages > 0, f"Manifest has a page count for {url}")
                    check(actual["pages"] == expected_pages, f"Built PDF page count matches validated final asset: {url}")
                    if "bytes" in entry:
                        check(actual["bytes"] == entry["bytes"], f"Built PDF byte length matches validated final asset: {url}")
                for language, expected_book in (manifest.get("full_books", {}) if isinstance(manifest, dict) else {}).items():
                    check(language in FULL_BOOKS, f"Manifest full-book language is recognized: {language}")
                    if language not in FULL_BOOKS:
                        continue
                    url = expected_book.get("url")
                    check(url == FULL_BOOKS[language], f"Manifest names the complete {language} booklet URL")
                    path = path_for(FULL_BOOKS[language])
                    check(path.is_file(), f"Complete {language} booklet remains available")
                    if path.is_file():
                        check(hashlib.sha256(path.read_bytes()).hexdigest() == expected_book.get("sha256"), f"Complete {language} booklet retains its validated SHA256")
                        reader = pdf_reader(path)
                        if reader is not None:
                            check(len(reader.pages) == expected_book.get("pages"), f"Complete {language} booklet retains its validated page count")
            except (ValueError, TypeError, AttributeError) as error:
                check(False, f"Cannot read validation manifest: {error}")

    report = {"checks": checks, "html_pages": len(html_files), "pdf_downloads": len(asset_reports), "assets": asset_reports, "failures": failures, "passed": not failures}
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if not failures else 1)


if __name__ == "__main__":
    main()
