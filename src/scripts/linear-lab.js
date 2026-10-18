import { renderActivity, escapeHtml } from "../lib/linearLabPlot.mjs";
const root = document.querySelector("#linear-lab");
if (root) {
  const activities = JSON.parse(document.querySelector("#la-data").textContent),
    key = "chengadi-linear-lab-v1";
  const $ = (id) => document.getElementById(id);
  const blank = (a) => ({
    values: Object.fromEntries(a.controls.map((c) => [c.id, c.value])),
    prediction: null,
    extension: null,
    reflection: "",
    stage: 0,
    completed: false,
  });
  let stored = {};
  try {
    const x = JSON.parse(localStorage.getItem(key) || "{}");
    if (x.version === 1) stored = x.activities || {};
  } catch {}
  const state = Object.fromEntries(
    activities.map((a) => {
      const b = blank(a),
        s = stored[a.id];
      if (!s || typeof s !== "object") return [a.id, b];
      for (const c of a.controls) {
        const v = s.values?.[c.id];
        if (
          Number.isFinite(v) &&
          (c.options
            ? c.options.some((o) => o.value === v)
            : v >= c.min && v <= c.max && (v - c.min) % (c.step || 1) === 0)
        )
          b.values[c.id] = v;
      }
      if (
        Number.isInteger(s.prediction) &&
        s.prediction >= 0 &&
        s.prediction < a.choices.length
      )
        b.prediction = s.prediction;
      if (
        Number.isInteger(s.extension) &&
        s.extension >= 0 &&
        s.extension < a.extensionChoices.length
      )
        b.extension = s.extension;
      if (typeof s.reflection === "string")
        b.reflection = s.reflection.slice(0, 5000);
      if ([0, 1, 2].includes(s.stage)) b.stage = s.stage;
      b.completed =
        s.completed === true &&
        b.extension === a.extensionAnswer &&
        b.reflection.trim().length >= 20;
      return [a.id, b];
    }),
  );
  let active = activities[0],
    plot;
  function save() {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ version: 1, activities: state }),
      );
    } catch {
      $("la-storage-status").textContent =
        "Browser storage is unavailable. Keep working and download your notebook to save a copy.";
    }
  }
  function progress() {
    const count = Object.values(state).filter((s) => s.completed).length;
    $("la-progress").value = count;
    $("la-progress-text").textContent = `${count} of 13 completed`;
    for (const el of root.querySelectorAll("[data-completion]")) {
      const done = state[el.dataset.completion].completed;
      el.textContent = done ? "✓" : "○";
      el.setAttribute("aria-label", done ? "Completed" : "Not completed");
    }
  }
  function showStage(n) {
    state[active.id].stage = n;
    for (const s of root.querySelectorAll("[data-stage]"))
      s.hidden = Number(s.dataset.stage) !== n;
    for (const b of root.querySelectorAll("[data-step]")) {
      if (Number(b.dataset.step) === n) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    }
    save();
  }
  function updatePlot() {
    plot = renderActivity(active.id, state[active.id].values);
    $("la-plot").innerHTML = plot.svg;
    $("la-caption").textContent = plot.caption;
    $("la-readouts").innerHTML = plot.readouts
      .map(
        (r) =>
          `<div><dt>${escapeHtml(r.label)}</dt><dd dir="auto">${escapeHtml(r.value)}</dd></div>`,
      )
      .join("");
    for (const [id, v] of Object.entries(state[active.id].values)) {
      const el = $(`value-${id}`);
      if (el) el.textContent = String(v);
    }
  }
  const choices = (texts, name, value) =>
    texts
      .map(
        (text, i) =>
          `<label><input type="radio" name="${name}" value="${i}" ${value === i ? "checked" : ""}/><span>${escapeHtml(text)}</span></label>`,
      )
      .join("");
  function select(id, focus = false) {
    const a = activities.find((x) => x.id === id);
    if (!a) return;
    active = a;
    const s = state[id];
    $("la-select").value = id;
    for (const el of root.querySelectorAll("[data-lab-id]")) {
      const current = el.dataset.labId === id;
      el.classList.toggle("is-active", current);
      if (current) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    }
    $("la-kicker").textContent =
      `Tutorial ${a.number} · About ${a.minutes} minutes`;
    $("la-title").textContent = a.title;
    $("la-intro").textContent = a.intro;
    $("la-formula").textContent = a.formula;
    $("la-question").textContent = a.question;
    $("la-choices").innerHTML = choices(a.choices, "prediction", s.prediction);
    $("la-prediction-feedback").hidden = true;
    $("la-finish-feedback").hidden = true;
    $("la-experiment").textContent = a.experiment;
    $("la-controls").innerHTML = a.controls
      .map(
        (c) =>
          `<div class="la-control"><label for="control-${c.id}">${escapeHtml(c.label)}<output id="value-${c.id}" dir="ltr">${s.values[c.id]}</output></label>${c.options ? `<select id="control-${c.id}" data-control="${c.id}">${c.options.map((o) => `<option value="${o.value}" ${o.value === s.values[c.id] ? "selected" : ""}>${escapeHtml(o.label)}</option>`).join("")}</select>` : `<input id="control-${c.id}" data-control="${c.id}" type="range" min="${c.min}" max="${c.max}" step="${c.step || 1}" value="${s.values[c.id]}"/>`}</div>`,
      )
      .join("");
    $("la-observations").innerHTML = a.observations
      .map((o) => `<li>${escapeHtml(o)}</li>`)
      .join("");
    $("la-explanation").textContent = a.explanation;
    root.querySelector(".la-proof").open = false;
    $("la-extension").textContent = a.extension;
    $("la-extension-choices").innerHTML = choices(
      a.extensionChoices,
      "extension",
      s.extension,
    );
    $("la-reflection-label").textContent = a.reflection;
    $("la-reflection").value = s.reflection;
    $("la-next-lab").textContent =
      a.number === 13 ? "Back to tutorial 1 →" : "Next tutorial →";
    updatePlot();
    showStage(s.stage);
    progress();
    if (focus) $("la-title").focus({ preventScroll: false });
  }
  const fromHash = () => {
    const m = location.hash.match(/^#tutorial-(\d+)$/);
    return m ? activities.find((a) => a.number === Number(m[1])) : null;
  };
  function navigate(id) {
    const a = activities.find((a) => a.id === id);
    if (!a) return;
    history.replaceState(null, "", `#tutorial-${a.number}`);
    select(id, true);
  }
  root.addEventListener("click", (e) => {
    const target = e.target.closest("[data-lab-id],[data-step],[data-next]");
    if (!target) return;
    if (target.dataset.labId) {
      e.preventDefault();
      navigate(target.dataset.labId);
    } else showStage(Number(target.dataset.step ?? target.dataset.next));
  });
  $("la-select").addEventListener("change", (e) => navigate(e.target.value));
  window.addEventListener("hashchange", () => {
    const a = fromHash();
    if (a) select(a.id, true);
  });
  $("la-controls").addEventListener("input", (e) => {
    const id = e.target.dataset.control;
    if (!id) return;
    state[active.id].values[id] = Number(e.target.value);
    updatePlot();
    save();
  });
  $("la-prediction-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = new FormData(e.currentTarget).get("prediction"),
      el = $("la-prediction-feedback");
    el.hidden = false;
    if (v === null) {
      el.textContent = "Choose an answer to check your prediction.";
      return;
    }
    state[active.id].prediction = Number(v);
    el.textContent =
      (Number(v) === active.answer
        ? "Your prediction is correct.\n"
        : "You can revise your prediction.\n") + active.feedback;
    save();
  });
  $("la-reflection").addEventListener("input", (e) => {
    state[active.id].reflection = e.target.value;
    if (e.target.value.trim().length < 20) state[active.id].completed = false;
    save();
    progress();
  });
  $("la-extension-choices").addEventListener("change", (e) => {
    state[active.id].extension = Number(e.target.value);
    if (state[active.id].extension !== active.extensionAnswer)
      state[active.id].completed = false;
    save();
    progress();
  });
  $("la-finish-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = new FormData(e.currentTarget).get("extension"),
      s = state[active.id],
      el = $("la-finish-feedback");
    el.hidden = false;
    if (v === null) {
      el.textContent = "Choose an answer to the check question.";
      return;
    }
    s.extension = Number(v);
    s.reflection = $("la-reflection").value;
    if (s.extension !== active.extensionAnswer) {
      el.textContent = "Check the argument again.\n" + active.extensionFeedback;
      save();
      return;
    }
    if (s.reflection.trim().length < 20) {
      el.textContent =
        "Correct answer. Add your own explanation, at least 20 characters, to save the activity summary.";
      return;
    }
    s.completed = true;
    el.textContent =
      "Correct answer. Your summary is saved.\n" +
      active.extensionFeedback +
      "\nYou can continue to the next tutorial.";
    save();
    progress();
  });
  $("la-reset").addEventListener("click", () => {
    state[active.id].values = blank(active).values;
    for (const c of active.controls) $(`control-${c.id}`).value = c.value;
    updatePlot();
    save();
  });
  $("la-next-lab").addEventListener("click", () =>
    navigate(activities[active.number % activities.length].id),
  );
  function download(content, type, name) {
    const url = URL.createObjectURL(new Blob([content], { type })),
      a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  $("la-download-plot").addEventListener("click", () =>
    download(
      plot.svg,
      "image/svg+xml",
      `linear-algebra-tutorial-${active.number}.svg`,
    ),
  );
  $("la-export").addEventListener("click", () =>
    download(
      JSON.stringify(
        {
          version: 1,
          course: "אלגברה לינארית — חן גדי",
          website: "https://chengadi.science/teaching/linear-algebra/lab",
          exportedAt: new Date().toISOString(),
          activities: activities.map((a) => ({
            tutorial: a.number,
            title: a.title,
            ...state[a.id],
          })),
        },
        null,
        2,
      ),
      "application/json",
      "linear-algebra-my-notebook.json",
    ),
  );
  select((fromHash() || activities[0]).id);
}
