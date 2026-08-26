import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { portfolio } from "./shared/portfolio.ts";

const portfolioMetadata = {
  name: "portfolio-metadata",
  transformIndexHtml(html) {
    return html
      .replaceAll("__PORTFOLIO_TITLE__", portfolio.metadata.title)
      .replaceAll("__PORTFOLIO_DESCRIPTION__", portfolio.metadata.description);
  },
};

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [portfolioMetadata, react()],
});
