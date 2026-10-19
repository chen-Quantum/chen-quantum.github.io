const root = document.querySelector("#linear-llm");
if (root) {
  const data = JSON.parse(
      document.getElementById("llm-workshop-data").textContent,
    ),
    key = "chengadi-linear-llm-v1";
  const $ = (id) => document.getElementById(id),
    fields = [
      "model",
      "date",
      "prediction",
      "prompt",
      "response",
      "check",
      "revision",
      "conclusion",
    ];
  let saved = {};
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "{}");
    if (parsed.version === 1) saved = parsed.records || {};
  } catch {}
  const records = Object.fromEntries(
    data.activities.map((a) => {
      const old = saved[a.id],
        record = {};
      for (const f of fields) {
        const limit =
          $(`llm-${f}`).maxLength > 0 ? $(`llm-${f}`).maxLength : 20;
        record[f] = typeof old?.[f] === "string" ? old[f].slice(0, limit) : "";
      }
      return [a.id, record];
    }),
  );
  let current = data.activities[0].id;
  try {
    const selected = JSON.parse(localStorage.getItem(key) || "{}").selected;
    if (data.activities.some((a) => a.id === selected)) current = selected;
  } catch {}
  function collect() {
    for (const f of fields) records[current][f] = $(`llm-${f}`).value;
  }
  function save() {
    collect();
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ version: 1, selected: current, records }),
      );
      return true;
    } catch {
      $("llm-journal-status").textContent =
        "Browser storage is unavailable. Download your records to keep a copy.";
      return false;
    }
  }
  function select(id) {
    if (!data.activities.some((a) => a.id === id)) return;
    collect();
    current = id;
    $("llm-activity").value = id;
    const r = records[id],
      a = data.activities.find((a) => a.id === id);
    for (const f of fields) $(`llm-${f}`).value = r[f] || "";
    if (!r.prompt) $("llm-prompt").value = a.prompt;
    if (!r.date) {
      const today = new Date();
      $("llm-date").value =
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    }
  }
  // The initial collection must not overwrite an existing first record.
  for (const f of fields) $(`llm-${f}`).value = records[current][f];
  select(current);
  $("llm-activity").addEventListener("change", (e) => {
    save();
    select(e.target.value);
    save();
  });
  $("llm-journal-form").addEventListener("input", () => {
    save();
  });
  $("llm-journal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (save())
      $("llm-journal-status").textContent =
        "Saved in this browser. This is not a course submission.";
  });
  root.addEventListener("click", async (e) => {
    const copy = e.target.closest("[data-copy]");
    if (copy) {
      const target = $(copy.dataset.copy),
        text = target.textContent.trim();
      let status = "Prompt copied. Paste it into your preferred model.";
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const range = document.createRange();
        range.selectNodeContents(target);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        status = "Text selected. Press Ctrl+C or ⌘C to copy.";
      }
      let out = copy.nextElementSibling;
      if (!out || !out.classList.contains("la-copy-status")) {
        out = document.createElement("p");
        out.className = "la-copy-status";
        out.setAttribute("role", "status");
        copy.after(out);
      }
      out.textContent = status;
    }
    const button = e.target.closest("[data-journal]");
    if (button) {
      save();
      select(button.dataset.journal);
      save();
      $("journal").scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
      $("llm-prediction").focus({ preventScroll: true });
    }
  });
  $("llm-export").addEventListener("click", () => {
    save();
    const used = data.activities.filter((a) =>
      fields.some(
        (f) => !["date", "prompt"].includes(f) && records[a.id][f].trim(),
      ),
    );
    if (!used.length) {
      $("llm-journal-status").textContent =
        "Add a prediction or a note first, then download your records.";
      return;
    }
    const isEnglish = root.dataset.locale === "en";
    const labels = isEnglish
      ? {
          model: "Model and version",
          date: "Date",
          prediction: "Prediction and independent attempt",
          prompt: "Original prompt",
          response: "Original response",
          check: "Independent verification",
          revision: "Revised prompt and comparison",
          conclusion: "Conclusion and remaining checks",
        }
      : {
          model: "שם המודל והגרסה",
          date: "תאריך",
          prediction: "ניבוי וניסיון עצמאי",
          prompt: "ההנחיה המקורית",
          response: "התשובה המקורית",
          check: "האימות העצמאי",
          revision: "הנחיה מתוקנת והשוואה",
          conclusion: "מסקנה ומה נותר לבדוק",
        };
    const text = [
      isEnglish
        ? "LLM notebook: Linear Algebra, Chen Gadi"
        : "מחברת LLM: אלגברה לינארית, חן גדי",
      "https://chengadi.science/teaching/linear-algebra/llm",
      "",
      ...used.flatMap((a) => [
        `${isEnglish ? "Activity" : "פעילות"}: ${a.title} | ${isEnglish ? "Homework" : "מטלה"} ${a.homework}`,
        ...fields.flatMap((f) => [
          `${labels[f]}:`,
          records[a.id][f] || (isEnglish ? "(not recorded)" : "(לא תועד)"),
          "",
        ]),
        "--------------------------------",
        "",
      ]),
    ].join("\n");
    const url = URL.createObjectURL(
        new Blob([text], { type: "text/plain;charset=utf-8" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = "linear-algebra-llm-notebook.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $("llm-journal-status").textContent =
      "Notebook downloaded as text. Attach your plots and code separately.";
  });
  $("llm-print").addEventListener("click", () => window.print());
}
