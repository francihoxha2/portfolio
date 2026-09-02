# Portfolio3D

Franci Hoxha's React portfolio presents selected software work, technical capabilities, professional background, contact paths, a downloadable CV, and an OpenRouter-backed portfolio assistant.

The current application includes the implemented portfolio experience through Phase 6 and the Phase 7 Journey/Credentials work described in the master plan. [PORTFOLIO_3D_MASTER_PLAN.md](./PORTFOLIO_3D_MASTER_PLAN.md) is the authoritative redesign plan.

## Current architecture

- `shared/portfolio.ts` is the canonical public professional-data source.
- `shared/portfolio.types.ts` defines the incremental TypeScript model.
- `shared/validatePortfolio.ts` rejects invalid and known-stale published content.
- React components consume the canonical data while preserving the current presentation.
- `api/_lib/buildPortfolioSystemPrompt.ts` creates the AI system context from an allowlisted subset of the same data.
- `api/chat.js` remains the Vercel serverless OpenRouter endpoint.
- `public/Franci-Hoxha-CV.pdf` remains the current downloadable CV and is intentionally unchanged.

Journey and credential metadata drive their public sections from the shared canonical source. The three real Udemy certificate images are stored under `public/certificates/`, marked `available` in canonical data, and exposed through the accessible certificate viewer.

## Requirements

- Node.js compatible with Vite 8
- npm
- Vercel CLI through `npx` for local AI/serverless development
- An OpenRouter API key only when exercising the AI endpoint

## Setup

```bash
npm install
```

Copy `.env.example` to a local ignored environment file and set the real value only when AI development is needed:

```text
OPENROUTER_API_KEY=your-server-side-key
```

Never prefix this key with `VITE_`; Vite-prefixed variables are exposed to browser code.

## Frontend-only development

```bash
npm run dev
```

This starts Vite with hot module replacement and is sufficient for frontend/content work. Plain Vite does **not** execute `api/chat.js`, so `/api/chat` returns 404 in this mode.

## Local AI and serverless development

Use the Vercel-compatible runtime from the repository root:

```bash
npx vercel dev
```

Make `OPENROUTER_API_KEY` available to that local runtime through an ignored local environment file or the linked Vercel development environment. The key is read only by `api/chat.js` through `process.env`; it must never be added to shared portfolio data or client code.

The repository currently relies on Vercel's Vite detection and `/api/*.js` serverless convention. The canonical production domain and whether a separate GitHub Pages frontend remains part of the final topology still require confirmation. Phase 0 does not change that topology.

## Validation commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

- Linting applies browser globals to client code and Node globals to server/config/test code.
- Type checking covers new shared data, validation, prompt-building, and TypeScript tests without converting the existing JSX application.
- Tests focus on canonical content, stale-claim exclusion, CV path consistency, generated AI context, and chat prompt injection.
- The production build remains the standard Vite output under ignored `dist/`.

## Content rules

Public professional facts belong in `shared/portfolio.ts`; do not duplicate them in components, metadata, or the API prompt. The model contains no secrets or certificate verification URLs. Unresolved availability remains `null`, and deeper project claims stay omitted until verified.

The current CV still contains historical wording that is intentionally not treated as an authority for the site or AI. Replacing it remains a separately authorized task. Raw non-Udemy certificate material remains unpublished; placeholder or fabricated credential art must not be used.
