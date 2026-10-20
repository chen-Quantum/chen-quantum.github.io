import { getSiteSearchEntries } from "../data/siteDiscovery";

export const prerender = true;
export async function GET() {
  return new Response(JSON.stringify(await getSiteSearchEntries()), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
