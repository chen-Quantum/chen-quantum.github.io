// DOM and built-output checks for public discovery and navigation.
// Uses an isolated jsdom runtime via PORTAL_QA_ROOT. No server or browser starts.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire, stripTypeScriptTypes } from "node:module";
import { test } from "node:test";

const require = createRequire(
  path.resolve(process.env.PORTAL_QA_ROOT || ".", "package.json"),
);
const { JSDOM } = require("jsdom");
const origin = "https://chengadi.science";
const dist = path.resolve("dist");
const htmlFiles = fs
  .readdirSync(dist, { recursive: true })
  .filter((file) => file.endsWith(".html"));

function builtFile(route) {
  const url = new URL(route, origin);
  const local = path.join(dist, decodeURIComponent(url.pathname));
  if (fs.existsSync(local) && fs.statSync(local).isFile()) return local;
  return path.join(local, "index.html");
}

function readHtml(route) {
  return fs.readFileSync(builtFile(route), "utf8");
}

function open(route = "/", { stored, blockStorage = false, fetcher } = {}) {
  const dom = new JSDOM(readHtml(route), {
    url: new URL(route, origin).href,
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const w = dom.window;
  // outside-only parses <noscript> as if scripting were disabled. Remove its
  // fallback content before manually running JS so hidden-button CSS cannot
  // distort the focus behavior of a scripting-enabled browser.
  w.document.querySelectorAll("noscript").forEach((node) => node.remove());
  const requests = [];
  const media = [];
  w.matchMedia = (query) => {
    const callbacks = [];
    const result = {
      matches: false,
      media: query,
      addEventListener: (_, callback) => callbacks.push(callback),
      removeEventListener: () => {},
      addListener: (callback) => callbacks.push(callback),
      removeListener: () => {},
      change(matches) {
        result.matches = matches;
        callbacks.forEach((callback) => callback(result));
      },
    };
    media.push(result);
    return result;
  };
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new w.Event("close"));
  };
  if (stored !== undefined) w.localStorage.setItem("cg-site-appearance", stored);
  if (blockStorage) {
    Object.defineProperty(w, "localStorage", {
      get() {
        throw new w.DOMException("Storage blocked", "SecurityError");
      },
    });
  }
  w.fetch = async (...args) => {
    requests.push(args);
    if (fetcher) return fetcher(...args);
    assert.equal(new URL(args[0], origin).pathname, "/search-index.json");
    return {
      ok: true,
      json: async () => JSON.parse(fs.readFileSync("dist/search-index.json", "utf8")),
    };
  };
  // Exercise the early preference restoration in the actual rendered document.
  for (const script of w.document.head.querySelectorAll("script:not([src])")) {
    if (script.textContent.includes("cg-site-appearance"))
      w.eval(script.textContent);
  }
  const source = stripTypeScriptTypes(
    fs.readFileSync("src/scripts/site-discovery.ts", "utf8"),
    { mode: "transform" },
  );
  w.eval(source);
  return { dom, w, d: w.document, requests, media };
}

function input(w, element, value, type = "input") {
  assert.ok(element, "input control exists");
  element.value = value;
  element.dispatchEvent(new w.Event(type, { bubbles: true }));
}

async function until(check) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (check()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  assert.fail("DOM state did not settle");
}

test("every built page has unambiguous landmarks, named media and shared social metadata", () => {
  for (const file of htmlFiles) {
    const dom = new JSDOM(fs.readFileSync(path.join(dist, file), "utf8"));
    const d = dom.window.document;
    assert.equal(d.querySelectorAll("main").length, 1, file);
    assert.equal(d.querySelectorAll("main h1").length, 1, file);
    assert.ok(d.getElementById("main-content"), file);
    const ids = [...d.querySelectorAll("[id]")].map((node) => node.id);
    assert.equal(new Set(ids).size, ids.length, `${file}: unique element IDs`);
    for (const image of d.querySelectorAll("img"))
      assert.ok(image.hasAttribute("alt"), `${file}: image alt attribute`);
    for (const frame of d.querySelectorAll("iframe"))
      assert.ok(frame.title.trim(), `${file}: frame title`);
    for (const property of ["og:title", "og:description", "og:url", "og:image"])
      assert.ok(
        d.querySelector(`meta[property="${property}"]`)?.content,
        `${file}: ${property}`,
      );
    assert.equal(
      d.querySelector('meta[property="og:url"]').content,
      d.querySelector('link[rel="canonical"]').href,
      `${file}: social URL agrees with canonical`,
    );
    const socialImage = new URL(d.querySelector('meta[property="og:image"]').content);
    assert.equal(socialImage.origin, origin, `${file}: same-site share image`);
    assert.ok(fs.existsSync(builtFile(socialImage.href)), `${file}: share image exists`);
    assert.ok(d.querySelector('meta[name="twitter:card"]')?.content, file);
    dom.window.close();
  }
});

test("empty placeholders, search results and 404 are noindex and omitted from the sitemap", () => {
  const excluded = ["/library/", "/materials/", "/digital-courses/", "/search/", "/404.html"];
  const sitemap = new JSDOM(fs.readFileSync("dist/sitemap.xml", "utf8"), {
    contentType: "text/xml",
  });
  const urls = [...sitemap.window.document.querySelectorAll("loc")].map((node) => node.textContent);
  assert.equal(urls.length, new Set(urls).size, "sitemap does not duplicate URLs");
  for (const route of excluded) {
    const dom = new JSDOM(readHtml(route));
    assert.match(
      dom.window.document.querySelector('meta[name="robots"]')?.content || "",
      /noindex/,
      route,
    );
    assert.ok(!urls.some((url) => new URL(url).pathname.replace(/\/$/, "") === route.replace(/\/$/, "")), route);
    dom.window.close();
  }
  for (const url of urls) {
    assert.equal(new URL(url).origin, origin);
    assert.ok(fs.existsSync(builtFile(url)), `sitemap destination exists: ${url}`);
    assert.ok(!new URL(url).search && !new URL(url).hash);
  }
  assert.match(fs.readFileSync("dist/robots.txt", "utf8"), /Sitemap: https:\/\/chengadi\.science\/sitemap\.xml/);
  assert.equal(fs.readFileSync("dist/CNAME", "utf8").trim(), "chengadi.science");
  sitemap.window.close();
});

test("paper appearance persists across page visits and remains usable with blocked storage", () => {
  const first = open();
  assert.equal(first.d.documentElement.dataset.appearance, "light");
  const toggle = first.d.getElementById("appearance-toggle");
  toggle.click();
  assert.equal(first.d.documentElement.dataset.appearance, "paper");
  assert.equal(toggle.getAttribute("aria-pressed"), "true");
  assert.equal(first.w.localStorage.getItem("cg-site-appearance"), "paper");
  const next = open("/teaching/", {
    stored: first.w.localStorage.getItem("cg-site-appearance"),
  });
  assert.equal(next.d.documentElement.dataset.appearance, "paper");
  next.d.getElementById("appearance-toggle").click();
  assert.equal(next.d.documentElement.dataset.appearance, "light");
  assert.equal(next.w.localStorage.getItem("cg-site-appearance"), "light");
  const invalid = open("/", { stored: "unrecognized-theme" });
  assert.equal(invalid.d.documentElement.dataset.appearance, "light");
  const blocked = open("/", { blockStorage: true });
  blocked.d.getElementById("appearance-toggle").click();
  assert.equal(blocked.d.documentElement.dataset.appearance, "paper");
  blocked.d.getElementById("appearance-toggle").click();
  assert.equal(blocked.d.documentElement.dataset.appearance, "light");
  for (const fixture of [first, next, invalid, blocked]) fixture.dom.window.close();
});

test("mobile navigation exposes the current section and closes on Escape, navigation and a wide viewport", () => {
  const { dom, w, d, media } = open("/teaching/2026-2027/");
  const toggle = d.getElementById("nav-toggle");
  const menu = d.getElementById("nav-menu");
  assert.equal(toggle.getAttribute("aria-controls"), menu.id);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(menu.hidden, true);
  assert.equal(d.querySelector('.site-desktop-links a[aria-current="page"]').getAttribute("href"), "/teaching");
  toggle.click();
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(menu.hidden, false);
  menu.querySelector("a").focus();
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.equal(menu.hidden, true);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(d.activeElement, toggle);
  toggle.click();
  const link = menu.querySelector("a");
  link.addEventListener("click", (event) => event.preventDefault());
  link.click();
  assert.equal(menu.hidden, true);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  toggle.click();
  media.find((query) => query.media.includes("1200px")).change(true);
  assert.equal(menu.hidden, true);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  dom.window.close();
});

test("the public index contains only explicit page metadata with live local destinations", () => {
  const entries = JSON.parse(fs.readFileSync("dist/search-index.json", "utf8"));
  assert.ok(Array.isArray(entries) && entries.length > 25);
  assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length);
  const allowedKeys = new Set(["title", "url", "description", "category", "keywords"]);
  const excluded = /^\/(?:library|materials|digital-courses|search|404)(?:\/|\.|$)/;
  for (const entry of entries) {
    assert.ok(Object.keys(entry).every((key) => allowedKeys.has(key)));
    for (const key of ["title", "description", "url", "category"])
      assert.ok(typeof entry[key] === "string" && entry[key].trim(), key);
    assert.ok(entry.url.startsWith("/") && !entry.url.startsWith("//"));
    const url = new URL(entry.url, origin);
    assert.equal(url.origin, origin);
    assert.equal(url.search, "", "no private portal or query-state variants");
    assert.ok(!excluded.test(url.pathname));
    assert.ok(!url.pathname.includes("/files/"), "index points to public resource pages");
    assert.ok(fs.existsSync(builtFile(entry.url)), `destination exists: ${entry.url}`);
    if (url.hash) {
      const dom = new JSDOM(readHtml(entry.url));
      assert.ok(dom.window.document.getElementById(decodeURIComponent(url.hash.slice(1))), entry.url);
      dom.window.close();
    }
  }
  for (const [collection, prefix] of [
    ["projects", "/projects#project-"],
    ["communityEvents", "/quantum-community/events/"],
    ["courses", "/courses/"],
  ]) {
    for (const file of fs.readdirSync(`src/content/${collection}`)) {
      if (!file.endsWith(".md")) continue;
      const source = fs.readFileSync(`src/content/${collection}/${file}`, "utf8");
      const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---/)[1];
      if (!/^draft:\s*true\s*$/m.test(frontmatter)) continue;
      const target = prefix + file.replace(/\.md$/, "");
      assert.ok(!entries.some((entry) => entry.url === target), "draft remains excluded");
    }
  }
  assert.ok(entries.some((entry) => entry.url === "/students"));
  assert.equal(entries.filter((entry) => entry.url.startsWith("/teaching/2026-2027#tutorial-")).length, 13);
  const page = new JSDOM(readHtml("/search/"));
  const cards = [...page.window.document.querySelectorAll("[data-search-entry]")];
  assert.equal(cards.length, entries.length);
  assert.ok(cards.every((card) => !card.hidden), "directory is present without JavaScript");
  assert.ok(page.window.document.querySelector('label[for="search-page-input"]'));
  assert.ok(page.window.document.querySelector('label[for="search-page-category"]'));
  page.window.close();
});

test("the full directory filters by query and section, handles no matches, and clears", () => {
  const { dom, w, d, requests } = open("/search/");
  const cards = [...d.querySelectorAll("[data-search-entry]")];
  const shown = () => cards.filter((card) => !card.hidden);
  assert.equal(requests.length, 0, "directory search needs no network request");
  input(w, d.getElementById("search-page-category"), "Teaching", "change");
  assert.ok(shown().length > 13 && shown().length < cards.length);
  assert.ok(shown().every((card) => card.dataset.searchCategory === "Teaching"));
  input(w, d.getElementById("search-page-input"), "eigenvalues");
  assert.ok(shown().length > 0 && shown().length < cards.length);
  assert.ok(shown().every((card) => /eigenvalues/i.test(card.dataset.searchText)));
  input(w, d.getElementById("search-page-input"), "zzzz-no-matching-resource-9971");
  assert.equal(shown().length, 0);
  assert.equal(d.getElementById("search-page-empty").hidden, false);
  input(w, d.getElementById("search-page-input"), '<img src=x onerror="alert(1)">');
  assert.equal(d.querySelectorAll("#search-page-results img[onerror]").length, 0);
  d.getElementById("search-page-reset").click();
  assert.equal(d.getElementById("search-page-input").value, "");
  assert.equal(d.getElementById("search-page-category").value, "");
  assert.equal(shown().length, cards.length);
  assert.equal(d.getElementById("search-page-empty").hidden, true);
  assert.equal(requests.length, 0);
  dom.window.close();
});

test("search loads on first use, supports keyboard navigation, restores focus and reuses its index", async () => {
  const { dom, w, d, requests } = open();
  const trigger = d.querySelector("[data-search-open]");
  const dialog = d.getElementById("site-search-dialog");
  const query = d.getElementById("site-search-input");
  assert.equal(trigger.getAttribute("href"), "/search", "search has a no-JavaScript destination");
  assert.equal(requests.length, 0, "ordinary page load does not fetch the index");
  assert.equal(dialog.open, false);
  assert.ok(d.getElementById(dialog.getAttribute("aria-labelledby")));
  trigger.focus();
  trigger.click();
  assert.equal(dialog.open, true);
  assert.equal(d.activeElement, query);
  await until(() => d.querySelectorAll("#site-search-results a").length > 0);
  assert.equal(requests.length, 1);
  input(w, query, "eigenvalues");
  assert.ok(d.querySelectorAll("#site-search-results a").length > 0);
  assert.match(d.getElementById("site-search-status").textContent, /resource.*found/);
  assert.equal(new URL(d.getElementById("site-search-all").href).searchParams.get("q"), "eigenvalues");
  query.dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
  assert.equal(d.activeElement, d.querySelector("#site-search-results a"));
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.equal(dialog.open, false);
  assert.equal(d.activeElement, trigger);
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
  assert.equal(dialog.open, true);
  assert.equal(requests.length, 1, "opening again reuses the public index");
  input(w, query, "zzzz-no-matching-resource-9971");
  assert.equal(d.querySelectorAll("#site-search-results a").length, 0);
  assert.match(d.getElementById("site-search-status").textContent, /No matches/);
  d.querySelector("[data-search-close]").click();
  assert.equal(dialog.open, false);
  assert.equal(d.activeElement, trigger);
  dom.window.close();
});

test("search text remains literal and nonlocal or unsafe result URLs are discarded", async () => {
  const unsafe = '<img src=x onerror="alert(1)">';
  const entry = {
    title: "Needle " + unsafe,
    url: "/about",
    description: "Needle description " + unsafe,
    category: "Academic",
  };
  const entries = [
    entry,
    ...["https://example.invalid/", "//example.invalid/", "/\\example.invalid/", "javascript:alert(1)"].map((url) => ({ ...entry, url })),
    { ...entry, title: { invalid: true } },
    null,
  ];
  const { dom, w, d } = open("/", {
    fetcher: async () => ({ ok: true, json: async () => entries }),
  });
  d.querySelector("[data-search-open]").click();
  await until(() => d.querySelectorAll("#site-search-results a").length > 0);
  input(w, d.getElementById("site-search-input"), "Needle");
  const results = d.getElementById("site-search-results");
  assert.equal(results.querySelectorAll("a").length, 1);
  assert.equal(results.querySelector("a").getAttribute("href"), "/about");
  assert.ok(results.textContent.includes(unsafe));
  assert.equal(results.querySelectorAll("img,script,[onerror]").length, 0);
  dom.window.close();
});

test("a failed search fetch can be retried without trapping the visitor in the dialog", async () => {
  let attempts = 0;
  const { dom, d } = open("/", {
    fetcher: async () => {
      attempts++;
      if (attempts === 1) throw new Error("Simulated offline request");
      return {
        ok: true,
        json: async () => [{ title: "Recovered", url: "/about", description: "Available again", category: "Academic" }],
      };
    },
  });
  const trigger = d.querySelector("[data-search-open]");
  trigger.focus();
  trigger.click();
  await until(() => d.getElementById("site-search-status").textContent.includes("could not load"));
  assert.equal(d.querySelectorAll("#site-search-results a").length, 0);
  assert.equal(new URL(d.getElementById("site-search-all").href).pathname, "/search");
  d.querySelector("[data-search-close]").click();
  assert.equal(d.activeElement, trigger);
  trigger.click();
  await until(() => d.querySelector("#site-search-results strong")?.textContent === "Recovered");
  assert.equal(attempts, 2);
  dom.window.close();
});

test("typing while the index loads uses the latest query and does not reopen a dismissed dialog", async () => {
  let finish;
  const pending = new Promise((resolve) => { finish = resolve; });
  const { dom, w, d } = open("/", { fetcher: () => pending });
  const dialog = d.getElementById("site-search-dialog");
  const trigger = d.querySelector("[data-search-open]");
  trigger.focus();
  trigger.click();
  input(w, d.getElementById("site-search-input"), "latest");
  d.querySelector("[data-search-close]").click();
  finish({
    ok: true,
    json: async () => [
      { title: "Old result", url: "/research", description: "Old", category: "Academic" },
      { title: "Latest result", url: "/about", description: "Latest", category: "Academic" },
    ],
  });
  await until(() => d.querySelector("#site-search-results strong")?.textContent === "Latest result");
  assert.equal(d.querySelectorAll("#site-search-results a").length, 1);
  assert.equal(dialog.open, false);
  assert.equal(d.activeElement, trigger);
  trigger.click();
  assert.equal(d.querySelector("#site-search-results strong").textContent, "Latest result");
  dom.window.close();
});

test("shared directory query URLs restore the requested term and valid category", () => {
  const { dom, w, d } = open("/search/?q=linear+algebra&category=Teaching");
  const query = d.getElementById("search-page-input");
  const section = d.getElementById("search-page-category");
  assert.equal(query.value, "linear algebra");
  assert.equal(section.value, "Teaching");
  const visible = [...d.querySelectorAll("[data-search-entry]")].filter((card) => !card.hidden);
  assert.ok(visible.length > 0);
  assert.ok(visible.every((card) => card.dataset.searchCategory === "Teaching"));
  input(w, query, "quantum");
  input(w, section, "Community", "change");
  d.getElementById("search-page-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  const params = new URLSearchParams(w.location.search);
  assert.equal(params.get("q"), "quantum");
  assert.equal(params.get("category"), "Community");
  d.getElementById("search-page-reset").click();
  assert.equal(w.location.search, "");
  assert.equal(d.activeElement, query);
  dom.window.close();
});
