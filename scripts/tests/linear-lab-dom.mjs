// Deterministic browser-DOM checks. Reuses the separate QA installation of jsdom.
// Run after npm run build, with PORTAL_QA_ROOT pointing to its package.json.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";
import { renderActivity, escapeHtml, teachingText, teachingDirection } from "../../src/lib/linearLabPlot.mjs";
const require = createRequire(
  path.resolve(process.env.PORTAL_QA_ROOT || ".", "package.json"),
);
const { JSDOM } = require("jsdom");
const labCode = readFileSync("src/scripts/linear-lab.js", "utf8").replace(
  /^import .*;\n/,
  "",
);
const llmCode = readFileSync("src/scripts/linear-llm.js", "utf8");
function open(route, code, stored = {}, options = {}) {
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
  w.teachingText = teachingText;
  w.teachingDirection = teachingDirection;
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
  for (const [k, v] of Object.entries(options.rawStorage || {}))
    w.localStorage.setItem(k, v);
  if (options.prepareActivities) {
    const data = w.document.getElementById("la-data");
    data.textContent = JSON.stringify(
      options.prepareActivities(JSON.parse(data.textContent)),
    );
  }
  options.beforeEval?.(w);
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
  assert.equal(d.getElementById("control-n").value, "5");
  dom.window.close();
});

// Content-revision migration regressions. Run against the parent's rebuilt data.
function labData(route = "lab") {
  const dom = new JSDOM(
    readFileSync(`dist/teaching/linear-algebra/${route}/index.html`, "utf8"),
  );
  const data = JSON.parse(
    dom.window.document.getElementById("la-data").textContent,
  );
  dom.window.close();
  return data;
}
const nondefaultControl = (c) =>
  c.options
    ? c.options.find((o) => o.value !== c.value)?.value ?? c.value
    : c.value === c.max ? c.min : c.max;

test("a changed same-index answer invalidates only that activity and preserves all original prose and metadata", async () => {
  const key = "chengadi-linear-lab-v1";
  const fixture = (data) => data.map((a) => ({
    ...a,
    contentRevision: a.id === "complex" ? 1 : 0,
    resetControlsOnRevision: a.id === "complex" ? [a.controls[0].id] : [],
  }));
  const data = fixture(labData());
  const changed = data.find((a) => a.id === "complex");
  const unchanged = data.find((a) => a.id === "field");
  const prose = '  המקור שלי <img src=x onerror="alert(1)">\n' + "long 🧮 prose ".repeat(600);
  const values = Object.fromEntries(
    changed.controls.map((c) => [c.id, nondefaultControl(c)]),
  );
  const retired = { reflection: "Keep this retired activity's student work.", privateNote: "Unrecognized fields survive." };
  const prior = {
    version: 1,
    preferences: { handwriting: "student supplied" },
    earlierMigration: { note: "keep earlier metadata" },
    activities: {
      [changed.id]: {
        values: { ...values, oldControl: 73 },
        prediction: changed.answer,
        extension: changed.extensionAnswer,
        reflection: prose,
        stage: 2,
        completed: true,
        studentTag: "never discard this field",
      },
      [unchanged.id]: {
        values: {},
        prediction: unchanged.answer,
        extension: unchanged.extensionAnswer,
        reflection: "An unchanged completed activity remains completed.",
        stage: 1,
        completed: true,
      },
      retired,
    },
  };
  const raw = JSON.stringify(prior, null, 3) + "\n";
  const dom = open("lab", labCode, {}, {
    rawStorage: { [key]: raw },
    prepareActivities: fixture,
  });
  const w = dom.window, d = w.document;
  let saved = JSON.parse(w.localStorage.getItem(key));
  const migrated = saved.activities[changed.id];
  assert.equal(migrated.contentRevision, 1);
  assert.equal(migrated.prediction, null);
  assert.equal(migrated.extension, null);
  assert.equal(migrated.completed, false);
  assert.equal(migrated.reflection, prose);
  assert.equal(d.getElementById("la-reflection").value, prose);
  assert.equal(d.querySelectorAll("#la-activity img").length, 0);
  assert.equal(migrated.stage, 2);
  assert.equal(migrated.values[changed.controls[0].id], changed.controls[0].value);
  assert.equal(migrated.values[changed.controls[1].id], values[changed.controls[1].id]);
  assert.equal(migrated.values.oldControl, 73);
  assert.equal(migrated.studentTag, prior.activities[changed.id].studentTag);
  assert.equal(saved.activities[unchanged.id].completed, true);
  assert.deepEqual(saved.activities.retired, retired);
  assert.deepEqual(saved.preferences, prior.preferences);
  assert.deepEqual(saved.earlierMigration, prior.earlierMigration);
  assert.equal(saved.legacyRawEnvelope, raw);
  assert.equal(d.getElementById("la-progress").value, 1);

  // Re-complete the revised scenario; reload/language changes must not reset it again.
  click(w, `input[name="extension"][value="${changed.extensionAnswer}"]`);
  click(w, "#la-finish-form button");
  click(w, "#la-reset");
  saved = JSON.parse(w.localStorage.getItem(key));
  assert.equal(saved.activities[changed.id].completed, true);
  assert.equal(saved.activities[changed.id].reflection, prose);
  assert.equal(saved.activities[changed.id].extension, changed.extensionAnswer);
  assert.equal(saved.legacyRawEnvelope, raw);
  click(w, "#la-export");
  const notebook = JSON.parse(await w.exports.at(-1).blob.text());
  assert.equal(notebook.activities.find((a) => a.id === changed.id).reflection, prose);
  assert.equal(notebook.legacyRawEnvelope, raw);

  for (const route of ["lab/en", "lab"]) {
    const next = open(route, labCode, { [key]: saved }, { prepareActivities: fixture });
    const current = JSON.parse(next.window.localStorage.getItem(key));
    assert.equal(current.activities[changed.id].completed, true);
    assert.equal(current.activities[changed.id].reflection, prose);
    assert.equal(current.activities[changed.id].contentRevision, 1);
    assert.equal(current.legacyRawEnvelope, raw);
    assert.deepEqual(current.activities.retired, retired);
    assert.equal(next.window.document.getElementById("la-progress").value, 2);
    saved = current;
    next.window.close();
  }
  dom.window.close();
});

test("the declared revision policy resets only c, eigen s and Gram-Schmidt delta", () => {
  const key = "chengadi-linear-lab-v1", data = labData();
  const policies = { map: ["c"], eigen: ["s"], "gram-schmidt": ["delta"] };
  const prior = { version: 1, legacyRawEnvelope: "earlier original raw backup", activities: {} };
  for (const a of data) {
    assert.equal(a.contentRevision, 1);
    assert.deepEqual(a.resetControlsOnRevision, policies[a.id] || []);
    prior.activities[a.id] = {
      contentRevision: 0,
      values: Object.fromEntries(a.controls.map((c) => [c.id, nondefaultControl(c)])),
      prediction: a.answer,
      extension: a.extensionAnswer,
      completed: true,
      stage: 1,
      reflection: `Original explanation for ${a.id}, preserved verbatim.`,
    };
  }
  const dom = open("lab", labCode, { [key]: prior }), w = dom.window;
  for (const a of data) {
    change(w, "la-select", a.id);
    const saved = JSON.parse(w.localStorage.getItem(key)).activities[a.id];
    assert.equal(saved.prediction, null);
    assert.equal(saved.extension, null);
    assert.equal(saved.completed, false);
    assert.equal(saved.stage, 1);
    assert.equal(saved.reflection, prior.activities[a.id].reflection);
    for (const c of a.controls)
      assert.equal(saved.values[c.id], (policies[a.id] || []).includes(c.id)
        ? c.value : prior.activities[a.id].values[c.id]);
  }
  assert.equal(JSON.parse(w.localStorage.getItem(key)).legacyRawEnvelope, prior.legacyRawEnvelope);
  assert.equal(w.document.getElementById("la-progress").value, 0);
  dom.window.close();
});

test("unavailable storage keeps migrated work usable and exports exact student text", async () => {
  const key = "chengadi-linear-lab-v1";
  const raw = JSON.stringify({ version: 1, activities: {}, keep: "original metadata" });
  const dom = open("lab", labCode, {}, {
    rawStorage: { [key]: raw },
    beforeEval(w) {
      w.Storage.prototype.setItem = () => { throw new w.DOMException("Storage full", "QuotaExceededError"); };
    },
  });
  const w = dom.window, d = w.document;
  const prose = "Student text remains usable when browser storage fails. ".repeat(120);
  input(w, "la-reflection", prose);
  assert.match(d.getElementById("la-storage-status").textContent, /storage is unavailable/);
  click(w, "#la-export");
  const notebook = JSON.parse(await w.exports.at(-1).blob.text());
  assert.equal(notebook.activities[0].reflection, prose);
  assert.equal(notebook.legacyRawEnvelope, raw);
  assert.equal(w.localStorage.getItem(key), raw);
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
