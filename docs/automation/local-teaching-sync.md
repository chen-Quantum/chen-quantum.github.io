# Local Mac sync for teaching content

The local script `scripts/local-sync-teaching.sh` is a thin wrapper around
the deterministic runner `scripts/sync-teaching-content.mjs`. It does two
things that the GitHub Actions scheduled workflow cannot:

1. It scans `../tirgulim/` for PDFs that are not yet in
   `public/files/teaching/calculus-2/` and lists them in the report. GitHub
   Actions cannot reach the maintainer's Mac, so this step is local-only.
2. It checks `yt-dlp` and `node` are on `PATH` and prints an install hint if
   either is missing.

## One-time setup

```bash
brew install yt-dlp      # or: pipx install yt-dlp / pip3 install --user yt-dlp
chmod +x scripts/local-sync-teaching.sh
```

Node 18+ is also required (any recent `nvm` / `brew install node` works).

## Running it manually

```bash
cd ~/Desktop/chen-web/chen-quantum.github.io
scripts/local-sync-teaching.sh
```

The script prints a short summary and writes
`reports/teaching-sync/latest.json`. It does not modify any source file.

## Optional: scheduling locally with launchd

`launchd` is macOS's native scheduler. To run the sync at **Tuesday 00:00
and Thursday 00:00 local time**, create a LaunchAgent plist like the example
below.

> Do not install the LaunchAgent silently. The user should opt in
> explicitly. Treat this as a documented option, not a default behaviour.

Example plist
(`~/Library/LaunchAgents/com.chen.teaching-sync.plist`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.chen.teaching-sync</string>

  <!-- Run the local sync script. Adjust the absolute paths if the repo or
       node binary live elsewhere on this Mac. -->
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-lc</string>
    <string>cd /Users/chengadi/Desktop/chen-web/chen-quantum.github.io &amp;&amp; scripts/local-sync-teaching.sh &gt;&gt; ~/Library/Logs/teaching-sync.log 2&gt;&amp;1</string>
  </array>

  <!-- Tuesday 00:00 and Thursday 00:00 local time. -->
  <key>StartCalendarInterval</key>
  <array>
    <dict>
      <key>Weekday</key><integer>2</integer>
      <key>Hour</key><integer>0</integer>
      <key>Minute</key><integer>0</integer>
    </dict>
    <dict>
      <key>Weekday</key><integer>4</integer>
      <key>Hour</key><integer>0</integer>
      <key>Minute</key><integer>0</integer>
    </dict>
  </array>

  <key>RunAtLoad</key>
  <false/>
  <key>StandardOutPath</key>
  <string>/tmp/teaching-sync.out</string>
  <key>StandardErrorPath</key>
  <string>/tmp/teaching-sync.err</string>
</dict>
</plist>
```

Load it (only after reviewing the file):

```bash
launchctl load ~/Library/LaunchAgents/com.chen.teaching-sync.plist
launchctl list | grep teaching-sync
```

Unload it later:

```bash
launchctl unload ~/Library/LaunchAgents/com.chen.teaching-sync.plist
```

Notes:

- `launchd` schedules in *local* time (`Asia/Jerusalem` on this Mac), so
  this LaunchAgent and the GitHub workflow (which uses
  `timezone: "Asia/Jerusalem"`) both stay at 00:00 local year-round.
- If the Mac is asleep at the scheduled time, `launchd` runs the job as soon
  as the system wakes.
- The job only runs while the user is logged in (this is a *LaunchAgent*, not
  a *LaunchDaemon*). For background system-wide scheduling, a LaunchDaemon
  in `/Library/LaunchDaemons/` would be needed — not recommended for this
  use case.

## What the local script does NOT do

- It does not commit, push, or modify any source file.
- It does not classify new videos automatically — it only reports them.
  Adding rows to `src/data/youtubeVideos.ts` and updating
  `src/data/playlists.ts` is still done in an interactive Claude Code
  session following the `sync-teaching-content` skill.
