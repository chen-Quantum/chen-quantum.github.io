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
      'a[href*="/files/cv/"], iframe[src*="/files/cv/"], object[data*="/files/cv/"]',
    ),
    path.relative(dist, file) + ": no CV PDF links or embeds",
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
  cv.querySelector("h1").textContent.includes("Curriculum Vitae") &&
    !!cv.getElementById("cv-education") &&
    cv.querySelector(".education-row").textContent.includes("Yaron Oz") &&
    !cv.querySelector("main a[download]"),
  "CV is readable as a web page and does not offer a PDF download",
);
const home = doc("");
check(
  !!home.querySelector('header a[href="/cv"]'),
  "CV is restored to the navigation",
);
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
  articleDates.length === 10 &&
    articleDates.every((date) => date >= "2026-09-18" && date <= "2026-10-18"),
  "all ten recommended articles fall within the requested month",
);
check(
  [...reading.querySelectorAll(".reading-card h3 a")].every((link) =>
    [
      "www.quantamagazine.org",
      "spectrum.ieee.org",
      "www.nature.com",
      "www.sciencenews.org",
      "physics.aps.org",
    ].includes(new URL(link.href).hostname),
  ),
  "every recommended article links directly to its publisher",
);
check(
  reading.querySelectorAll(".resource-card").length === 4 &&
    reading.body.textContent.replace(/\s+/g, " ").includes("second course"),
  "student resources distinguish enrichment from introductory material",
);
const publishers = new Set(
  [...reading.querySelectorAll("[data-reading-publisher]")].map(
    (card) => card.dataset.readingPublisher,
  ),
);
check(
  publishers.size === 5 &&
    [...publishers].includes("IEEE Spectrum") &&
    [...publishers].includes("Nature"),
  "selection covers five publishers across magazines, news, and commentary",
);
const homeCards = [...home.querySelectorAll(".reading-card")];
check(
  homeCards.length === 2 &&
    new Set(homeCards.map((card) => card.dataset.readingPublisher)).size ===
      2 &&
    new Set(homeCards.map((card) => card.dataset.readingTopic)).size === 2,
  "homepage highlights two different publishers and both topic groups",
);
const filtered = new JSDOM(fs.readFileSync("dist/reading/index.html", "utf8"), {
  runScripts: "outside-only",
});
filtered.window.eval(
  stripTypeScriptTypes(
    fs.readFileSync("src/scripts/reading-filter.ts", "utf8"),
    { mode: "transform" },
  ),
);
const select = (topic) =>
  filtered.window.document
    .querySelector(`[data-reading-filter="${topic}"]`)
    .click();
const shown = () =>
  [...filtered.window.document.querySelectorAll(".reading-card")].filter(
    (card) => !card.hidden,
  );
select("ml");
check(
  shown().length === 4 &&
    shown().every((card) => card.dataset.readingTopic === "ml"),
  "ML filter shows all four AI and machine learning recommendations",
);
check(
  filtered.window.document
    .getElementById("reading-results")
    .textContent.includes("Showing 4 articles") &&
    filtered.window.document
      .querySelector('[data-reading-filter="ml"]')
      .getAttribute("aria-pressed") === "true",
  "filter updates the accessible count and selected state",
);
select("physics");
check(
  shown().length === 6 &&
    shown().every((card) => card.dataset.readingTopic === "physics"),
  "physics filter shows all six quantum and physics recommendations",
);
select("all");
check(
  shown().length === 10 &&
    filtered.window.document.querySelectorAll(
      '[data-reading-filter][aria-pressed="true"]',
    ).length === 1,
  "All reading restores the full selection with one active filter",
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
