# Process New Site Materials

Short runbook for future Codex/Claude passes when files are dropped into:

`/Users/chengadi/Desktop/03_Projects/Chen_Web/Working/chen-web/new`

## 1. Verify Context

```bash
cd /Users/chengadi/Desktop/03_Projects/Chen_Web/Working/chen-web/chen-quantum.github.io
git rev-parse --show-toplevel
git status
git remote -v
git branch --show-current
git log --oneline -5
```

Work only in the website repo unless a source file must be copied from
`../new` or `../tirgulim`. Never delete or move source files.

## 2. Classify New Files

List every file in `../new` and classify it as one of:

- practice sheet / tirgul PDF;
- teaching video metadata or playlist material;
- CV / resume;
- event / conference / community meeting material;
- project material;
- image / logo / poster;
- unknown / manual review.

Copy only clearly public files into `public/` or the correct data location.
If unclear, report it instead of guessing.

## 3. Teaching Sync

- Compare `../tirgulim` to `public/files/teaching/calculus-2/`.
- Copy clear missing or updated Hedva practice sheets as canonical
  `tirgulN.pdf` files.
- Update `src/data/tirgulim.ts` without inventing topics.
- Scan all playlists in `src/data/playlists.ts` with `yt-dlp`.
- Update `src/data/youtubeVideos.ts` and `src/data/playlists.ts` from clear
  live metadata only.
- Use `youtube-nocookie.com/embed/...` embed URLs.
- Link `relatedPractice: "tirgulN"` only when the title clearly says
  `תרגול N`.

Preserve the PDF gate behavior: previews collapsed by default, iframe fragment
`#toolbar=0&navpanes=0&scrollbar=0&view=FitH`, full PDF code `juanBalagan`,
wrong-code text `Incorrect code. The preview is still available.` The gate is a
soft classroom UX gate, not security.

## 4. CV And Events

- If a new public CV is clearly the latest, copy it to
  `public/files/cv/chen-gadi-cv-2026.pdf` and verify `/` and `/cv` links.
- If an event poster/text is present, use only visible/source-backed details,
  add/update `src/content/communityEvents/`, and make sure the homepage event
  card shows the registration link.

## 5. Validate

```bash
pnpm astro build
node scripts/sync-teaching-content.mjs
git status
git diff --stat
```

Also check the homepage, `/teaching`, `/teaching/linear-algebra`,
`/teaching/linear-algebra#songs`, and `/contact`. Confirm
`chengadi@tauex.tau.ac.il` is still visible on `/contact`.

## 6. Commit Policy

Commit and push only when the user explicitly asked for it and all checks pass:

```bash
git add -A
git commit -m "Update website content and teaching materials"
git push origin main
```

Do not stage `.claude/settings.json` or `.claude/settings.local.json`. Do not
add Claude/AI/Codex/bot co-author trailers.
