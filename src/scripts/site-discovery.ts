(() => {
  const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const tokensFor = (value: string) => normalize(value).split(/\s+/).filter(Boolean);
  const matches = (text: string, tokens: string[]) => tokens.every((token) =>
    /^\d+$/.test(token) ? text.split(/\s+/).includes(token) : text.includes(token),
  );

  // Reading appearance stays on this device. Blocked storage must not disable
  // navigation, search, or changing the appearance for the current page.
  const appearanceButton = document.getElementById("appearance-toggle");
  const applyAppearance = (appearance: string) => {
    const paper = appearance === "paper";
    document.documentElement.dataset.appearance = paper ? "paper" : "light";
    appearanceButton?.setAttribute("aria-pressed", String(paper));
    appearanceButton?.setAttribute("aria-label", paper ? "Use white background" : "Use paper background");
  };
  let savedAppearance = document.documentElement.dataset.appearance || "light";
  try { savedAppearance = localStorage.getItem("cg-site-appearance") || savedAppearance; } catch {}
  applyAppearance(savedAppearance);
  appearanceButton?.addEventListener("click", () => {
    const next = document.documentElement.dataset.appearance === "paper" ? "light" : "paper";
    applyAppearance(next);
    try { localStorage.setItem("cg-site-appearance", next); } catch {}
  });

  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const setMenu = (open: boolean, restoreFocus = false) => {
    if (!navMenu || !navToggle) return;
    navMenu.hidden = !open;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    if (restoreFocus) navToggle.focus();
  };
  navToggle?.addEventListener("click", () => setMenu(Boolean(navMenu?.hidden)));
  navMenu?.addEventListener("click", (event) => {
    if ((event.target as Element).closest("a")) setMenu(false);
  });
  const desktop = window.matchMedia?.("(min-width: 1200px)");
  desktop?.addEventListener?.("change", (event) => { if (event.matches) setMenu(false); });

  type Entry = { title: string; url: string; description: string; category: string; keywords?: string };
  const dialog = document.getElementById("site-search-dialog") as HTMLDialogElement | null;
  const input = document.getElementById("site-search-input") as HTMLInputElement | null;
  const resultList = document.getElementById("site-search-results");
  const status = document.getElementById("site-search-status");
  const allResults = document.getElementById("site-search-all") as HTMLAnchorElement | null;
  let index: Entry[] | null = null;
  let loading: Promise<void> | null = null;
  let previousFocus: HTMLElement | null = null;
  const validPath = (path: unknown): path is string => {
    if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) return false;
    try { return new URL(path, window.location.origin).origin === window.location.origin; } catch { return false; }
  };
  const validEntry = (value: unknown): value is Entry => {
    if (!value || typeof value !== "object") return false;
    const candidate = value as Entry;
    return typeof candidate.title === "string" && typeof candidate.description === "string" &&
      typeof candidate.category === "string" && validPath(candidate.url) &&
      (candidate.keywords === undefined || typeof candidate.keywords === "string");
  };
  const renderSearch = () => {
    if (!input || !resultList || !status || !index) return;
    const query = normalize(input.value);
    const tokens = tokensFor(input.value);
    const results = index.filter((entry) => matches(normalize([entry.title, entry.description, entry.category, entry.keywords || ""].join(" ")), tokens));
    if (query) results.sort((a, b) => Number(normalize(b.title).includes(query)) - Number(normalize(a.title).includes(query)));
    resultList.replaceChildren();
    for (const entry of results.slice(0, 8)) {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = entry.url;
      const category = document.createElement("span");
      category.className = "site-result-category";
      category.textContent = entry.category;
      const title = document.createElement("strong");
      title.textContent = entry.title;
      const description = document.createElement("span");
      description.className = "site-result-description";
      description.textContent = entry.description;
      link.append(category, title, description);
      li.append(link);
      resultList.append(li);
    }
    status.textContent = !tokens.length ? "A few places to start. Type a topic to search all " + index.length + " resources."
      : !results.length ? "No matches. Try a shorter topic or browse all resources below."
      : results.length + (results.length === 1 ? " resource found." : " resources found.") + (results.length > 8 ? " Showing the first 8." : "");
    if (allResults) {
      const destination = new URL("/search", window.location.origin);
      if (input.value.trim()) destination.searchParams.set("q", input.value.trim());
      allResults.href = destination.pathname + destination.search;
      allResults.textContent = tokens.length ? "See all results ↗" : "Browse all resources ↗";
    }
  };
  const loadIndex = () => {
    if (index) { renderSearch(); return Promise.resolve(); }
    if (loading) return loading;
    if (status) status.textContent = "Loading the search index...";
    loading = (async () => {
      try {
        const response = await fetch("/search-index.json", { credentials: "same-origin" });
        if (!response.ok) throw new Error("Search index unavailable");
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid search index");
        index = data.filter(validEntry);
        renderSearch(); // Read the current input, including typing during loading.
      } catch {
        if (status) status.textContent = "Search could not load. Browse all resources below, or close and reopen search to try again.";
      } finally {
        loading = null;
      }
    })();
    return loading;
  };
  const closeSearch = () => {
    if (!dialog?.open) return;
    dialog.close();
  };
  const openSearch = () => {
    if (!dialog || !input || typeof dialog.showModal !== "function") return false;
    if (!dialog.open) {
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setMenu(false);
      dialog.showModal();
    }
    input.focus();
    void loadIndex();
    return true;
  };
  document.querySelectorAll<HTMLAnchorElement>("[data-search-open]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (openSearch()) event.preventDefault();
    });
  });
  dialog?.querySelector("[data-search-close]")?.addEventListener("click", closeSearch);
  dialog?.addEventListener("close", () => {
    if (previousFocus?.isConnected) previousFocus.focus();
  });
  dialog?.addEventListener("cancel", (event) => { event.preventDefault(); closeSearch(); });
  dialog?.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeSearch();
  });
  resultList?.addEventListener("click", (event) => {
    if ((event.target as Element).closest("a")) closeSearch();
  });
  input?.addEventListener("input", renderSearch);
  input?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      const first = resultList?.querySelector<HTMLAnchorElement>("a");
      if (first) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k" && !event.altKey) {
      if (openSearch()) event.preventDefault();
    } else if (event.key === "Escape") {
      if (dialog?.open) { event.preventDefault(); closeSearch(); }
      else if (navMenu && !navMenu.hidden) { event.preventDefault(); setMenu(false, true); }
    }
  });

  // The directory is pre-rendered so every destination is available without JS.
  const form = document.getElementById("search-page-form") as HTMLFormElement | null;
  const pageInput = document.getElementById("search-page-input") as HTMLInputElement | null;
  const category = document.getElementById("search-page-category") as HTMLSelectElement | null;
  const pageStatus = document.getElementById("search-page-status");
  const empty = document.getElementById("search-page-empty");
  const cards = [...document.querySelectorAll<HTMLElement>("[data-search-entry]")];
  if (form && pageInput && category && pageStatus) {
    const params = new URLSearchParams(window.location.search);
    pageInput.value = params.get("q") || "";
    const initialCategory = params.get("category") || "";
    if ([...category.options].some((option) => option.value === initialCategory)) category.value = initialCategory;
    const filterPage = () => {
      const tokens = tokensFor(pageInput.value);
      let count = 0;
      for (const card of cards) {
        const visible = (!category.value || card.dataset.searchCategory === category.value) &&
          matches(normalize(card.dataset.searchText || ""), tokens);
        card.hidden = !visible;
        if (visible) count++;
      }
      pageStatus.textContent = count + (count === 1 ? " resource" : " resources") +
        ((tokens.length || category.value) ? " match your search." : " across the website.");
      if (empty) empty.hidden = count > 0;
    };
    const updateAddress = () => {
      const address = new URL(window.location.href);
      address.search = "";
      if (pageInput.value.trim()) address.searchParams.set("q", pageInput.value.trim());
      if (category.value) address.searchParams.set("category", category.value);
      window.history.replaceState(null, "", address.pathname + address.search);
    };
    pageInput.addEventListener("input", filterPage);
    category.addEventListener("change", filterPage);
    form.addEventListener("submit", (event) => { event.preventDefault(); filterPage(); updateAddress(); });
    document.getElementById("search-page-reset")?.addEventListener("click", () => {
      pageInput.value = "";
      category.value = "";
      filterPage();
      updateAddress();
      pageInput.focus();
    });
    filterPage();
  }
})();
