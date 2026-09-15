import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { portfolio } from "./shared/portfolio.ts";

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const publicContact = portfolio.contact.filter(
  (channel) => channel.public && channel.status === "published",
);
const cvPath = portfolio.assets.find((asset) => asset.id === "cv")?.src;

// The no-JS fallback is generated from the same canonical data as the app so a
// visitor without JavaScript still gets the identity, the public channels, and
// the CV instead of an empty root element.
const noscriptMarkup = () => {
  const channels = publicContact.map((channel) => {
    const value = escapeHtml(channel.value);
    const label = escapeHtml(channel.label);
    const target = channel.id === "linkedin" ? ' target="_blank" rel="noreferrer"' : "";
    const body = channel.href
      ? `<a href="${escapeHtml(channel.href)}"${target}>${value}</a>`
      : value;

    return `<li><strong>${label}</strong><br />${body}</li>`;
  });

  if (cvPath) {
    channels.push(
      `<li><strong>CV</strong><br /><a href="${escapeHtml(cvPath)}" download>Download the PDF CV</a></li>`,
    );
  }

  return [
    '<div class="no-js-fallback">',
    `<p class="no-js-fallback__eyebrow">${escapeHtml(portfolio.identity.name)} &middot; ${escapeHtml(portfolio.identity.title)}</p>`,
    `<h1>${escapeHtml(portfolio.identity.heroStatement)}</h1>`,
    `<p>${escapeHtml(portfolio.identity.capabilityLine)}</p>`,
    `<p>${escapeHtml(portfolio.identity.summary)}</p>`,
    `<h2>${escapeHtml(portfolio.contactNarrative.title)}</h2>`,
    `<ul>${channels.join("")}</ul>`,
    '<p class="no-js-fallback__note">This page is an interactive portfolio. Enable JavaScript to see the projects, engineering system map, journey, credentials, and the portfolio assistant.</p>',
    "</div>",
  ].join("");
};

// The prepared social image is deliberately absent here: it is published only
// once an approved canonical domain makes an absolute og:image URL possible.
const replacements = () => ({
  __PORTFOLIO_TITLE__: portfolio.metadata.title,
  __PORTFOLIO_DESCRIPTION__: portfolio.metadata.description,
  __PORTFOLIO_SITE_NAME__: portfolio.metadata.siteName,
});

const portfolioMetadata = {
  name: "portfolio-metadata",
  transformIndexHtml(html) {
    let output = html;

    for (const [token, value] of Object.entries(replacements())) {
      output = output.replaceAll(token, escapeHtml(value));
    }

    return output.replaceAll("__PORTFOLIO_NOSCRIPT__", noscriptMarkup());
  },
};

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [portfolioMetadata, react()],
});
