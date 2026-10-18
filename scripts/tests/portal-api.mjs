// Runs the actual Edge Function against an in-memory REST boundary.
// No accounts, messages, emails, or test rows are created in production.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { stripTypeScriptTypes } from "node:module";
import { createHash, randomUUID, webcrypto } from "node:crypto";
const project = "https://portal-test.invalid";
const keys = { a: "a".repeat(64), b: "b".repeat(64), staff: "c".repeat(64) };
const digest = (key) => createHash("sha256").update(key).digest("hex");
const course = "linear-algebra-electrical";
const otherCourse = "linear-algebra-biomedical";
const staffId = "11111111-1111-4111-8111-111111111111";
const tables = {
  student_portal_courses: [
    { id: course, board_enabled: true, access_code: "FIXTURECODE" },
    { id: otherCourse, board_enabled: true, access_code: "FIXTURECODE" },
    { id: "general", board_enabled: false, access_code: null },
  ],
  student_portal_staff: [{ user_id: staffId }],
  student_portal_memberships: [],
  student_portal_tickets: [],
  student_portal_ticket_messages: [],
  student_portal_questions: [],
  student_portal_answers: [],
  student_portal_votes: [],
};
const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
function matches(row, params) {
  for (const [field, value] of params) {
    if (["select", "order", "limit", "offset"].includes(field)) continue;
    if (value.startsWith("eq.") && String(row[field]) !== value.slice(3))
      return false;
    if (value.startsWith("neq.") && String(row[field]) === value.slice(4))
      return false;
    if (
      value.startsWith("in.(") &&
      !value.slice(4, -1).split(",").includes(String(row[field]))
    )
      return false;
  }
  return true;
}
const outbound = [];
async function boundary(url, opts = {}) {
  outbound.push(String(url));
  const target = new URL(url);
  if (target.origin !== project)
    throw new Error("Unexpected outbound request: " + target.origin);
  const headers = new Headers(opts.headers);
  if (target.pathname === "/auth/v1/user")
    return headers.get("authorization") === "Bearer fixture-staff-token"
      ? json({ id: staffId })
      : json({ error: "unauthorized" }, 401);
  const table = target.pathname.replace("/rest/v1/", "");
  if (table === "rpc/student_portal_rate_limit") return json(true);
  assert.ok(tables[table], "known table " + table);
  const method = opts.method || "GET";
  const body = opts.body ? JSON.parse(opts.body) : null;
  let rows = tables[table].filter((row) => matches(row, target.searchParams));
  if (method === "POST") {
    const row = {
      id: randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "open",
      student_email: null,
      request_kind: "private",
      hidden: false,
      pinned: false,
      ...body,
    };
    tables[table].push(row);
    return json(headers.get("prefer")?.includes("return=minimal") ? [] : [row]);
  }
  if (method === "PATCH") {
    for (const row of rows) Object.assign(row, body);
    return json(rows);
  }
  assert.equal(method, "GET");
  if (headers.get("prefer")?.includes("count=exact"))
    return json([], 200, { "content-range": `0-0/${rows.length}` });
  const offset = Number(target.searchParams.get("offset") || 0),
    limit = Number(target.searchParams.get("limit") || 10000);
  rows = rows.slice(offset, offset + limit);
  const select = target.searchParams.get("select");
  if (select)
    rows = rows.map((row) =>
      Object.fromEntries(select.split(",").map((key) => [key, row[key]])),
    );
  return json(rows);
}
let handler;
vm.runInNewContext(
  stripTypeScriptTypes(
    fs.readFileSync("supabase/functions/student-portal/index.ts", "utf8"),
    { mode: "transform" },
  ),
  {
    Deno: {
      env: {
        get: (name) =>
          name === "SUPABASE_URL" ? project : "fixture-service-key",
      },
      serve: (fn) => {
        handler = fn;
      },
    },
    crypto: webcrypto,
    TextEncoder,
    URLSearchParams,
    fetch: boundary,
    Response,
    console,
  },
);
let passed = 0;
function check(value, label) {
  assert.ok(value, label);
  console.log("PASS " + label);
  passed++;
}
async function call(
  action,
  params = {},
  actor = "a",
  status = 200,
  staff = false,
) {
  const headers = {
    "content-type": "application/json",
    "x-portal-key": keys[actor],
    Origin: "https://chen-quantum.github.io",
  };
  if (staff) headers.authorization = "Bearer fixture-staff-token";
  const response = await handler(
    new Request(project + "/functions/v1/student-portal", {
      method: "POST",
      headers,
      body: JSON.stringify({ action, course, ...params }),
    }),
  );
  const body = await response.json();
  assert.equal(response.status, status, `${action}: ${JSON.stringify(body)}`);
  return body;
}
for (const [params, error] of [
  [{ student_email: undefined }, "email_required"],
  [{ student_email: "invalid" }, "invalid_email"],
  [{ student_email: "bad\nmail@example.com" }, "invalid_email"],
  [{ course: "" }, "course_required"],
  [{ course: "general" }, "course_required"],
]) {
  const result = await call(
    "logistics",
    {
      subject: "Test logistics",
      body: "A private course question",
      student_email: "learner@example.invalid",
      ...params,
    },
    "a",
    400,
  );
  check(
    result.error === error,
    "logistics rejects " + error + " before storing a request",
  );
}
await call(
  "logistics",
  {
    course: "unknown-course",
    student_email: "learner@example.invalid",
    subject: "Unknown course",
    body: "Must not be stored",
  },
  "a",
  404,
);
check(
  tables.student_portal_tickets.length === 0,
  "invalid or missing contact details never create a ticket",
);
const ticket = await call(
  "logistics",
  {
    subject: "Private logistics",
    body: "Please check the tutorial room.",
    student_email: "  learner+tag@example.invalid  ",
    student_name: "Learner",
  },
  "a",
  201,
);
check(
  tables.student_portal_memberships.length === 0,
  "logistics submission does not grant classroom membership",
);
const own = (await call("my_tickets")).tickets;
check(
  own.length === 1 &&
    own[0].student_email === "learner+tag@example.invalid" &&
    own[0].course_id === course &&
    own[0].request_kind === "logistics",
  "sender can read the email and chosen course in the private inbox",
);
check(
  !JSON.stringify(own).includes("actor_hash") &&
    !JSON.stringify(own).includes(keys.a),
  "private inbox omits ownership secrets",
);
check(
  (await call("my_tickets", { actor_hash: digest(keys.a) }, "b")).tickets
    .length === 0,
  "another visitor cannot list a private email or spoof the owner",
);
await call(
  "ticket_message",
  { id: ticket.id, body: "Intrusion attempt" },
  "b",
  404,
);
await call(
  "ticket_message",
  { id: ticket.id, course: otherCourse, body: "Wrong course" },
  "a",
  404,
);
check(
  true,
  "private replies require both ticket ownership and matching course",
);
await call("board", {}, "a", 403);
await call("tickets", {}, "a", 403);
check(
  true,
  "logistics-only access cannot read a classroom discussion or its ticket list",
);
await call("ticket_message", {
  id: ticket.id,
  body: "A private follow-up",
  official: true,
});
const followup = (await call("my_tickets")).tickets[0];
check(
  followup.messages.length === 1 && !followup.messages[0].official,
  "sender can follow up without joining a classroom and cannot forge an official reply",
);
await call("dashboard", {}, "a", 403);
const staffTickets = (await call("tickets", {}, "staff", 200, true)).tickets;
check(
  staffTickets.some(
    (row) =>
      row.id === ticket.id &&
      row.student_email === "learner+tag@example.invalid",
  ),
  "verified instructor can read logistics contact details",
);
await call(
  "ticket_message",
  { id: ticket.id, body: "Official private reply" },
  "staff",
  200,
  true,
);
check(
  (await call("my_tickets")).tickets[0].messages.some(
    (message) => message.official,
  ),
  "official instructor reply returns through the website",
);
await call("join", { code: "fixture-code" });
await call(
  "question",
  {
    title: "Anonymous concept question",
    body: "How do I find a basis?",
    category: "concept",
    student_email: "ignored@example.invalid",
  },
  "a",
  201,
);
const board = await call("board");
check(
  board.questions.length === 1 &&
    !JSON.stringify(board).includes("student_email") &&
    !JSON.stringify(board).includes("learner+tag"),
  "anonymous discussions do not collect or expose logistics email details",
);
await call(
  "ticket",
  {
    subject: "Old form logistics",
    body: "This must use the new form.",
    category: "logistics",
  },
  "a",
  400,
);
check(
  true,
  "the older private-ticket endpoint cannot bypass required logistics fields",
);
await call(
  "ticket",
  {
    subject: "Private material request",
    body: "A private request without an email.",
    category: "material",
  },
  "a",
  201,
);
check(
  (await call("my_tickets")).tickets.some(
    (row) => row.category === "material" && row.student_email === null,
  ),
  "other private requests remain usable without providing email",
);
check(
  outbound.every(
    (url) =>
      url.startsWith(project + "/rest/v1/") ||
      url === project + "/auth/v1/user",
  ),
  "the request flow sends no outgoing email or external messages",
);
console.log(JSON.stringify({ passed, productionWrites: 0 }));
