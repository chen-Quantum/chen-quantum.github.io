const API_BASE = "https://ccrthybyqhbnrclxomls.supabase.co";
const PUBLIC_KEY = "sb_publishable_ZKc3ePy8loeTC8FNnyc-wg_F1qPai9B";
const API = `${API_BASE}/functions/v1/student-portal`;
const root = document.getElementById("student-portal")!;
const content = document.getElementById("portal-content")!;
const notice = document.getElementById("portal-notice")!;
const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
type Course = {
  id: string;
  title: string;
  title_he: string;
  role: string;
  board_enabled: boolean;
  access_code?: string;
};
type Message = {
  id: string;
  body: string;
  official: boolean;
  created_at: string;
  hidden?: boolean;
  own?: boolean;
};
type Question = {
  id: string;
  title: string;
  body: string;
  category: string;
  status: string;
  created_at: string;
  hidden: boolean;
  pinned: boolean;
  votes: number;
  voted: boolean;
  own: boolean;
  answers: Message[];
};
type Ticket = {
  id: string;
  subject: string;
  body: string;
  category: string;
  student_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
};
type StaffSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in?: number;
};
const state = {
  phase: "landing",
  courses: [] as Course[],
  members: [] as string[],
  course: "",
  staff: false,
  session: null as StaffSession | null,
  view: "board",
  compose: "",
  questions: [] as Question[],
  tickets: [] as Ticket[],
  offset: 0,
  more: false,
  loading: false,
  search: "",
  status: "all",
  category: "all",
  dashboard: null as null | {
    open_questions: number;
    open_tickets: number;
    courses: Course[];
  },
};
let actorKey = "";
let sequence = 0;
function rememberSession(session: StaffSession | null) {
  state.session = session;
  if (session)
    sessionStorage.setItem("cg-portal-staff", JSON.stringify(session));
  else sessionStorage.removeItem("cg-portal-staff");
}
function showNotice(message: string, error = false) {
  notice.textContent = message;
  notice.classList.toggle("error", error);
  notice.hidden = false;
  notice.scrollIntoView({ block: "nearest", behavior: "smooth" });
}
function errorText(error: unknown) {
  const code = error instanceof Error ? error.message : String(error);
  const messages: Record<string, string> = {
    invalid_class_code: "Incorrect class code. Get your class code from Chen.",
    rate_limit: "Too many requests. Please try again in a few minutes.",
    join_required: "Join this class with its access code first.",
    invalid_input: "Please check the fields and text length.",
    thread_closed: "This discussion is closed to new replies.",
    staff_session_expired:
      "Your instructor session expired. Please sign in again.",
    staff_only: "This action is available to the instructor only.",
    not_found: "This item was not found or is not accessible to this account.",
    invalid_login:
      "Incorrect sign-in details. Use your existing teaching workspace account.",
  };
  return (
    messages[code] ||
    "Unable to complete this action. Check your connection and retry. Your form stays here until you leave the page."
  );
}
async function api(action: string, params: Record<string, unknown> = {}) {
  if (state.session && state.session.expires_at * 1000 < Date.now() + 30000) {
    const res = await fetch(
      `${API_BASE}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: { apikey: PUBLIC_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: state.session.refresh_token }),
        signal: AbortSignal.timeout(20000),
      },
    );
    if (!res.ok) {
      rememberSession(null);
      state.staff = false;
      throw new Error("staff_session_expired");
    }
    const data = await res.json();
    rememberSession({
      ...data,
      expires_at:
        data.expires_at || Math.floor(Date.now() / 1000) + data.expires_in,
    });
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: PUBLIC_KEY,
    "x-portal-key": actorKey,
  };
  if (state.session)
    headers.Authorization = `Bearer ${state.session.access_token}`;
  const res = await fetch(API, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, course: state.course, ...params }),
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "server_error");
  return data;
}
const courseTitle = (c: Course) => c.title;
const selected = () => state.courses.find((c) => c.id === state.course)!;
const statusLabel = (s: string) =>
  ({
    open: "Awaiting a reply",
    answered: "Answered by instructor",
    closed: "Discussion closed",
    in_progress: "In progress",
    resolved: "Resolved",
  })[s] || s;
const categoryLabel = (s: string) =>
  ({
    concept: "Concepts",
    exercise: "Exercises",
    logistics: "Logistics",
    technical: "Technical",
    material: "Materials",
    personal: "Personal",
    other: "Other",
  })[s] || s;
const date = (s: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(s));
const button = (
  label: string,
  action: string,
  extra = "",
  cls = "secondary small",
) =>
  `<button type="button" class="portal-button ${cls}" data-action="${action}" ${extra}>${label}</button>`;
const options = (values: string[], label: (s: string) => string, value = "") =>
  values
    .map(
      (v) =>
        `<option value="${escapeHtml(v)}" ${v === value ? "selected" : ""}>${escapeHtml(label(v))}</option>`,
    )
    .join("");
function recovery() {
  return `<details class="portal-recovery"><summary>${"My access & recovery code"}</summary><div class="portal-form"><p>${"Your recovery code unlocks your private requests. Save it privately to return from another device. Anyone with the code can read your requests. Without it, clearing browser data or using a private window can lose access."}</p><label><span class="portal-label">${"My private recovery code"}</span><input value="${escapeHtml(actorKey)}" readonly dir="ltr" aria-label="${"Recovery code"}" /></label><div>${button("Copy code", "copy-recovery")}</div><form data-form="restore" class="portal-form"><label><span class="portal-label">${"Restore access from another device"}</span><input name="recovery" pattern="[a-fA-F0-9]{64}" maxlength="64" minlength="64" required autocomplete="off" dir="ltr" /></label><div class="portal-form-actions"><button class="portal-button secondary small">${"Restore access"}</button>${button("Forget me on this device", "forget", "", "danger small")}</div></form></div></details>`;
}
function landing() {
  const courses = state.courses.filter((c) => c.board_enabled);
  return `<div class="portal-section-head"><div><h2>${"Your classroom, in one place"}</h2><p class="portal-muted">${"Choose your class and enter the code shared in class. No email or registration needed."}</p></div>${button("Refresh", "refresh-config")}</div><div class="portal-grid">${courses.map((c, i) => `<article class="portal-card portal-course"><span class="portal-course-number">0${i + 1} / ${c.role === "Lecturer" ? "LECTURE" : "TUTORIAL"}</span><h3>${escapeHtml(courseTitle(c))}</h3><p class="portal-muted">${"Anonymous discussions and private requests to Chen"}</p><form class="portal-form" data-form="join" data-course="${escapeHtml(c.id)}">${state.members.includes(c.id) ? "" : `<label><span class="portal-label">${"Class code"}</span><input name="code" required maxlength="24" autocomplete="off" autocapitalize="characters" dir="ltr" /></label>`}<button class="portal-button">${state.members.includes(c.id) ? "Return to my class" : "Enter classroom"}</button></form></article>`).join("")}</div><div class="portal-card portal-section-head"><div><h3>${"General inquiry, research or collaboration?"}</h3><p class="portal-muted">${"Start a private conversation here without a class code."}</p></div>${button("Start a private request", "general", "", "")}</div>${recovery()}`;
}
function login() {
  return `<section class="portal-card portal-login"><p class="portal-eyebrow">INSTRUCTOR ACCESS</p><h2>${"Instructor sign in"}</h2><p class="portal-muted">${"Use your existing teaching workspace account. Account details are used for sign-in only. Messages and replies stay on the website."}</p><form class="portal-form" data-form="login"><label><span class="portal-label">${"Teaching workspace account"}</span><input type="email" name="email" autocomplete="username" dir="ltr" required /></label><label><span class="portal-label">${"Password"}</span><input type="password" name="password" autocomplete="current-password" required /></label><div class="portal-form-actions"><button class="portal-button">${"Sign in"}</button>${button("Back", "landing")}</div></form></section>`;
}
function dashboard() {
  if (!state.staff || !state.dashboard) return "";
  const d = state.dashboard;
  return `<details class="portal-card" open><summary><strong>${"Chen’s instructor dashboard"}</strong></summary><div class="portal-stats"><div class="portal-stat"><strong>${d.open_questions}</strong>${"Questions awaiting a reply"}</div><div class="portal-stat"><strong>${d.open_tickets}</strong>${"Open and active private requests"}</div></div><p class="portal-muted">${"Counts cover all classes. Select a class below to reply. Class codes are shown only to you. Share them with students in class."}</p>${d.courses
    .filter((c) => c.board_enabled)
    .map(
      (c) =>
        `<div class="portal-code"><span>${escapeHtml(courseTitle(c))}</span><div><code dir="ltr">${escapeHtml(c.access_code)}</code> ${button("Copy", "copy-code", `data-code="${escapeHtml(c.access_code)}"`)}</div></div>`,
    )
    .join("")}</details>`;
}
function compose() {
  if (!state.compose) return "";
  const q = state.compose === "question";
  return `<section class="portal-card portal-compose"><h2>${q ? "Ask your class" : "Private request to Chen"}</h2><p class="portal-muted">${q ? "Your question appears without a name to your class. Include the tutorial and exercise number where useful. Keep personal information off the board." : "Only you and Chen can access this conversation. Return to My requests to read replies and continue the conversation."}</p><form class="portal-form" data-form="${q ? "question" : "ticket"}"><div class="portal-form-row"><label><span class="portal-label">${"Category"}</span><select name="category">${options(q ? ["concept", "exercise", "logistics", "technical"] : ["logistics", "material", "personal", "other"], categoryLabel)}</select></label>${q ? "" : `<label><span class="portal-label">${"Name or identifying detail, only if needed (optional)"}</span><input name="student_name" maxlength="120" dir="auto" autocomplete="off" /></label>`}</div><label><span class="portal-label">${"Subject"}</span><input name="${q ? "title" : "subject"}" required minlength="4" maxlength="180" dir="auto" /></label><label><span class="portal-label">${"Message"}</span><textarea name="body" required minlength="5" maxlength="8000" rows="6" dir="auto"></textarea></label><label class="portal-checkbox"><input type="checkbox" required /><span>${q ? "I understand this will appear anonymously on the class board and have not included personal information." : "I have saved my recovery code and will check for replies here."}</span></label><div class="portal-form-actions"><button class="portal-button">${q ? "Post anonymous question" : "Send private request"}</button>${button("Cancel", "cancel-compose")}</div></form></section>`;
}
function reply(message: Message, questionId?: string) {
  return `<div class="portal-reply ${message.official ? "official" : ""}"><div class="portal-tags"><span class="portal-badge ${message.official ? "official" : ""}">${message.official ? "Chen Gadi · Instructor" : "Anonymous reply"}</span>${message.hidden ? `<span class="portal-badge hidden">${"Hidden"}</span>` : ""}<time class="portal-meta">${date(message.created_at)}</time></div><p class="portal-text" dir="auto">${escapeHtml(message.body)}</p>${state.staff && questionId ? button(message.hidden ? "Show reply" : "Hide reply", "moderate-answer", `data-id="${questionId}" data-answer="${message.id}" data-hidden="${!message.hidden}"`) : ""}</div>`;
}
function answerForm(id: string, ticket = false) {
  return `<form class="portal-form" data-form="${ticket ? "ticket_message" : "answer"}" data-id="${id}"><label><span class="portal-label">${state.staff ? "Your instructor reply" : ticket ? "Continue this private conversation" : "Your anonymous reply"}</span><textarea name="body" required minlength="2" maxlength="8000" rows="3" dir="auto"></textarea></label><div><button class="portal-button small">${"Send reply"}</button></div></form>`;
}
function questionCard(q: Question) {
  return `<article class="portal-card"><div class="portal-tags"><span class="portal-badge ${q.status}">${statusLabel(q.status)}</span><span class="portal-badge">${categoryLabel(q.category)}</span>${q.own ? `<span class="portal-badge">${"My question"}</span>` : ""}${q.pinned ? `<span class="portal-badge">${"Pinned"}</span>` : ""}${q.hidden ? `<span class="portal-badge hidden">${"Hidden from class"}</span>` : ""}</div><div class="portal-question-head"><h3 dir="auto">${escapeHtml(q.title)}</h3></div><p class="portal-text" dir="auto">${escapeHtml(q.body)}</p><p class="portal-meta">${"Anonymous question"} · ${date(q.created_at)}</p><div class="portal-question-actions"><span class="portal-meta">${q.answers.length} ${"replies"}</span><button class="portal-vote" data-action="vote" data-id="${q.id}" aria-pressed="${q.voted}">+1 · ${q.votes} ${"I have this question too"}</button></div><details class="portal-replies"><summary>${"Read replies & join the discussion"}</summary>${q.answers.map((a) => reply(a, q.id)).join("")}${q.status === "closed" && !state.staff ? `<p class="portal-muted">${"This discussion is closed to new replies."}</p>` : answerForm(q.id)}</details>${state.staff ? `<div class="portal-admin-actions"><label class="portal-label">${"Discussion status"}<select data-moderate-question="${q.id}">${options(["open", "answered", "closed"], statusLabel, q.status)}</select></label>${button(q.pinned ? "Unpin" : "Pin", "pin", `data-id="${q.id}"`)}${button(q.hidden ? "Show to class" : "Hide from class", "hide-question", `data-id="${q.id}"`)}</div>` : ""}</article>`;
}
function ticketCard(t: Ticket) {
  return `<article class="portal-card"><div class="portal-tags"><span class="portal-badge ${t.status}">${statusLabel(t.status)}</span><span class="portal-badge">${categoryLabel(t.category)}</span><span class="portal-meta">${"Private conversation"}</span></div><h3 dir="auto">${escapeHtml(t.subject)}</h3>${t.student_name ? `<p class="portal-meta portal-break" dir="auto">${escapeHtml(t.student_name)}</p>` : ""}<p class="portal-text" dir="auto">${escapeHtml(t.body)}</p><p class="portal-meta">${date(t.updated_at)} · <span class="portal-ticket-id">#${t.id}</span></p><details class="portal-replies"><summary>${"Open conversation"} · ${t.messages.length} ${"replies"}</summary>${t.messages.map((m) => reply(m)).join("")}${answerForm(t.id, true)}</details>${state.staff ? `<div class="portal-admin-actions"><label class="portal-label">${"Request status"}<select data-ticket-status="${t.id}">${options(["open", "in_progress", "resolved"], statusLabel, t.status)}</select></label></div>` : ""}</article>`;
}
function list() {
  const board = state.view === "board";
  const items = board ? state.questions : state.tickets;
  const search = state.search.toLocaleLowerCase();
  const filtered = items.filter((item) => {
    const all =
      "title" in item
        ? `${item.title} ${item.body} ${item.answers.map((a) => a.body).join(" ")}`
        : `${item.subject} ${item.body} ${item.student_name} ${item.messages.map((m) => m.body).join(" ")}`;
    return (
      (state.status === "all" || item.status === state.status) &&
      (state.category === "all" || item.category === state.category) &&
      all.toLocaleLowerCase().includes(search)
    );
  });
  return `${state.loading ? `<p class="portal-loading">${"Loading conversations..."}</p>` : filtered.length ? filtered.map((item) => (board ? questionCard(item as Question) : ticketCard(item as Ticket))).join("") : `<div class="portal-empty"><h3>${items.length ? "No matches for your filters" : board ? "Every discussion starts with a question" : "No requests on this page yet"}</h3><p class="portal-muted">${items.length ? "Try adjusting your search or filters." : board ? "Something unclear? Someone else in your class probably has the same question." : "Requests and replies will appear here. Start a private request for personal or logistical matters."}</p></div>`}`;
}
function workspace() {
  const c = selected();
  if (!c) {
    state.phase = "landing";
    return landing();
  }
  const board = state.view === "board";
  return `${dashboard()}<div class="portal-section-head" style="margin-top:28px"><div><p class="portal-eyebrow">${state.staff ? "INSTRUCTOR VIEW" : "CLASSROOM"}</p><h2>${escapeHtml(courseTitle(c))}</h2></div><div>${button("Change class", "landing")}${state.staff ? " " + button("Sign out of instructor view", "logout") : ""}</div></div><label><span class="portal-label">${"Your classroom"}</span><select id="portal-course-select">${(state.staff ? state.courses : state.courses.filter((c) => state.members.includes(c.id))).map((c) => `<option value="${escapeHtml(c.id)}" ${state.course === c.id ? "selected" : ""}>${escapeHtml(courseTitle(c))}</option>`).join("")}</select></label><div class="portal-resource-links"><a href="/teaching">${"Practice sheets & recordings"} ↗</a>${c.id.includes("linear-algebra") ? `<a href="/teaching/linear-algebra">${"Linear algebra recordings"} ↗</a>` : ""}</div><div class="portal-toolbar"><div class="portal-tabs" role="tablist" aria-label="${"Conversation type"}">${c.board_enabled ? `<button class="portal-tab" role="tab" data-action="view-board" aria-selected="${board}" aria-controls="portal-list" id="portal-board-tab">${"Anonymous Q&A"}</button>` : ""}<button class="portal-tab" role="tab" data-action="view-tickets" aria-selected="${!board}" aria-controls="portal-list" id="portal-tickets-tab">${state.staff ? "Student requests" : "My private requests"}</button></div><div class="portal-form-actions">${button("Refresh", "refresh")}${button(board ? "+ Ask anonymously" : "+ Private request", "compose", "", "")}</div></div>${compose()}<div class="portal-search"><input type="search" id="portal-search" value="${escapeHtml(state.search)}" aria-label="${"Search this page"}" placeholder="${"Search this page..."}" /><select id="portal-filter-status" aria-label="${"Filter by status"}"><option value="all">${"All statuses"}</option>${options(board ? ["open", "answered", "closed"] : ["open", "in_progress", "resolved"], statusLabel, state.status)}</select><select id="portal-filter-category" aria-label="${"Filter by category"}"><option value="all">${"All topics"}</option>${options(board ? ["concept", "exercise", "logistics", "technical"] : ["logistics", "material", "personal", "other"], categoryLabel, state.category)}</select></div><div id="portal-list" role="tabpanel" aria-labelledby="${board ? "portal-board-tab" : "portal-tickets-tab"}" class="portal-list">${list()}</div><div class="portal-more">${state.offset ? button("Previous", "previous") : ""}${state.more ? button("Next", "next") : ""}</div>${recovery()}`;
}
function render() {
  content.setAttribute("aria-busy", "false");
  content.innerHTML =
    state.phase === "login"
      ? login()
      : state.phase === "workspace"
        ? workspace()
        : landing();
}
async function loadView(reset = false) {
  if (reset) {
    state.offset = 0;
    state.search = "";
    state.status = "all";
    state.category = "all";
    state.questions = [];
    state.tickets = [];
    state.more = false;
  }
  const n = ++sequence;
  state.loading = true;
  render();
  try {
    const data = await api(state.view === "board" ? "board" : "tickets", {
      offset: state.offset,
    });
    if (n !== sequence) return;
    if (state.view === "board") state.questions = data.questions;
    else state.tickets = data.tickets;
    state.more = data.has_more;
    if (state.staff) state.dashboard = await api("dashboard");
  } finally {
    if (n === sequence) {
      state.loading = false;
      render();
    }
  }
}
async function openCourse(id: string) {
  state.course = id;
  state.phase = "workspace";
  state.compose = "";
  if (!selected().board_enabled) state.view = "tickets";
  await loadView(true);
}
async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    showNotice("Code copied. Store it privately.");
  } catch {
    showNotice(
      "Your browser blocked copying. Select the code and copy it manually.",
    );
  }
}
root.addEventListener("submit", async (event) => {
  const form = event.target as HTMLFormElement;
  if (!form.dataset.form) return;
  event.preventDefault();
  notice.hidden = true;
  const submit = form.querySelector<HTMLButtonElement>(
    "button[type=submit],button:not([type])",
  );
  if (submit) submit.disabled = true;
  const values = Object.fromEntries(new FormData(form)) as Record<
    string,
    string
  >;
  try {
    const kind = form.dataset.form;
    if (kind === "join") {
      const id = form.dataset.course!;
      if (!state.members.includes(id)) {
        await api("join", { course: id, code: values.code });
        state.members.push(id);
      }
      await openCourse(id);
    } else if (kind === "login") {
      const res = await fetch(`${API_BASE}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: PUBLIC_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(values),
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error("invalid_login");
      const session = await res.json();
      rememberSession({
        ...session,
        expires_at:
          session.expires_at ||
          Math.floor(Date.now() / 1000) + session.expires_in,
      });
      try {
        state.dashboard = await api("dashboard");
      } catch (error) {
        rememberSession(null);
        throw error;
      }
      state.staff = true;
      await openCourse(state.courses.find((c) => c.board_enabled)!.id);
    } else if (kind === "restore") {
      const key = values.recovery.trim().toLowerCase();
      if (!/^[a-f0-9]{64}$/.test(key)) throw new Error("invalid_input");
      localStorage.setItem("cg-portal-key", key);
      actorKey = key;
      const memberships = await api("memberships");
      state.members = memberships.courses;
      state.phase = "landing";
      render();
      showNotice(
        "Access restored. Choose a class to return to your conversations.",
      );
    } else {
      const result = await api(kind!, { ...values, id: form.dataset.id });
      state.compose = "";
      await loadView();
      showNotice(
        kind === "ticket"
          ? `Request sent. Tracking ID: ${result.id}. Replies will appear here. Remember to save your recovery code.`
          : "Sent successfully.",
      );
    }
  } catch (error) {
    showNotice(errorText(error), true);
  } finally {
    if (submit) submit.disabled = false;
  }
});
root.addEventListener("click", async (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
    "button",
  );
  if (!target) return;
  if (target.id === "portal-staff") {
    state.phase = state.staff ? "workspace" : "login";
    if (state.staff && !state.course)
      state.course = state.courses.find((c) => c.board_enabled)!.id;
    render();
    return;
  }
  const action = target.dataset.action;
  if (!action) return;
  target.disabled = true;
  try {
    const id = target.dataset.id;
    const q = state.questions.find((q) => q.id === id);
    if (action === "landing") {
      ++sequence;
      state.phase = "landing";
      state.compose = "";
      render();
    }
    if (action === "general") {
      await api("join", { course: "general" });
      if (!state.members.includes("general")) state.members.push("general");
      await openCourse("general");
      state.compose = "ticket";
      render();
    }
    if (action === "view-board" || action === "view-tickets") {
      state.view = action === "view-board" ? "board" : "tickets";
      state.compose = "";
      await loadView(true);
    }
    if (action === "refresh") await loadView();
    if (action === "refresh-config") await bootstrap();
    if (action === "compose") {
      state.compose = state.view === "board" ? "question" : "ticket";
      render();
      content.querySelector<HTMLElement>(".portal-compose input")?.focus();
    }
    if (action === "cancel-compose") {
      state.compose = "";
      render();
    }
    if (action === "copy-recovery") await copy(actorKey);
    if (action === "copy-code") await copy(target.dataset.code!);
    if (action === "vote" && q) {
      await api("vote", { id, active: !q.voted });
      await loadView();
    }
    if (action === "hide-question" && q) {
      await api("moderate_question", { id, hidden: !q.hidden });
      await loadView();
    }
    if (action === "pin" && q) {
      await api("moderate_question", { id, pinned: !q.pinned });
      await loadView();
    }
    if (action === "moderate-answer") {
      await api("moderate_answer", {
        id,
        answer_id: target.dataset.answer,
        hidden: target.dataset.hidden === "true",
      });
      await loadView();
    }
    if (action === "previous" || action === "next") {
      state.offset = Math.max(0, state.offset + (action === "next" ? 30 : -30));
      state.search = "";
      await loadView();
    }
    if (action === "logout") {
      const token = state.session?.access_token;
      rememberSession(null);
      state.staff = false;
      state.dashboard = null;
      state.phase = "landing";
      render();
      if (token)
        await fetch(`${API_BASE}/auth/v1/logout?scope=local`, {
          method: "POST",
          headers: { apikey: PUBLIC_KEY, Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(15000),
        }).catch(() => {});
    }
    if (
      action === "forget" &&
      confirm(
        "Without your recovery code you will lose access to your requests on this device. Continue?",
      )
    ) {
      localStorage.removeItem("cg-portal-key");
      rememberSession(null);
      location.reload();
    }
  } catch (error) {
    showNotice(errorText(error), true);
  } finally {
    target.disabled = false;
  }
});
root.addEventListener("change", async (event) => {
  const el = event.target as HTMLSelectElement;
  try {
    if (el.id === "portal-course-select") await openCourse(el.value);
    if (
      el.id === "portal-filter-status" ||
      el.id === "portal-filter-category"
    ) {
      if (el.id === "portal-filter-status") state.status = el.value;
      else state.category = el.value;
      document.getElementById("portal-list")!.innerHTML = list();
    }
    if (el.dataset.moderateQuestion) {
      el.disabled = true;
      await api("moderate_question", {
        id: el.dataset.moderateQuestion,
        status: el.value,
      });
      await loadView();
    }
    if (el.dataset.ticketStatus) {
      el.disabled = true;
      await api("ticket_status", {
        id: el.dataset.ticketStatus,
        status: el.value,
      });
      await loadView();
    }
  } catch (error) {
    showNotice(errorText(error), true);
    el.disabled = false;
  }
});
root.addEventListener("input", (event) => {
  const el = event.target as HTMLInputElement;
  if (el.id === "portal-search") {
    state.search = el.value;
    document.getElementById("portal-list")!.innerHTML = list();
  }
});
async function bootstrap() {
  try {
    const cfg = await api("config");
    state.courses = cfg.courses;
    try {
      const membership = await api("memberships");
      state.members = membership.courses;
      state.staff = membership.staff;
    } catch (error) {
      if (state.session) {
        rememberSession(null);
        state.staff = false;
        state.members = (await api("memberships")).courses;
      } else throw error;
    }
    const queryCourse = new URLSearchParams(location.search).get("course");
    if (state.staff) {
      state.dashboard = await api("dashboard");
      await openCourse(state.courses.find((c) => c.board_enabled)!.id);
    } else if (queryCourse === "general") {
      await api("join", { course: "general" });
      if (!state.members.includes("general")) state.members.push("general");
      await openCourse("general");
    } else if (queryCourse && state.members.includes(queryCourse))
      await openCourse(queryCourse);
    else render();
  } catch (error) {
    content.setAttribute("aria-busy", "false");
    content.innerHTML = `<div class="portal-empty"><h2>${"Unable to connect right now"}</h2><p class="portal-muted">${"You can retry. Existing conversations are saved."}</p>${button("Retry", "refresh-config")}</div>`;
    showNotice(errorText(error), true);
  }
}
try {
  actorKey = localStorage.getItem("cg-portal-key") || "";
  if (!/^[a-f0-9]{64}$/.test(actorKey)) {
    actorKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    localStorage.setItem("cg-portal-key", actorKey);
  }
  const saved = sessionStorage.getItem("cg-portal-staff");
  if (saved) {
    try {
      state.session = JSON.parse(saved);
    } catch {
      sessionStorage.removeItem("cg-portal-staff");
    }
  }
  render();
  void bootstrap();
} catch {
  content.setAttribute("aria-busy", "false");
  content.innerHTML =
    '<div class="portal-notice error">Allow browser storage and refresh to keep access to your requests.</div>';
}
