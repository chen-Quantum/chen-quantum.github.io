---
name: process-new-site-materials
description: >-
  Process the `new/` drop folder for chen-quantum.github.io. Whenever the site
  owner drops files into ../new (sibling of the repo, i.e.
  chen-web/new), inspect every file, classify it (practice-sheet PDF, teaching
  video metadata, CV/resume, event/community material, project material,
  image/poster, or unknown), copy each into the correct website location, update
  the relevant registry/page (teaching data, CV links, communityEvents, etc.),
  scan the YouTube playlists for new/edited videos, build, and report. Safety-
  and accuracy-first: copies (never moves) source files, never deletes anything
  from new/, never invents details, never exposes private drafts, preserves the
  PDF access-code UX, and never commits/pushes or adds AI co-author trailers
  unless the user explicitly allows it in the same session.
---

> **Tracked backup of a local Claude Code skill.** The active copy lives at
> `.claude/skills/process-new-site-materials/SKILL.md` (gitignored). Keep
> `.claude/`, `CLAUDE.md`, `.claude/settings.json`, and
> `.claude/settings.local.json` untracked. This skill is a workflow guide, not
> an automated runner — it executes through ordinary Claude Code tools.

# process-new-site-materials

A repeatable, careful workflow for ingesting whatever the site owner drops into
the **`new/`** folder and placing it correctly on the live site. It composes
with the existing `sync-teaching-content` skill (which owns the teaching
videos/PDF sub-workflow) and follows the same conventions and safety rules.

---

## 0. Paths & repo

- Outer workspace: `/Users/chengadi/Desktop/03_Projects/Chen_Web/Working/chen-web`
- Drop folder (source of truth): `<workspace>/new`
- Teaching PDF source: `<workspace>/tirgulim`
- Actual git repo (Astro root): nested at `<workspace>/chen-quantum.github.io`.
  **Always verify first:** `git rev-parse --show-toplevel`.

If `new/` is empty or missing, search ONLY inside the outer workspace for a
folder named `new` (do not scan the rest of the machine). If still none, report
and stop.

---

## 1. Hard safety rules (read every run)

- **Never delete, move, or modify anything inside `new/`.** Always **copy** out
  of it. The source files stay untouched.
- **Copy into `public/` (or the right data location); never move source files
  destructively.**
- **No commit / no push unless the user explicitly allows it in this session.**
  Default: leave changes in the working tree and report. If allowed, author as
  **Chen Gadi**, plain message, and **never** add `Co-authored-by` / "Generated
  with Claude" / any AI/bot trailer.
- **`.claude/` and `CLAUDE.md` are gitignored.** Never stage
  `.claude/settings.json` or `.claude/settings.local.json`.
- **No invented content.** Speakers, dates, talk titles, tutorial numbers,
  topics, institutions, times — only from a real file, a poster you can read, a
  video title, or the user. If a detail is missing, use a clean placeholder and
  the verified registration link; do not guess.
- **Do not expose private/local-only drafts.** Publish a file only when it
  clearly belongs on the public site. When unclear → manual-review list.
- **Do not touch** `qaoa-xy-assessment`, any `assessment`/`interview`/`job`/
  `assignment` file, unrelated archived projects, unrelated QTC archive pages,
  or unrelated CV-history/research content.
- **Preserve the teaching PDF UX exactly** (a *soft classroom access-code*, not
  security): keep the access code `juanBalagan`, the wrong-code message
  `"Incorrect code. The preview is still available."`, the preview iframe
  fragment `#toolbar=0&navpanes=0&scrollbar=0&view=FitH`, PDF previews collapsed
  by default, and the embedded PDF preview (not an image thumbnail). **Never**
  describe it as secure / private / protected / encrypted / DRM.
- **YouTube videos are *unlisted*, not private/secure.** Keep that wording. Use
  `youtube-nocookie.com/embed/…` URLs.
- Do not add heavy deps; static-first Astro only. `pnpm astro build` must pass
  before reporting done.

---

## 2. Inspect & classify

List `new/` and identify each file. Classify into exactly one category:

| Category | Cues | Destination |
|---|---|---|
| practice-sheet / tirgul PDF | `tirgulN.pdf`, `תרגול N …pdf`, calculus content | `public/files/teaching/<course>/` + update `src/data/tirgulim.ts` (only if it's an existing/clear session with a real PDF) |
| teaching video metadata | playlist URL, video list, title/duration notes | via `sync-teaching-content`: `src/data/youtubeVideos.ts` / `playlists.ts` |
| CV / resume | `*cv*.pdf`, `*resume*.pdf` | `public/files/cv/chen-gadi-cv-2026.pdf` (keep the stable path so links don't change) |
| event / conference / meeting | poster image with date/speakers, event text | `public/community/qtc/<slug>.<ext>` + `src/content/communityEvents/<slug>.md` |
| project material | code/figures/demo clearly for a public project | `public/media/<project>/` + the project page — only if it clearly belongs public |
| image / logo / poster | `.png/.jpg/.svg` | event poster → community; site logo → `public/brand/`; else project media |
| unknown / needs review | anything ambiguous | **do not guess** — add to the manual-review list |

For each file: state what it is, where it belongs, copy it, update the registry,
or list it under manual review.

---

## 3. Teaching (PDFs + videos)

Delegate the teaching specifics to **`sync-teaching-content`** and follow it:

- **PDFs:** compare `new/` and `../tirgulim` against
  `public/files/teaching/calculus-2/` by **content (md5)**, not just filename.
  - If a published `tirgulN.pdf` differs from its source → it's an **update**;
    copy the source over the published file (same path → `tirgulim.ts` and links
    unchanged).
  - A source PDF with no matching published file, no recordings, or that is not
    clearly a calculus tirgul (e.g. a Physics-2 syllabus, a different track's
    sheet) → **report under manual review; do not auto-publish.**
- **Videos:** run `node scripts/sync-teaching-content.mjs --include-local`
  (report-only; needs `yt-dlp` + network). It diffs every playlist in
  `playlists.ts` against `youtubeVideos.ts`.
  - New video IDs → append rows (verbatim title, `embedUrl` nocookie,
    `hqdefault` thumbnail, `durationSeconds`, `category`, `relatedPractice`,
    `track`, `visibilityNote`). Don't hand-edit `courseId`/`courseTag`.
  - Edited titles / durations of existing IDs: confirm with a **full** (non
    `--flat-playlist`) extraction — flat-playlist durations are off-by-one. Only
    change values on a clear, real difference (title text differs, duration > ~3 s).
  - Match a video to `tirgulN` **only** when the title says `תרגול N`
    (e.g. תרגול 6 → tirgul6, תרגול 7 → tirgul7). Otherwise leave unmatched + TODO.

---

## 4. CV / resume

If `new/` has a CV: pick the newest correct **public** CV (by content/date; if
several and the final one is unclear → **ask/report, don't choose**). Copy it to
`public/files/cv/chen-gadi-cv-2026.pdf` (the existing stable path) so every link
keeps working. Verify the links on `/` and `/cv` resolve. Don't publish drafts.

---

## 5. Events / community (the new currently-relevant event only)

- Read event details from the **poster** (source of truth) and/or event text in
  `new/`. Verify before claiming. Don't invent speakers/titles/times.
- Copy the poster to `public/community/qtc/<slug>.<ext>`.
- Add `src/content/communityEvents/<slug>.md` matching the schema in
  `src/content.config.ts` (title, description, date, dateDisplay, time,
  eventType, venue, partners, posterImage `qtc/<slug>.<ext>`, speakers, talks,
  registrationUrl, featured, status). Use `status: "upcoming"` while relevant.
- Surface it on the homepage: the hero computes `nextEvent` (nearest upcoming)
  and renders a tasteful announcement card with the poster + verified details +
  **Register** button (registration URL). Keep it consistent and uncrowded.
- Do not touch unrelated/past QTC archive entries.

---

## 6. Projects

Only if `new/` clearly contains material for an existing public project
(figures, a demo, a preview image) → copy to `public/media/<project>/` and wire
it into that project's page. If it's research-in-progress or ambiguous → manual
review. Never expose internal drafts.

---

## 7. Logo / homepage tweaks

Homepage logo lives at `public/brand/logo.png`, rendered in the hero of
`src/pages/index.astro`. If asked to resize, adjust only the hero logo box
classes (keep it responsive — typically `hidden md:flex`, bump `w-/h-` and tune
padding). Don't break mobile or crowd the page.

---

## 8. Validate

```bash
pnpm astro build                                   # must pass
node scripts/sync-teaching-content.mjs --include-local  # report-only
git status
git diff --stat
```

Verify: homepage loads & shows the event (with the registration link); logo
larger & responsive; `/teaching` loads; new/updated tirgul PDFs appear; teaching
cards newest-first; PDF access-code UX still works (`juanBalagan`,
collapsed previews, the iframe fragment); `/teaching/linear-algebra` and its
`#songs` anchor; `/contact` still shows `chengadi@tauex.tau.ac.il`; CV link
works if the CV changed; no unrelated files changed; no `.claude/settings*`
staged; no AI/bot co-author trailer.

---

## 9. Report

Report: files found in `new/` and how each was classified; files copied (with
destinations); videos added/updated; PDFs added/updated; CV result; event
result; logo result; build result; sync result; `git status` + `git diff
--stat`; and a **manual-review** list for anything ambiguous (with the reason).
Confirm `new/` is untouched. Commit/push **only** if the user explicitly allowed
it this session — otherwise remind them nothing was committed or pushed.

---

## 10. Relationship to other skills

- `sync-teaching-content` — owns the teaching videos + practice-sheet sync
  detail. This skill calls into it for §3; don't duplicate its logic.
- `new-content` — empty placeholder; superseded by this skill for the `new/`
  drop-folder workflow.
- Never recreate `verify-build` or any skill the user did not ask for.
