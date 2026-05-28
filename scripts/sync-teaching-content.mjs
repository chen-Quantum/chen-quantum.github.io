#!/usr/bin/env node
// Deterministic teaching-content sync runner.
//
// Modes:
//   --report-only (default)  Scans the playlists tracked in src/data/playlists.ts,
//                            diffs against the video IDs in src/data/youtubeVideos.ts,
//                            and emits a JSON report. Does NOT modify source files.
//   --include-local          Also scans ../tirgulim for PDFs that are not yet in
//                            public/files/teaching/calculus-2. Local-only —
//                            GitHub Actions cannot reach the maintainer's Mac.
//
// Output:
//   - JSON written to reports/teaching-sync/latest.json (creates dir if missing).
//   - Short summary printed to stdout.
//
// Requirements:
//   - Node 18+ (built-in fs / child_process; no npm deps).
//   - yt-dlp on PATH (installed in CI; locally via brew/pipx/pip).
//
// Safety:
//   - Read-only. Never edits the source data files, never commits, never pushes.
//   - No secrets, no .env, no API keys.

import { spawnSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

const args = new Set(process.argv.slice(2));
const REPORT_ONLY = !args.has("--write"); // --write is reserved for the future
const INCLUDE_LOCAL = args.has("--include-local");

// 1) Extract playlist URLs from src/data/playlists.ts (regex; no TS runtime).
function readPlaylistUrls() {
  const text = readFileSync(
    resolve(REPO_ROOT, "src/data/playlists.ts"),
    "utf8",
  );
  const urlRe =
    /https:\/\/www\.youtube\.com\/playlist\?list=([A-Za-z0-9_-]+)/g;
  const out = [];
  const seen = new Set();
  let m;
  while ((m = urlRe.exec(text))) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      out.push({ id: m[1], url: m[0] });
    }
  }
  return out;
}

// 2) Extract existing video IDs from src/data/youtubeVideos.ts.
function readExistingVideoIds() {
  const text = readFileSync(
    resolve(REPO_ROOT, "src/data/youtubeVideos.ts"),
    "utf8",
  );
  const ids = new Set();
  const re = /videoId:\s*"([A-Za-z0-9_-]{6,})"/g;
  let m;
  while ((m = re.exec(text))) ids.add(m[1]);
  return ids;
}

// 3) Run yt-dlp on one playlist URL.
function scanPlaylist(url) {
  const r = spawnSync(
    "yt-dlp",
    [
      "--flat-playlist",
      "--no-warnings",
      "--quiet",
      "--dump-single-json",
      url,
    ],
    { encoding: "utf8", timeout: 60_000 },
  );
  if (r.status !== 0 || !r.stdout) {
    return {
      ok: false,
      error: (r.stderr || "").split("\n")[0] || "yt-dlp failed",
    };
  }
  try {
    const d = JSON.parse(r.stdout);
    return {
      ok: true,
      title: d.title || "",
      entries: (d.entries || []).map((e) => ({
        videoId: e.id,
        title: (e.title || "").trim(),
        duration: e.duration ?? null,
      })),
    };
  } catch (e) {
    return { ok: false, error: "json-parse: " + e.message };
  }
}

// 4) Scan ../tirgulim/ for PDF files (local mode only).
function scanLocalPdfs() {
  const dir = resolve(REPO_ROOT, "..", "tirgulim");
  if (!existsSync(dir)) return [];
  const liveDir = resolve(REPO_ROOT, "public/files/teaching/calculus-2");
  const live = new Set(existsSync(liveDir) ? readdirSync(liveDir) : []);
  return readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .map((f) => ({
      file: f,
      sourcePath: resolve(dir, f),
      alreadyInRepo: live.has(f),
    }));
}

// 5) Main.
function main() {
  const playlists = readPlaylistUrls();
  const existing = readExistingVideoIds();

  const playlistResults = playlists.map((p) => {
    const scan = scanPlaylist(p.url);
    if (!scan.ok) {
      return { id: p.id, url: p.url, ok: false, error: scan.error };
    }
    const newVideos = scan.entries.filter((e) => !existing.has(e.videoId));
    return {
      id: p.id,
      url: p.url,
      title: scan.title,
      totalVideos: scan.entries.length,
      newCount: newVideos.length,
      newVideos,
      ok: true,
    };
  });

  const report = {
    generatedAt: new Date().toISOString(),
    mode: REPORT_ONLY ? "report-only" : "write",
    includeLocal: INCLUDE_LOCAL,
    existingVideoCount: existing.size,
    playlists: playlistResults,
    localPdfs: INCLUDE_LOCAL ? scanLocalPdfs() : null,
    note:
      "report-only run: this script does NOT modify source files. " +
      "Use the manual sync skill (.claude/skills/sync-teaching-content) " +
      "to classify and append new rows.",
  };

  // 6) Write report.
  const reportDir = resolve(REPO_ROOT, "reports/teaching-sync");
  mkdirSync(reportDir, { recursive: true });
  const reportPath = resolve(reportDir, "latest.json");
  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  // 7) Short stdout summary.
  console.log(`teaching-sync · ${report.mode}`);
  console.log(`  existing videos: ${existing.size}`);
  console.log(`  playlists scanned: ${playlistResults.length}`);
  for (const p of playlistResults) {
    if (!p.ok) {
      console.log(`    [FAIL] ${p.id}  ${p.error}`);
    } else {
      console.log(
        `    [OK]   ${p.id}  total=${p.totalVideos}  new=${p.newCount}  ` +
          `title=${JSON.stringify(p.title)}`,
      );
    }
  }
  if (INCLUDE_LOCAL) {
    const all = report.localPdfs || [];
    const newLocal = all.filter((p) => !p.alreadyInRepo);
    console.log(
      `  local PDFs in ../tirgulim: ${all.length} (new: ${newLocal.length})`,
    );
    for (const pdf of newLocal) console.log(`    NEW PDF: ${pdf.file}`);
  }
  const totalNew = playlistResults.reduce(
    (acc, p) => acc + (p.ok ? p.newCount : 0),
    0,
  );
  console.log(`  total new videos across all playlists: ${totalNew}`);
  console.log(`  report: ${reportPath}`);

  // 8) Exit successfully even if individual playlists failed — the report
  // captures the details and a single 0-entry / unavailable playlist should
  // not break the whole scheduled run.
  process.exitCode = 0;
}

main();
