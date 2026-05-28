#!/usr/bin/env bash
# Local Mac wrapper for the teaching-content sync runner.
#
# Adds two things on top of `node scripts/sync-teaching-content.mjs`:
#   1. Checks that yt-dlp and node are available; suggests an install if not.
#   2. Passes --include-local so the script also scans ../tirgulim for new
#      PDFs (GitHub Actions cannot reach that folder; this is local-only).
#
# Defaults to report-only. Extra args are forwarded to the runner.

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v yt-dlp >/dev/null 2>&1; then
  echo "yt-dlp not found on PATH. Install with one of:" >&2
  echo "  brew install yt-dlp" >&2
  echo "  pipx install yt-dlp" >&2
  echo "  pip3 install --user yt-dlp" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node not found on PATH. Install Node 18+ (e.g. via nvm or brew install node)." >&2
  exit 1
fi

node scripts/sync-teaching-content.mjs --include-local "$@"
