// Deterministic browser-DOM checks. Reuses the separate QA installation of jsdom.
// Run after npm run build, with PORTAL_QA_ROOT pointing to its package.json.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";
import { renderActivity, escapeHtml } from "../../src/lib/linearLabPlot.mjs";
const require = createRequire(
  path.resolve(process.env.PORTAL_QA_ROOT || ".", "package.json"),
);
const { JSDOM } = require("jsdom");
const labCode = readFileSync("src/scripts/linear-lab.js", "utf8").replace(
  /^import .*;\n/,
  "",
);
const llmCode = readFileSync("src/scripts/linear-llm.js", "utf8");
function open(route, code, stored = {}) {
  const dom = new JSDOM(
      readFileSync(`dist/teaching/linear-algebra/${route}/index.html`, "utf8"),
      {
        url: `https://chengadi.science/teaching/linear-algebra/${route}`,
        runScripts: "outside-only",
      },
    ),
    w = dom.window;
  w.renderActivity = renderActivity;
  w.escapeHtml = escapeHtml;
  w.Blob = Blob;
  w.exports = [];
  w.URL.createObjectURL = (b) => {
    w.exports.push({ blob: b });
    return "blob:test";
  };
  w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = function () {
    w.exports.at(-1).filename = this.download;
  };
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.matchMedia = () => ({ matches: true });
  w.print = () => {
    w.printed = true;
  };
  for (const [k, v] of Object.entries(stored))
    w.localStorage.setItem(k, JSON.stringify(v));
  w.eval(code);
  return dom;
}
const click = (w, q) => w.document.querySelector(q).click();
const input = (w, id, value) => {
  const e = w.document.getElementById(id);
  e.value = String(value);
  e.dispatchEvent(new w.Event("input", { bubbles: true }));
};
const change = (w, id, value) => {
  const e = w.document.getElementById(id);
  e.value = String(value);
  e.dispatchEvent(new w.Event("change", { bubbles: true }));
};
test("all thirteen labs navigate, update plots, check answers, save summaries and export", async () => {
  const dom = open("lab", labCode),
    w = dom.window,
    d = w.document,
    data = JSON.parse(d.getElementById("la-data").textContent);
  for (const a of data) {
    change(w, "la-select", a.id);
    assert.equal(d.getElementById("la-title").textContent, a.title);
    click(w, '[data-step="1"]');
    assert.equal(d.querySelectorAll("[data-stage]:not([hidden])").length, 1);
    for (const c of a.controls)
      input(w, `control-${c.id}`, c.options ? c.options.at(-1).value : c.max);
    assert.ok(d.querySelector("#la-plot svg desc").textContent.length > 20);
    assert.ok(!/NaN|undefined/.test(d.getElementById("la-plot").innerHTML));
    click(w, '[data-step="0"]');
    click(w, `input[name="prediction"][value="${a.answer}"]`);
    click(w, "#la-prediction-form button");
    assert.ok(
      d
        .getElementById("la-prediction-feedback")
        .textContent.startsWith("Your prediction is correct."),
    );
    click(w, '[data-step="2"]');
    click(w, `input[name="extension"][value="${a.extensionAnswer}"]`);
    input(
      w,
      "la-reflection",
      "זהו הסבר עצמאי לצורך בדיקת שמירת הסיכום והמעבר בין הפעילויות.",
    );
    click(w, "#la-finish-form button");
    assert.ok(!d.getElementById("la-finish-feedback").hidden);
  }
  assert.equal(d.getElementById("la-progress").value, 13);
  click(w, "#la-export");
  const out = JSON.parse(await w.exports.at(-1).blob.text());
  assert.equal(out.activities.length, 13);
  assert.ok(out.activities.every((a) => a.completed));
  const persisted = JSON.parse(
    w.localStorage.getItem("chengadi-linear-lab-v1"),
  );
  const next = open("lab", labCode, { "chengadi-linear-lab-v1": persisted });
  assert.equal(next.window.document.getElementById("la-progress").value, 13);
  click(w, "#la-download-plot");
  assert.equal(w.exports.at(-1).filename, "linear-algebra-tutorial-13.svg");
  assert.ok((await w.exports.at(-1).blob.text()).includes("<svg"));
  dom.window.close();
  next.window.close();
});
test("missing answers and short reflection are not recorded as completed", () => {
  const dom = open("lab", labCode),
    w = dom.window,
    d = w.document;
  click(w, "#la-prediction-form button");
  assert.match(
    d.getElementById("la-prediction-feedback").textContent,
    /Choose/,
  );
  click(w, '[data-step="2"]');
  click(w, "#la-finish-form button");
  assert.match(d.getElementById("la-finish-feedback").textContent, /Choose/);
  click(w, 'input[name="extension"][value="1"]');
  click(w, "#la-finish-form button");
  assert.equal(d.getElementById("la-progress").value, 0);
  assert.match(
    d.getElementById("la-finish-feedback").textContent,
    /20 characters/,
  );
  dom.window.close();
});
test("singular field and system cases produce the correct visible classifications", () => {
  const dom = open("lab", labCode),
    w = dom.window,
    d = w.document;
  change(w, "la-select", "field");
  input(w, "control-p", 2);
  assert.match(d.getElementById("la-readouts").textContent, /dim ker A = 1/);
  change(w, "la-select", "systems");
  input(w, "control-t", 0);
  input(w, "control-b", 5);
  assert.match(d.getElementById("la-readouts").textContent, /אין פתרונות/);
  input(w, "control-b", 6);
  assert.match(d.getElementById("la-readouts").textContent, /אינסוף פתרונות/);
  change(w, "la-select", "gram-schmidt");
  input(w, "control-delta", 0);
  assert.match(d.getElementById("la-readouts").textContent, /w2 = 0/);
  dom.window.close();
});
test("invalid stored controls are rejected and student text is never interpreted as HTML", () => {
  const evil = '<img src=x onerror="alert(1)"> reflection text';
  const dom = open("lab", labCode, {
      "chengadi-linear-lab-v1": {
        version: 1,
        activities: {
          complex: {
            values: { theta: 9999, n: 0 },
            reflection: evil,
            stage: 2,
            extension: -9,
            completed: true,
          },
        },
      },
    }),
    w = dom.window,
    d = w.document;
  assert.equal(d.getElementById("la-reflection").value, evil);
  assert.equal(d.querySelectorAll("#la-activity img").length, 0);
  assert.equal(d.getElementById("la-progress").value, 0);
  click(w, '[data-step="1"]');
  assert.equal(d.getElementById("control-n").value, "3");
  dom.window.close();
});
test("LLM journal preserves separate records, copies prompts and exports only actual work", async () => {
  const dom = open("llm", llmCode),
    w = dom.window,
    d = w.document;
  Object.defineProperty(w.navigator, "clipboard", {
    value: {
      writeText: async (t) => {
        w.copied = t;
      },
    },
  });
  const data = JSON.parse(d.getElementById("llm-workshop-data").textContent);
  assert.equal(d.querySelectorAll(".la-llm-card").length, 8);
  click(w, `[data-copy="prompt-${data.activities[0].id}"]`);
  await Promise.resolve();
  assert.equal(w.copied, data.activities[0].prompt);
  input(w, "llm-model", "My model — version not displayed");
  input(w, "llm-prediction", "ניבוי עצמאי לפני הפנייה למודל");
  input(w, "llm-check", "בדקתי כל שורש בהצבה.");
  change(w, "llm-activity", data.activities[1].id);
  assert.equal(d.getElementById("llm-prediction").value, "");
  input(w, "llm-prediction", "צריך לציין את השדה.");
  change(w, "llm-activity", data.activities[0].id);
  assert.equal(d.getElementById("llm-check").value, "בדקתי כל שורש בהצבה.");
  click(w, "#llm-export");
  const out = await w.exports.at(-1).blob.text();
  assert.ok(out.includes("בדקתי כל שורש"));
  assert.ok(out.includes("צריך לציין את השדה"));
  const stored = JSON.parse(w.localStorage.getItem("chengadi-linear-llm-v1"));
  const next = open("llm", llmCode, { "chengadi-linear-llm-v1": stored });
  assert.equal(
    next.window.document.getElementById("llm-model").value,
    "My model — version not displayed",
  );
  click(w, "#llm-print");
  assert.equal(w.printed, true);
  dom.window.close();
  next.window.close();
});
