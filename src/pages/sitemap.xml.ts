import { getSiteSearchEntries } from "../data/siteDiscovery";
export const prerender = true;
export async function GET() {
  const entries = await getSiteSearchEntries();
  const paths = [...new Set(entries.map(({ url }) => url.split(/[?#]/)[0]))];
  const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const body = paths.map((path) => {
    const canonicalPath = path === "/" ? "/" : path.replace(/\/$/, "") + "/";
    return "<url><loc>" + escapeXml(new URL(canonicalPath, "https://chengadi.science").href) + "</loc></url>";
  }).join("");
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + body + "</urlset>", {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
