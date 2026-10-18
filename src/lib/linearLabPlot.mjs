import * as M from "./linearLabMath.mjs";
export const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const colors = {
  green: "#1b6655",
  blue: "#3165a2",
  orange: "#b55c22",
  purple: "#7754a1",
  muted: "#839388",
};
const num = (x) => Number(Math.abs(x) < 1e-10 ? 0 : x.toFixed(3));
export function renderActivity(id, p) {
  let extent =
    {
      complex: 1.45,
      field: 4,
      systems: 7,
      span: 11,
      order: 10,
      basis: 7,
      rank: 5,
      map: 5,
      similarity: 8,
      determinant: 6,
      eigen: 5,
      projection: 4.6,
      "gram-schmidt": 6,
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
  const label = (v, text, color = "green", dy = -12) => {
    shapes += `<text x="${X(v[0]) + 8}" y="${Y(v[1]) + dy}" fill="${colors[color]}" font-size="13" font-weight="600">${escapeHtml(text)}</text>`;
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
        wholeLine(1, 1, 0, "blue");
        wholeLine(1, -1, 0, "orange");
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
      wholeLine(1, 1, 3, "blue");
      wholeLine(2, 2 + p.t, p.b, "orange");
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
        "כחול: x+y=3. כתום: המשוואה השנייה. במקרה של ישרים חופפים, אחד מכסה את האחר. המשוואות והדרגות מכריעות גם כשקשה להבחין בציור.";
      break;
    }
    case "span": {
      const m = M.spanModel(p.delta, p.a, p.b);
      if (m.rank === 1) wholeLine(1, -1, 0, "muted");
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
      arrow([1, 1], "x", "muted");
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
      arrow([p.a, 0], "a·b1", "blue", [0, 0], true);
      arrow(M.scale(p.b, m.basis[1]), "b·b2", "orange", [p.a, 0], true);
      point(m.x, "x");
      row("הקואורדינטות בבסיס B", `[x]B = ${vec(m.coordinates)}`);
      row("הווקטור בקואורדינטות רגילות", `x = ${vec(m.x)}`);
      row("מטריצת הבסיס", `P = [[1, ${p.s}], [0, 1]]`);
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
          [3, p.t],
          [2, p.t],
        ]);
      point([0, 1], "b", "purple");
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
        "u=(1,0), v=(0,1). חפיפה במקרה אחד אינה הוכחה כללית; במקרה c=0 הייצוג המטריציוני מוכיח לינאריות.";
      break;
    }
    case "similarity": {
      const m = M.similarityModel(p.s);
      m.eigenvectors.forEach((v, i) =>
        arrow(v, `p${i + 1}`, i ? "orange" : "blue"),
      );
      arrow(m.x, "x = Pc", "muted");
      arrow(m.Ax, "Ax = PDc", "green");
      row("המטריצה בקואורדינטות רגילות", `A = [[2, ${p.s}], [0, 3]]`);
      row("מסלול 1: הפעלת A", `Ax = ${vec(m.Ax)}`);
      row("מסלול 2: חישוב בקואורדינטות", `P(Dc) = ${vec(m.PDc)}`);
      row("נתונים שאינם משתנים", `tr A = 5; det A = 6; λ = 2,3`);
      caption =
        "c=(1,1). שני מסלולי החישוב מגיעים לאותו וקטור. החצים p1,p2 הם עמודות P.";
      break;
    }
    case "determinant": {
      const u = [2, 1],
        v = [p.s, p.t],
        d = 2 * p.t - p.s;
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
      row("ריבוי אלגברי של λ=2", "2");
      row("ממד המרחב העצמי", String(m.eigenspaceDimension));
      row("לכסינות", m.diagonalizable ? "לכסינה: A=2I" : "אינה לכסינה");
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
      row("ההיטל על W", `p = (${m.exact}, ${m.exact})`);
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
  for (let x = Math.ceil(-extent / tick) * tick; x <= extent; x += tick) {
    grid += `<line x1="${X(x)}" y1="24" x2="${X(x)}" y2="386" stroke="#e6ece6"/><line x1="80" y1="${Y(x)}" x2="480" y2="${Y(x)}" stroke="#e6ece6"/>`;
    if (x && Number.isInteger(x)) {
      grid += `<text x="${X(x) + 3}" y="${cy + 16}" fill="#718076" font-size="10">${x}</text><text x="${cx - 20}" y="${Y(x) - 3}" fill="#718076" font-size="10">${x}</text>`;
    }
  }
  const description = readouts.map((r) => `${r.label}: ${r.value}`).join(". ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 410" role="img" aria-labelledby="plot-title plot-desc" direction="ltr"><title id="plot-title">${escapeHtml(caption)}</title><desc id="plot-desc">${escapeHtml(description)}</desc><defs><clipPath id="plot-clip"><rect x="24" y="20" width="512" height="370"/></clipPath></defs><rect width="560" height="410" rx="16" fill="#fcfdf9"/>${grid}<path d="M 40 ${cy} H 520 M ${cx} 24 V 386" stroke="#a2aea2" stroke-width="1.2"/><text x="522" y="${cy + 17}" font-size="12" fill="#617365">${id === "complex" ? "Re" : "x"}</text><text x="${cx + 8}" y="28" font-size="12" fill="#617365">${id === "complex" ? "Im" : "y"}</text><g clip-path="url(#plot-clip)">${shapes}</g></svg>`;
  return { svg, readouts, caption };
}
