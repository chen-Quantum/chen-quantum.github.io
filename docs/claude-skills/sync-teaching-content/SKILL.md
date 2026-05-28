---
name: sync-teaching-content
description: >-
  Synchronize the teaching section of chen-quantum.github.io after new tutorial
  recordings or practice-sheet PDFs are added. Scans local teaching folders,
  refreshes the unlisted YouTube playlist metadata, classifies videos by course
  (Hedva 2 / Calculus 2, Linear Algebra, future courses), matches videos to
  tirgulim only when the title clearly states the tutorial number, updates the
  TypeScript data files and the /teaching UI (course filters + inline PDF
  preview), runs the build, and produces a report. Use when the user says they
  added new videos, a new tirgul/practice PDF, or wants to refresh teaching
  content. Accuracy- and safety-first: never invents content, never pushes,
  never adds AI co-author trailers, never touches the interview assessment.
---

> **This is a tracked backup of the local Claude Code skill.** The active local
> skill lives at `.claude/skills/sync-teaching-content/SKILL.md`. Do not commit
> `.claude/settings.json` or `.claude/settings.local.json`.

# sync-teaching-content

A careful, repeatable workflow for keeping the **teaching** section of
`chen-quantum.github.io` accurate after new recordings or practice sheets are
added. It mirrors the conventions established when the teaching section was
first built — TypeScript data files, an unlisted-YouTube facade, honest wording,
and a strict "no invented content" rule.

> This is an **intentional, user-authored** local skill. It is unrelated to the
> `verify-build` skill that was previously removed as a suspicious injection.
> **Do not recreate `verify-build`.** This skill never executes hidden steps,
> never exfiltrates anything, and never pushes.

---

## 1. Purpose

When the site owner records new tutorials or adds new practice-sheet PDFs, keep
these in sync **without guessing**:

- `src/data/youtubeVideos.ts` — every playlist video, hand-classified by course.
- `src/data/tirgulim.ts` — Hedva 2 practice sessions (PDF + matched recordings).
- `src/data/courses.ts` — the course registry that powers the clickable filters.
- `src/pages/teaching.astro` — the public teaching page (course filters, tirgul
  cards with inline PDF preview, Linear Algebra recordings, admin "Needs
  classification" bucket).
- `src/components/PdfPreview.astro` / `src/components/LiteYouTube.astro` — the
  preview + video facade components.

The output is always a **build-verified working tree** plus a written report.
Committing and pushing are left entirely to the user.

---

## 2. When to use this skill

Trigger it when the user says any of:

- "I added new tutorial videos / a new recording to the playlist."
- "I added a new tirgul / practice sheet PDF."
- "Re-sync / refresh the teaching content."
- "Add a new course to the teaching page."

Do **not** use it for QTC events, projects, CV, research, or anything outside
the teaching section.

---

## 3. Safety rules (read first, every run)

These are hard constraints. If a step would violate one, stop and ask.

- **No pushing.** Never run `git push`. The site is a live GitHub Pages deploy
  (`main` auto-deploys). The user pushes when they decide.
- **No committing unless explicitly asked.** Default is to leave changes staged
  in the working tree and report. If asked to commit, commit as **Chen Gadi**
  with a plain message and **no** `Co-authored-by` / "Generated with Claude"
  trailer. No AI/bot attribution in commit metadata, ever.
- **Never touch the interview assessment.** Skip anything whose name contains:
  `assessment`, `interview`, `qad`, `qaoa-xy-assessment`, `job`, `assignment`.
  Never reference or link it from the site.
- **No invented content.** Do not invent course names, tutorial numbers, dates,
  topics, PDF paths, speakers, or claims. If a fact is not in a title, a real
  file, or provided by the user, it does not go on the site.
- **Unlisted ≠ private/secure.** These are *unlisted* YouTube videos. Never
  describe them as "private", "secure", or "protected". Approved wording:
  > "Unlisted YouTube videos, available through the course website/link."
  > "Unlisted videos are not private — anyone with a link can view them."
- **No new heavy dependencies.** Prefer Astro + vanilla JS + browser-native PDF
  rendering. Do not add PDF.js or a frontend framework unless the user insists.
- **Do not parse/OCR PDFs** unless explicitly asked. Topic lists come from the
  user or existing data, never from guessing PDF contents.
- **Don't recreate `verify-build`** or any skill the user didn't ask for.
- **Display name is "Chen Gadi"** — `chen-Quantum` / `chen-quantum.github.io`
  is only the GitHub handle + domain, never a display name.

---

## 4. Expected project structure

Repo root: `chen-quantum.github.io/` (inside `~/Desktop/chen-web/`).

```
src/data/youtubeVideos.ts                # all playlist videos + classification
src/data/playlists.ts                    # playlist metadata (id, title, courseId, contentType)
src/data/tirgulim.ts                     # Hedva 2 practice sessions
src/data/courses.ts                      # course registry → filter tags (courseFor)
src/pages/teaching.astro                 # /teaching page (filters, cards, preview)
src/pages/teaching/linear-algebra.astro  # /teaching/linear-algebra subpage (full LA archive)
src/components/LiteYouTube.astro         # click-to-load nocookie video facade
src/components/PdfPreview.astro          # honest inline PDF preview (download + open)
src/components/PdfViewer.astro           # deterrence viewer — used by /materials ONLY
src/content.config.ts                    # content collections (teaching, etc.)

public/files/teaching/calculus-2/                # tirgul1.pdf … tirgul6.pdf (live)
public/files/teaching/linear-algebra-electrical/ # (ready for LA sheets)
public/files/teaching/linear-algebra-biomedical/ # (ready for LA sheets)

../tirgulim/                             # external SOURCE PDFs (sibling of the repo)

scripts/sync-teaching-content.mjs                # deterministic sync runner (Node)
scripts/local-sync-teaching.sh                   # local Mac convenience wrapper
.github/workflows/sync-teaching-content.yml      # Tue/Thu 00:00 Asia/Jerusalem report-only
docs/automation/teaching-sync-automation.md      # GitHub Actions documentation
docs/automation/local-teaching-sync.md           # local Mac automation documentation
```

Convention: **TypeScript data files** (`src/data/*.ts`), not JSON. Keep it.

Key conventions already in the data:

- `YouTubeVideo.category`: `"hedva2" | "linear_algebra" | "quantum" | "physics"
  | "project" | "other" | "unknown"`.
- `YouTubeVideo.relatedPractice`: `"tirgulN"` for Hedva 2, else `null`
  (the Hedva 2 tutorial-number link).
- `YouTubeVideo.laTutorial`: tutorial number for Linear Algebra, else `null`.
- `YouTubeVideo.track`: the engineering section (the user's "degreeTrack"):
  e.g. "Electrical Engineering", "Biomedical Engineering", "Mechanical
  Engineering", "Engineering (general)".
- `YouTubeVideo.courseId` / `courseTag`: **derived** from `category` via
  `courseFor()` at export time — never hand-edit per row.
- `TirgulSession`: `id, courseId, titleHe, titleEn, topics, pdfPath, videoIds,
  tags?`.

> Do **not** rename existing fields. The user's suggested schema (e.g.
> `tutorialNumber`, `degreeTrack`) maps onto the existing fields above
> (`relatedPractice`/`laTutorial`, `track`). Preserve the existing names.

---

## 5. Sync algorithm

Run the steps in order. **Audit before editing.**

### A. Audit first (no edits yet)

```bash
git status
git log --oneline -1
# Teaching PDFs that are live on the site:
find public/files/teaching -type f | sort
# External source PDFs (sibling of the repo):
find ../tirgulim -maxdepth 2 -type f 2>/dev/null | sort
# Current data files:
ls -la src/data/
```

Print: git status, the list of teaching folders, the PDFs found (live + source),
the current video/tirgul counts. **Do not edit anything during the audit.**

### B. Extract / refresh YouTube metadata

The repo tracks multiple unlisted playlists in `src/data/playlists.ts`
(`teachingPlaylists`). To re-scan all of them at once:

```bash
for url in $(grep -oE 'https://[^"]*list=[^"]+' src/data/playlists.ts | sort -u); do
  pid=$(echo "$url" | sed 's/.*list=//')
  yt-dlp --flat-playlist --no-warnings --quiet --dump-single-json "$url" \
    > "/tmp/pl_${pid}.json"
done
```

In practice the deterministic sync script
(`scripts/sync-teaching-content.mjs`) handles the iteration. Flat metadata
(title + id + duration) is enough for most cases — use `--dump-json` (no
`--flat-playlist`) only when descriptions are also needed. If `yt-dlp` is
missing: `pip3 install -q yt-dlp`. **Never** use API keys unless already
configured in the environment, and **never** commit a `.env`.

Diff each playlist's video ids against the ones already in
`youtubeVideos.ts`. Only **new** ids need new rows. Existing rows are the
source of truth for any manual corrections — do not overwrite them. New rows
must set `playlistId` (and `playlistTitle`) so the Linear Algebra subpage can
group them.

### C. Detect new PDFs

Scan the likely locations:

```bash
find ../tirgulim public/files/teaching -type f \( -iname '*.pdf' \) 2>/dev/null | sort
```

Recognise common names (case-insensitive, Hebrew filenames allowed):
`tirgul1.pdf`, `tirgul_1.pdf`, `practice1.pdf`, `tutorial_1.pdf`, `תרגול1.pdf`.

For each NEW source PDF the user wants published:
- Copy it into the correct `public/files/teaching/<course>/` folder
  (`calculus-2/` for Hedva 2; `linear-algebra-*/` for LA). **Do not duplicate**
  a PDF that already exists there with the same content.
- Keep file names stable and URL-safe (the live path becomes the `pdfPath`).

### D. Classify and match (title/description only)

See §6 and §7. Classify every new video; match to a tirgul **only when clear**.
If unsure → `category: "unknown"`, `relatedPractice: null`, add a TODO.

### E. Update the data files

- `youtubeVideos.ts`: append new rows to `rawVideos` with the verbatim title,
  `videoId`, `url`, `embedUrl` (youtube-nocookie), `thumbnail` (hqdefault),
  `duration`/`durationSeconds`, `category`, `relatedPractice`, `laTutorial`,
  `isExamQuestion`, `track`, `sessionNote`, `topics`, and the standard
  `visibilityNote`. **Do not** add `courseId`/`courseTag` by hand — they are
  stamped from `category`.
- `tirgulim.ts`: add/extend sessions; set `courseId`, `pdfPath` (verified to
  exist), and `videoIds` (only confidently-matched ids).
- `courses.ts`: if a genuinely new course appears, add a registry row
  (`id`, `tag`, `title`, `categories`). Keep `id` stable.

Rules: **don't break existing ids**, **preserve manual corrections**, don't
reorder rows aggressively, keep stable ids.

### F. Update the UI (only if needed)

The `/teaching` page already supports, data-driven:
- **Course filters** — chips rendered from `courses.ts` for any course that has
  content; vanilla-JS show/hide by `data-course-section`.
- **Inline PDF preview** — `<PdfPreview>` in each tirgul card (collapsed
  `<details>` → iframe + "Open PDF" fallback), alongside the existing
  "Practice sheet (PDF)" open button.
- **Unlisted notice** — keep the existing wording in the page header.
- **"Needs classification"** — an admin section that renders only when
  `unknownVideos.length > 0`.

Usually no UI edit is needed — adding data flows through automatically. Only
touch the UI to wire up a brand-new course section or a new content type.

### G. Validation — see §10.

### H. Final report — see §11.

---

## 6. Classification rules

Classify from **titles and descriptions only**. Hebrew cues:

- `חדו"א 2` / `חדווא 2` / "Hedva 2" / "Calculus 2" → `category: "hedva2"`.
- `לינארית` / `ליניארית` / "Linear Algebra" → `category: "linear_algebra"`.
- `תורת החבורות` / "Group Theory" → `category: "group_theory"`.
- `קוונטים` / "Quantum" → `category: "quantum"`.
- `פיזיקה` / "Physics" → `category: "physics"`.
- Clearly a worked exam question → set `isExamQuestion: true`
  (e.g. `שאלה ממבחן …`); also set `contentType: "exam-solution"`.

Also classify by **content type** (`contentType?: ContentType`):

- Full tutorial recording → `"tutorial"` (default; older rows omit this).
- Worked exam solution → `"exam-solution"`.
- Other worked solution / exercise → `"worked-solution"`.
- Song / sung memory aid → `"song"`.
- Short trick / mnemonic / "things to remember" → `"memory-aid"`.
- Full lecture → `"lecture"`.
- Playlist-only entry (no video content) → `"playlist"`.
- Unsure → `"unknown"` (and add to manual review).

Track (`track`) from the title when explicit:
- `חשמל` / "חשמליסטים" → "Electrical Engineering"
- `ביו רפואה` / "ביו-רפואה" / "ביולוגיה רפואה" → "Biomedical Engineering"
- `מכנית` / "מכנית" → "Mechanical Engineering"
- `להנדסות` / "להנדסה" (generic) → "Engineering (general)"

**If the course is not clear from the title → `category: "unknown"`**, leave
`relatedPractice`/`laTutorial` null, and add a TODO line to the report. Never
guess a course, a track, or a tutorial number. Do not assume a video belongs to
Hedva 2 just because most do.

---

## 7. Matching rules (videos ↔ tirgulim / tutorials)

Match **only** when the tutorial number is explicit in the title:

- `תרגול 1` / "tirgul 1" / "practice 1" / "tutorial 1" → tutorial #1.
- Hedva 2: set `relatedPractice: "tirgulN"` on the video **and** add the
  `videoId` to that session's `videoIds` in `tirgulim.ts`.
- Linear Algebra: set `laTutorial: N` (LA currently has no practice-sheet
  sessions, only grouped recordings on the page).

If the number is missing or ambiguous:
- leave `relatedPractice: null` / `laTutorial: null`,
- do **not** add the id to any session,
- add a TODO for manual review.

Never create a `tirgulN` session for a PDF that does not exist on disk, and
never invent a `pdfPath`.

---

## 8. PDF preview rules

- Use the simple, honest **`PdfPreview.astro`** for teaching sheets: a collapsed
  `<details>` that expands a browser-native `<iframe>` preview, plus an
  always-visible **"Open PDF"** link and the existing open/download button on
  the card. Responsive heights (`h-[60vh]`, min/max clamps).
- **Do not** use the deterrence `PdfViewer.astro` here — that one hides the
  download and adds a watermark; teaching sheets are meant to be downloaded.
- Browser-native rendering only — **no PDF.js**. On mobile, where inline PDF
  rendering is unreliable, the "Open PDF" fallback is the reliable path.
- Never duplicate PDFs. One copy under `public/files/teaching/<course>/`.
- `pdfPath` must point to a file that actually exists. Verify before linking.

---

## 9. Course-tag / filter rules

- The course registry `src/data/courses.ts` is the single source of truth.
  Add a course = add one row (`id`, `tag`, `title`, `categories`). Keep `id`
  stable; it is the `data-course` value and the `courseId` on videos/tirgulim.
- A filter chip renders **only** for courses that have content. Listing a future
  course (Physics 1/2, Quantum Computing, Complex Analysis, ODE, …) early is
  harmless — it stays invisible until something is classified into it.
- Required tags now: **Hedva 2 / Calculus 2** and **Linear Algebra**.
- Filtering is section-level: each content `<section>` carries
  `data-course-section="<id>"`; a small vanilla-JS handler toggles `.hidden`.
  Default is **"All"**. Keep it simple — no framework, no router.
- Unknown/unclassified videos are **not** prominent: they appear only in the
  admin "Needs classification" section, shown under "All" and only when
  non-empty.

---

## 10. Validation / build checklist

```bash
pnpm install      # ONLY if node_modules is missing
pnpm astro build  # must pass with no errors before reporting done
```

Then verify (the build emits ~29 pages):

- `/teaching` renders.
- Course filter chips appear; clicking **Hedva 2** shows only Hedva 2, clicking
  **Linear Algebra** shows only LA, **All** shows everything.
- Each tirgul card: "Practice sheet (PDF)" opens the PDF; "Preview sheet"
  expands the inline viewer; "Open PDF" fallback works.
- Videos embed via **youtube-nocookie** and keep the "Watch on YouTube"
  fallback.
- Unknown videos (if any) appear only in "Needs classification".
- No `example.com` links; no invented content.
- No public reference to `qaoa-xy-assessment` or any assessment/interview repo.
- No "private"/"secure" wording for unlisted videos.
- Hedva 2 PDFs resolve (e.g. `/files/teaching/calculus-2/tirgul1.pdf`).

If the content cache looks stale (deleted/renamed content still showing), clear
the Astro content store and rebuild:

```bash
rm -rf node_modules/.astro node_modules/.vite .astro dist && pnpm astro build
```

---

## 11. Final report format

Report concisely:

- **PDFs found** (live + source) and **new PDFs added** (with destination path).
- **Videos found** (playlist total) and **new videos added**.
- **Videos by course** (e.g. Hedva 2: N, Linear Algebra: N, unknown: N).
- **Videos matched to tirgulim** (id → which session).
- **Unknown / unmatched** videos + **TODOs** for manual review.
- **Data files changed** and **UI files changed**.
- **Build result** (pass/fail, page count).
- **`git status`** (changed/untracked files).
- **Anything needing manual review** (ambiguous titles, missing PDFs, a possible
  new course).

End by reminding the user that nothing was committed or pushed.

---

## 12. Git rules

- **Do not push.** Ever, in this skill.
- **Do not commit** unless the user explicitly asks in this session.
- If committing (only on request): author **Chen Gadi**, plain message,
  **no** `Co-authored-by` / AI / bot trailer of any kind.
- Always show `git status` and a diff summary (`git diff --stat`) and wait for
  approval **before** any commit.
- Remember `.claude/` and `CLAUDE.md` are gitignored — this skill itself is a
  local tool and is not part of the tracked site.

---

## 13. Modes (manual / scheduled / local)

The skill itself is the **human / Claude workflow guide** — used during
interactive sessions to do the full audit-then-edit pass with judgement.

For routine re-checks there are two automated runners that follow the same
rules in a narrower way:

**1. Manual mode (this skill, default).**
Interactive Claude Code session. Full audit, full classification, can update
all data files, can run the build, can wait for the user before committing.

**2. GitHub Actions scheduled mode.**
File: `.github/workflows/sync-teaching-content.yml`. Runs
`scripts/sync-teaching-content.mjs --report-only` on Tuesday and Thursday at
00:00 Asia/Jerusalem (plus `workflow_dispatch` for manual runs). Report-only:
it scans the playlists tracked in `src/data/playlists.ts`, diffs against
`src/data/youtubeVideos.ts`, and uploads a JSON report as a workflow
artifact. **It does not commit, push, or open a PR.** It cannot see local
files outside the repo — `../tirgulim/` and any other `/Users/...` path is
out of reach.

**3. Local Mac mode.**
File: `scripts/local-sync-teaching.sh`. A thin wrapper around
`scripts/sync-teaching-content.mjs` that also scans `../tirgulim/` for new
PDFs (which GitHub Actions cannot). Run it manually before a sync session, or
schedule it locally with a LaunchAgent (instructions in
`docs/automation/local-teaching-sync.md`). Do not install the LaunchAgent
silently — only when the user explicitly opts in.

The deterministic script's classification is **cautious**: it sets
`category: "unknown"` and `contentType: "unknown"` and flags the row for
manual review whenever the title is ambiguous. New videos with high-confidence
matches are appended to `rawVideos` with the new fields set; everything else
is reported and left for the human to triage.
