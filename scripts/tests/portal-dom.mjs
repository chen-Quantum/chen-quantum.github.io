// DOM interaction tests. This does not start a server or a graphical browser.
// Install jsdom in a separate QA directory and set PORTAL_QA_ROOT to that path.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire, stripTypeScriptTypes } from "node:module";
const require = createRequire(
  path.resolve(process.env.PORTAL_QA_ROOT || ".", "package.json"),
);
const { JSDOM } = require("jsdom");
const html = fs.readFileSync("dist/students/index.html", "utf8");
const dom = new JSDOM(html, {
  url: "https://chen-quantum.github.io/students",
  runScripts: "outside-only",
});
const { window } = dom;
const courses = [
  {
    id: "international-engineering",
    title: "International Engineering Program",
    title_he: "המסלול הבינלאומי להנדסה",
    role: "Lecturer",
    board_enabled: true,
    access_code: "FIXTURE-CODE",
  },
  {
    id: "linear-algebra-electrical",
    title: "Linear Algebra · Electrical Engineering",
    title_he: "אלגברה לינארית להנדסת חשמל",
    role: "Teaching Assistant",
    board_enabled: true,
    access_code: "FIXTURE-CODE",
  },
  {
    id: "linear-algebra-biomedical",
    title: "Linear Algebra · Biomedical Engineering",
    title_he: "אלגברה לינארית להנדסה ביו־רפואית",
    role: "Teaching Assistant",
    board_enabled: true,
    access_code: "FIXTURE-CODE",
  },
  {
    id: "general",
    title: "General inquiries",
    title_he: "פניות כלליות",
    role: "Contact",
    board_enabled: false,
    access_code: null,
  },
];
const questions = [];
const tickets = [];
const members = new Set();
const calls = [];
let failNext = false;
let copied = "";
window.HTMLElement.prototype.scrollIntoView = function () {};
window.AbortSignal = globalThis.AbortSignal;
window.confirm = () => true;
Object.defineProperty(window.navigator, "clipboard", {
  value: {
    writeText: async (text) => {
      copied = text;
    },
  },
});
const response = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
window.fetch = async (url, opts = {}) => {
  const p = JSON.parse(opts.body || "{}");
  const staff = opts.headers?.Authorization === "Bearer qa-token";
  if (String(url).includes("/auth/v1/token"))
    return response({
      access_token: "qa-token",
      refresh_token: "qa-refresh",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
  if (String(url).includes("/auth/v1/logout")) return response({});
  calls.push({ p, headers: opts.headers });
  if (failNext) {
    failNext = false;
    throw new Error("simulated network failure");
  }
  switch (p.action) {
    case "config":
      return response({ courses: courses.map(({ access_code, ...c }) => c) });
    case "memberships":
      return response({ courses: [...members], staff });
    case "join":
      if (p.course !== "general" && p.code !== "FIXTURE-CODE")
        return response({ error: "invalid_class_code" }, 403);
      members.add(p.course);
      return response({ joined: true });
    case "board":
      return response({
        questions: questions.filter(
          (q) => q.course_id === p.course && (staff || !q.hidden),
        ),
        has_more: false,
      });
    case "tickets":
      return response({
        tickets: tickets.filter((t) => t.course_id === p.course),
        has_more: false,
      });
    case "question": {
      const q = {
        ...p,
        id: "11111111-1111-4111-8111-111111111111",
        course_id: p.course,
        status: "open",
        created_at: new Date().toISOString(),
        hidden: false,
        pinned: false,
        votes: 0,
        voted: false,
        own: true,
        answers: [],
      };
      questions.push(q);
      return response({ id: q.id }, 201);
    }
    case "ticket": {
      const t = {
        ...p,
        id: "22222222-2222-4222-8222-222222222222",
        course_id: p.course,
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [],
      };
      tickets.push(t);
      return response({ id: t.id }, 201);
    }
    case "answer": {
      const q = questions.find((q) => q.id === p.id);
      q.answers.push({
        id: "33333333-3333-4333-8333-333333333333",
        body: p.body,
        official: staff,
        created_at: new Date().toISOString(),
      });
      if (staff) q.status = "answered";
      return response({ ok: true });
    }
    case "ticket_message": {
      const t = tickets.find((t) => t.id === p.id);
      t.messages.push({
        id: "44444444-4444-4444-8444-444444444444",
        body: p.body,
        official: staff,
        created_at: new Date().toISOString(),
      });
      return response({ ok: true });
    }
    case "dashboard":
      return staff
        ? response({
            courses,
            open_questions: questions.filter((q) => q.status === "open").length,
            open_tickets: tickets.length,
          })
        : response({ error: "staff_only" }, 403);
    case "moderate_question":
      Object.assign(
        questions.find((q) => q.id === p.id),
        p,
      );
      return response({ ok: true });
    case "ticket_status":
      Object.assign(
        tickets.find((t) => t.id === p.id),
        p,
      );
      return response({ ok: true });
    case "vote": {
      const q = questions.find((q) => q.id === p.id);
      q.voted = p.active;
      q.votes = p.active ? 1 : 0;
      return response({ ok: true });
    }
    default:
      throw new Error("unhandled mock action " + p.action);
  }
};
let count = 0;
function check(condition, label) {
  assert.ok(condition, label);
  console.log("PASS " + label);
  count++;
}
async function until(fn) {
  for (let n = 0; n < 200; n++) {
    if (fn()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error("DOM state timed out");
}
const $ = (s) => window.document.querySelector(s);
const $$ = (s) => [...window.document.querySelectorAll(s)];
const click = (s) => {
  const el = $(s);
  assert.ok(el, "button exists: " + s);
  el.click();
};
const set = (s, value) => {
  $(s).value = value;
};
const submit = (s) => {
  $(s).dispatchEvent(
    new window.Event("submit", { bubbles: true, cancelable: true }),
  );
};
const input = (s) =>
  $(s).dispatchEvent(new window.Event("input", { bubbles: true }));
const change = (s) =>
  $(s).dispatchEvent(new window.Event("change", { bubbles: true }));
window.localStorage.setItem("cg-portal-lang", "he");
check(
  !/[\u0590-\u05ff]/.test($("#student-portal").textContent),
  "first-load HTML is English before JavaScript runs",
);
window.eval(
  stripTypeScriptTypes(
    fs.readFileSync("src/scripts/student-portal.ts", "utf8"),
    { mode: "transform" },
  ),
);
await until(() => $$('[data-form="join"]').length === 3);
check(
  $("#student-portal").dir === "ltr" && $("#student-portal").lang === "en",
  "English interface starts in LTR despite an old Hebrew preference",
);
check(
  !$("#portal-language"),
  "no language control can switch the interface away from English",
);
check(
  !/[\u0590-\u05ff]/.test($("#student-portal").textContent),
  "student landing labels and course names are English",
);
check(
  window.localStorage.getItem("cg-portal-key").length === 64,
  "student recovery key is generated and persisted",
);
check(
  !$("#portal-content").textContent.includes("FIXTURE-CODE"),
  "class codes are absent from student landing screen",
);
set(
  '[data-form="join"][data-course="linear-algebra-electrical"] input',
  "incorrect",
);
submit('[data-form="join"][data-course="linear-algebra-electrical"]');
await until(() => $("#portal-notice").classList.contains("error"));
check(
  $("#portal-notice").textContent.includes("Incorrect class code"),
  "validation errors are English",
);
check(
  $$('[data-form="join"]').length === 3,
  "incorrect class code keeps the student on the join screen",
);
set(
  '[data-form="join"][data-course="linear-algebra-electrical"] input',
  "FIXTURE-CODE",
);
submit('[data-form="join"][data-course="linear-algebra-electrical"]');
await until(
  () =>
    $("#portal-board-tab") &&
    !$("#portal-list").textContent.includes("Loading"),
);
check(
  $("#portal-course-select").value === "linear-algebra-electrical",
  "correct code opens the requested classroom",
);
click('[data-action="compose"]');
check(
  $('[data-form="question"] input[name="title"]').getAttribute("maxlength") ===
    "180",
  "question subject length is constrained",
);
const unsafe = '<img src=x onerror="alert(1)">';
set('[data-form="question"] input[name="title"]', "Vectors " + unsafe);
set('[data-form="question"] textarea', "A question with " + unsafe);
submit('[data-form="question"]');
await until(() => $$(".portal-question-head").length === 1);
check(
  !$("#portal-list img") && !$("#portal-list [onerror]"),
  "student question text cannot inject HTML",
);
check(
  $("#portal-list").textContent.includes(unsafe),
  "special characters remain readable as literal text",
);
set('[data-form="answer"] textarea', "An anonymous peer reply");
submit('[data-form="answer"]');
await until(() => $$(".portal-reply").length === 1);
check(
  $(".portal-reply").textContent.includes("Anonymous reply"),
  "peer answer is labeled anonymous",
);
click('[data-action="vote"]');
await until(() => $(".portal-vote").getAttribute("aria-pressed") === "true");
check(
  $(".portal-vote").getAttribute("aria-pressed") === "true",
  "same-question vote updates its pressed state",
);
set("#portal-search", "nothing-matches");
input("#portal-search");
check(!$(".portal-question-head"), "search filters the current page");
set("#portal-search", "");
input("#portal-search");
click('[data-action="view-tickets"]');
await until(
  () =>
    $("#portal-tickets-tab")?.getAttribute("aria-selected") === "true" &&
    !$("#portal-list").textContent.includes("Loading"),
);
click('[data-action="compose"]');
check(
  $('[data-form="ticket"] input[type="checkbox"]').required,
  "private request requires recovery-code acknowledgment",
);
set('[data-form="ticket"] input[name="subject"]', "Private logistics");
set('[data-form="ticket"] textarea', "A private issue");
submit('[data-form="ticket"]');
await until(() => $(".portal-ticket-id"));
check(
  $("#portal-list").textContent.includes("Private logistics"),
  "private request appears under My requests",
);
click('[data-action="copy-recovery"]');
await until(() => copied.length === 64);
check(
  copied === window.localStorage.getItem("cg-portal-key"),
  "copy recovery code uses the current private key",
);
click("#portal-staff");
set('[data-form="login"] input[name="email"]', "qa@example.invalid");
set('[data-form="login"] input[name="password"]', "fixture-only");
submit('[data-form="login"]');
await until(() => $$(".portal-code").length === 3 && $("#portal-board-tab"));
check(
  $("#portal-content").textContent.includes("instructor dashboard"),
  "instructor gets a distinct management dashboard",
);
check(
  !/[\u0590-\u05ff]/.test($("#portal-content").textContent),
  "instructor dashboard and class codes use English labels",
);
check(
  $$(".portal-code").length === 3,
  "class codes appear only after instructor authorization",
);
set("#portal-course-select", "linear-algebra-electrical");
change("#portal-course-select");
await until(
  () =>
    $("#portal-course-select").value === "linear-algebra-electrical" &&
    $("#portal-list") &&
    !$("#portal-list").textContent.includes("Loading"),
);
click('[data-action="view-board"]');
await until(() => $$(".portal-question-head").length === 1);
set('[data-form="answer"] textarea', "Official explanation");
submit('[data-form="answer"]');
await until(() => $$(".portal-reply.official").length === 1);
check(
  $(".portal-reply.official").textContent.includes("Instructor"),
  "official reply is visually distinct",
);
check(
  !!$("[data-moderate-question]"),
  "instructor can manage discussion status",
);
failNext = true;
set("#portal-course-select", "linear-algebra-biomedical");
change("#portal-course-select");
await until(
  () =>
    $("#portal-notice").classList.contains("error") &&
    $("#portal-course-select").value === "linear-algebra-biomedical",
);
check(
  !$(".portal-question-head"),
  "failed classroom change does not show stale content from another class",
);
click('[data-action="logout"]');
await until(() => $$('[data-form="join"]').length === 3);
check(
  !window.sessionStorage.getItem("cg-portal-staff"),
  "instructor sign out removes the session",
);
click('[data-action="general"]');
await until(
  () =>
    $('[data-form="ticket"]') && $("#portal-course-select").value === "general",
);
check(
  !$("#portal-board-tab"),
  "general inquiries provide private requests without a public forum",
);
check(
  !calls.some((c) => c.p.action === "question" && c.p.official),
  "student UI never asks for an official reply flag",
);
const ids = $$("[id]").map((el) => el.id);
check(
  ids.length === new Set(ids).size,
  "interactive interface has unique element IDs",
);
console.log(JSON.stringify({ passed: count }));
dom.window.close();
