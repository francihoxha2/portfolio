# Portfolio3D

Franci Hoxha's React portfolio presents selected software work, technical capabilities, professional background, contact paths, a downloadable CV, and an OpenRouter-backed portfolio assistant.

Phases 0 through 11 of the master plan are implemented: the Hero-to-Planify story, the Engineering System Map, Selected Work, Journey and Credentials, the shared AI assistant, the contact/footer close, the performance and accessibility hardening, and the cross-browser/cross-device pass. [PORTFOLIO_3D_MASTER_PLAN.md](./PORTFOLIO_3D_MASTER_PLAN.md) is the authoritative plan and carries the per-phase implementation records.

## Current architecture

- `shared/portfolio.ts` is the canonical public professional-data source.
- `shared/portfolio.types.ts` defines the incremental TypeScript model.
- `shared/validatePortfolio.ts` rejects invalid and known-stale published content.
- React components consume the canonical data while preserving the current presentation.
- `api/_lib/buildPortfolioSystemPrompt.ts` creates the AI system context from an allowlisted subset of the same data.
- `api/chat.ts` remains the Vercel serverless OpenRouter endpoint.
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

This starts Vite with hot module replacement and is sufficient for frontend/content work. Plain Vite does **not** execute `api/chat.ts`, so `/api/chat` returns 404 in this mode.

## Local AI and serverless development

Use the Vercel-compatible runtime from the repository root:

```bash
npx vercel dev
```

Make `OPENROUTER_API_KEY` available to that local runtime through an ignored local environment file or the linked Vercel development environment. The key is read only by `api/chat.ts` through `process.env`; it must never be added to shared portfolio data or client code.

The repository relies on Vercel's Vite detection and the `/api/*` serverless convention. The functions are TypeScript and import their dependencies with explicit `.ts` extensions, which is what the Vercel Node runtime resolves; dropping an extension breaks the deployed function even though local type checking still passes. `tests/apiRuntime.test.js` compiles `api/chat.ts` to guard that.

The canonical production domain still requires confirmation, so no canonical URL, `og:url`, absolute `og:image`, or URL-dependent JSON-LD is published. See the Phase 12 record in the master plan.

## Deployment, rollback, and recovery

Production is the linked Vercel project (`.vercel/project.json`, untracked). Deployment is Vercel's Git integration: a push to `main` builds and promotes automatically.

- **Required environment variable:** `OPENROUTER_API_KEY`, server-only, set in the Vercel project. Nothing else is required. The frontend needs no environment variable, and no `VITE_`-prefixed variable may ever hold the key.
- **Verify a release** by confirming the served asset hashes match a local `npm run build`, then checking `/`, `/Franci-Hoxha-CV.pdf`, a certificate image, and `OPTIONS /api/chat` (204). `GET /api/chat` returns 405. Neither consumes OpenRouter quota.
- **Rollback** is an instant promotion of the previous good deployment from the Vercel dashboard or `npx vercel rollback`; every build is immutable and retained, so no rebuild or revert commit is needed to restore service. Reverting the offending commit on `main` afterwards keeps the repository and production aligned.
- **If the assistant fails**, the portfolio is unaffected by design: `/api/chat` answers with a generic `AI service unavailable` and the UI offers Retry plus a contact path. Removing or rotating the key degrades only the assistant, which is the intended failure mode and needs no redeploy of the site.

## Validation commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run test:dev-lifecycle   # needs `npm run dev` running on port 5173
```

- Linting applies browser globals to client code and Node globals to server/config/test code.
- Type checking covers new shared data, validation, prompt-building, and TypeScript tests without converting the existing JSX application.
- Tests focus on canonical content, stale-claim exclusion, CV path consistency, generated AI context, and chat prompt injection.
- The production build remains the standard Vite output under ignored `dist/`. No source maps are emitted.
- `npm run test:e2e` builds, serves the production output on port 4173, and runs the browser suite in Chrome, Edge, Firefox, and WebKit. Every assistant test mocks `/api/chat`; `vite preview` serves static files only and never executes `api/`, so the suite cannot reach OpenRouter.
- `npm run evidence:phase10` and `npm run evidence:phase11` write acceptance material to the untracked `artifacts/` directory; they are gated out of the default suite.

## Content rules

Public professional facts belong in `shared/portfolio.ts`; do not duplicate them in components, metadata, or the API prompt. The model contains no secrets or certificate verification URLs. Unresolved availability remains `null`, and deeper project claims stay omitted until verified.

The current CV still contains historical wording that is intentionally not treated as an authority for the site or AI. Replacing it remains a separately authorized task. Raw non-Udemy certificate material remains unpublished; placeholder or fabricated credential art must not be used.
