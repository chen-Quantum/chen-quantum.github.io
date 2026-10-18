import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://chengadi.science",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [mdx()],
});