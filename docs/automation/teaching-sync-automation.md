# Teaching content sync — automation

This repository ships two ways of automating the teaching-content sync:

1. **GitHub Actions scheduled mode** — report-only, runs twice a week and on
   demand. Lives in `.github/workflows/sync-teaching-content.yml`.
2. **Local Mac mode** — runs the same runner with `--include-local`, plus a
   scan of `../tirgulim/` for new PDFs. See
   [`local-teaching-sync.md`](./local-teaching-sync.md).

The deterministic runner is `scripts/sync-teaching-content.mjs`. The
interactive workflow guide (full audit, classification, edits) is the
`sync-teaching-content` skill in `.claude/skills/` (tracked backup in
`docs/claude-skills/`).

## What the scheduled workflow does

1. Checks out the repo.
2. Installs `yt-dlp` and Node 24.
3. Runs `node scripts/sync-teaching-content.mjs` in report-only mode.
4. The runner reads `src/data/playlists.ts`, fetches each playlist's flat
   metadata via `yt-dlp --flat-playlist --dump-single-json`, diffs each
   playlist's video IDs against the IDs already in
   `src/data/youtubeVideos.ts`, and writes a JSON report to
   `reports/teaching-sync/latest.json`.
5. The workflow appends the JSON to the run's job summary and uploads it as
   the artifact `teaching-sync-report` (30-day retention).

The workflow does **not** commit, push, open a PR, modify any source file, or
trigger a deploy.

## Schedule

```yaml
on:
  schedule:
    - cron: "0 0 * * 2,4"
      timezone: "Asia/Jerusalem"
  workflow_dispatch:
```

GitHub Actions timezone support is used: Tuesday and Thursday at 00:00
Asia/Jerusalem. Runs may still be delayed by GitHub load, especially at the
top of the hour.

## Manual trigger

`workflow_dispatch` is enabled. From the GitHub UI:

> Actions → "Teaching content sync (report-only)" → Run workflow → Run.

## Permissions

The workflow only requests `contents: read`. It cannot push or open PRs even
if asked. Promoting to a branch-and-PR mode in the future would require
adding `contents: write` and `pull-requests: write`.

## What it cannot do

- It cannot scan files outside the repo. `../tirgulim/` and any other path on
  the maintainer's Mac is unreachable. New PDFs in those locations must be
  detected by the local Mac script (`scripts/local-sync-teaching.sh`).
- It cannot classify new videos by itself beyond reporting them. New rows in
  `src/data/youtubeVideos.ts` are still added by the human / interactive
  Claude Code session, following the rules in the
  `sync-teaching-content` skill.
- It cannot push, deploy, or modify the live site.

## Disabling

To pause the schedule without deleting the file:

> Actions → "Teaching content sync (report-only)" → "•••" → Disable workflow.

To remove it entirely, delete
`.github/workflows/sync-teaching-content.yml`.
