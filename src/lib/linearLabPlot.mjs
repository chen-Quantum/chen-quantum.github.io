import * as M from "./linearLabMath.mjs";
import { translatePlotText } from "./linearLabPlotEn.mjs";
export const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
// Format trusted teaching text only. Student writing is never passed here.
// Plain Unicode isolates keep mathematical runs intact without adding HTML.
export function teachingText(value) {
  const text = String(value);
  if (!/[\u0590-\u05ff]/u.test(text)) return text;
  return text.replace(/[^\u0590-\u05ff]+/gu, (run) => {
    const [, leading, core, trailing] = run.match(/^(\s*)([\s\S]*?)([\s.,;:!?]*)$/u);
    return /[A-Za-z0-9\u0370-\u03ff\u2100-\u214f]/u.test(core)
      ? `${leading}\u2066${core}\u2069${trailing}`
      : run;
  });
}
export const teachingDirection = (text) =>
  /[\u0590-\u05ff]/u.test(text) ? "rtl" : "ltr";
const colors = {
  green: "#1b6655",
  blue: "#3165a2",
  orange: "#b55c22",
  purple: "#7754a1",
  muted: "#839388",
};
const num = (x) => Number(Math.abs(x) < 1e-10 ? 0 : x.toFixed(3));
export function renderActivity(id, p, locale = "he") {
  let extent =
    {
      complex: 1.45,
      field: 4,
      systems: 7,
      span: 18,
      order: 20,
      basis: 16,
      rank: 5,
      map: 19,
      similarity: 16,
      determinant: 9,
      eigen: 8,
      projection: 5.5,
      "gram-schmidt": 9,
    }[id] || 6;
  if (id === "field" && p.p) extent = p.p + 0.5;
  const cx = 280,
    cy = 205,
    s = 178 / extent,
    X = (x) => cx + x * s,
    Y = (y) => cy - y * s;
  let shapes = "",
    readouts = [],
    caption = "";
  const line = (u, v, color = "muted", dash = false, width = 2) => {
    shapes += `<line x1="${X(u[0])}" y1="${Y(u[1])}" x2="${X(v[0])}" y2="${Y(v[1])}" stroke="${colors[color]}" stroke-width="${width}" ${dash ? 'stroke-dasharray="6 5"' : ""}/>`;
  };
  const placedLabels = [];
  const label = (v, text, color = "green", dy = -12) => {
    const ax = X(v[0]), ay = Y(v[1]), width = Math.max(8, text.length * 7.6);
    const x = Math.max(30, Math.min(ax + 8, 526 - width));
    let y = Math.max(38, Math.min(ay + dy, 378));
    for (const offset of [0, 24, -24, 48, -48, 72, -72, 96, -96]) {
      const candidate = Math.max(38, Math.min(ay + dy + offset, 378));
      const box = { x, y: candidate - 15, width, height: 19 };
      if (!placedLabels.some((other) => box.x < other.x + other.width + 5 &&
        box.x + box.width + 5 > other.x && box.y < other.y + other.height + 3 &&
        box.y + box.height + 3 > other.y)) {
        y = candidate;
        break;
      }
    }
    placedLabels.push({ x, y: y - 15, width, height: 19 });
    if (Math.abs(y - (ay + dy)) > 1 || Math.abs(x - (ax + 8)) > 1)
      shapes += `<path d="M ${ax} ${ay} L ${x - 3} ${y - 4}" stroke="${colors[color]}" stroke-width="0.8" opacity="0.65" fill="none"/>`;
    shapes += `<text data-plot-label="${escapeHtml(text)}" data-endpoint-x="${v[0]}" data-endpoint-y="${v[1]}" x="${x}" y="${y}" fill="${colors[color]}" stroke="#fcfdf9" stroke-width="2.5" paint-order="stroke" stroke-linejoin="round" font-size="13" font-weight="600">${escapeHtml(text)}</text>`;
  };
  const point = (v, text, color = "green", dy = -12) => {
    shapes += `<circle cx="${X(v[0])}" cy="${Y(v[1])}" r="5" fill="${colors[color]}" stroke="#fff" stroke-width="1.5"/>`;
    if (text) label(v, text, color, dy);
  };
  const arrow = (v, text, color = "green", start = [0, 0], dash = false) => {
    line(start, M.add(start, v), color, dash, 2.5);
    const end = M.add(start, v),
      angle = Math.atan2(-v[1], v[0]);
    if (Math.hypot(...v) > 1e-10) {
      const x = X(end[0]),
        y = Y(end[1]);
      shapes += `<path d="M ${x - 10 * Math.cos(angle - 0.4)} ${y - 10 * Math.sin(angle - 0.4)} L ${x} ${y} L ${x - 10 * Math.cos(angle + 0.4)} ${y - 10 * Math.sin(angle + 0.4)}" fill="none" stroke="${colors[color]}" stroke-width="2.5"/>`;
    }
    if (text) label(end, text, color);
  };
  const polygon = (vs, color = "green") => {
    shapes += `<polygon points="${vs.map((v) => `${X(v[0])},${Y(v[1])}`).join(" ")}" fill="${colors[color]}" fill-opacity="0.12" stroke="${colors[color]}" stroke-width="1.5"/>`;
  };
  const curve = (vs, color = "blue", dash = false) => {
    shapes += `<polyline points="${vs.map((v) => `${X(v[0])},${Y(v[1])}`).join(" ")}" fill="none" stroke="${colors[color]}" stroke-width="2" ${dash ? 'stroke-dasharray="5 5"' : ""}/>`;
  };
  const circlePoints = Array.from({ length: 101 }, (_, i) => [
    Math.cos((i * Math.PI) / 50),
    Math.sin((i * Math.PI) / 50),
  ]);
  const wholeLine = (a, b, c, color) => {
    const ps = [];
    for (const x of [-extent, extent])
      if (b) {
        const y = (c - a * x) / b;
        if (Math.abs(y) <= extent + 1e-9) ps.push([x, y]);
      }
    for (const y of [-extent, extent])
      if (a) {
        const x = (c - b * y) / a;
        if (Math.abs(x) <= extent + 1e-9) ps.push([x, y]);
      }
    if (ps.length >= 2) line(ps[0], ps.at(-1), color, false, 2.5);
  };
  const row = (label, value) => readouts.push({ label, value });
  const vec = M.vectorText;
  switch (id) {
    case "complex": {
      const theta = (p.theta * Math.PI) / 180,
        z = [Math.cos(theta), Math.sin(theta)],
        ws = M.roots(p.theta, p.n);
      curve(circlePoints, "muted", true);
      arrow(z, "z", "green");
      ws.forEach((w, i) => {
        line([0, 0], w, "blue", true, 1);
        point(w, `w${i}`, "blue", 18);
      });
      row("מספר השורשים השונים", String(p.n));
      row("הפרש הזוויות", `${M.fraction(360, p.n)}°`);
      row("הזווית של השורש הראשון", `${M.fraction(p.theta, p.n)}°`);
      caption =
        "מישור מרוכב. הקואורדינטות הן החלק הממשי והחלק המדומה; שני הצירים באותו קנה מידה.";
      break;
    }
    case "field": {
      const m = M.fieldModel(p.p);
      if (p.p) {
        for (let x = 0; x < p.p; x++)
          for (let y = 0; y < p.p; y++) {
            shapes += `<circle cx="${X(x)}" cy="${Y(y)}" r="3" fill="#c8d1ca"/>`;
          }
        m.points.forEach((v) => point(v, vec(v), "green", -10));
      } else {
        wholeLine(3, 5, 0, "blue");
        wholeLine(5, 3, 0, "orange");
        point([0, 0], "ker A = {0}");
      }
      row("השדה", p.p ? `F${p.p}` : "ℝ");
      row("הדטרמיננטה בשדה", String(m.determinant));
      row("דרגה וממד גרעין", `rank A = ${m.rank};  dim ker A = ${m.nullity}`);
      row("מספר הפתרונות", p.p ? String(m.points.length) : "1");
      caption = p.p
        ? "הנקודות הירוקות הן כל הפתרונות בשדה הנבחר. המרחקים בתרשים הם אמצעי תצוגה בלבד."
        : "מעל הממשיים שני הישרים נחתכים רק בראשית.";
      break;
    }
    case "systems": {
      const m = M.systemModel(p.t, p.b);
      wholeLine(1, 2, 2, "blue");
      wholeLine(3, 6 + p.t, p.b, "orange");
      if (m.solution) point(m.solution, "solution");
      row(
        "סוג המערכת",
        {
          unique: "פתרון יחיד",
          infinite: "אינסוף פתרונות",
          none: "אין פתרונות",
        }[m.kind],
      );
      row("לאחר פעולת שורה", `${p.t}y = ${p.b - 6}`);
      row("דרגות", `rank A = ${m.rank};  rank [A|b] = ${m.augmentedRank}`);
      if (m.solution) row("הפתרון המדויק", `(x,y) = (${m.exact.join(", ")})`);
      caption =
        "כחול: x+2y=2. כתום: המשוואה השנייה. במקרה של ישרים חופפים, אחד מכסה את האחר. המשוואות והדרגות מכריעות גם כשקשה להבחין בציור.";
      break;
    }
    case "span": {
      const m = M.spanModel(p.delta, p.a, p.b);
      if (m.rank === 1) wholeLine(1, -2, 0, "muted");
      else polygon([[0, 0], m.u, M.add(m.u, m.v), m.v]);
      arrow(m.u, "u", "blue");
      arrow(m.v, "v", "orange");
      arrow(M.scale(p.a, m.u), "au", "blue", [0, 0], true);
      arrow(M.scale(p.b, m.v), "bv", "orange", M.scale(p.a, m.u), true);
      point(m.combination, "au+bv");
      row("הצירוף שנבחר", `x = ${vec(m.combination)}`);
      row("ממד הפרישה", String(m.rank));
      row("מבחן הדטרמיננטה", `det[u v] = ${m.determinant}`);
      caption =
        "המקבילית מציגה רק מקדמים בין 0 ל־1. כאשר הדרגה 2, הפרישה היא כל המישור.";
      break;
    }
    case "order": {
      const m = M.matrixOrderModel(p.s, p.r);
      arrow(m.x, "x", "muted");
      polygon(
        [
          [0, 0],
          [p.r, 0],
          [p.r + p.s, 1],
          [p.s, 1],
        ],
        "blue",
      );
      polygon(
        [
          [0, 0],
          [p.r, 0],
          [p.r * (1 + p.s), 1],
          [p.r * p.s, 1],
        ],
        "orange",
      );
      arrow(m.ABx, "ABx", "blue");
      arrow(m.BAx, "BAx", "orange");
      row("תחילה B ואחריה A", `ABx = ${vec(m.ABx)}`);
      row("תחילה A ואחריה B", `BAx = ${vec(m.BAx)}`);
      row("האם AB=BA במשפחה הזאת?", m.commute ? "כן" : "לא");
      row("דטרמיננטות המכפלות", `det(AB) = det(BA) = ${m.determinant}`);
      caption =
        "שני האזורים הם תמונות ריבוע היחידה בשני סדרי ההרכבה. הצבע והסימון על החצים מבחינים בין המסלולים.";
      break;
    }
    case "basis": {
      const m = M.basisModel(p.s, p.a, p.b);
      arrow(m.basis[0], "b1", "blue");
      arrow(m.basis[1], "b2", "orange");
      arrow(M.scale(p.a, m.basis[0]), "a·b1", "blue", [0, 0], true);
      arrow(M.scale(p.b, m.basis[1]), "b·b2", "orange", M.scale(p.a, m.basis[0]), true);
      point(m.x, "x");
      row("הקואורדינטות בבסיס B", `[x]B = ${vec(m.coordinates)}`);
      row("הווקטור בקואורדינטות רגילות", `x = ${vec(m.x)}`);
      row("מטריצת הבסיס", `P = [[1, ${p.s}], [2, ${2 * p.s + 1}]]`);
      row("ההמרה בחזרה", `P⁻¹x = ${vec(M.mv(m.inverse, m.x))}`);
      caption =
        "החצים b1,b2 הם וקטורי הבסיס. הסכום המקווקו מראה כיצד הקואורדינטות יוצרות את x.";
      break;
    }
    case "rank": {
      const m = M.rankModel(p.t);
      m.A[0].forEach((x, i) =>
        arrow([x, m.A[1][i]], `c${i + 1}`, ["blue", "orange", "green"][i]),
      );
      if (p.t === 0) wholeLine(0, 1, 0, "muted");
      else
        polygon([
          [0, 0],
          [1, 0],
          [4, p.t],
          [3, p.t],
        ]);
      point(m.target, "b", "purple");
      row("ממד התחום", "3");
      row("דרגה וממד גרעין", `${m.rank} + ${m.nullity} = 3`);
      row("בסיס לגרעין", m.kernel.map(vec).join("; "));
      row("האם b בתמונה?", m.targetInImage ? "כן" : "לא");
      caption =
        "זהו מרחב היעד ℝ²: החצים הם עמודות המטריצה. בסיס הגרעין המוצג בחישוב שייך לתחום ℝ³.";
      break;
    }
    case "map": {
      const m = M.mapModel(p.c);
      arrow(m.origin, "T(0)", "purple");
      arrow(m.Tu, "T(u)", "muted");
      arrow(m.Tv, "T(v)", "muted");
      arrow(m.Tsum, "T(u+v)", "blue");
      arrow(m.sumT, "T(u)+T(v)", "orange");
      row("תמונת האפס", `T(0) = ${vec(m.origin)}`);
      row("תמונת הסכום", `T(u+v) = ${vec(m.Tsum)}`);
      row("סכום התמונות", `T(u)+T(v) = ${vec(m.sumT)}`);
      row("לינאריות של T במשפחה הזאת", m.linear ? "לינארית" : "אינה לינארית");
      caption =
        "u=(1,1), v=(−1,2). חפיפה במקרה אחד אינה הוכחה כללית; במקרה c=0 הייצוג המטריציוני מוכיח לינאריות.";
      break;
    }
    case "similarity": {
      const m = M.similarityModel(p.s);
      m.eigenvectors.forEach((v, i) =>
        arrow(v, `p${i + 1}`, i ? "orange" : "blue"),
      );
      arrow(m.x, "x = Pc", "muted");
      arrow(m.Ax, "Ax = PDc", "green");
      row("המטריצה בקואורדינטות רגילות", `A = [[3, ${p.s}], [0, 4]]`);
      row("מסלול 1: הפעלת A", `Ax = ${vec(m.Ax)}`);
      row("מסלול 2: חישוב בקואורדינטות", `P(Dc) = ${vec(m.PDc)}`);
      row("נתונים שאינם משתנים", `tr A = 7; det A = 12; λ = 3,4`);
      caption =
        "c=(2,−1). שני מסלולי החישוב מגיעים לאותו וקטור. החצים p1,p2 הם עמודות P.";
      break;
    }
    case "determinant": {
      const { u, v, determinant: d } = M.determinantModel(p.s, p.t);
      polygon([[0, 0], u, M.add(u, v), v], d < 0 ? "orange" : "green");
      arrow(u, "u", "blue");
      arrow(v, "v", "orange");
      row("דטרמיננטה עם סימן", `det A = ${d}`);
      row("שטח המקבילית", String(Math.abs(d)));
      row("הפיכות", d === 0 ? "המטריצה אינה הפיכה" : "המטריצה הפיכה");
      caption =
        "הצירים באותו קנה מידה. כאשר הדטרמיננטה אפס, המקבילית קורסת לישר.";
      break;
    }
    case "eigen": {
      const m = M.eigenModel(p.s, p.theta);
      curve(circlePoints, "muted", true);
      curve(
        circlePoints.map((v) => M.mv(m.A, v)),
        "blue",
      );
      if (p.s) wholeLine(0, 1, 0, "purple");
      arrow(m.v, "v", "orange");
      arrow(m.Av, "Av", "green");
      row("ריבוי אלגברי של λ=3", "2");
      row("ממד המרחב העצמי", String(m.eigenspaceDimension));
      row("לכסינות", m.diagonalizable ? "לכסינה: A=3I" : "אינה לכסינה");
      row(
        "בדיקת כיוון",
        Math.abs(m.cross) < 1e-9
          ? "v ו־Av על אותו ישר"
          : "v ו־Av אינם על אותו ישר",
      );
      caption =
        "המעגל המקווקו הוא הקלט, והעקומה הכחולה היא תמונתו. עבור s≠0 הישר הסגול הוא המרחב העצמי היחיד.";
      break;
    }
    case "projection": {
      const m = M.projectionModel(p.w);
      wholeLine(1, -1, 0, "blue");
      curve(
        circlePoints.map(([x, y]) => [x / Math.sqrt(p.w), y]),
        "muted",
        true,
      );
      arrow(m.v, "v", "purple");
      arrow(m.p, "p", "green");
      arrow(m.residual, "v−p", "orange", m.p, true);
      row("המקדם המדויק", `c = ${m.exact}`);
      row("ההיטל על W", `p = (${m.exactProjection}, ${m.exactProjection})`);
      row("בדיקה במכפלה הנתונה", `⟨v−p,u⟩w = ${num(m.weightedDot)}`);
      row("לשם השוואה: מכפלה אוקלידית", `(v−p)·u = ${num(m.euclideanDot)}`);
      caption =
        "הציור משתמש בצירים אוקלידיים. האורתוגונליות נבדקת במכפלה המשוקללת, ולכן לא מסמנים כאן זווית ישרה לפי מראה.";
      break;
    }
    case "gram-schmidt": {
      const m = M.gramSchmidtModel(p.k, p.delta);
      arrow(m.v1, "v1", "blue");
      arrow(m.v2, "v2", "orange");
      arrow(m.w2, "w2", "green");
      arrow(m.e1, "e1", "purple");
      if (m.e2) arrow(m.e2, "e2", "purple");
      row("השארית האורתוגונלית", `w2 = ${vec(m.w2)}`);
      row("מכפלה עם v1", `⟨w2,v1⟩ = ${num(M.dot(m.w2, m.v1))}`);
      row(
        "האם מותר לנרמל את w2?",
        m.independent ? "כן, הנורמה חיובית" : "לא, w2 = 0",
      );
      row("ממד הפרישה", m.independent ? "2" : "1");
      caption =
        "הכיוונים הסגולים מנורמלים. כאשר השארית אפסית אין וקטור e2; לפרישה נדרש אז וקטור אחד בלבד.";
      break;
    }
    default:
      throw new Error(`Unknown activity: ${id}`);
  }
  let grid = "";
  const tick = extent < 2 ? 0.5 : 1;
  const labelEvery = Math.max(1, Math.ceil(extent / 8));
  for (let x = Math.ceil(-extent / tick) * tick; x <= extent; x += tick) {
    grid += `<line x1="${X(x)}" y1="24" x2="${X(x)}" y2="386" stroke="#e6ece6"/><line x1="80" y1="${Y(x)}" x2="480" y2="${Y(x)}" stroke="#e6ece6"/>`;
    if (x && Number.isInteger(x) && x % labelEvery === 0) {
      grid += `<text data-axis-tick="x" x="${X(x) + 3}" y="${cy + 16}" fill="#718076" font-size="10">${x}</text><text data-axis-tick="y" x="${cx - 20}" y="${Y(x) - 3}" fill="#718076" font-size="10">${x}</text>`;
    }
  }
  if (locale === "en") {
    caption = translatePlotText(caption);
    readouts = readouts.map(({ label, value }) => ({
      label: translatePlotText(label),
      value: translatePlotText(value),
    }));
  }
  const description = readouts.map((r) => `${r.label}: ${r.value}`).join(". ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 410" role="img" aria-labelledby="plot-title plot-desc" direction="ltr"><title id="plot-title">${escapeHtml(caption)}</title><desc id="plot-desc">${escapeHtml(description)}</desc><defs><clipPath id="plot-clip"><rect x="24" y="20" width="512" height="370"/></clipPath></defs><rect width="560" height="410" rx="16" fill="#fcfdf9"/>${grid}<path d="M 40 ${cy} H 520 M ${cx} 24 V 386" stroke="#a2aea2" stroke-width="1.2"/><text x="522" y="${cy + 17}" font-size="12" fill="#617365">${id === "complex" ? "Re" : "x"}</text><text x="${cx + 8}" y="28" font-size="12" fill="#617365">${id === "complex" ? "Im" : "y"}</text><g clip-path="url(#plot-clip)">${shapes}</g></svg>`;
  return { svg, readouts, caption };
}
