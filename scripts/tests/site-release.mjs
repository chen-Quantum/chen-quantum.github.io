// Built-output checks for the public website. No server or graphical browser required.
// Install jsdom in a separate QA directory and set PORTAL_QA_ROOT to that path.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire, stripTypeScriptTypes } from "node:module";
const require = createRequire(
  path.resolve(process.env.PORTAL_QA_ROOT || ".", "package.json"),
);
const { JSDOM } = require("jsdom");
const dist = path.resolve("dist");
const doc = (route) =>
  new JSDOM(fs.readFileSync(path.join(dist, route, "index.html"), "utf8"))
    .window.document;
let count = 0;
function check(condition, label) {
  assert.ok(condition, label);
  console.log("PASS " + label);
  count++;
}
const pages = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) pages.push(full);
  }
}
walk(dist);
const broken = [];
for (const file of pages) {
  const document = new JSDOM(fs.readFileSync(file, "utf8")).window.document;
  check(
    document.documentElement.lang === "en",
    path.relative(dist, file) + ": English document",
  );
  const visible = document.body.cloneNode(true);
  visible.querySelectorAll("script,style").forEach((node) => node.remove());
  check(
    !/[\u0590-\u05ff]/.test(visible.textContent),
    path.relative(dist, file) + ": English interface text",
  );
  check(
    !document.querySelector(
      'a[href="/cv"], a[href*="/files/cv/"], iframe[src*="/files/cv/"], object[data*="/files/cv/"]',
    ),
    path.relative(dist, file) + ": no CV links or embeds",
  );
  for (const link of document.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href");
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const url = new URL(href, "https://chen-quantum.github.io");
    const local = path.join(dist, decodeURIComponent(url.pathname));
    const target =
      fs.existsSync(local) && fs.statSync(local).isFile()
        ? local
        : path.join(local, "index.html");
    if (!fs.existsSync(target))
      broken.push({ page: path.relative(dist, file), href });
    else if (url.hash && target.endsWith(".html")) {
      const destination = new JSDOM(fs.readFileSync(target, "utf8")).window
        .document;
      if (!destination.getElementById(decodeURIComponent(url.hash.slice(1))))
        broken.push({ page: path.relative(dist, file), href });
    }
  }
}
check(
  broken.length === 0,
  "all internal page, asset, and fragment links resolve: " +
    JSON.stringify(broken),
);
check(
  !fs.existsSync(path.join(dist, "files/cv/chen-gadi-cv-2026.pdf")),
  "CV PDF is absent from the deployment",
);
const cv = doc("cv");
check(
  cv.querySelector('meta[name="robots"]').content === "noindex, nofollow" &&
    cv.querySelector("h1").textContent.includes("unavailable"),
  "CV route shows only an unavailable notice and discourages indexing",
);
const home = doc("");
check(
  home
    .querySelector(".academic-appointment")
    .textContent.includes("M.SC. THESIS") &&
    home
      .querySelector(".academic-appointment")
      .textContent.includes("Yaron Oz"),
  "master’s thesis and supervisor are the first academic role",
);
for (const route of ["", "about", "research", "cv"])
  check(
    !/training dynamics|tangent kernel|perturbation|physics of learning/i.test(
      doc(route).querySelector("main").textContent,
    ),
    route + ": no thesis topic disclosed",
  );
check(
  home.querySelectorAll(".events-edition .event-date-panel").length === 3,
  "three upcoming events appear on the homepage",
);
const events = doc("quantum-community/events");
check(
  events.querySelectorAll(".event-date-panel").length === 3,
  "three upcoming event date cards are present",
);
check(
  doc("quantum-community/events/quantau-journal-club-2026-10-28")
    .querySelector("main")
    .textContent.includes("Planned"),
  "journal club is explicitly planned",
);
check(
  doc("quantum-community/events/qtc-community-meetup-2026-10-28")
    .querySelector("main")
    .textContent.includes("Save the date"),
  "QTC meetup is a save-the-date announcement",
);
check(
  doc("quantum-community/events/quantum-day-2026-11-12")
    .querySelector("main")
    .textContent.includes("Save the date"),
  "Quantum Day is a save-the-date announcement",
);
const reading = doc("reading");
const articleDates = [...reading.querySelectorAll(".reading-card time")].map(
  (time) => time.dateTime,
);
check(
  articleDates.length === 4 &&
    articleDates.every((date) => date >= "2026-09-18" && date <= "2026-10-18"),
  "all four recommended articles fall within the requested month",
);
check(
  reading.querySelectorAll(
    ".reading-card h3 a[href^='https://physics.aps.org/']",
  ).length === 4,
  "every physics article links directly to its publisher",
);
check(
  reading.querySelectorAll(".resource-card").length === 4 &&
    reading.body.textContent.replace(/\s+/g, " ").includes("second course"),
  "student resources distinguish enrichment from introductory material",
);
const syllabus = doc("teaching/linear-algebra-electrical/syllabus");
check(
  syllabus.querySelectorAll(".syllabus-topics article").length === 12 &&
    syllabus.body.textContent.replace(/\s+/g, " ").includes("65 lecture hours"),
  "English syllabus contains all 12 topic blocks and 65 listed hours",
);
check(
  [
    "best 8",
    "best 10",
    "at least 50",
    "80%–100%",
    "WeBWorK",
    "No calculator",
  ].every((text) => syllabus.querySelector("main").textContent.includes(text)),
  "syllabus preserves homework, exam, and eligibility rules",
);
const { isUpcomingEvent } = await import(
  "data:text/javascript," +
    encodeURIComponent(
      stripTypeScriptTypes(fs.readFileSync("src/data/eventStatus.ts", "utf8"), {
        mode: "transform",
      }),
    )
);
const event = {
  status: "upcoming",
  date: new Date("2026-10-28"),
  dateConfirmed: true,
};
check(
  isUpcomingEvent(event, new Date("2026-10-28T20:59:59Z")) &&
    !isUpcomingEvent(event, new Date("2026-10-28T22:01:00Z")),
  "event expires after its calendar day in Israel",
);
check(
  !isUpcomingEvent({ ...event, dateConfirmed: false }, new Date("2026-10-18")),
  "unknown-year historical events do not become upcoming",
);
console.log(JSON.stringify({ passed: count, pages: pages.length }));
