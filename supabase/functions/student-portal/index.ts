// Public student API with capability-based student access and verified staff auth.
// No email is collected or sent. All database tables deny direct browser access.
const base = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const allowedOrigins = new Set([
  "https://chen-quantum.github.io",
  "http://localhost:4321",
  "http://127.0.0.1:4321",
]);
class PortalError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const hash = async (s: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
const columns = {
  question:
    "id,course_id,actor_hash,title,body,category,status,hidden,pinned,created_at",
  answer: "id,question_id,actor_hash,body,official,hidden,created_at",
  ticket:
    "id,course_id,subject,body,student_name,category,status,created_at,updated_at",
};
async function db(
  table: string,
  query: Record<string, string> = {},
  method = "GET",
  body?: unknown,
  prefer?: string,
) {
  const res = await fetch(
    `${base}/rest/v1/${table}?${new URLSearchParams(query)}`,
    {
      method,
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: prefer || "return=representation",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  );
  if (!res.ok) {
    console.error(
      "portal database operation failed",
      table,
      method,
      res.status,
    );
    throw new PortalError(500, "storage_error");
  }
  const responseBody = await res.text();
  return responseBody ? JSON.parse(responseBody) : [];
}
async function count(table: string, query: Record<string, string>) {
  const res = await fetch(
    `${base}/rest/v1/${table}?${new URLSearchParams({ ...query, select: "id", limit: "0" })}`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "count=exact",
      },
    },
  );
  if (!res.ok) throw new PortalError(500, "storage_error");
  return Number(res.headers.get("content-range")?.split("/")[1] || 0);
}
async function limit(bucket: string, max = 12, seconds = 60) {
  const ok = await db("rpc/student_portal_rate_limit", {}, "POST", {
    p_bucket: bucket,
    p_limit: max,
    p_seconds: seconds,
  });
  if (!ok) throw new PortalError(429, "rate_limit");
}
function text(value: unknown, min: number, max: number) {
  if (typeof value !== "string") throw new PortalError(400, "invalid_input");
  const s = value.trim();
  if (s.length < min || s.length > max)
    throw new PortalError(400, "invalid_input");
  return s;
}
function choice(value: unknown, options: string[]) {
  if (typeof value !== "string" || !options.includes(value))
    throw new PortalError(400, "invalid_input");
  return value;
}
function uuid(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      value,
    )
  )
    throw new PortalError(400, "invalid_input");
  return value;
}
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Vary: "Origin",
    "Access-Control-Allow-Headers":
      "content-type,apikey,authorization,x-portal-key",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };
  if (origin && allowedOrigins.has(origin))
    headers["Access-Control-Allow-Origin"] = origin;
  const respond = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers });
  if (origin && !allowedOrigins.has(origin))
    return respond({ error: "origin_denied" }, 403);
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (req.method !== "POST")
    return respond({ error: "method_not_allowed" }, 405);
  try {
    if (Number(req.headers.get("content-length") || 0) > 24000)
      throw new PortalError(413, "too_large");
    const raw = await req.text();
    if (raw.length > 24000) throw new PortalError(413, "too_large");
    let p: Record<string, unknown>;
    try {
      p = JSON.parse(raw);
    } catch {
      throw new PortalError(400, "invalid_input");
    }
    if (!p || typeof p !== "object" || Array.isArray(p))
      throw new PortalError(400, "invalid_input");
    const action = text(p.action, 2, 40);
    const ip = await hash(
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown",
    );
    await limit(`read:${ip}`, 240, 60);
    if (action === "config")
      return respond({
        courses: await db("student_portal_courses", {
          select: "id,title,title_he,role,board_enabled",
          order: "id",
        }),
      });
    const key = req.headers.get("x-portal-key") || "";
    if (!/^[a-f0-9]{64}$/.test(key))
      throw new PortalError(401, "session_required");
    const actor = await hash(key);
    let staff = false;
    const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
    if (token) {
      const auth = await fetch(`${base}/auth/v1/user`, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${token}` },
      });
      if (!auth.ok) throw new PortalError(401, "staff_session_expired");
      const user = await auth.json();
      const rows = await db("student_portal_staff", {
        select: "user_id",
        user_id: `eq.${user.id}`,
        limit: "1",
      });
      staff = rows.length === 1;
      if (!staff) throw new PortalError(403, "staff_only");
    }
    if (action === "memberships") {
      const rows = await db("student_portal_memberships", {
        select: "course_id",
        actor_hash: `eq.${actor}`,
      });
      return respond({
        courses: rows.map((r: { course_id: string }) => r.course_id),
        staff,
      });
    }
    if (action === "dashboard") {
      if (!staff) throw new PortalError(403, "staff_only");
      const [courses, questions, tickets] = await Promise.all([
        db("student_portal_courses", {
          select: "id,title,title_he,role,access_code,board_enabled",
          order: "id",
        }),
        count("student_portal_questions", {
          status: "eq.open",
          hidden: "eq.false",
        }),
        count("student_portal_tickets", { status: "neq.resolved" }),
      ]);
      return respond({
        courses,
        open_questions: questions,
        open_tickets: tickets,
      });
    }
    const courseId = text(p.course, 2, 80);
    const courses = await db("student_portal_courses", {
      id: `eq.${courseId}`,
      select: "id,title,title_he,access_code,board_enabled",
      limit: "1",
    });
    const course = courses[0];
    if (!course) throw new PortalError(404, "course_not_found");
    if (action === "join") {
      await limit(`join:${ip}`, 12, 60);
      if (
        course.access_code &&
        String(p.code || "")
          .replace(/[\s-]/g, "")
          .toUpperCase() !== course.access_code
      )
        throw new PortalError(403, "invalid_class_code");
      await db(
        "student_portal_memberships",
        {},
        "POST",
        { actor_hash: actor, course_id: courseId },
        "resolution=ignore-duplicates,return=minimal",
      );
      return respond({ joined: true });
    }
    if (!staff) {
      const memberships = await db("student_portal_memberships", {
        select: "course_id",
        actor_hash: `eq.${actor}`,
        course_id: `eq.${courseId}`,
        limit: "1",
      });
      if (!memberships.length) throw new PortalError(403, "join_required");
    }
    const boardActions = [
      "board",
      "question",
      "answer",
      "vote",
      "moderate_question",
      "moderate_answer",
    ];
    if (boardActions.includes(action) && !course.board_enabled)
      throw new PortalError(403, "board_disabled");
    if (action === "board") {
      const offset = Math.min(Math.max(Number(p.offset) || 0, 0), 10000);
      const filters: Record<string, string> = {
        select: columns.question,
        course_id: `eq.${courseId}`,
        order: "pinned.desc,created_at.desc",
        limit: "30",
        offset: String(offset),
      };
      if (!staff) filters.hidden = "eq.false";
      const rows = await db("student_portal_questions", filters);
      if (!rows.length) return respond({ questions: [], has_more: false });
      const ids = `in.(${rows.map((q: { id: string }) => q.id).join(",")})`;
      const answerFilters: Record<string, string> = {
        select: columns.answer,
        question_id: ids,
        order: "created_at.asc",
        limit: "1000",
      };
      if (!staff) answerFilters.hidden = "eq.false";
      const [answers, votes] = await Promise.all([
        db("student_portal_answers", answerFilters),
        db("student_portal_votes", {
          select: "question_id,actor_hash",
          question_id: ids,
          limit: "10000",
        }),
      ]);
      return respond({
        questions: rows.map((q: Record<string, unknown>) => {
          const { actor_hash, ...safe } = q;
          return {
            ...safe,
            own: actor_hash === actor,
            votes: votes.filter(
              (v: { question_id: string }) => v.question_id === q.id,
            ).length,
            voted: votes.some(
              (v: { question_id: string; actor_hash: string }) =>
                v.question_id === q.id && v.actor_hash === actor,
            ),
            answers: answers
              .filter((a: { question_id: string }) => a.question_id === q.id)
              .map((a: Record<string, unknown>) => {
                const { actor_hash, ...safeAnswer } = a;
                return { ...safeAnswer, own: actor_hash === actor };
              }),
          };
        }),
        has_more: rows.length === 30,
      });
    }
    if (action === "question") {
      await limit(`write:${actor}`, 20, 600);
      await limit(`question:${ip}`, 30, 600);
      const rows = await db("student_portal_questions", {}, "POST", {
        course_id: courseId,
        actor_hash: actor,
        title: text(p.title, 4, 180),
        body: text(p.body, 5, 8000),
        category: choice(p.category, [
          "concept",
          "exercise",
          "logistics",
          "technical",
        ]),
      });
      return respond({ id: rows[0].id }, 201);
    }
    if (
      ["answer", "vote", "moderate_question", "moderate_answer"].includes(
        action,
      )
    ) {
      const id = uuid(p.id);
      const rows = await db("student_portal_questions", {
        id: `eq.${id}`,
        course_id: `eq.${courseId}`,
        select: "id,status,hidden",
        limit: "1",
      });
      const question = rows[0];
      if (!question || (!staff && question.hidden))
        throw new PortalError(404, "not_found");
      if (action === "answer") {
        if (!staff && question.status === "closed")
          throw new PortalError(409, "thread_closed");
        await limit(`write:${actor}`, 20, 600);
        await limit(`answer:${ip}`, 80, 600);
        await db(
          "student_portal_answers",
          {},
          "POST",
          {
            question_id: id,
            actor_hash: actor,
            body: text(p.body, 2, 8000),
            official: staff,
          },
          "return=minimal",
        );
        if (staff)
          await db("student_portal_questions", { id: `eq.${id}` }, "PATCH", {
            status: "answered",
          });
      } else if (action === "vote") {
        await limit(`vote:${actor}`, 80, 600);
        const filters = { question_id: `eq.${id}`, actor_hash: `eq.${actor}` };
        if (p.active === false)
          await db("student_portal_votes", filters, "DELETE");
        else
          await db(
            "student_portal_votes",
            {},
            "POST",
            { question_id: id, actor_hash: actor },
            "resolution=ignore-duplicates,return=minimal",
          );
      } else {
        if (!staff) throw new PortalError(403, "staff_only");
        if (action === "moderate_answer") {
          await db(
            "student_portal_answers",
            { id: `eq.${uuid(p.answer_id)}`, question_id: `eq.${id}` },
            "PATCH",
            { hidden: p.hidden === true },
          );
        } else {
          const changes: Record<string, unknown> = {};
          if (p.status !== undefined)
            changes.status = choice(p.status, ["open", "answered", "closed"]);
          if (typeof p.hidden === "boolean") changes.hidden = p.hidden;
          if (typeof p.pinned === "boolean") changes.pinned = p.pinned;
          await db(
            "student_portal_questions",
            { id: `eq.${id}` },
            "PATCH",
            changes,
          );
        }
      }
      return respond({ ok: true });
    }
    if (action === "tickets") {
      const filters: Record<string, string> = {
        select: columns.ticket,
        course_id: `eq.${courseId}`,
        order: "updated_at.desc",
        limit: "30",
        offset: String(Math.min(Math.max(Number(p.offset) || 0, 0), 10000)),
      };
      if (!staff) filters.actor_hash = `eq.${actor}`;
      const tickets = await db("student_portal_tickets", filters);
      let messages = [];
      if (tickets.length)
        messages = await db("student_portal_ticket_messages", {
          select: "id,ticket_id,body,official,created_at",
          ticket_id: `in.(${tickets.map((t: { id: string }) => t.id).join(",")})`,
          order: "created_at.asc",
          limit: "1000",
        });
      return respond({
        tickets: tickets.map((t: { id: string }) => ({
          ...t,
          messages: messages.filter(
            (m: { ticket_id: string }) => m.ticket_id === t.id,
          ),
        })),
        has_more: tickets.length === 30,
      });
    }
    if (action === "ticket") {
      await limit(`write:${actor}`, 20, 600);
      await limit(`ticket:${ip}`, 20, 600);
      const rows = await db("student_portal_tickets", {}, "POST", {
        course_id: courseId,
        actor_hash: actor,
        subject: text(p.subject, 4, 180),
        body: text(p.body, 5, 8000),
        student_name: text(p.student_name || "", 0, 120),
        category: choice(p.category, [
          "logistics",
          "material",
          "personal",
          "other",
        ]),
      });
      return respond({ id: rows[0].id }, 201);
    }
    if (action === "ticket_message" || action === "ticket_status") {
      const id = uuid(p.id);
      const filters: Record<string, string> = {
        select: "id,status",
        id: `eq.${id}`,
        course_id: `eq.${courseId}`,
        limit: "1",
      };
      if (!staff) filters.actor_hash = `eq.${actor}`;
      const rows = await db("student_portal_tickets", filters);
      if (!rows.length) throw new PortalError(404, "not_found");
      if (action === "ticket_status") {
        if (!staff) throw new PortalError(403, "staff_only");
        await db("student_portal_tickets", { id: `eq.${id}` }, "PATCH", {
          status: choice(p.status, ["open", "in_progress", "resolved"]),
          updated_at: new Date().toISOString(),
        });
      } else {
        await limit(`write:${actor}`, 20, 600);
        await db(
          "student_portal_ticket_messages",
          {},
          "POST",
          { ticket_id: id, body: text(p.body, 2, 8000), official: staff },
          "return=minimal",
        );
        await db("student_portal_tickets", { id: `eq.${id}` }, "PATCH", {
          status: staff ? "in_progress" : "open",
          updated_at: new Date().toISOString(),
        });
      }
      return respond({ ok: true });
    }
    throw new PortalError(400, "unknown_action");
  } catch (err) {
    if (err instanceof PortalError)
      return respond({ error: err.message }, err.status);
    console.error(
      "portal unhandled error",
      err instanceof Error ? err.name : "unknown",
    );
    return respond({ error: "server_error" }, 500);
  }
});
