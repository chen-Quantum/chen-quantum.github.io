// Progressive enhancement: all course materials remain available without JS.
// Resource URLs and PDF access controls are left to their existing components.
(() => {
  const normalize = (value: string) =>
    value
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase("en")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();

  const hashTarget = (hash = location.hash) => {
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return null;
    }
  };

  const onHashNavigation = (reveal: (target: HTMLElement | null, scroll: boolean) => void) => {
    window.addEventListener("hashchange", () => reveal(hashTarget(), true));
    // A link to the current hash does not fire hashchange. Reveal its target
    // before the browser scrolls, including links from site-wide search.
    document.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[href]")
        : null;
      if (!link || link.target === "_blank") return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname.replace(/\/$/, "") !== location.pathname.replace(/\/$/, "") || !url.hash) return;
      reveal(hashTarget(url.hash), false);
    });
  };

  for (const root of document.querySelectorAll<HTMLElement>("[data-tutorial-discovery]")) {
    const input = root.querySelector<HTMLInputElement>("[data-tutorial-search]");
    const controls = root.querySelector<HTMLElement>("[data-discovery-controls]");
    const results = root.querySelector<HTMLElement>("#tutorial-results");
    const empty = root.querySelector<HTMLElement>("[data-tutorial-empty]");
    const cards = [...root.querySelectorAll<HTMLElement>("[data-tutorial-search-text]")];
    if (!input || !controls || !results || !empty || !cards.length) continue;

    const indexed = cards.map((card) => ({
      card,
      number: Number(card.dataset.tutorial),
      text: normalize(card.dataset.tutorialSearchText || ""),
    }));
    const clear = controls.querySelector<HTMLButtonElement>("[data-tutorial-reset]");

    const apply = () => {
      const query = input.value.trim();
      const tokens = normalize(query).split(" ").filter(Boolean);
      let visible = 0;
      for (const entry of indexed) {
        // Numeric queries select the tutorial number, so "1" does not also
        // return tutorials 10, 11, 12, and 13.
        const matches = tokens.every((token) =>
          /^\d+$/.test(token)
            ? entry.number === Number(token)
            : entry.text.includes(token),
        );
        entry.card.hidden = !matches;
        if (matches) visible++;
      }
      empty.hidden = visible > 0;
      if (clear) clear.disabled = !input.value;
      results.textContent = !tokens.length
        ? `Showing all ${cards.length} tutorials`
        : `Showing ${visible} of ${cards.length} tutorials for “${query}”`;
    };

    input.addEventListener("input", apply);
    for (const button of root.querySelectorAll<HTMLButtonElement>("[data-tutorial-reset]")) {
      button.addEventListener("click", () => {
        input.value = "";
        apply();
        input.focus();
      });
    }
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !input.value) return;
      event.preventDefault();
      input.value = "";
      apply();
    });

    onHashNavigation((target, scroll) => {
      if (!target || !cards.includes(target) || !target.hidden) return;
      input.value = "";
      apply();
      if (scroll) target.scrollIntoView?.({ block: "start" });
    });
    controls.hidden = false;
    apply();
  }

  for (const root of document.querySelectorAll<HTMLElement>("[data-teaching-archive]")) {
    const bar = root.querySelector<HTMLElement>("[data-course-filter]");
    if (!bar) continue;
    const buttons = [...bar.querySelectorAll<HTMLButtonElement>("[data-course]")];
    const sections = [...root.querySelectorAll<HTMLElement>("[data-course-section]")];
    const results = bar.querySelector<HTMLElement>("[data-course-results]");
    const sectionIds = sections.map((section) => section.id).filter(Boolean).join(" ");
    for (const button of buttons) button.setAttribute("aria-controls", sectionIds);

    const apply = (course: string) => {
      const selection = buttons.find((button) => button.dataset.course === course);
      const selectedCourse = selection ? course : "all";
      let visible = 0;
      for (const section of sections) {
        section.hidden = selectedCourse !== "all" && section.dataset.courseSection !== selectedCourse;
        if (!section.hidden) visible++;
      }
      for (const button of buttons) {
        button.setAttribute("aria-pressed", String(button.dataset.course === selectedCourse));
      }
      if (results) {
        results.textContent = selectedCourse === "all"
          ? `Showing all ${visible} courses`
          : `Showing ${selection?.textContent?.trim() || "selected course"} materials`;
      }
    };

    for (const button of buttons) {
      button.addEventListener("click", () => apply(button.dataset.course || "all"));
    }
    const revealHash = (target: HTMLElement | null, scroll: boolean) => {
      const section = target?.closest<HTMLElement>("[data-course-section]");
      if (section && sections.includes(section)) {
        const wasHidden = section.hidden;
        apply(section.dataset.courseSection || "all");
        if (wasHidden && scroll) target?.scrollIntoView?.({ block: "start" });
      } else if (target?.id === "recording-archive") {
        apply("all");
      }
    };

    bar.hidden = false;
    apply("all");
    revealHash(hashTarget(), false);
    onHashNavigation(revealHash);
  }
})();
