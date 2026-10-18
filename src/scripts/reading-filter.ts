(() => {
  const selection = document.getElementById("reading-selection");
  if (!selection) return;
  const cards = [
    ...selection.querySelectorAll<HTMLElement>("[data-reading-topic]"),
  ];
  const buttons = [
    ...selection.querySelectorAll<HTMLButtonElement>("[data-reading-filter]"),
  ];
  const results = document.getElementById("reading-results");
  const names: Record<string, string> = {
    all: "all reading",
    physics: "quantum and physics",
    ml: "machine learning and AI",
  };
  for (const button of buttons) {
    button.addEventListener("click", () => {
      const filter = button.dataset.readingFilter || "all";
      let visible = 0;
      for (const card of cards) {
        card.hidden = filter !== "all" && card.dataset.readingTopic !== filter;
        if (!card.hidden) visible++;
      }
      for (const control of buttons)
        control.setAttribute("aria-pressed", String(control === button));
      if (results)
        results.textContent = `Showing ${visible} ${visible === 1 ? "article" : "articles"} · ${names[filter] || names.all}`;
    });
  }
})();
