import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire, stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { renderActivity, escapeHtml } from "../../src/lib/linearLabPlot.mjs";
const require = createRequire(
  path.resolve(process.env.PORTAL_QA_ROOT || ".", "package.json"),
);
const { JSDOM } = require("jsdom");
const labCode = fs
  .readFileSync("src/scripts/linear-lab.js", "utf8")
  .replace(/^import .*;\n/, "");
const llmCode = fs.readFileSync("src/scripts/linear-llm.js", "utf8");
const switchCode = stripTypeScriptTypes(
  fs
    .readFileSync(
      "src/components/linear-algebra/CourseLanguageSwitch.astro",
      "utf8",
    )
    .match(/<script>([\s\S]*?)<\/script>/)[1],
);
const he = /[\u0590-\u05ff]/;
function open(route, storage = {}, hash = "") {
  const dom = new JSDOM(
    fs.readFileSync(`dist/teaching/linear-algebra/${route}/index.html`, "utf8"),
    {
      url: `https://chengadi.science/teaching/linear-algebra/${route}/${hash}`,
      runScripts: "outside-only",
    },
  );
  const w = dom.window;
  w.renderActivity = renderActivity;
  w.escapeHtml = escapeHtml;
  w.Blob = Blob;
  w.exports = [];
  w.URL.createObjectURL = (b) => {
    w.exports.push(b);
    return "blob:local";
  };
  w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = function () {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.matchMedia = () => ({ matches: true });
  w.print = () => {
    w.printed = true;
  };
  for (const [key, value] of Object.entries(storage))
    w.localStorage.setItem(key, JSON.stringify(value));
  w.eval(route.startsWith("lab") ? labCode : llmCode);
  w.eval(switchCode);
  return dom;
}
function set(w, id, value, event = "input") {
  const el = w.document.getElementById(id);
  el.value = String(value);
  el.dispatchEvent(new w.Event(event, { bubbles: true }));
}
function visibleText(d) {
  const body = d.body.cloneNode(true);
  body
    .querySelectorAll("script,style,.la-language-switch")
    .forEach((x) => x.remove());
  return body.textContent;
}
const data = (route, id) =>
  JSON.parse(
    new JSDOM(
      fs.readFileSync(
        `dist/teaching/linear-algebra/${route}/index.html`,
        "utf8",
      ),
    ).window.document.getElementById(id).textContent,
  );
test("both languages have matching activity IDs, controls, quiz keys and homework mappings", () => {
  const h = data("lab", "la-data"),
    e = data("lab/en", "la-data");
  assert.equal(e.length, 13);
  for (let i = 0; i < h.length; i++) {
    for (const key of [
      "id",
      "number",
      "formula",
      "answer",
      "extensionAnswer",
      "minutes",
    ])
      assert.deepEqual(e[i][key], h[i][key]);
    assert.equal(e[i].choices.length, h[i].choices.length);
    assert.equal(e[i].extensionChoices.length, h[i].extensionChoices.length);
    assert.deepEqual(
      e[i].controls.map(({ label, options, ...rest }) => ({
        ...rest,
        ...(options ? { options: options.map((x) => x.value) } : {}),
      })),
      h[i].controls.map(({ label, options, ...rest }) => ({
        ...rest,
        ...(options ? { options: options.map((x) => x.value) } : {}),
      })),
    );
    assert.ok(!he.test(JSON.stringify(e[i])), e[i].id);
  }
  const hw = data("llm", "llm-workshop-data"),
    ew = data("llm/en", "llm-workshop-data");
  assert.equal(ew.activities.length, 8);
  assert.equal(ew.protocol.length, hw.protocol.length);
  for (let i = 0; i < 8; i++) {
    for (const key of ["id", "homework", "tutorial"])
      assert.equal(ew.activities[i][key], hw.activities[i][key]);
    for (const key of ["tasks", "solution", "deliverables"])
      assert.equal(ew.activities[i][key].length, hw.activities[i][key].length);
  }
  assert.ok(!he.test(JSON.stringify(ew)));
});
test("English rendering includes all teaching text, controls, explanations and accessible plot labels", () => {
  const dom = open("lab/en"),
    w = dom.window,
    d = w.document;
  for (const a of JSON.parse(d.getElementById("la-data").textContent)) {
    set(w, "la-select", a.id, "change");
    assert.ok(!he.test(visibleText(d)), a.id);
    for (const c of a.controls) {
      const values = c.options
        ? c.options.map((o) => o.value)
        : [c.min, c.value, c.max];
      for (const v of values) {
        set(w, `control-${c.id}`, v);
        assert.ok(
          !he.test(
            d.getElementById("la-plot").innerHTML +
              d.getElementById("la-readouts").textContent,
          ),
        );
      }
    }
    d.querySelector(`input[name="prediction"][value="${a.answer}"]`).click();
    d.querySelector("#la-prediction-form button").click();
    assert.match(
      d.getElementById("la-prediction-feedback").textContent,
      /correct/,
    );
  }
  assert.equal(d.getElementById("la-activity").dir, "ltr");
  assert.equal(d.getElementById("la-activity").lang, "en");
  dom.window.close();
});
test("language navigation preserves the tutorial hash and existing student work", () => {
  const dom = open("lab", {}, "#tutorial-12"),
    w = dom.window,
    d = w.document;
  set(
    w,
    "la-reflection",
    "Keep this original explanation when the language changes.",
  );
  set(w, "control-w", 3);
  const record = JSON.parse(w.localStorage.getItem("chengadi-linear-lab-v1"));
  const link = d.querySelector('[data-language-switch][hreflang="en"]');
  assert.equal(link.hash, "#tutorial-12");
  assert.ok(link.href.includes("/lab/en/"));
  const next = open(
    "lab/en",
    { "chengadi-linear-lab-v1": record },
    "#tutorial-12",
  );
  assert.equal(
    next.window.document.getElementById("la-reflection").value,
    "Keep this original explanation when the language changes.",
  );
  assert.equal(next.window.document.getElementById("control-w").value, "3");
  assert.match(
    next.window.document.getElementById("la-caption").textContent,
    /weighted inner product/,
  );
  dom.window.close();
  next.window.close();
});
test("English LLM prompts, solutions, downloads and journal preserve the selected activity across languages", async () => {
  const dom = open("llm/en"),
    w = dom.window,
    d = w.document;
  assert.ok(!he.test(visibleText(d)));
  assert.ok(d.querySelector('a[href$="llm-activities-en.json"]'));
  const workshop = JSON.parse(
    d.getElementById("llm-workshop-data").textContent,
  );
  let copied = "";
  Object.defineProperty(w.navigator, "clipboard", {
    value: {
      writeText: async (x) => {
        copied = x;
      },
    },
  });
  for (const a of workshop.activities) {
    d.querySelector(`[data-copy="prompt-${a.id}"]`).click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(copied, a.prompt);
    set(w, "llm-activity", a.id, "change");
    set(
      w,
      "llm-check",
      `Independent check for ${a.id}: verified by direct substitution.`,
    );
  }
  d.getElementById("llm-export").click();
  const exported = await w.exports.at(-1).text();
  assert.match(exported, /Model and version/);
  assert.ok(!he.test(exported));
  const records = JSON.parse(w.localStorage.getItem("chengadi-linear-llm-v1"));
  const next = open("llm", { "chengadi-linear-llm-v1": records });
  assert.equal(
    next.window.document.getElementById("llm-activity").value,
    "complex-convention",
  );
  assert.match(
    next.window.document.getElementById("llm-check").value,
    /complex-convention/,
  );
  d.getElementById("llm-print").click();
  assert.equal(w.printed, true);
  dom.window.close();
  next.window.close();
});
test("favicon declarations replace the starter icon with Chen's portrait on every page", () => {
  const d = new JSDOM(fs.readFileSync("dist/index.html", "utf8")).window
    .document;
  assert.equal(
    d
      .querySelector('link[rel="icon"][type="image/svg+xml"]')
      .getAttribute("href"),
    "/brand/chen-favicon-v2.svg",
  );
  assert.ok(d.querySelector('link[rel="apple-touch-icon"]'));
  const svg = fs.readFileSync("public/favicon.svg", "utf8");
  assert.match(svg, /Chen Gadi/);
  assert.match(svg, /data:image\/png;base64/);
  assert.ok(!svg.includes("M50.4 78.5"));
  const png = fs.readFileSync("public/brand/chen-favicon-v2.png");
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.ok(png.length > 3000);
});
