# Portfolio3D Master Plan

**Project:** Franci Hoxha Portfolio3D
**Document status:** Planning source of truth - implementation is not authorized by this document
**Creative direction amendment:** On 2026-08-27, the creative interaction direction was strengthened after live Phase 3 review. This amendment raises the interaction and motion-quality target without changing the approved architecture, evidence, accessibility, progressive-enhancement, or performance guardrails.
**Audit date:** 2026-08-26
**Repository branch audited:** `main`
**Target outcome:** A premium, highly interactive, Awwwards-level creative software-engineering experience that feels alive and spatial while remaining fast, accessible, credible, evidence-led, and easy for recruiters to understand.

> Scope lock: this planning pass does not redesign components, install packages, change source code, replace the CV, delete assets, commit, or deploy. The only repository deliverable from the planning task is this document.

## 1. Executive Vision

The redesign will express **"Franci's Developer Universe"** as a living software system rather than a literal space scene. Entering the portfolio should feel like entering an active digital environment built from a workstation, product interfaces, data paths, API nodes, restrained lighting, and meaningful system relationships. Scroll, pointer interaction, depth, system motion, project storytelling, typography, WebGL, DOM, SVG, and microinteractions should work together as one designed experience. Every visual device must support a professional message: Franci can understand a problem, build across the stack, ship a product, and explain the result.

The connected narrative is:

**Identity → System → Product → Capability → Journey → AI → Contact**

The experience must satisfy two reading depths at the same time:

- In the first 5-10 seconds, a recruiter can identify Franci Hoxha, the role **Full-Stack Software Developer**, the breadth **Web • Mobile • Backend • AI**, Planify as the flagship project, the main work CTA, the AI assistant, CV access, and contact access.
- On deeper exploration, an engineering or design reviewer can find project responsibilities, system capabilities, a credible stack, the progression from business and IT operations into software/product development, certificates, thoughtful 3D architecture, and evidence of delivery discipline.

The creative-quality target is **Awwwards / top creative-developer portfolio quality, with stronger recruiter usability, engineering credibility, accessibility, and evidence discipline than spectacle-first portfolios**. Premium does **not** mean static, minimally animated, or merely polished in screenshots. The experience may be visually ambitious and highly interactive as long as meaning stays in the DOM, motion has a purpose, reduced-motion/static alternatives remain first-class, performance budgets remain enforced, and recruiter comprehension stays immediate.

It must not become a game, a cyberpunk dashboard, a literal space/planet scene, an animation demo, a clone of another portfolio, or an interface whose professional content depends on WebGL.

### Non-negotiable product principles

1. **Evidence before spectacle.** DOM content, project proof, and honest claims lead; 3D reinforces them.
2. **Planify leads the work story.** It receives a dedicated flagship presentation rather than another equal card.
3. **One connected journey.** Visual continuity links the hero to Planify and the rest of the page without forcing every section into WebGL.
4. **HTML is the source of meaning.** Recruiter-critical text, links, controls, and headings remain semantic, indexable HTML.
5. **Progressive enhancement.** Identity, navigation, work, CV, AI entry points, and contact remain useful when 3D is loading, disabled, reduced, or unavailable.
6. **Content integrity.** No employer, client, user, scale, integration, certification, date, availability claim, or project capability is published without support.
7. **Performance is a feature.** The first impression cannot wait for a scene, model, font, or AI response.
8. **Interaction communicates system behavior.** Motion explains relationships, hierarchy, data flow, depth, navigation, or state instead of existing as decoration.

### Global interaction design principle

Interaction must make the portfolio's software-system concept easier to perceive. Data can move between interface, API, and data nodes; layers can respond according to spatial depth; project visuals can transform between scene and DOM; system paths can activate as capabilities are explored; scroll transitions can advance the professional story; and sections can visibly evolve or settle as the visitor moves through the page.

Avoid arbitrary spinning, floating, bouncing, direct cursor chasing, or continuous movement with no semantic role. A motion effect is admitted only when it clarifies a relationship, reinforces hierarchy, signals state, directs attention, or strengthens the connected narrative.

This creative amendment does not weaken evidence-before-spectacle, semantic/indexable DOM, the one-WebGL-canvas architecture, static and no-WebGL fallbacks, reduced-motion behavior, context-loss recovery, adaptive DPR/quality, offscreen/hidden rendering pause, native browser scroll, the prohibition on scroll snapping, keyboard/mobile accessibility, performance and bundle budgets, claim verification, AI security boundaries, Planify payment/Polar removal, CV/content truthfulness, or immediate recruiter comprehension. The visually extraordinary result must be produced inside those constraints.

### Recommended high-level technical direction

- Retain React 19 and Vite.
- Add `three`, React Three Fiber v9 (the React 19-compatible major), and selected Drei helpers.
- Use GSAP plus ScrollTrigger for the limited hero-to-Planify scroll choreography and selected DOM reveals.
- Keep native browser scrolling. Do **not** add Lenis initially.
- Do **not** add Motion initially; GSAP and CSS cover the planned motion system.
- Use one lazy-loaded WebGL canvas for the hero-to-Planify story.
- Build the Engineering System Map with semantic DOM plus SVG, not a second WebGL canvas.
- Consolidate the full AI section and floating widget into one assistant experience with multiple entry points and one shared session.
- Introduce a shared public portfolio data module consumed by both the visible site and the server-side AI prompt builder.
- Use an incremental TypeScript migration for new data, 3D, and API modules; do not rewrite untouched code solely to change extensions.

## 2. Current-State Repository Audit

### 2.1 Repository inventory

The production-relevant repository is small and single-page:

```text
Portfolio3D/
|-- api/
|   `-- chat.js
|-- public/
|   |-- Franci-Hoxha-CV.pdf
|   |-- favicon-fh.svg
|   |-- icons.svg
|   `-- planify-preview.png
|-- src/
|   |-- assets/
|   |   |-- hero.png
|   |   |-- react.svg
|   |   `-- vite.svg
|   |-- components/
|   |   |-- AiChat.jsx
|   |   |-- ChatWidget.jsx
|   |   |-- Contact.jsx
|   |   |-- Education.jsx
|   |   |-- Footer.jsx
|   |   |-- Hero.jsx
|   |   |-- Navbar.jsx
|   |   |-- ProjectCard.jsx
|   |   |-- Projects.jsx
|   |   `-- Skills.jsx
|   |-- App.jsx
|   |-- index.css
|   `-- main.jsx
|-- .env.example
|-- eslint.config.js
|-- index.html
|-- package.json
|-- package-lock.json
`-- vite.config.js
```

The workspace also contains ignored/local material (`node_modules`, `dist`, `.vercel`, `.env`, `.env.local`) and a pre-existing untracked `.claude/` directory. Those are not part of the product architecture and were not modified by this planning task.

### 2.2 Runtime and build architecture

| Area | Current implementation | Finding |
|---|---|---|
| UI runtime | React `^19.2.4`; installed `19.2.5` | Current and suitable for the redesign. |
| DOM renderer | React DOM `^19.2.4`; installed `19.2.5` | `createRoot` under `StrictMode`. |
| Build tool | Vite `^8.0.4`; installed `8.0.8` | `base: "/"`, React plugin, no custom chunking or dev API proxy. |
| Source language | JavaScript/JSX | No TypeScript compiler or application types. |
| Routing | None | One SPA page with anchor navigation; no router is needed for the proposed main experience. |
| State | Local React state only | Adequate except duplicated AI conversation state. |
| Styling | One global `src/index.css` file, 2,039 lines | Contains tokens, all components, breakpoints, chat, and reduced motion. It is workable but too coupled for the redesign. |
| Content | Constants in `src/App.jsx` | Profile, skills, projects, education, experience, courses, languages, and navigation are embedded in the root component file. |
| AI rendering | `react-markdown` + `remark-gfm` | Shared dependency, independently used by both chat clients. Raw HTML is not enabled. |
| Tests | None | No unit, component, API, end-to-end, or visual regression tests and no `test` script. |
| 3D | None | No Three.js, canvas, model loader, postprocessing, or scroll-scene system exists today. |

### 2.3 Current component/data flow

`src/App.jsx` owns almost all public content and passes subsets to presentation components. `Navbar` receives navigation items but hard-codes the CV path independently. `Footer` receives the same section list. `Hero` receives the profile but also owns a hard-coded `TECH` list. Projects are partly data-driven, while section headings and claims remain embedded in components.

```text
App.jsx profile/projects/skills/journey/navigation
  |-- Navbar.jsx (sections; CV path duplicated)
  |-- Hero.jsx (profile; core stack duplicated locally)
  |-- Projects.jsx -> ProjectCard.jsx
  |-- Skills.jsx
  |-- Education.jsx
  |-- AiChat.jsx -----------\
  |                          > POST /api/chat
  |-- Contact.jsx           /
  |-- Footer.jsx
  `-- ChatWidget.jsx -------/

api/chat.js
  `-- a second, manually written copy of profile/project/journey content
```

This duplication is the repository's largest maintainability risk. A profile correction currently requires coordinated edits in several places and can still leave the AI assistant, SEO metadata, hero badges, or CV link inconsistent.

### 2.4 Current page and navigation

Current section order:

1. `#about` - hero/profile
2. `#projects` - Planify plus two secondary projects
3. `#skills` - four conventional skill-card groups
4. `#education` - education, one experience entry, generic courses
5. `#ai-chat` - full embedded assistant
6. `#contact` - contact card
7. Footer
8. Independently mounted floating chat widget

Current desktop navigation is About, Projects, Skills, Education, Ask AI, Contact, plus Download CV. The brand links to `#about`. Mobile collapses the link panel behind a hamburger button.

### 2.5 Current visual system

The current site is already a coherent dark portfolio, not an untouched Vite template. It uses:

- Deep navy/graphite background (`#05070f`) with violet (`#7c7aff`) and cyan (`#4fd1e0`) accents.
- Space Grotesk for display, Inter for body, JetBrains Mono for a small number of labels, loaded from Google Fonts.
- Translucent panels, restrained borders, grid texture, soft glows, sticky blurred navigation, responsive grids, and conventional card hover lifts.
- A consistent 1,140 px content width and CSS custom properties scoped to `.app-shell`.
- `prefers-reduced-motion` handling that effectively removes CSS transitions/animations and restores automatic CSS scrolling.

The design is functional and reasonably polished, but the equal card language makes most sections feel interchangeable. The hero's profile-stat card, skills cards, journey cards, and project cards do not create the requested signature experience or connected storytelling.

### 2.6 Current responsive behavior

The source and local renders show intentional responsive behavior:

- Above 980 px, hero, Planify, and contact use two-column layouts.
- At 980 px and below, hero, Planify, contact, skills, and journey stack to one column.
- At 860 px and below, the embedded AI section becomes one column.
- At 780 px and below, navigation collapses, the secondary project grid becomes one column, and Planify highlights become one column.
- At 600 px and below, the floating chat panel becomes a viewport-inset fixed panel.
- At 560 px and below, page gutters shrink, hero CTAs become full width, and several panels reduce padding.
- A 1,440 px local render is readable and balanced. A 500 px render shows a usable hamburger and full-width hero actions.

Current weaknesses:

- The floating Ask AI button can overlap the lowest visible hero action on short mobile viewports.
- Mobile adaptation is primarily layout stacking; it has no capability/quality system because there is no 3D yet.
- The mobile menu has no Escape/outside-click behavior, no focus containment/return logic, and no `aria-controls` relationship.
- There are no dedicated compact/landscape rules, content-length stress tests, or automated no-overflow checks.

### 2.7 Current projects and profile data

The current app contains:

- Planify.al, marked featured and presented with the one actual screenshot.
- BarberSpot.al, presented as a live external link with a generated placeholder rather than a screenshot.
- Online Charging Station Management System, presented with a placeholder and a `#contact` demo path.
- Four skill groups, two education entries, one IT-support experience entry, two generic courses, English, and Italian.
- Contact details for Tirana, email, phone, and LinkedIn.

`ProjectCard.jsx` receives `highlights` from `Projects.jsx`, but does not declare or render that prop. BarberSpot's stored highlights are therefore invisible. `profile.summary` is also defined but unused.

### 2.8 Current CV integration

- Asset: `public/Franci-Hoxha-CV.pdf`
- Size: 93,992 bytes
- Length: two pages; extracted text is approximately 317 words.
- Linked from the hero through `profile.cvPath` and from the navigation through a separate hard-coded path.
- Vite copies it correctly into the production output.

The CV is a useful existing downloadable asset but contains stale and inconsistent content detailed in Sections 5 and 31. In particular, the ongoing-Master's/`2024 - Present` wording is superseded by the confirmed July 2026 completion, and its `Polar for payments` wording must not propagate publicly. The CV must remain unchanged in this task and must not act as the automatic authority for portfolio data, AI context, SEO, structured data, or diagrams; updating/replacing it is a separate future task.

### 2.9 Current AI implementation

There are two separate React clients:

- `AiChat.jsx`: full portfolio section with four suggested questions and an initially empty conversation.
- `ChatWidget.jsx`: floating launcher/panel with a separate initial greeting and separate conversation state.

Both duplicate fetch, loading, error, keyboard, scroll, and Markdown-rendering logic. A conversation in one surface does not appear in the other.

`api/chat.js` is a Vercel-style serverless function that:

- Uses server-side `OPENROUTER_API_KEY`.
- Calls OpenRouter chat completions with `openai/gpt-oss-20b:free`.
- Sets temperature `0.4`, `max_tokens: 300`, and a portfolio-specific system prompt.
- Requests same-language answers and explicitly calls out natural Albanian.
- Allows four hard-coded origins, handles OPTIONS, accepts POST, filters messages to role/content strings, and returns visitor-safe error bodies.
- Logs bounded upstream error details server-side.

Important deployment behavior: ordinary `vite dev` does not run `api/chat.js`; local `POST /api/chat` returns 404. AI development currently requires a Vercel-compatible local runtime or an explicit dev proxy. This assumption is not documented in the template README.

### 2.10 Current deployment assumptions

- The repository is linked locally to a Vercel project through ignored `.vercel` metadata.
- There is no `vercel.json`; the implementation relies on Vercel's Vite detection and `/api/*.js` serverless convention.
- `OPENROUTER_API_KEY` exists only as a server-side environment key; it is not prefixed `VITE_` and is not imported into client code. This is correct.
- `.env` and `.env.local` are ignored. Only key names were inspected; secret values were not exposed.
- The CORS list includes a GitHub Pages origin, but the client uses relative `/api/chat` and Vite uses `base: "/"`. A static GitHub Pages deployment would not provide that serverless route without a separately configured backend URL. The canonical production host and intended deployment topology are **NEEDS USER CONFIRMATION**.
- The repository remote points to the GitHub portfolio repository; there is no GitHub profile link in the visible portfolio data.
- The README is still the default React/Vite template and does not document content ownership, local AI development, environment setup, validation, or deployment.

### 2.11 Baseline validation results

Run on 2026-08-26 against the audited working tree:

| Check | Result | Notes |
|---|---|---|
| `npm run build` | Pass | Built with Vite 8.0.8 to an isolated temporary output directory. |
| Client JS | 374.34 kB / 112.79 kB gzip | Before adding any 3D library. |
| CSS | 28.77 kB / 6.13 kB gzip | All styles are currently in one file. |
| `npm run lint` | Fail | One existing error: `process` is undefined in `api/chat.js`; ESLint applies browser globals to the serverless file. |
| Tests | Not available | No test script or test files. |
| Vite local AI | Fail by design | `/api/chat` returns 404 under plain Vite dev. |

This baseline must be recorded again immediately before implementation because dependency and content state can change.

## 3. Existing Functionality That Must Be Preserved

The redesign may change presentation and internal structure, but it must preserve or deliberately improve:

1. A fast, responsive, dark single-page portfolio.
2. Sticky desktop navigation and an accessible mobile menu.
3. Clear identity, professional title, location when confirmed, and recruiter-oriented CTAs.
4. Planify as the featured project, its current screenshot, project copy after validation, and its confirmed live link.
5. BarberSpot.al and Online Charging Station Management System as selected work.
6. Technical skills/capabilities, language information, education, experience, and course history after data reconciliation.
7. Direct email and LinkedIn access; phone/location only if continued public display is confirmed.
8. Downloadable CV in both navigation and a logical content location.
9. The working Vercel `/api/chat` pattern, OpenRouter integration, server-side API key, portfolio-specific scope, Markdown answer rendering, same-language responses, and graceful error copy.
10. Both current AI discovery paths in intent: a prominent full-page AI feature and a floating/hero-accessible chat entry. They should become one shared experience, not two independent sessions.
11. Reduced-motion support, semantic images, and no heavy loading splash.
12. Anchor navigation and a clear brand route back to the top.

## 4. Problems With the Current Portfolio

### 4.1 Positioning and content

- The hero, title tag, meta description, AI prompt, and contact copy lead with or repeatedly emphasize "Junior," contrary to the approved main positioning.
- "SaaS & booking platforms" is too narrow for the intended Web/Mobile/Backend/AI identity.
- The hero focuses on availability, a definitely stale current-student MSc status, and generic stat tiles instead of a distinctive engineering/product story.
- Time-sensitive availability, remote-work, internship, and response-time claims are not centrally managed or confirmed.
- New 2026 certificates do not appear in the UI, CV, or AI context.
- Several claims sound stronger than the available evidence: "used by real businesses," "2 live web platforms shipped," "deployment-ready," "scalable," and some Planify/BarberSpot integrations.

### 4.2 Information architecture and visual hierarchy

- Most sections are isolated card grids with similar visual weight.
- Planify is featured, but still reads as a large card rather than a flagship product case study.
- BarberSpot and the charging-station project have no screenshots.
- The skills section is a logo/chip inventory rather than evidence of how capabilities are used.
- Education and experience are parallel card columns, not the intended progression from business to IT systems to software/product development.
- The full-page AI section and floating widget compete with each other and duplicate behavior.

### 4.3 Engineering architecture

- Public profile data and AI context are manually duplicated.
- Navigation and CV paths are partially duplicated.
- Chat logic and state are duplicated.
- A 2,039-line global stylesheet couples every section and breakpoint.
- There is no test suite, no type checking, no content validation, and no documented local serverless workflow.
- ESLint does not distinguish browser code from Node/serverless code.

### 4.4 Accessibility and resilience

- No skip link.
- Focus-visible styles are not systematic across links, menu, chips, and chat controls.
- Chat has no Escape-to-close, focus return, robust dialog labelling, or live status region.
- Textareas depend on placeholders rather than visible/associated labels.
- Menu and dialog keyboard behavior is incomplete.
- JS smooth scrolling is requested by chat message effects even under reduced motion.
- No WebGL fallback architecture exists yet.
- With JavaScript disabled, Vite's empty root provides no useful professional content or CV/contact fallback.

### 4.5 SEO and discoverability

- Title and meta description are stale/narrow.
- No Open Graph/Twitter metadata or social preview image.
- No canonical URL, structured data, or documented production hostname.
- No explicit social profile strategy beyond LinkedIn.
- Google Fonts add external connection cost; font loading behavior is not controlled locally.

### 4.6 AI endpoint and cost controls

- No maximum request bytes, message count, per-message length, or total conversation length.
- Roles are not allowlisted, so a client can forward arbitrary role names.
- No rate limit, abuse control, or upstream timeout.
- The free model identifier is hard-coded and can create quality, latency, and availability risk.
- The system prompt includes stale content and is manually maintained.
- CORS/deployment intent is ambiguous.

## 5. Professional Positioning and Content Quality Rules

### 5.1 Approved main positioning

- Name: **FRANCI HOXHA**
- Title: **Full-Stack Software Developer**
- Main statement: **Building modern software experiences, from idea to production.**
- Capability line: **Web • Mobile • Backend • AI**
- Primary CTA: **Explore My Work**
- Secondary CTA: **Ask My AI**
- Approved work label for Planify: **Flagship Software Project** because it communicates significance without making unverified business/ownership claims.

Do not lead with "Junior Full-Stack Developer." Junior/graduate context may appear in a truthful availability or journey statement only after current status is confirmed. Do not substitute the narrower rejected SaaS-specific hero line.

### 5.2 Tone rules

- Short, direct, evidence-led sentences.
- Prefer "Built X using Y to support Z" over "passionate about innovation."
- Use natural first person in visible portfolio narrative when Franci presents his own work, projects, capabilities, experience, or approach. Do not expose internal `confirmed`, `verified`, `approved`, claim-ledger, or admission-rule language in visitor-facing prose. Third person remains appropriate for metadata, structured data, internal AI grounding, and assistant-owned interface copy where the assistant is the speaker.
- Avoid "world-class," "expert," "revolutionary," "scalable" without proof, "real-time" without technical confirmation, and unquantified claims about businesses/users.
- Do not overstate product ownership, seniority, scale, revenue, professional software years, or client relationships.

### 5.3 Claim status definitions

Every professional claim in the canonical data model must have an editorial status during Phase 0:

- **CONFIRMED** - explicitly stated in this brief or directly observable as a repository/build fact.
- **STALE** - explicitly identified as outdated or conflicts with the current approved direction.
- **NEEDS USER CONFIRMATION** - plausible and present in one or more current sources, but not safe to republish as current fact.
- **REMOVE** - unsupported, redundant, misleading, or not useful to the audience.
- **REWRITE** - underlying idea may remain, but current wording is too narrow, generic, or risky.

### 5.4 Initial content classification

| Claim/content | Status | Planned treatment |
|---|---|---|
| Name Franci Hoxha | **CONFIRMED** | Use consistently. |
| Main title and exact hero statement/capability line | **CONFIRMED** | Use the approved copy above. |
| Planify, BarberSpot.al, charging-station project inventory | **CONFIRMED** | Preserve all three. Validate details. |
| Three 2026 Udemy certificates, metadata, and externally supplied images | **CONFIRMED** | Add under Credentials; repository placement of the approved images occurs in Phase 7. |
| Master of Science in Informatics Engineering | **CONFIRMED** | Completed July 2026. Present it as a completed journey milestone using this exact title. |
| "Currently pursuing an MSc/Master's" / `2024 - Present` | **STALE** | Remove from visible copy, shared data, SEO, AI context, and any later structured data. |
| Junior-led hero/title/SEO/AI positioning | **STALE / REWRITE** | Main brand is Full-Stack Software Developer; career level must not define the main identity. |
| "SaaS & booking" as main identity | **STALE / REWRITE** | Move booking/product evidence into work sections. |
| Approved hero statement and `Web • Mobile • Backend • AI` capability line | **CONFIRMED** | Use exactly and consistently. |
| `Flagship Software Project` for Planify | **CONFIRMED** | Use instead of `Flagship SaaS Project`. |
| Public Planify online customer payments/prepayments or `Polar for payments` | **STALE / REMOVE** | Do not publish in portfolio copy, AI context, SEO, shared data, diagrams, or highlights. Do not speculate about a replacement provider. |
| "2 live web platforms shipped" | **NEEDS USER CONFIRMATION** | Remove from hero until links/status/role are confirmed. |
| "Used by real businesses" | **NEEDS USER CONFIRMATION** | Do not publish without evidence/approval. |
| Availability for roles, internships, remote work | **NEEDS USER CONFIRMATION** | One centralized optional field; hide when unset. |
| Current "Usually replies within a day" copy | **STALE / REMOVE** | Replace with a neutral invitation; any future response-time claim would require fresh confirmation at publication time. |
| Tirana, email, phone, LinkedIn | **NEEDS USER CONFIRMATION** | Repository-consistent, but verify freshness and desired public visibility. |
| Master's degree in Business Administration | **CONFIRMED** | Present the completed degree using this exact title; institution wording, location, and dates remain unpublished pending separate confirmation. |
| IT troubleshooting/systems background across Windows, macOS, Linux, hardware/software support, backup/recovery, and end-user support | **CONFIRMED** | Use as evidence of systems thinking; exact employer/organization and final public dates remain phase-specific verification items. |
| JavaScript, TypeScript, React, Next.js, HTML, CSS, responsive UI, integration, and PWA-related work | **CONFIRMED** | Present with evidence-led, non-expert wording. |
| Node.js-style APIs, REST, Python, FastAPI, auth, authorization, and application/business logic | **CONFIRMED** | Prioritize project evidence and avoid expert-level claims. |
| MongoDB, database-backed applications, MySQL, and SQL Server | **CONFIRMED** | Use according to demonstrated relevance and prominence. |
| Git, testing, debugging, deployment, production hardening, application integration, and troubleshooting | **CONFIRMED** | Explain actual usage instead of displaying a generic tool inventory. |
| Mobile application development | **CONFIRMED** | Keep Mobile as a top-level capability; exact mobile technologies remain targeted verification before technology-specific copy. |
| AI integration and AI-assisted development | **CONFIRMED** | Ground in the portfolio assistant, software integration, coding workflows, and supplied credentials; do not imply ML/model-training/data-science expertise. |
| Java | **CONFIRMED** | Present as a normal primary language alongside JavaScript, TypeScript, and Python. Do not imply Java employment, production projects, years of experience, or expert-level mastery without evidence. |
| Generic "Software Professional Course" / IT course | **NEEDS USER CONFIRMATION** | Verify provider, completion, and exact title or de-emphasize. |

## 6. Final Information Architecture

### 6.1 Page order

1. **Hero / Developer Universe** (`#top`)
2. **Planify - Flagship Software Project** (`#work`)
3. **Engineering System Map** (`#stack`)
4. **Selected Work** (`#selected-work`)
5. **Experience / Journey** (`#journey`)
6. **Credentials** (`#credentials`)
7. **AI Portfolio Assistant** (`#ai`)
8. **Contact** (`#contact`)
9. **Footer**

This order moves from the flagship product into the engineering capabilities used to build software, then additional selected work, professional progression, selected credentials, the AI differentiator, and contact.

### 6.2 Navigation

Recommended desktop items:

- Work
- Stack
- Journey
- Credentials
- Ask AI
- Contact
- Download CV (separate restrained CTA)

Rules:

- Logo/name links to `#top`.
- Work lands at Planify, not a generic project grid.
- Ask AI opens the shared assistant; it may also update the URL hash/focus the `#ai` section only when appropriate.
- Active-section indication is optional; if implemented, use `IntersectionObserver` and `aria-current="location"` without constant visual noise.
- Mobile menu is a real button with `aria-expanded`, `aria-controls`, Escape/outside-click close, focus return, and touch targets at least 44 x 44 CSS px.
- Keep Download CV visible but visually secondary to Explore My Work.

## 7. Detailed Hero Specification

### 7.1 Desktop composition

Use a full-height-but-not-blocking opening composition (`min-height` approximately `min(900px, 100svh)` after the header). The DOM copy occupies the left 42-48%; the scene occupies the right/background 52-58%. Copy remains above the canvas in stacking order where overlap occurs.

Content order:

1. Small identity/role eyebrow: `FRANCI HOXHA` and/or `Full-Stack Software Developer`.
2. One `h1`: **Building modern software experiences, from idea to production.**
3. Capability line: **Web • Mobile • Backend • AI** using accessible text, not four WebGL labels.
4. One short evidence-based supporting paragraph, written only after content reconciliation.
5. Primary `Explore My Work` anchor to `#work`.
6. Secondary `Ask My AI` button opening the shared assistant.
7. Restrained text link for CV if it is not already sufficiently visible in navigation.

Do not retain the current profile-stat card. Do not present Franci as a current Master's student, and do not display availability, shipped-platform counts, or SaaS labels in the hero unless separately confirmed and genuinely useful. The completed July 2026 Master's belongs in the Journey rather than competing with the hero's software-developer identity.

### 7.2 Interaction

- After the DOM content is available, the full-quality scene performs an intentional entrance/build-up sequence that establishes the workstation, connected modules, and Planify monitor without delaying or obscuring the copy.
- The full-quality desktop scene continuously shows restrained operational activity: moving data nodes, visible pulses through selected connections, interface/system micro-animation, and subtle workstation motion.
- Pointer input produces perceptible layered parallax and a smoothly damped camera/scene target response. The monitor, near panels, far modules, nodes, and data layers respond independently according to depth rather than moving as one flat group.
- Use a tunable interaction envelope rather than a fixed conservative limit. A recommended full-quality starting range is approximately 2-4 degrees of camera/scene rotational response where visually appropriate and roughly 6-24 CSS-equivalent pixels of near/far layer translation according to depth. These are tuning ranges, not mandatory final values; live visual QA determines the final amplitude.
- Apply slow damping, non-linear weighting, bounded targets, and calm return behavior. Nothing directly chases the pointer, snaps between states, or gives the visitor orbit/camera controls.
- Localized hover/pointer reactions may activate nearby nodes, paths, or interface states when they clarify a system relationship and have an equivalent stable/focus/touch treatment where meaning is involved.
- Initial scroll away from the Hero introduces a subtle recession/depth state that prepares the later Hero-to-Planify handoff without implementing the full transition before Phase 4.
- The reduced tier is significantly calmer. Coarse pointer/touch disables cursor parallax, and reduced-motion/static tiers remove continuous motion while preserving the same composition and professional meaning.
- The HTML hero appears immediately. The scene placeholder is a composed gradient/silhouette, not a loading percentage.

### 7.3 Mobile composition

- Copy and CTAs come first.
- A reduced visual appears below/behind the copy without forcing the user to scroll past a tall canvas.
- Use a simplified scene or a pre-rendered static fallback depending on capability; never merely scale down the desktop scene.
- Primary and secondary actions remain distinct; avoid three equal full-width buttons.
- The AI launcher must not overlap CTAs or browser safe areas.

### 7.4 Hero acceptance criteria

- Identity/title, main statement, capability line, Explore My Work, Ask My AI, and CV access are understandable before 3D loads.
- No recruiter-critical text is inside canvas.
- Keyboard focus order follows the visual order.
- With reduced motion, copy is immediately present and the scene uses an intentional stable composition with no continuous motion.
- With WebGL blocked, the layout remains visually intentional and no empty right-hand hole appears.
- At 320, 375, 390, 768, 1,024, 1,440, and ultrawide widths there is no horizontal overflow or clipped CTA.
- In full-quality desktop mode, live review confirms that the Hero clearly feels alive, spatial, and connected without compromising copy legibility or CTA use.
- Motion quality is judged in a real browser for perceptibility, smoothness, timing, hierarchy, responsiveness, semantic purpose, and distraction; screenshots alone do not satisfy the interactive acceptance gate.

## 8. Detailed 3D Scene Concept

### 8.1 Scene narrative: a software system workspace

The scene is an abstract premium developer workstation assembled from lightweight procedural geometry:

- A dark-metal desk/workplane or floating base establishes physical weight.
- A primary monitor/device contains the real Planify screenshot as a texture, establishing the direct transition to the flagship project.
- Four restrained system layers represent Web, Mobile, Backend, and AI through shape, connection, and DOM-adjacent labels rather than floating technology logos.
- Thin luminous paths connect interface panels to API/data nodes and a compact database core.
- A small AI node is visually distinct but not a robot, brain, or novelty mascot.
- Sparse instanced points/segments suggest data flow and depth.
- A few geometric modules represent services/components; their arrangement should read like a system diagram viewed as an object.

The visual message is: an interface is one part of a connected product system.

### 8.2 Operational behavior

- The scene behaves like a functioning system rather than a still life: selected data nodes travel through bounded paths, connection pulses communicate flow, and interface modules change state with restrained sequencing.
- Depth is structural. Near, middle, and far layers use distinct response weights so pointer and scroll input reveal spatial relationships rather than translating the whole scene uniformly.
- Idle motion is meaningful and perceptible in the full tier: it can suggest service activity, interface refresh, or data transfer, but must not become random drift.
- Motion priority follows the story: identity/workstation first, Planify monitor second, supporting system activity third. Background motion must yield visually when the visitor reads or interacts with controls.
- Prefer existing R3F/Three primitives, instancing, material state, and `useFrame` before adding another runtime dependency. No postprocessing is required; any later exception needs measured visual benefit and must stay inside the approved budgets.
- Full, reduced, and static modes share the same conceptual composition. Reduced mode lowers frequency, amplitude, node count, and update cost; static mode preserves a deliberate visual state without continuous animation.

### 8.3 Material and lighting language

- Base materials: rough dark metal, charcoal polymer, smoked glass used sparingly, low-intensity emissive edges.
- Avoid mirror-like chrome and high-transmission glass across large surfaces.
- One soft key light, one restrained fill/rim source, ambient/environment contribution, and at most one shadow-casting light.
- Prefer procedural lightformers/simple environment lighting over a large HDR file.
- Shadow maps: one, maximum 1,024 px desktop and 512 px reduced/mobile.
- Bloom is not part of the initial implementation. A single subtle bloom pass may be tested later on high-quality desktop only and retained only if measured cost is acceptable.

### 8.4 Geometry and rendering

- Create the workstation and modules with boxes, rounded boxes, planes, lines, and instancing before commissioning a GLB.
- Keep repeated nodes/particles instanced or batched.
- Target fewer than 100 draw calls desktop and 50 mobile/reduced mode.
- Initial triangle budget: at most approximately 150k desktop and 50k reduced/mobile; procedural target should be well below this.
- Initial particle/data-node budget: 80-150 desktop, 30-60 mobile, with no transparent overdraw cloud.
- Reuse geometries/materials and explicitly manage textures, render targets, loaders, and disposal.

### 8.5 Canvas lifecycle

Use one `DeveloperUniverseCanvas` spanning the hero and Planify transition zone:

- Lazy-load the canvas chunk after critical DOM content is committed; optionally schedule with `requestIdleCallback` plus a short maximum delay.
- Keep it sticky/absolute only through the hero-to-Planify story, not fixed behind the entire page.
- Pause or switch to demand rendering when offscreen, the document is hidden, reduced motion/static mode is active, or no visible full-tier operational state requires continuous frames.
- Use `IntersectionObserver` and `visibilitychange` to control animation work.
- Handle `webglcontextlost` and scene-load errors by replacing the canvas with a static composition.
- Do not mount a second canvas for skills, project cards, certificates, or the AI panel.

### 8.6 Choice comparison

| Choice | Benefits | Risks | Decision |
|---|---|---|---|
| One hero-to-Planify R3F canvas | Shared camera/story, one renderer/context, reusable assets | More coordination between DOM and scene | **Recommended** |
| Canvas fixed across every section | Strong continuity | High idle cost, complex z-index/focus, harder fallbacks | Reject for v1 |
| Separate canvas per section | Local component isolation | Multiple contexts, duplicated resources, inconsistent performance | Reject |
| Large custom Blender scene | Rich bespoke detail | Asset cost, iteration time, mobile burden | Defer; use only if procedural prototype is visually insufficient |

## 9. Scroll Storytelling

### 9.1 Hero to Planify

The portfolio's primary cinematic transition communicates: **"This developer universe produces real software - here is the product."**

1. The Developer Universe is visibly active in the Hero.
2. As scroll begins, secondary system modules spread, recede, dim, or reorganize in a bounded composition.
3. Data paths visually converge toward the Planify monitor.
4. The camera performs a short, controlled dolly toward the Planify interface.
5. The monitor grows and changes perspective toward the incoming DOM browser/device frame.
6. WebGL and DOM synchronize briefly so the same product visual appears to move from the system scene into the readable case study.
7. The crisp DOM Planify presentation assumes control without a visible discontinuity or dependency on the canvas.
8. The WebGL scene is then reduced, demand-rendered, paused, or unmounted as appropriate to the chosen lifecycle.

The transition remains progress-driven, reversible, native-scroll-based, and no longer than roughly one viewport of scroll. Use GSAP plus ScrollTrigger only where coordinated WebGL/DOM synchronization genuinely requires it. Do not introduce long pinning, scroll hijacking, nested page scrolling, or a cinematic corridor. Reduced-motion mode bypasses the choreography and transitions directly between stable Hero and Planify states.

### 9.2 Later sections

- Selected Work: restrained scroll entrances, image masks/reveals, fine-pointer depth/tilt, and content-state transitions with focus/touch equivalents.
- Engineering Stack: a signature DOM/SVG system composition in which paths assemble, related nodes activate together, and evidence changes the visible system state.
- Journey: a progressive timeline/system path, restrained staggered evidence, and section-state transitions that connect business understanding to IT systems, software engineering, and product development.
- Credentials: short reveal; certificate viewer opens without page transition.
- AI: the established AI/system node motif and data-line language resolve into the one accessible assistant surface, then the interface behaves like a normal application panel.
- Contact: motion, node activity, depth, and visual complexity intentionally reduce so the system settles around a clear human CTA.

Later sections inherit the motion language established in Phase 3B so the result does not become an interactive Hero followed by a static conventional website. Use CSS and IntersectionObserver for simple reveals. Reserve GSAP ScrollTrigger for synchronization, scroll progress, sequencing, or WebGL/DOM handoffs where it is materially better than CSS; do not animate every element merely because it can be animated.

### 9.3 Scroll safeguards

- Preserve native scrollbar, anchor behavior, text selection, find-in-page, keyboard scrolling, and browser history.
- Avoid nested scroll containers except chat messages and certificate modal content.
- Avoid scroll snapping.
- Recalculate triggers after fonts/assets settle and on responsive layout changes.
- In reduced motion, remove scrub/pinning and use direct section state changes.

### 9.4 Connected narrative and calm ending

Section transitions should make the sequence **Identity → System → Product → Capability → Journey → AI → Contact** legible without requiring the visitor to understand the animation. The final contact region deliberately quiets the system: data activity subsides, spatial layers settle, decorative detail recedes, and the page resolves to **Franci Hoxha → software engineer → real work → clear contact path**.

## 10. Planify Flagship Specification

### 10.1 Positioning

Recommended hierarchy:

- Eyebrow: `FLAGSHIP SOFTWARE PROJECT`
- Heading: `PLANIFY`
- Short evidence-led product description.
- Role/contribution statement only after confirmation.
- Live platform CTA if the URL/status is confirmed.
- Optional case-study details inline; no router is required initially.

Do not use `Flagship SaaS Project`; the approved label is `Flagship Software Project`. Avoid implying sole ownership, client count, revenue, or adoption.

### 10.2 Visual presentation

- Use the actual 1,200 x 628 Planify dashboard screenshot as the first proof asset.
- Synchronize the incoming DOM browser/device frame with the Hero's WebGL monitor during the brief handoff, then settle the DOM frame nearly flat for readability.
- Add 2-4 additional screenshots only when supplied/approved: booking flow, staff/role area, customer/public flow, and responsive/mobile/PWA view.
- Use layered screenshot/product-story reveals and controlled entry perspective to show product breadth, but do not show tiny illegible UI solely as decoration.
- Where confirmed evidence supports them, architecture/system paths may connect interface, API, data, mobile, and delivery responsibilities without inventing product topology.
- Scroll-driven sequencing may progressively reveal the problem, Franci's role, capabilities, architecture, and delivery story. The complete DOM content remains readable and correctly ordered with motion disabled.
- Keep important labels and capability descriptions outside the image.

### 10.3 Content blocks

Recommended structure:

1. Product problem/context.
2. Franci's confirmed role and responsibilities.
3. Selected capabilities (maximum 4-6, evidence-led).
4. Architecture/stack summary.
5. Delivery notes: responsive/PWA/deployment only where confirmed.
6. Live platform link and optional case-study detail.

### 10.4 Claim reconciliation required

The app/AI prompt currently claims online appointments, staff/customer management, analytics, reminders, geolocation discovery, public profiles, payment status, PWA, authentication, role-based areas, APIs, MongoDB, responsive flows, and Vercel deployment.

**Authoritative payment override:** Planify must not be described as currently offering online customer payments or customer prepayments, and Polar must not be described as its current payment provider. The legacy `Polar for payments` claim is **STALE / REMOVE**, not a verification item. It must be excluded from public copy, capability lists, shared portfolio data, AI context, SEO, structured data, architecture diagrams, and highlights. Do not speculate about a future provider. If an internal administrative payment-status workflow exists, its exact wording still requires evidence and must not imply online payment processing.

The CV additionally claims multi-vendor, multi-location, real-time notifications, Google Maps API, Resend, and Google Auth. These integrations remain individually **NEEDS USER CONFIRMATION** and must not be copied simply because they appear in the CV. Exact current Planify functionality, Franci's contribution, production status, and terminology must be reconciled against the actual project/source of truth before final public copy.

### 10.5 Acceptance criteria

- Planify is visually and semantically more prominent than both secondary projects combined.
- Its first screenshot is useful without hovering.
- Every capability is traceable to confirmed data.
- The section works with the WebGL transition disabled.
- The section feels like exploring a real software product produced by the Developer Universe, not reading a large project card.
- The WebGL/DOM handoff and layered product sequence are reviewed live in a real browser for both scroll directions; screenshots remain required for stable, fallback, and responsive states but do not prove transition quality.
- Link status and external-link labeling are verified.
- Images have dimensions, meaningful alt text, responsive `srcset`/formats where applicable, and no avoidable layout shift.

## 11. Other Project Presentation

### 11.1 BarberSpot.al

- Present as selected work below Planify, not equal flagship weight.
- Retain the live link only after status verification.
- Add one desktop and one mobile/workflow screenshot if available.
- Current appointment, staff, role, reminder, SMS, WhatsApp, real-time notification, and analytics claims are **NEEDS USER CONFIRMATION**.
- Describe relationship to Planify accurately; do not imply they are independent products if one evolved into the other unless confirmed.

### 11.2 Online Charging Station Management System

- Present as a focused system/case study with user management, reservation flow, and database integration only after confirmation.
- Current lack of live URL should be explicit; use `View case study` or `Discuss the project`, not a fake live CTA.
- Add a diagram or screenshot if available. If none exists, use a deliberately designed architecture panel rather than a generic striped placeholder.

### 11.3 Shared interaction rules

- Fine-pointer depth/tilt uses a restrained, tunable envelope that preserves legibility and the clear secondary hierarchy.
- Image masks/reveals, content-state transitions, and restrained scroll entrances may add tactile quality when they expose real project information rather than decorative novelty.
- Metadata animations should reveal role, problem, stack, and status; not decorative counters.
- The entire card must not become one ambiguous link if it also contains multiple controls.
- Hover enhancements must have focus and touch equivalents.
- External links announce destination/new-tab behavior accessibly.

## 12. Engineering Stack Visualization

### 12.1 Recommended approach

Build an **Interactive Engineering System Map** with semantic DOM nodes and an SVG connection layer. This is one of the portfolio's signature interactive sections and should feel like a functioning software-system diagram without adding a second renderer.

- Center: `FULL-STACK`.
- Connected system clusters: Frontend, Backend/APIs, Data, Mobile, AI, and Engineering/Delivery, weighted according to confirmed evidence rather than presented as equal expertise.
- A natural `Languages` group contains JavaScript, TypeScript, Python, and Java as cross-cutting implementation languages.
- Product capability appears as a cross-cutting band rather than another logo cloud.
- Each technology is a real button or focusable disclosure trigger.
- Hover/focus/tap opens a concise evidence panel explaining how the capability is used.
- Hover, focus, and tap states propagate through related nodes and activate the relevant connection paths so frontend/backend/data/mobile/AI relationships become visible.
- Entry may assemble or activate the system in a bounded sequence; subsequent interaction changes system state rather than replaying decorative animation.

Examples of evidence-led disclosures:

- React - component architecture, responsive interfaces, API/state integration.
- Node.js / REST APIs - backend endpoints, auth, business workflows.
- MongoDB - data modeling and database-backed product workflows.
- PWA - installability/offline/manifest/service-worker behavior only if current implementation supports it.

### 12.2 Accessible representation

- The complete information exists as structured HTML grouped by category.
- SVG lines are `aria-hidden` and decorative.
- Nodes are reachable in logical DOM order with visible focus.
- The detail panel updates with an appropriate heading and `aria-live="polite"` only if needed; avoid announcing pointer-only movement.
- Mobile defaults to an accordion/list; the map may simplify to a vertical system path.
- No content is available only by hover.
- Keyboard focus produces the same related-node, path-activation, and evidence-panel state as pointer interaction; motion is reduced or removed without losing those relationships.

### 12.3 Skill admission rule

The capability inventory is reconciled for planning:

- Languages: JavaScript, TypeScript, Python, and Java. Present all four as normal primary languages within this group. Java's equal placement does not imply expert-level mastery, professional Java employment, fabricated Java projects, or years of Java experience.
- Frontend: React, Next.js, HTML, CSS, responsive interfaces, frontend/backend integration, and PWA-related work.
- Backend/APIs: Node.js-style API development, REST APIs, FastAPI, authentication, authorization, and application/business logic.
- Data: MongoDB, database-backed application development, MySQL, and SQL Server where relevant.
- Engineering/Delivery: Git, testing, debugging, deployment, production hardening, application integration, and troubleshooting.
- Mobile: broad mobile application development is confirmed; do not name a native stack until technology-specific evidence is reconciled.
- AI: AI integration and AI-assisted development are confirmed when grounded in the portfolio assistant, software integrations/workflows, and supplied AI credentials. Do not imply machine-learning engineering, model training, data science, or LLM research.

Do not create a standalone visual category called `Additional Engineering Language`. Confirmation establishes eligibility, not mastery. Every visible node still needs a short usage/evidence statement, and the map should prioritize the strongest practical stack instead of giving every technology equal visual weight. Do not add fashionable or unsupported technologies merely to make the map look fuller.

## 13. Experience and Journey

### 13.1 Narrative

The section should communicate this progression:

**Business understanding → IT systems → Software engineering → Product development**

This is a strength: business education helps frame workflows; IT support contributes troubleshooting, reliability, system awareness, and user empathy; software engineering turns those foundations into products.

### 13.2 Presentation

- Use one chronological/causal journey rather than separate education and experience card columns.
- Give the progression a connected visual path that advances from business understanding through IT systems and software engineering into product development.
- Use a progressive timeline/system path, restrained staggered evidence, and section-state or spatial/graphical transitions to show causality between stages. Do not reduce the Journey to generic cards appearing one after another.
- Each stop contains period, verified role/degree, organization only if confirmed, 1-2 evidence statements, and a short connection to the next stage.
- Give the Computer Technician & IT Support period meaningful space. Confirmed responsibilities may include Windows/macOS/Linux support, hardware/software troubleshooting, operations, backup/recovery, and end-user support.
- Do not invent an employer from the current generic `Technical Support and Systems Operations` label.
- Do not claim seniority or professional software employment that is not present.
- Present the Master's as a completed milestone: degree completed in July 2026. Never describe it as current or ongoing.
- Use the confirmed `Master of Science in Informatics Engineering` title; this wording does not reopen the confirmed completion status/date.

### 13.3 Data needed

The `Master of Science in Informatics Engineering` title and July 2026 completion date are **CONFIRMED**. The `Master's degree in Business Administration` title is also **CONFIRMED**. IT employer/self-employed context and final public dates, Business Administration institution/location/date wording, and availability-specific professional status remain targeted verification items for the phases that publish them.

## 14. Credentials and Certifications

### 14.1 Section decision

Use the section name **Credentials**. It is concise, professional, and can include selected certifications plus future verified learning without sounding like a course catalog. Credentials remain deliberately secondary to Planify/selected work, engineering capability, and the professional Journey; they must not outrank real software evidence.

### 14.2 Confirmed entries

1. **Complete Software Engineering Course: Build Better Software**
   Udemy - Yogesh Dahake - completed 2026-06-23 - 15 hours
2. **AI Coder: Complete Claude Code & Coding Agents Course**
   Udemy - Ligency, Ed Donner - completed 2026-06-21 - 16.5 hours
3. **Succeed in the Age of AI**
   Udemy - Dr. Angela Yu - completed 2026-05-18 - 8.5 hours

The certificate images exist, were supplied externally by the user, and are approved source assets. They are not yet physically placed in this repository; placement and optimization will occur during Phase 7. Exact public verification URLs remain **NEEDS USER CONFIRMATION** and are optional rather than a Phase 0 blocker.

### 14.3 UI behavior

- Three restrained certificate cards with title, provider, instructor(s), completion date, duration, optional thumbnail, and `View certificate`.
- Cards do not occupy flagship-project scale.
- Desktop viewer: accessible modal/dialog with image fitted inside a max-width content surface, zoom/open-original option, focus trap, focus return, Escape close, explicit close button, and body scroll control.
- Mobile viewer: near-full-screen dialog/sheet with safe-area padding, pinch/browser zoom compatibility, a clear close control, and optional `Open original` link.
- If the image fails, metadata remains visible and the viewer offers a fallback link only when an exact asset exists.
- Do not fabricate certificate IDs or verification links. URLs are **NEEDS USER CONFIRMATION**.

### 14.4 Asset convention

```text
public/certificates/software-engineering-build-better-software.jpg
public/certificates/ai-coder-claude-code-coding-agents.jpg
public/certificates/succeed-in-age-of-ai.jpg
```

Create optimized thumbnails separately at build/content-prep time if necessary; do not stretch raw screenshots into page-width banners.

## 15. AI Portfolio Assistant Integration

### 15.1 Product recommendation

Consolidate to **one assistant experience with multiple launch points**:

- Hero `Ask My AI` button.
- Navigation `Ask AI` button/link.
- AI section with explanation, suggested prompts, and an open/continue CTA.
- Persistent floating launcher after the hero, positioned so it does not overlap content or mobile safe areas.

All entry points open or focus the same `AssistantPanel` and shared conversation state. Do not keep independent embedded and floating chat sessions.

The full AI section remains in the information architecture because it explains a meaningful differentiator and offers recruiter-specific prompts, but it should not mount a second complete chat client. On desktop the one panel may be visually docked in the section when appropriate; on mobile it should use one accessible dialog/sheet.

The assistant must be visually native to the Developer Universe. The established AI/system node motif, connection lines, depth cues, and data-flow language may resolve into the assistant surface so it feels like a system component becoming interactive rather than an unrelated widget attached to the page. This visual integration must not change the one-session architecture or weaken dialog semantics, focus management, multilingual behavior, endpoint security, or graceful failure.

### 15.2 Suggested prompts

- What has Franci built?
- Tell me about Planify.
- What is his tech stack?
- What is his professional background?
- What AI experience does he have?
- What mobile development has he worked on?
- Is he open to opportunities? (show only if availability is confirmed)

### 15.3 Conversation UX

- Shared `ChatProvider` or `usePortfolioChat` hook owns messages, pending state, errors, cancellation, and retry.
- Keep message history bounded client-side to the same server allowance.
- Cancel in-flight requests on unmount/new session where appropriate.
- Provide visible label text for the composer, Enter/Shift+Enter guidance, and a status region for sending/error state.
- Focus moves into the panel on open and returns to the launcher on close; Escape closes; background focus is managed for modal mode.
- Markdown remains sanitized by not enabling raw HTML. Render links with safe external-link behavior.
- Error UI offers Retry and direct contact/CV paths instead of a dead end.
- Multilingual behavior remains: respond in the visitor's language, with explicit Albanian quality guidance. Italian behavior should be tested because Italian is listed as a language.

### 15.4 Assistant truthfulness

- The system prompt is generated from confirmed canonical data plus a server-only policy preamble.
- Exclude fields marked stale, hidden, or needing confirmation.
- The prompt states that missing facts must be referred to direct contact, not inferred.
- Make clear that the assistant represents portfolio information and is not Franci personally.
- The AI is a retrieval-like interface over a small approved profile, not proof of general ML/AI engineering expertise.

## 16. Content and Data Architecture

### 16.1 Single source of truth

Create one public, serializable portfolio data module outside the component and API layers:

```text
shared/
|-- portfolio.ts
|-- portfolio.types.ts
`-- validatePortfolio.ts

api/_lib/
`-- buildPortfolioSystemPrompt.ts

src/data/
|-- scene.ts
`-- viewModels.ts
```

`shared/portfolio.ts` contains only information intended to be public: identity, positioning, contact fields with visibility flags, navigation labels, projects, capability evidence, journey, credentials, languages, availability, and asset/link paths. It must contain no API keys, private notes, internal IDs, or unapproved claim drafts.

The browser imports public data for sections. The serverless prompt builder imports the same data and serializes an allowlisted subset. View-specific layout configuration and scene parameters remain in `src/data`, so professional facts are not coupled to animation.

### 16.2 Proposed data characteristics

- Stable IDs independent of display titles.
- `status`: draft/published/hidden where useful.
- Optional `verificationStatus` used during editorial work but not exposed as a badge to visitors.
- Explicit link labels/types/status.
- Asset objects with `src`, `alt`, width, height, and focal point.
- Project `capabilities` contain evidence text, not just tag names.
- Availability is nullable; UI hides it when absent.
- Contact fields include a `public` flag.
- Credentials allow an optional exact verification URL, never a fabricated one.

### 16.3 Type strategy

Incremental TypeScript migration is **APPROVED**:

- Add TypeScript and lint support in Phase 0/1.
- Type the shared content, prompt builder, scene configuration, and all new components.
- Convert existing JSX only when touched by a planned phase.
- Add `tsc --noEmit` to validation.

Do not mass-convert untouched JSX simply to change file extensions. Existing components may be converted when their implementation phase naturally touches them. JavaScript plus JSDoc remains acceptable only for untouched low-complexity legacy code; new shared data, validation, 3D, quality, AI/API, and complex UI boundaries should preferentially be typed.

## 17. Visual Design System

Final tokens must be tested in context. The following are direction tokens, not blindly locked colors:

```css
--color-bg-0: #050508;
--color-bg-1: #080a12;
--color-surface-1: #0d1019;
--color-surface-glass: rgba(15, 18, 29, 0.72);
--color-text: #f3f5fa;
--color-text-muted: #a4acc0;
--color-text-subtle: #717a90;
--color-border: rgba(255, 255, 255, 0.10);
--color-accent-violet: #8270ff;
--color-accent-blue: #4c9aff;
--color-accent-cyan: #5ddde6;
--color-success: #39c98a;
--color-warning: #e7ad55;
--color-danger: #ef6a7a;
```

The existing violet/cyan identity should evolve rather than be discarded. Green, amber, and red are semantic only.

### 17.1 Typography

Recommended pairing:

- Space Grotesk: hero and major section display only.
- Geist Sans: body, navigation, UI, and project copy.
- Geist Mono or system monospace: scarce system/API labels only; omit if font budget is exceeded.

Self-host optimized WOFF2 files with limited weights/subsets rather than retaining Google Fonts network dependencies. If combined font transfer cannot remain roughly under 160 kB, use Geist Sans/Mono only.

Guidelines:

- Body minimum 16 px on mobile; 17-18 px for major descriptive copy.
- Main paragraphs approximately 55-70 characters per line.
- Avoid all-uppercase body copy; uppercase only for small eyebrow/metadata labels with adequate letter spacing.
- Maintain a clear `h1` -> section `h2` -> item `h3` hierarchy.

### 17.2 Surfaces and spacing

- Use opaque dark surfaces for text-heavy content; reserve blur/glass for navigation, the AI surface, and a few overlays.
- Border radii: 12-20 px depending on scale; avoid a different radius on every component.
- One subtle inner highlight plus one soft shadow is sufficient.
- Use an 8 px base spacing system with deliberate exceptions for optical balance.
- Content max width approximately 1,200-1,280 px; text max widths remain narrower.
- Grid and glow textures should fade around content and never reduce contrast.

### 17.3 Iconography and brand

- Continue with a simple `FH` monogram unless a separate identity exercise is approved.
- Redesign the current teal/orange Georgia-style favicon to match the violet/graphite visual system while preserving recognition.
- Use one consistent stroke-icon family or small custom SVG set.
- Do not place random framework logos into the 3D scene.

## 18. Motion System

The site-wide motion language prevents the experience from becoming an interactive Hero followed by a static normal website. Motion communicates system behavior: relationships, hierarchy, data flow, spatial depth, navigation, or state. Continuous movement is allowed only when its semantic role, visual hierarchy, and runtime cost remain clear.

### 18.1 Motion hierarchy

- **Level A - microinteractions:** buttons, links, controls, chips, navigation, AI triggers, disclosures, focus, hover, and press states.
- **Level B - section interactions:** content reveals, image depth and masks, connected SVG paths, timeline progress, project interaction, and visible system-state changes.
- **Level C - signature spatial storytelling:** a small number of high-value sequences - the Hero entrance, the Hero-to-Planify handoff, and potentially one Engineering System Map composition/reveal when justified.

Use CSS and IntersectionObserver for simple motion. Use GSAP only when synchronization, scroll progress, sequencing, or WebGL/DOM handoff makes the result materially better. Do not animate every element simply because it can be animated, and do not give simultaneous visual priority to multiple motion levels.

### 18.2 Timing

- Micro interactions: 120-220 ms.
- Component entrances/state transitions: 280-480 ms.
- Hero/Planify cinematic movement: approximately 700-1,200 ms when time-based, or bounded scroll progress.
- Operational idle cycles: typically 6-20 seconds with restrained, perceptible amplitude and varied phase; individual data-node travel or connection pulses may be shorter when they clearly communicate flow.

Timing is tuned in the browser rather than accepted from numeric compliance alone. Motion should be perceptible, responsive, and composed without rushing content or making the interface feel delayed.

### 18.3 Easing and interpolation

- Primary entrance: CSS `cubic-bezier(0.22, 1, 0.36, 1)` / GSAP `power3.out`.
- State/camera transitions: `power2.inOut`.
- Exit: shorter and quieter than entry.
- Avoid bounce, elastic, large overshoot, and simultaneous motion in every layer.
- Pointer and camera response use damping, bounded targets, depth-weighted non-linear response, and calm return behavior rather than direct position mapping.

### 18.4 Reduced-motion and static equivalence

No long intro sequence or percentage loader. Reduced-motion mode removes parallax, scrub/pinning, auto-moving particles, animated gradients, and smooth programmatic scrolling; it uses immediate or short state changes between intentional compositions. Static/no-WebGL alternatives preserve information, hierarchy, and visual authorship rather than serving as error leftovers.

### 18.5 Cursor decision

Do not implement a custom cursor in the first release. Native cursor/focus behavior is clearer and lower risk. A small optional pointer aura or magnetic offset may be prototyped after accessibility/performance QA, only on fine pointers, without hiding/replacing the native cursor.

### 18.6 Calm ending

Contact intentionally reduces motion density, node activity, perspective, and system complexity. The visual system settles rather than stops abruptly, leaving the final impression centered on Franci Hoxha, software engineering, real work, and an obvious contact path. Any remaining motion must support the CTA instead of competing with it.

## 19. Responsive and Mobile Strategy

### 19.1 Capability tiers

Choose quality from measured capability signals, not screen width alone:

- **Full:** fine pointer, motion allowed, adequate recent GPU/frame rate.
- **Reduced:** mobile/coarse pointer, low memory/concurrency signal, performance regression, or battery-sensitive conditions.
- **Static:** reduced motion, WebGL unavailable/context failure, severe regression, save-data where available, or user/browser constraints.

Do not rely on one user-agent rule. Use conservative defaults and allow `PerformanceMonitor`/measured frame rate to downgrade once without flip-flopping.

### 19.2 Mobile-specific design

- Hero copy first; scene cropped/recomposed or replaced, not scaled.
- Remove depth layers and nonessential nodes; reduce particles, lights, shadows, texture resolution, and DPR.
- Disable postprocessing and cursor parallax.
- Use touch disclosures for project/stack detail; no hover prerequisite.
- Engineering map becomes a clear accordion/system list.
- Project mockups settle close to flat for legibility.
- Certificate viewer becomes full-screen/near-full-screen.
- AI becomes one accessible bottom sheet/dialog and respects virtual keyboard/safe areas.
- Navigation and CTA touch targets are at least 44 px.
- Preserve exactly the same professional content as desktop.

### 19.3 Layout test matrix

- 320 x 568 (minimum stress case)
- 375 x 667 and 390 x 844 phones
- 430 x 932 large phone
- 768 x 1,024 tablet portrait
- 1,024 x 768 tablet landscape
- 1,280 x 720 short laptop
- 1,440 x 900 standard desktop
- 1,920 x 1,080 and ultrawide composition
- Browser zoom at 200% and large text settings

## 20. Accessibility Strategy

Target WCAG 2.2 AA behavior for recruiter-critical paths.

### 20.1 Structure and navigation

- Add a visible-on-focus Skip to content link.
- One `h1`; logical `h2`/`h3` hierarchy.
- Landmarks: header/nav/main/sections/footer with useful labels.
- All section anchors account for sticky navigation and focus behavior.
- Active navigation does not rely on color alone.

### 20.2 Keyboard and focus

- Global, high-contrast `:focus-visible` tokens for every control/link.
- Mobile menu, AI dialog, and certificate viewer support Escape, deliberate initial focus, containment when modal, and focus return.
- No positive `tabindex` or canvas-only interaction.
- Interactive project/stack elements use native links/buttons.

### 20.3 Motion and 3D

- Honor `prefers-reduced-motion` before initializing major animations.
- Canvas is decorative (`aria-hidden`) unless a specific interaction gains an equivalent HTML control; planned canvas should remain decorative.
- Static fallback conveys the same composition while HTML conveys all meaning.
- No flashing, rapid contrast pulses, or motion that follows the pointer at large amplitude.

### 20.4 Images, dialogs, and chat

- Meaningful project/certificate alt text; decorative imagery uses empty alt.
- Certificate modal has an accessible name/description and original-view fallback.
- Chat composer has a label, instructions, status region, and announced errors without repeated noisy updates.
- Typing indicators are hidden from assistive technology or announced once as status.
- Suggested prompts are real buttons and remain understandable out of visual context.

### 20.5 Contrast and content

- Normal text contrast at least 4.5:1; large text at least 3:1; focus/controls meet non-text contrast requirements.
- Do not use the current muted color for essential small text without measured contrast.
- No information only in color, glow, depth, or hover.

### 20.6 Degraded JavaScript

Remain a Vite SPA unless a later SEO need justifies pre-rendering. Add a useful `<noscript>` block in `index.html` containing name, role, a short summary, CV link, email, and LinkedIn. This is a practical fallback without introducing SSR architecture.

## 21. Performance Strategy

### 21.1 Loading sequence

1. HTML shell, metadata, critical global CSS, and hero DOM.
2. Core React page and navigation.
3. Lazy Planify image based on proximity (or eager only if the new layout brings it into the initial viewport).
4. Lazy 3D chunk and small scene assets after critical content.
5. Remaining project/certificate images near viewport.

No full-screen preload gate. Scene failure must never block scrolling or navigation.

### 21.2 Initial budgets and targets

These are engineering gates to validate, not guaranteed public claims:

| Area | Initial target |
|---|---|
| Core initial JS (excluding lazy 3D) | Keep close to current baseline; target <= 140 kB gzip |
| Lazy 3D runtime/scene JS | Target <= 250 kB gzip; inspect bundle and remove unused Drei helpers |
| Initial critical image transfer | <= 300 kB |
| Total initial hero 3D asset transfer | <= 1.2 MB compressed, preferably much lower through procedural geometry |
| Individual color texture | Usually <= 1,024 px; maximum 2,048 px desktop only when visibly justified |
| Decoded texture/GPU memory | Aim <= 64 MB reduced/mobile and <= 128 MB desktop |
| DPR | Desktop clamp 1-1.75; mobile/reduced 1-1.25 |
| Draw calls | <100 desktop; <50 reduced/mobile |
| Shadow-casting lights | 1 maximum |
| CLS | <= 0.1 target |
| LCP | <= 2.5 s target at the 75th percentile where field data becomes available |
| INP | <= 200 ms target where field data becomes available |

### 21.3 Runtime controls

- Adaptive DPR/quality with a one-way fallback to prevent oscillation.
- Pause/offscreen-demand rendering via intersection and visibility state.
- Outside approved visible full-tier operational activity, stop frame loops when settled and invalidate only on interaction where feasible; continuous frames are never justified merely by decorative drift.
- Reuse/instance geometries and materials.
- Dispose obsolete geometries, materials, textures, render targets, controls, and loaders; inspect `renderer.info` during QA.
- KTX2/Basis texture compression only if real texture assets justify the toolchain; procedural scene may not need it.
- Draco/Meshopt only if a GLB is introduced and measured savings justify decoder cost.
- Lazy-load certificates and secondary screenshots.
- Include explicit image dimensions and responsive formats (AVIF/WebP with practical fallback).
- Self-host and preload only the one critical font file/weight needed for initial text.

### 21.4 Lighthouse checkpoints

Run mobile and desktop Lighthouse at the end of the foundation, hero, Planify, AI, and production phases. Final aspirational gates:

- Performance: 85+ mobile and 90+ desktop.
- Accessibility: 95+ with no known critical manual failures.
- Best Practices: 95+.
- SEO: 95+.

These are targets, not promises. Manual accessibility, real-device frame time, and Core Web Vitals matter more than a single lab score.

## 22. SEO and Professional Discoverability

- Proposed title: `Franci Hoxha - Full-Stack Software Developer`.
- Meta description should mention building modern web, mobile, backend, and AI-assisted software experiences and identify Planify without unsupported scale claims.
- Add Open Graph/Twitter title, description, image, and card type.
- Create a 1,200 x 630 professional social image based on the visual system, not a canvas screenshot containing tiny UI.
- Add an updated favicon/app icon set.
- Set canonical only after the production domain is confirmed.
- Keep project descriptions, capabilities, headings, links, and contact channels as HTML.
- Use descriptive link labels instead of repeated `View project` where context may be lost.
- Add `Person` JSON-LD only with confirmed name, job title, URL, location level, and exact `sameAs` profiles. Do not include private/unconfirmed contact data.
- No unnecessary router/SSR migration. Reassess static prerendering only if crawl/index tests show a real gap.
- Update `lang="en"`; multilingual AI responses do not make the page itself multilingual.

## 23. AI Endpoint and Security Review

### 23.1 What is already correct

- API key is read server-side from `process.env.OPENROUTER_API_KEY`.
- No `VITE_` secret or secret import appears in the client bundle.
- Only POST is accepted for chat; OPTIONS is handled.
- Visitor-facing errors do not include stack traces or raw upstream bodies.
- Upstream output is capped at 300 tokens.
- Raw HTML is not enabled in Markdown rendering.
- The prompt tells the model not to invent facts and to refer unknowns to direct contact.

### 23.2 Required hardening

1. Validate `Content-Type` and reject malformed/non-object bodies.
2. Enforce a request-body limit (initial recommendation: 16 kB).
3. Allow at most 12 messages, 1,500 characters per message, and approximately 8,000 total characters.
4. Allow only `user` and `assistant` roles; require a nonempty final user message. Never accept client-supplied `system`/`developer` roles.
5. Trim/control unsupported Unicode/control characters where necessary without harming multilingual text.
6. Add an upstream timeout with `AbortController` (initially 10-15 seconds) and return a safe retryable error.
7. Validate that the upstream reply is a nonempty string and cap returned length.
8. Add rate limiting/abuse controls. Prefer platform-level rate limiting/firewall first; if unavailable, use a durable server-side store rather than in-memory counters that fail across serverless instances.
9. Make the model configurable through a server-side environment variable with a reviewed default; do not expose provider keys/config to the client.
10. Minimize upstream error logging so user message content/tokens are not echoed into logs.
11. Define same-origin policy explicitly. If cross-origin API use is not required, keep the browser client same-origin. If GitHub Pages or another frontend is required, configure an exact environment-driven allowlist and backend URL.
12. Add API validation tests for method, body, roles, sizes, timeout, upstream failure, empty reply, and safe errors.

### 23.3 Cost and reliability

The hard-coded free model is a product risk. **NEEDS USER CONFIRMATION:** acceptable provider/model, budget, expected traffic, latency tolerance, retention/logging expectations, and whether an unavailable free model should fail closed or use a second approved model. Do not silently create a potentially paid fallback. This is a Phase 8 gate and explicitly does not block Phase 0 content/data architecture.

### 23.4 Prompt safety

Prompt injection cannot be solved by prose alone. Bound the assistant's approved context, tell it to ignore requests to change role/reveal instructions, never include secrets, and treat all visitor content as untrusted. The response remains advisory portfolio text; it must not perform external actions.

## 24. Asset Requirements

### 24.1 Existing assets to retain now

- `public/planify-preview.png` - used, current 1,200 x 628 screenshot, strong flagship starting point.
- `public/Franci-Hoxha-CV.pdf` - used and downloadable; retain until an approved replacement exists.
- `public/favicon-fh.svg` - used, but visually mismatched to the new direction and should be redesigned later.

### 24.2 Existing assets to review/retire later, not delete now

- `public/icons.svg` - no current code reference; unrelated social/icon symbols.
- `src/assets/hero.png` - no current code reference; small legacy graphic, not sufficient for the new signature scene.
- `src/assets/react.svg` and `src/assets/vite.svg` - unused template assets.

Any deletion occurs only after a later reference audit and explicit implementation scope.

### 24.3 Required new assets

- Local placement/optimization of the three certificate images already supplied externally, using the semantic filenames in Section 14.
- BarberSpot desktop/mobile or workflow screenshots.
- Charging-station system screenshot, diagram, or approved case-study visual.
- Additional Planify screenshots showing 2-4 confirmed product areas.
- A future updated CV handled as a separate authorized task after content reconciliation; the current CV remains unchanged for this redesign phase.
- Social preview image (1,200 x 630).
- Updated favicon/app icon set.
- Static hero fallback render/image for no-WebGL/reduced devices.

### 24.4 Nice-to-have assets

- One clean professional portrait only if Franci wants a personal-photo direction; the design must work with the monogram alone.
- A compact Planify architecture diagram based on confirmed topology.
- Exact certificate verification URLs.
- One short, muted Planify interaction capture only if it adds proof and does not autoplay heavy video.

### 24.5 Can be generated procedurally

- Workstation/base geometry.
- Monitor/device frame.
- API/data nodes, links, particles, grids, and architecture paths.
- Abstract interface panels.
- Lighting environment and emissive accents.
- Browser/device frames around real screenshots.
- Engineering System Map SVG paths.

### 24.6 Naming conventions

Recommended future structure:

```text
public/
|-- certificates/
|-- documents/franci-hoxha-cv.pdf
|-- og/franci-hoxha-portfolio.jpg
|-- projects/
|   |-- planify/
|   |-- barberspot/
|   `-- charging-station/
`-- three/fallback/
```

When replacing the CV, use `documents/franci-hoxha-cv.pdf` and preserve/redirect the existing `/Franci-Hoxha-CV.pdf` path for a release if external links may exist. Do not modify CV content during the redesign unless separately authorized.

## 25. Proposed Component and Code Architecture

```text
shared/
|-- portfolio.ts
|-- portfolio.types.ts
`-- validatePortfolio.ts

src/
|-- components/
|   |-- common/
|   |-- navigation/
|   |-- ai/
|   `-- media/
|-- sections/
|   |-- Hero/
|   |-- PlanifyFlagship/
|   |-- SelectedWork/
|   |-- EngineeringStack/
|   |-- Journey/
|   |-- Credentials/
|   |-- AiAssistant/
|   `-- Contact/
|-- three/
|   |-- DeveloperUniverseCanvas.tsx
|   |-- scenes/DeveloperWorkspace.tsx
|   |-- models/
|   |-- materials/
|   |-- effects/
|   `-- quality/
|-- hooks/
|   |-- useReducedMotion.ts
|   |-- useMediaQuery.ts
|   |-- useSceneQuality.ts
|   |-- usePageVisibility.ts
|   `-- usePortfolioChat.ts
|-- data/
|   |-- scene.ts
|   `-- viewModels.ts
|-- styles/
|   |-- tokens.css
|   |-- reset.css
|   |-- global.css
|   |-- utilities.css
|   `-- motion.css
|-- App.tsx
`-- main.jsx/tsx

api/
|-- _lib/
|   |-- buildPortfolioSystemPrompt.ts
|   |-- validateChatRequest.ts
|   `-- openRouterClient.ts
`-- chat.ts
```

### Architecture rules

- Sections own composition; small reusable components own behavior, not arbitrary visual fragments.
- CSS Modules may be used per major section, with tokens/global utilities in `src/styles`. Do not introduce Tailwind or a CSS-in-JS runtime solely for the redesign.
- One AI hook/provider and one rendered assistant panel.
- One canvas and one scene-quality controller.
- DOM scroll state is translated into a small scene state model; components do not directly query random selectors.
- Server-only code stays under `api`; only the public shared data crosses into both bundles.
- Keep the single-page architecture until a genuine case-study routing need appears.
- Do not reorganize untouched components before their phase; migrate incrementally.

## 26. Dependency Recommendations

### 26.1 Recommended runtime additions

| Package | Decision | Reason |
|---|---|---|
| `three` | Add in Hero phase | Core renderer/material/geometry layer. |
| `@react-three/fiber` v9 compatible with React 19 | Add | Declarative integration, lifecycle, one canvas, hooks. Official R3F guidance pairs v9 with React 19. |
| `@react-three/drei` | Add selectively | `AdaptiveDpr`, `PerformanceMonitor`, loaders/helpers, rounded geometry, and utilities; import only what is used. |
| `gsap` + ScrollTrigger | Add | Coordinate the one complex DOM/3D scroll story while retaining native scroll. |

Official references: [R3F React/Vite installation and React-major compatibility](https://r3f.docs.pmnd.rs/getting-started/installation), [R3F scaling/performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [GSAP ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), and [Three.js resource disposal guidance](https://threejs.org/manual/en/how-to-dispose-of-objects.html).

### 26.2 Defer or reject initially

| Package/approach | Decision | Reason |
|---|---|---|
| Motion | Defer | Duplicates GSAP/CSS responsibility for this plan. Reconsider only if a clear React layout-animation need appears. |
| Lenis | Do not add initially | Native scroll plus ScrollTrigger meets the story and has fewer nested-scroll/modal/accessibility integration risks. Prototype later only if measured UX benefit is clear. |
| `@react-three/postprocessing` | Defer | No postprocessing is required for the initial material/lighting concept. |
| Physics engine | Reject | No interaction requires physics. |
| Large UI/component library | Reject | Would dilute the visual system and add unused runtime. |
| 3D text for critical labels | Reject | Accessibility, sharpness, and localization are better in DOM. |
| Drei `ScrollControls` for the page | Reject | An internal scroll container would conflict with semantic native page navigation; ScrollTrigger should observe the document. |

### 26.3 Development dependencies

- TypeScript and TypeScript-aware ESLint for incremental typing.
- Vitest for content, quality-selection, prompt-builder, and API validation tests.
- React Testing Library for keyboard/dialog/menu/chat component behavior.
- Playwright for viewport, navigation, CV, assistant failure, WebGL fallback, overflow, and reduced-motion flows.
- Optional `@axe-core/playwright` for automated accessibility signals; manual testing remains mandatory.

Lock compatible versions during the implementation spike, run bundle analysis, and do not install the entire candidate list before its phase.

## 27. Implementation Phases

Each phase is independently reviewable. Do not begin high-cost 3D polish before content, DOM structure, and fallback behavior are approved. Phase 3B establishes the global interaction and motion language inherited by later phases; those phases must apply it proportionately rather than reverting to static section templates.

### Phase 0 - Audit, content reconciliation, and baseline lock

| Field | Plan |
|---|---|
| Objective | Remove stale-data risk and establish a clean engineering baseline. |
| Exact scope | Begin from the confirmed identity, July 2026 Master's completion, reconciled capability inventory, credentials metadata, and explicit Planify payment removal. Categorize unresolved facts by phase; resolve only the public-data gates needed to finalize Phase 0/1 fields. Snapshot current desktop/mobile, define the typed shared content schema, document Vercel/local AI workflow, separate ESLint browser/server globals, add focused tests/typecheck, and preserve the current visual experience. No 3D or visual redesign. |
| Likely files | `shared/*`, `src/App.*`, `api/_lib/*`, `api/chat.*`, `eslint.config.js`, `README.md`, package scripts. |
| Dependencies | Phase 0 may begin immediately. Its affected public fields require only the Phase 0/1 gates in Section 30; later AI-provider, analytics, certificate-URL, secondary-project-asset, photo, and monitoring decisions do not block it. Incremental TypeScript is approved. |
| Acceptance criteria | One canonical approved/draft/hidden content inventory; Master's recorded as completed July 2026; no current-student, Junior-led main-brand, SaaS-led hero, or Planify online-payment/Polar claim; visible UI and AI draw from the same published facts; canonical CV path and credential metadata exist; build, lint, typecheck, and focused tests pass; deployment/runtime assumptions are documented. |
| Tests/validation | `npm run build`, `npm run lint`, typecheck, content/prompt validation tests, CV link check, and local Vercel-function smoke test. |
| Performance | Preserve or improve current core bundle; no 3D runtime added. |
| Risks | User confirmations delay work; broad refactor could accidentally change presentation. Keep changes data-focused. |

### Phase 1 - Content and design foundation

| Field | Plan |
|---|---|
| Objective | Establish the final semantic page, tokens, typography, navigation, and responsive layout foundation. |
| Exact scope | New information architecture, self-hosted fonts, tokens, global focus, skip link, desktop/mobile nav, DOM-only section shells, approved copy, no canvas. |
| Likely files | `src/styles/*`, `src/components/navigation/*`, `src/sections/*`, `index.html`, `shared/portfolio.*`. |
| Dependencies | Phase 0 content; approved typography assets. |
| Acceptance criteria | All sections exist in final order; keyboard/mobile nav works; hero identity and CTA clear; no stale copy; no horizontal overflow. |
| Tests/validation | Build/lint/typecheck; component keyboard tests; Playwright anchors/menu/zoom/viewports; contrast checks. |
| Performance | Core JS <= approximately 140 kB gzip target; fonts within budget; zero 3D dependency in initial chunk. |
| Risks | Visual foundation may feel plain before 3D; review structure/typography on its own merits. |

### Phase 2 - Hero foundation and scene fallback

| Field | Plan |
|---|---|
| Objective | Deliver the final DOM hero and a polished static/no-WebGL composition. |
| Exact scope | Hero copy hierarchy, Explore My Work, Ask My AI launcher hook, CV path, responsive layout, placeholder/static fallback, scene error boundary and capability contract. |
| Likely files | `src/sections/Hero/*`, `src/components/media/*`, `src/hooks/useReducedMotion.*`, fallback asset paths. |
| Dependencies | Phase 1; confirmed hero copy and asset direction. |
| Acceptance criteria | Hero succeeds with JS scene not loaded, WebGL disabled, slow network, reduced motion, and mobile; 5-10 second comprehension test passes. |
| Tests/validation | Viewport screenshots, keyboard order, no-WebGL simulation, slow 3G/throttling, reduced motion. |
| Performance | Critical hero has no blocking 3D; static asset tightly compressed; dimensions reserve layout. |
| Risks | Fallback may diverge from later scene; derive it from the same approved composition. |

### Phase 3 - 3D hero foundation

| Field | Plan |
|---|---|
| Objective | Establish the robust technical and visual foundation for the meaningful developer-workspace scene without weakening the Hero. |
| Exact scope | One lazy R3F canvas, procedural workstation, Planify monitor, system nodes/links, materials, lighting, baseline animation/interaction hooks, adaptive quality, context failure, and lifecycle controls. Phase 3 proves the architecture; Phase 3B owns the signature interaction refinement. |
| Likely files | `src/three/*`, `src/hooks/useSceneQuality.*`, `src/data/scene.*`, Hero scene boundary. |
| Dependencies | `three`, R3F v9, selected Drei; no GSAP required until transition if CSS/R3F state suffices. |
| Acceptance criteria | One canvas; stable 60 fps target on representative desktop and acceptable 30+ fps reduced tier; no content dependency; correct full/reduced/static contracts; no context leaks after navigation/HMR. |
| Tests/validation | Performance profiles, `renderer.info`, context-loss test, reduced/mobile/static tiers, tab visibility, memory repeat test. |
| Performance | Enforce draw/triangle/DPR/light/texture budgets; pause offscreen/hidden. |
| Risks | GPU variability, StrictMode lifecycle issues, material overdraw. Downgrade early and avoid postprocessing. |

### Phase 3B - Interactive Hero & Motion Language

| Field | Plan |
|---|---|
| Objective | Refine the technically completed 3D Hero into the first signature interactive experience and establish the motion language used by later phases. |
| Exact scope | Stronger layered pointer response; damped scene/camera depth; intentional canvas entrance; meaningful workstation idle animation; moving data nodes; connection/data-flow pulses; restrained interface/system micro-animation; localized reactions; subtle Hero exit/recession behavior; full-quality desktop tuning; a significantly calmer reduced tier; and preservation of static/reduced-motion/no-WebGL behavior. Do not implement the full Hero-to-Planify handoff; Phase 4 owns that coordinated transition. |
| Likely files | Existing `src/three/*`, scene configuration, Hero scene boundary, and existing motion/quality hooks. No new canvas or architecture redesign. |
| Dependencies | Completed Phase 3 foundation and accepted Hero DOM/fallback. Prefer current R3F/Three primitives and `useFrame` before any additional runtime dependency. |
| Acceptance criteria | The Hero clearly feels alive in real desktop use; pointer response is perceptible without cursor chasing; motion communicates a connected software system; full/reduced/static tiers remain correct; reduced motion and no-WebGL states remain intentional; approved performance targets hold; short-laptop and mobile usability remain intact. |
| Tests/validation | Performance and renderer diagnostics; pointer/idle/initial-scroll review; keyboard and CTA checks; reduced-motion/no-WebGL/context-loss tests; short-laptop/mobile layouts; and a short real-browser screen recording showing entrance, idle behavior, pointer response, and initial scroll recession. Screenshots remain required for layout/fallback states but do not prove motion quality. |
| Performance | Stay within existing draw-call, triangle, DPR, lighting, texture, bundle, and frame-rate budgets; pause offscreen/hidden; use reduced node/update counts outside full quality. No postprocessing unless separately justified by measured visual benefit and budget evidence. |
| Risks | Over-amplified interaction can distract from copy or regress GPU cost. Tune in live review against perceptibility, smoothness, hierarchy, responsiveness, semantic purpose, and recruiter comprehension. |

### Phase 4 - Planify flagship storytelling

| Field | Plan |
|---|---|
| Objective | Make Planify the unmistakable proof-point produced by the Developer Universe and the portfolio's primary cinematic product story. |
| Exact scope | Short reversible Hero-to-Planify WebGL/DOM synchronization; converging system paths; bounded camera dolly; monitor-to-DOM perspective handoff; large readable case-study DOM; layered screenshot/product-story reveals; verified problem/role/capability/architecture/delivery sequencing; and confirmed live link. No fabricated functionality or topology. |
| Likely files | `src/sections/PlanifyFlagship/*`, `src/three/scenes/*`, project data/assets, GSAP timeline module. |
| Dependencies | Approved Planify claims/screenshots; GSAP/ScrollTrigger. |
| Acceptance criteria | Section works without canvas; transition is short, reversible, synchronized, and memorable; DOM content remains readable without animation; screenshots remain useful; all claims are approved; Planify dominates hierarchy and feels like an explored software product rather than a large card. |
| Tests/validation | Scroll both directions, anchor jump, resize/refresh, reduced motion, slow image, link/alt testing, and a short real-browser recording showing the complete Hero-to-Planify handoff and stable responsive/reduced alternatives where relevant. |
| Bundle/chunk discipline | Treat the completed Phase 3 lazy 3D scene baseline of approximately 244.44 kB gzip as already near the approximately 250 kB target. Preserve lazy loading and deliberate code splitting. Where practical, keep GSAP/ScrollTrigger and transition choreography in a selective, lazily loaded transition/animation chunk rather than silently folding that cost into the 3D scene/runtime chunk. Report core initial JS, the 3D scene/runtime chunk, and the transition/animation chunk separately before and after Phase 4. Optimize first or obtain explicit approval before accepting a meaningful budget regression; do not weaken the existing targets simply to accommodate GSAP. |
| Performance | Limit pinned/scrub distance; lazy-load additional screenshots; use selective GSAP/ScrollTrigger imports and load transition code only when appropriate; add no extra canvas. |
| Risks | Transition alignment across aspect ratios; build breakpoint-specific scene states rather than one brittle timeline. |

### Phase 5 - Selected Work

| Field | Plan |
|---|---|
| Objective | Present BarberSpot and charging-station work with premium but secondary weight. |
| Exact scope | Two project stories/cards, confirmed status/role/stack/capabilities, real screenshots or intentional diagrams, restrained scroll entrances, image masks/reveals, content-state transitions, and fine-pointer depth/tilt with touch/focus equivalents. |
| Likely files | `src/sections/SelectedWork/*`, shared project data, `public/projects/*`. |
| Dependencies | Confirmed project details and assets. |
| Acceptance criteria | Clear status/CTA; no generic placeholder; premium tactile behavior with keyboard/touch parity; motion reveals evidence; no competition with Planify. |
| Tests/validation | External links, missing-image fallback, card keyboard behavior, mobile layout. |
| Performance | Lazy assets; no large video; CSS transform only for tilt. |
| Risks | Missing assets/claims. Use honest architecture visuals and shorter copy rather than fabrication. |

### Phase 6 - Engineering System Map

| Field | Plan |
|---|---|
| Objective | Deliver a signature interactive software-system map that demonstrates evidence-based capability relationships. |
| Exact scope | Central Full-Stack core; connected Frontend, Backend/API, Data, Mobile, AI, Engineering/Delivery, and Languages groupings; semantic DOM nodes; SVG paths; bounded assembly/reveal; related-node/path propagation on hover/focus/tap; evidence detail panel; and mobile accordion/list. No second WebGL canvas. |
| Likely files | `src/sections/EngineeringStack/*`, capability data, SVG utilities. |
| Dependencies | Confirmed stack/evidence and the Phase 3B motion language; GSAP only if synchronized composition/reveal materially benefits from it. |
| Acceptance criteria | The map feels like a functioning system; related capability paths visibly respond; all data remains accessible without hover/SVG; keyboard/focus/touch parity is strong; node prominence matches evidence; Languages presents JavaScript, TypeScript, Python, and Java with equal primary treatment without inventing experience or projects; unconfirmed technologies are absent. |
| Tests/validation | Keyboard, touch, screen-reader labels, high contrast, reduced motion, 200% zoom, and a short real-browser recording showing entry, hover/focus/tap propagation, evidence changes, and the mobile/responsive alternative where relevant. |
| Performance | Bound SVG line/node counts and animation work; no second WebGL canvas; stop entry animation after reveal and update only on meaningful interaction. |
| Risks | Visual complexity/readability. Default to clear categories and progressive disclosure. |

### Phase 7 - Journey and Credentials

| Field | Plan |
|---|---|
| Objective | Tell the professional progression and add verified continuous-learning proof. |
| Exact scope | Integrated connected journey path expressing Business understanding → IT systems → Software engineering → Product development; restrained staged evidence and section-state transitions; confirmed IT/education copy; three credential cards; image optimization; accessible certificate viewer. |
| Likely files | `src/sections/Journey/*`, `src/sections/Credentials/*`, dialog component, `public/certificates/*`. |
| Dependencies | Final Journey wording and relevant employment/education details; local placement of the certificate images already supplied externally. Certificate verification URLs are optional and do not block this phase. |
| Acceptance criteria | The progression is visibly connected rather than a sequence of generic cards; no stale MSc wording; IT background has meaningful context; motion preserves reading order; modal supports focus/Escape/mobile/original; metadata remains if image fails. |
| Tests/validation | Dialog accessibility, certificate image/link fallback, mobile/zoom, date/content checks. |
| Performance | Lazy thumbnails/full images; decode only opened certificate where practical. |
| Risks | Raw certificate aspect/quality and personal data visible in images; review/crop only with authorization. |

#### Phase 7 implementation record - 2026-09-01

- Journey uses one semantic four-stage progression in canonical order: Business foundation → IT / systems foundation → Software engineering → Product development.
- Public narrative copy lives in `shared/portfolio.ts` and remains first-person. Stage 01 uses the confirmed `Master’s degree in Business Administration` title without publishing unresolved institution/date details; the IT stage names no employer or dates; Stage 03 uses the canonical `Master of Science in Informatics Engineering` / `Completed July 2026` wording; product development is presented as current practice rather than fabricated employment.
- Desktop progression uses `IntersectionObserver` to activate the stage nearest the reading zone and advances one decorative CSS path. It adds no canvas, animation package, pinned scroll region, scroll hijacking, or permanent animation loop.
- Mobile uses normal vertical reading with a simple continuous route rather than compressed desktop geometry. Reduced motion renders the full hierarchy without reveal movement.
- Credentials render exactly the three canonical 2026 Udemy records with provider, instructors, completion date, and duration. Older generic courses, language proficiency claims, and verification links remain omitted.
- The certificate viewer is implemented as an accessible modal dialog for credentials whose canonical asset status is `available`: explicit button, initial close-button focus, focus containment and return, Escape/close handling, inert background, mobile viewport fit, uncropped scrollable image, original-image link, and metadata-preserving load failure behavior.
- The three genuine Udemy source images are present at the semantic paths in Section 14.4. Each is a 1600×1190 JPEG, is marked `available` in canonical data, and enables its real preview and viewer trigger. Visible certificate IDs and `ude.my` URLs remain inside the inspectable source images only; no separate verification CTA is published because verification URLs are not canonical public metadata.
- Raw ATC certificate material remains unpublished because it contains personal information. It does not add public credential metadata or supply canonical Journey facts.

### Phase 8 - AI Assistant redesign and endpoint hardening

| Field | Plan |
|---|---|
| Objective | Deliver one reliable recruiter-focused assistant across hero, section, nav, and floating entry points. |
| Exact scope | Shared chat provider/hook, one panel/dialog, suggested prompts, focus/error/retry behavior, prompt builder from canonical data, request validation, timeout, rate-limit integration, model env config, and a transition from the established AI/system node and data-line motif into the interactive assistant surface. |
| Likely files | `src/components/ai/*`, `src/hooks/usePortfolioChat.*`, `src/sections/AiAssistant/*`, `api/chat.*`, `api/_lib/*`. |
| Dependencies | Confirmed profile, approved provider/model/rate-limit choice; existing Markdown libraries retained. |
| Acceptance criteria | The assistant feels native to the Developer Universe rather than attached as an unrelated widget; one shared session; accessible dialog behavior; multilingual tests; no stale answer; bounded requests; safe failures; key remains server-only; AI-offline path still gives CV/contact. |
| Tests/validation | API unit tests, mocked upstream, English/Albanian/Italian manual prompts, prompt injection cases, timeout/429/5xx/empty reply, keyboard/dialog. |
| Performance | Lazy-load chat Markdown UI if beneficial; no request until user acts; bounded history. |
| Risks | Model availability/cost, prompt injection, privacy, latency. Feature must fail gracefully and never be required to read profile data. |

#### Phase 8 implementation record - 2026-09-02

- One page-level `AssistantProvider` owns the conversation messages, shared draft, pending request, visitor-safe error, retry target, and new-conversation action. The AI section and floating modal are presentation surfaces over that single controller; they do not synchronize independent chat arrays.
- The session is intentionally memory-only for the lifetime of the mounted page. Scrolling, opening/closing the floating assistant, and moving between entry points preserve it. A refresh starts a new conversation. No `localStorage`, `sessionStorage`, account identifier, analytics identifier, or permanent conversation storage was added.
- Entry behavior is deliberate: Hero `Ask My AI` opens the compact modal; the deferred floating launcher opens the same modal; navigation `Ask AI` lands on the richer inline AI section. None of these actions resets the session.
- `New conversation` is available on both surfaces. It clears the shared messages, draft, error, retry target, and pending state everywhere, and aborts the browser request if one is active. Opening or closing the modal never invokes it.
- The client permits one active request. A synchronous controller guard and disabled shared composer prevent repeated Enter/click submissions and cross-surface duplicates; no request queue or automatic provider retry was added.
- Client history uses a deterministic recent suffix bounded to 12 messages and 8,000 total characters. If bounding would leave an orphaned leading assistant reply, that reply is removed. Each visitor message is capped at 1,500 characters, and the visible shared history is bounded by the same policy without a fabricated summary.
- `/api/chat` accepts only JSON object bodies with a non-empty `messages` array, only `user` and `assistant` roles, text content with no unsupported control characters, and a final `user` message. A client `system`, `developer`, or `tool` role is rejected; the canonical system prompt remains server-owned.
- Server request limits are 16 KiB serialized body, 12 messages, 1,500 characters per message, and 8,000 total message characters. Returned assistant text is capped at 1,500 characters. The upstream request retains `max_tokens: 300` and has a 12-second abort timeout.
- `openrouter/free` remains the only router/model identifier. No paid or silent fallback was introduced. Automated tests mock `/api/chat` or the upstream `fetch` and consume no OpenRouter quota.
- Errors distinguish local/request validation, oversized content, connection failure, and temporary service unavailability. Raw provider bodies, stack traces, routing details, and keys remain hidden. Retry is visitor-initiated and reuses the failed bounded request without appending a duplicate user message; contact remains available as a non-AI fallback.
- The production and localhost CORS allowlist is unchanged. `OPENROUTER_API_KEY`, the system prompt, provider endpoint, and router configuration remain server-side. Markdown still renders without raw HTML and external answer links use safe new-tab attributes.
- A globally reliable rate limit was not fabricated with serverless instance memory. Phase 8 relies on strict body/history limits, one client request at a time, the upstream timeout, and the existing free-router allowance. Platform-level firewall/rate limiting or a durable shared store remains an explicit production-infrastructure item for Phase 12 if traffic requires it.
- The floating presentation is modal: focus enters the composer, Tab is contained, Escape and the explicit close action dismiss it, focus returns to the launcher, and background/page scroll is inert while open. The inline section remains non-modal. Mobile rules cover safe-edge spacing, 16 px composer text, viewport-height fitting, short landscape, nested-message overscroll containment, and reduced motion.

### Phase 9 - Contact, footer, SEO, and global polish

| Field | Plan |
|---|---|
| Objective | Let the software system settle into a calm, strong professional contact path and complete metadata. |
| Exact scope | `Let's build something useful.` contact section; deliberate reduction of motion, depth, and system complexity; confirmed channels; footer; OG/canonical/JSON-LD decision; favicon; no-JS fallback; copy polish. |
| Likely files | Contact/Footer sections, `index.html`, public icons/OG asset, shared contact data. |
| Dependencies | Confirmed public contact channels, canonical domain, social profiles. |
| Acceptance criteria | The ending feels intentional and human; email/LinkedIn/CV are easy to find; motion supports rather than competes with the CTA; no unconfirmed response-time/availability claim; metadata preview correct; brand returns top. |
| Tests/validation | Mail/link/CV targets, metadata validators, favicon/social preview, keyboard, noscript review. |
| Performance | OG assets not page-loaded; contact has no form/runtime dependency. |
| Risks | Public phone/privacy choice; stale production URL. Block canonical/JSON-LD fields until confirmed. |

#### Phase 9 implementation record - 2026-09-15

- The closing section uses the approved invitation `Let's build something useful.` as its heading, with a single calm paragraph, one primary `Email me` action, a quiet `Download CV` action, and a flat channel list. Contact deliberately steps down in intensity after the assistant: one hairline gradient seam marks the AI-to-Contact transition, and no new signature interaction, accent spike, or motion was introduced.
- Published contact channels are email, location (`Tirana, Albania`), and LinkedIn, plus the existing CV asset. Contact copy, channel labels, and both call-to-action labels now live in `portfolio.contactNarrative` so the section, the assistant context, and the no-JS fallback share one source.
- **Phone remains unpublished.** The stored number is only `repository-current`, and public phone visibility is still the unresolved gate in Section 30.1 question 2. The channel is retained in canonical data as `public: false` / `status: 'draft'` / `verificationStatus: 'needs-confirmation'`, so a later confirmation is a status change, not a code change. Unpublishing makes the question moot for the release; it does not answer it. No availability, response-time, or role-preference claim was added.
- `validatePortfolio` enforces the decision by status rather than by hardcoding the unresolved answers: **no contact channel whose `verificationStatus` is `needs-confirmation` may be published**, which is what currently keeps phone off the page. Confirming a channel is the only change needed to publish it; nothing declares that a phone can never be public. The validator gained one general quality rule, a meta-description length bound, and `contactNarrative` and `metadata` are now included in the forbidden-public-pattern screening. `metadata.canonicalUrl` is deliberately **not** asserted in the validator: its current `null` value is verified as present-state in `tests/e2e/phase9.spec.ts`, so populating it once the domain is approved needs no validator change.
- **Canonical URL decision: omitted.** No approved canonical portfolio domain exists (Section 30.1 question 6). `metadata.canonicalUrl` is `null`, and both `<link rel="canonical">` and `og:url` are absent. The two origins in the API CORS allowlist are deployment hosts, not an approved canonical address, and were not published as one.
- **JSON-LD decision: omitted.** The Phase 9 risks row directs that canonical and JSON-LD fields stay blocked until confirmed. With `url`/`@id` unavailable (Section 30.1 question 6) and `sameAs` ungated (Section 30.6 question 1), the remaining Person fields would only duplicate the title, meta description, and visible copy. A Playwright assertion keeps `application/ld+json` at zero so the omission is deliberate and visible.
- Title and Open Graph values are generated from canonical data through the existing `transformIndexHtml` plugin, so no metadata string is hardcoded in `index.html`. Published set: `title`, `description`, `author`, `theme-color`, `color-scheme`, `og:type`, `og:site_name`, `og:title`, `og:description`, `twitter:card=summary`, `twitter:title`, `twitter:description`, and the favicon links. No `twitter:site` was invented. The meta description was refined from the third-person assertion form to `Portfolio of Franci Hoxha, ...` and now ends on the approved `from idea to production`.
- **No social image is published.** `og:image` and its structured `type`/`width`/`height`/`alt` fields, `twitter:image`, and `twitter:image:alt` are all omitted, because a reliable absolute URL for them requires the canonical domain. A root-relative image path was considered and rejected: relative Open Graph image URLs are not reliably resolved by every platform, so it is a workaround rather than a correct value, and a temporary Vercel or GitHub Pages URL was not substituted. For the same reason `twitter:card` is `summary`, not `summary_large_image` - the card must not claim a large image preview it cannot supply. The prepared 1200x630 card remains a static asset in `public/`, regenerated by `npm run generate:social`, ready to be referenced as an absolute URL once the domain is approved.
- `public/og-image.png` (1200x630, prepared but unpublished), `public/apple-touch-icon.png` (180x180), and `public/favicon-48.png` are generated by `npm run generate:social` from the same design tokens and self-hosted brand fonts the site uses. Playwright was already a dev dependency, so this adds no runtime or build dependency, and the committed bitmaps keep a reproducible recipe. None of these files is loaded by the page.
- `public/favicon-fh.svg` was retoned from the superseded warm/serif mark to the current surface, violet-to-cyan edge, and display typeface.
- The no-JS fallback is generated from canonical data inside `<noscript>` and carries the identity, hero statement, capability line, summary, the closing invitation, every public channel, and the CV. Its styles are inline and scoped so it stays legible whether the app stylesheet is extracted (production) or injected by script (dev), and it collapses the empty `#root`, whose `min-height: 100vh` would otherwise push the fallback below the fold.
- The fixed assistant launcher no longer overlaps the closing flow: the footer reserves launcher height plus the bottom safe-area inset at every width. A Playwright check compares the launcher box against every `#contact` and footer link at 320, 360, 375, 390, 430, 768, and short landscape, so the collision cannot silently return.
- Footer behavior is unchanged in intent and more complete in execution: the brand returns to the top with an explicit accessible name, the published sections repeat, and the closing line carries the professional title and a rendered copyright year.
- The targeted public-copy review found no stale third-person self-description, audit/governance wording, animation or design-brief language, student wording, or Java-secondary wording in published copy. The third-person phrasing inside the assistant surfaces (`Ask about Franci's work`, `Ask about his projects...`) was reviewed and kept: there the assistant speaks about its subject rather than Franci describing himself.
- Phase 9 added no contact form and no runtime or backend dependency. Page-load cost is `index.html` +4.67 kB raw / +1.43 kB gzip, CSS +0.96 kB raw / +0.18 kB gzip, and the main JS chunk +2.15 kB raw / +0.69 kB gzip against the Phase 8 baseline; the WebGL, transition, and font chunks are byte-identical.
- Audit byproduct handed to Phase 10: under the root-`zoom` 200% approximation at a 1280 px viewport the document reports horizontal overflow that does not reproduce at any real viewport width. **Phase 10 diagnosed this and corrected the attribution:** the overflow comes from `nav.site-nav` and its Download CV link, because `style.zoom` does not re-evaluate media queries and leaves the desktop header rendered inside a half-width layout. `.planify-handoff-frame` appears in the offender list only at 1440 px, where `scrollWidth === clientWidth` and there is no overflow at all, so Planify was never the cause. `tests/e2e/phase1.spec.ts` was corrected in Phase 10 to use a halved viewport, matching `tests/e2e/phase9.spec.ts`.
- Open after Phase 9: the canonical production domain and deployment topology (Section 30.1 question 6), public phone visibility (Section 30.1 question 2), and an approved `sameAs` profile (Section 30.6 question 1). The CV remains published at its existing `/Franci-Hoxha-CV.pdf` path, unchanged.

### Phase 10 - Global motion, performance, and accessibility hardening

| Field | Plan |
|---|---|
| Objective | Treat performance/accessibility as release gates while completing a coherent global motion and interaction-quality pass. |
| Exact scope | Bundle analysis, image/font/model optimization, adaptive thresholds, focus/contrast/motion audit, memory/frame profiling, fallbacks, cross-section timing/hierarchy tuning, and confirmation that WebGL, DOM, SVG, typography, scroll, and microinteractions feel like one system. |
| Likely files | Across app; quality config; asset pipeline; test config. |
| Dependencies | All main sections feature-complete. |
| Acceptance criteria | Budgets/targets met or documented tradeoff approved; no critical WCAG issue; no persistent offscreen rendering; stable memory; motion is perceptible, smooth, purposeful, responsive, coherent, and non-distracting across the full page. |
| Tests/validation | Lighthouse checkpoints, axe signals, screen reader, keyboard, CPU/network throttling, GPU profiling, context-loss, and a short real-browser recording of the complete global motion/polish pass including idle, pointer, scroll, and representative responsive behavior. |
| Performance | This phase owns final enforcement of Section 21. |
| Risks | Late visual cuts. Measure in every earlier phase to avoid a last-minute downgrade. |

#### Phase 10 implementation record - 2026-09-16

Measured on Windows 11, Chrome (Playwright `channel: 'chrome'`), local `vite preview`. Lab numbers on one machine, not field data.

- The audit measured before changing anything, and most of Section 21 was already satisfied by the Phase 3-9 architecture. Core initial JS is 129.8 kB gzip against a 140 kB target (`index` 125.17 + `jsx-runtime` 4.61); the lazy 3D runtime is 247.5 kB gzip against a 250 kB target; GSAP/ScrollTrigger is a separate 45.75 kB gzip chunk loaded on proximity, not initially. Desktop draw calls are 33 against a <100 target, four textures, one canvas, DPR clamped at 1.75. LCP 728 ms desktop and 1.57 s on an emulated Pixel 7 at 4x CPU throttling, both inside the 2.5 s target. CLS 0.0052 against a 0.1 target, helped by explicit `width`/`height` on every image.
- Initial critical image transfer is one 156 kB request for `/planify-preview.png`, inside the 300 kB budget. An earlier 313 kB reading was an artifact of disabling the HTTP cache in the audit harness. Three `<img>` nodes share that single URL because the accepted Phase 4 transition needs an origin (`[data-planify-origin-screen]`), a moving handoff frame, and a target (`[data-planify-target-screen]`); CDP shows one 160,097-byte download plus a 179-byte revalidation caused by `vite preview` sending no immutable cache headers. No node was removed and no `srcset` was added: one shared decode across three slots is cheaper than three per-slot variants.
- Offscreen behavior is correct. `useSceneActivity` combines an IntersectionObserver with `visibilitychange`, and `FrameLoopController` sets R3F `frameloop` to `never` when inactive. Verified by sampling `data-scene-idle-tick`, which only advances when frames are produced: it moved 30 -> 115 with the hero visible and stayed at 131 across 1.2 s with the hero offscreen. An earlier `requestAnimationFrame` counter showed 241/s in both states and proved nothing, because rAF keeps ticking for the page regardless of the renderer.
- Under `prefers-reduced-motion: reduce` the page downloads no 3D chunk, mounts no canvas, uses 5 MB of heap instead of 14 MB, and transfers 406 kB instead of 803 kB. Forced-colors rendering keeps the heading, primary CTA, and footer usable on the static fallback.
- **Accessibility fix 1 - assistant composer focus indicator.** `src/index.css` set `.chat-input:focus { outline: none }`, which removed the global `:focus-visible` ring from the Phase 8 composer and left only a `rgba(130, 112, 255, 0.32)` border as the focus affordance. A 70-stop keyboard traversal found it as the single control on the page without a visible indicator (WCAG 2.4.7). A `.chat-input:focus-visible` rule now restores the same `--focus-ring` outline every other control uses; the mouse-click behavior the original rule protected is unchanged.
- **Accessibility fix 2 - Planify caption contrast.** `.planify-browser figcaption` used `--color-text-subtle` (`#717a90`) on its own opaque `#0c111b` bar at 0.68 rem, measuring 4.40:1 against the 4.5:1 requirement (WCAG 1.4.3). A new `--color-text-subtle-raised` token (`#7b8499`, 5.04:1 on that panel) is applied only there. The global `--color-text-subtle` is unchanged because it measures well above AA on the page background everywhere else it is used, and the caption's sibling span keeps `--color-text-muted` at 8.31:1 so the intended hierarchy survives.
- **Test methodology correction - 200% zoom.** `tests/e2e/phase1.spec.ts` set `document.documentElement.style.zoom = '2'`. That scales layout boxes but leaves media queries evaluating against the unzoomed viewport, so at 1280x800 the desktop header stayed rendered inside a half-width layout and reported a 1421 px document overflow. The offenders were `nav.site-nav` and its Download CV link, **not** Planify: at 1440 px under the same technique `scrollWidth === clientWidth`, so `.planify-handoff-frame` appearing in that offender list was never an overflow at all. This corrects the Phase 9 record, which attributed the artifact to Planify. Real browser zoom halves the CSS viewport and re-evaluates media queries, so the test now uses a halved viewport at `deviceScaleFactor: 2`. At 720x450, 640x400, and 320x512 the document does not scroll horizontally at any section. **No product layout was changed to satisfy the artificial condition.**
- Reviewed and found sound, recorded so they are not re-chased: exactly one top-level `header`, `footer`, and `main` (a raw count of 18 `<header>` elements counts section-scoped headers, which are not `banner` landmarks); the assistant composer is named by `<label for>` and exposes as `textbox "Ask the portfolio assistant"`; one `h1` with no heading-level jumps across 35 headings; no positive `tabindex`; the canvas is inside an `aria-hidden` slot; no CSS rule reveals content only on `:hover`; no control is under 24 px at 320 or 390; and every contrast entry measuring 1.0 was dark text on a light violet gradient, which `backgroundColor` cannot describe.
- `tests/e2e/phase10.spec.ts` locks all of this in: offscreen frame-loop halt via `data-scene-idle-tick`, renderer budgets, no 3D under reduced motion, the initial image budget, a focus indicator on every keyboard stop, an alpha-composited AA contrast sweep over the whole page, real-zoom reflow at 720/640/320, WCAG 2.2 target sizes at 320 and 390, forced colors, and the landmark/heading/tabindex structure.
- Adding ten context-heavy gates pushed the browser suite past what eight concurrent Playwright workers schedule reliably on this machine: specs failed intermittently, in a different file each run, while passing in isolation, and a three-run baseline at `bb186b4` in an isolated worktree was clean at 117 tests in 44 s. The gates were first made cheaper - the keyboard traversal now records stops through one in-page `focusin` listener instead of a round trip per stop, reflow checks two widths rather than three, and target sizing checks the binding 320 px width that `phase6-mobile-audit` does not already cover in detail - and `playwright.config.ts` now uses four workers. Four consecutive full-suite runs pass at 127 tests in 59 s. The extra wall time buys determinism; no accepted spec was weakened to make the suite green.
- `tests/e2e/phase10-evidence.spec.ts` captures the Section 28.5 acceptance material: video of idle, pointer interaction, scrolling through the Hero-to-Planify transition and reversing direction, the reduced-motion alternative, and a mobile pass, plus full-page stills, real 200%/400% reflow, short landscape, and the restored composer focus ring. It is gated behind `PHASE10_EVIDENCE=1` and run by `npm run evidence:phase10` on a single worker, matching the existing Phase 3B and Phase 4 motion-evidence convention. Running video capture inside the default parallel suite saturated the machine and produced unrelated timing failures in three different specs across three runs; gating it restored two consecutive clean full-suite runs.
- Deferred as optional/future with measurements, not silently dropped: the three certificate JPEGs total 608 kB and are lazy-loaded, but recompressing them would modify certificate originals, which this task forbids; `public/og-image.png` is 380 kB and never page-loaded; the emulated Pixel 7 at 4x CPU throttling shows 1,814 ms across five long tasks, which would need hydration restructuring to address and has no field data behind it; and under reduced motion the GSAP chunk still loads only to bypass itself, costing 45.75 kB gzip. Gating that import was considered and rejected for this phase - the reduced branch also runs `measure()`, `applyProgress(...)`, and the overlay construction that live inside the module, so replicating it outside would duplicate accepted Phase 4 layout logic and risk a broken hero for exactly the users the change would target, and GSAP `matchMedia` is currently what handles a runtime reduced-motion change that `tests/e2e/phase3.spec.ts` exercises.
- Preserved unchanged: one R3F canvas, the StrictMode lifecycle patch, native scroll, the Hero-to-Planify story, Selected Work, the Engineering System Map, Journey/Credentials, the unified Phase 8 assistant session, Phase 9 contact/footer/SEO behavior, `openrouter/free`, and every progressive-enhancement fallback. No framework, state library, animation system, SSR, or prerendering was introduced. Bundle impact is CSS only: 122.89 -> 123.01 kB raw, 23.68 -> 23.72 kB gzip. Every JavaScript chunk is byte-identical.

### Phase 11 - Cross-device QA

| Field | Plan |
|---|---|
| Objective | Validate the complete experience on real browsers, input types, and device classes. |
| Exact scope | Chrome, Firefox, Safari/WebKit, Edge; phone/tablet/laptop; touch, mouse, keyboard; zoom; orientation; slow network; AI and fallback paths. |
| Likely files | Test fixes only; Playwright projects/visual baselines. |
| Dependencies | Production-like preview and stable assets. |
| Acceptance criteria | No overflow, blocked navigation, unusable interaction, browser-specific scene failure, or content disparity. |
| Tests/validation | Full matrix in Sections 19/28; real-device smoke tests prioritized for iOS Safari and Android Chrome. |
| Performance | Record frame time/quality tier on representative devices. |
| Risks | Safari/WebGL/font differences; leave time for quality-specific fixes, not hacks. |

### Phase 12 - Production readiness

| Field | Plan |
|---|---|
| Objective | Ship a reproducible, observable, rollback-safe release. |
| Exact scope | Production env validation, final content freeze, security headers/CORS/rate limits, analytics only if approved, error monitoring only if approved, README/deployment docs, preview sign-off. |
| Likely files | Deployment config if needed, README, env example, final metadata, tests. |
| Dependencies | Approved domain/provider/model/privacy choices. |
| Acceptance criteria | Build/lint/typecheck/tests pass; preview accepted; secrets absent from bundle/repo; AI limits active; rollback path known. |
| Tests/validation | Production smoke tests for page, CV, links, assets, API, rate/failure behavior, metadata, WebGL fallback. |
| Performance | Final Lighthouse and production transfer/cache inspection. |
| Risks | Environment drift and free-model instability; use explicit env/documentation and a controlled rollout. |

## 28. Validation Strategy

### 28.1 Required automated commands

```text
npm run lint
npm run typecheck       # after TypeScript is introduced
npm run test            # after Vitest is introduced
npm run test:e2e        # after Playwright is introduced
npm run build
```

Do not treat the current lint failure as acceptable debt; configure server globals/overrides in Phase 0.

### 28.2 Functional checks

- Desktop Chrome full-page flow.
- Mobile and tablet viewport matrix.
- Menu open/close, Escape, outside click, anchor focus/scroll.
- Explore My Work and brand-to-top paths.
- Planify and BarberSpot link status and new-tab behavior.
- Charging-station CTA semantics.
- CV downloads and opens from every entry point.
- Certificate viewer open/close/focus/zoom/original/failure.
- AI suggestions, free text, shared conversation across entry points, retry, loading, cancellation.
- AI 400/405/413/429/timeout/502/500 and offline behavior.
- English, Albanian, and Italian assistant behavior.
- Contact mailto/LinkedIn and any confirmed phone link.

### 28.3 Accessibility checks

- Keyboard-only full page.
- Visible focus and logical order.
- Screen-reader landmarks/headings/buttons/dialog labels/status messages.
- `prefers-reduced-motion` before load and while running.
- 200% zoom, text spacing, high contrast/forced-colors where practical.
- No content only by hover/canvas/color.
- Axe automated scan plus manual WCAG review.

### 28.4 3D/performance checks

- WebGL unavailable and context-loss fallback.
- Scene asset failure and slow load.
- Document hidden/offscreen render pause.
- Full/reduced/static tier selection and downgrade behavior.
- DPR/draw calls/triangles/textures/programs from renderer diagnostics.
- Repeated mount/unmount/HMR memory test.
- CPU 4x slowdown, slow 4G/3G lab tests, save-data signal where available.
- No horizontal overflow at any matrix size.
- CLS when fonts/images/canvas resolve.

### 28.5 Motion-specific live acceptance

Static screenshots remain required for layout, fallback, responsive, reduced-motion, and stable visual-state verification, but they are not sufficient when interaction is a primary deliverable.

Phase 3B Interactive Hero & Motion Language, Phase 4 Hero-to-Planify transition, Phase 6 Engineering System Map interaction, and Phase 10 global motion/polish each require a short real-browser screen recording or equivalent live review showing:

- Idle behavior.
- Pointer interaction on a fine-pointer device.
- Scroll behavior and direction reversal where applicable.
- Responsive transition behavior or the appropriate reduced/mobile alternative where relevant.

Acceptance evaluates perceptibility, smoothness, timing, hierarchy, responsiveness, semantic purpose, visual quality, and whether the motion feels premium rather than distracting. Review must also confirm that controls remain usable, copy remains readable, motion does not obscure evidence, and reduced/static alternatives preserve the same professional narrative.

### 28.6 SEO/production checks

- Title, description, headings, canonical after confirmation, OG image/card.
- Crawlable rendered project/contact content.
- JSON-LD validator if used.
- No secret or internal token in built assets/source maps.
- Caching/content types for fonts, images, models, CV.
- Lighthouse Performance, Accessibility, Best Practices, and SEO at defined checkpoints.

## 29. Risks and Tradeoffs

| Risk | Consequence | Mitigation/decision |
|---|---|---|
| 3D delays recruiter comprehension | High | DOM hero first, lazy canvas, no loading gate, static fallback. |
| Persistent scene complexity | High | Limit one canvas to hero/Planify zone; pause/unmount later. |
| Mobile GPU variability | High | Reduced/static tiers, adaptive DPR, no postprocessing, real-device QA. |
| Creative ambition overwhelms recruiter comprehension | High | Keep identity, proof, CTAs, and meaning immediate in DOM; tune motion around the reading hierarchy and apply the 5-10 second recruiter test. |
| Continuous scene activity wastes GPU/battery | High | Render continuous activity only while visible and justified in full quality; lower frequency/node count in reduced mode and eliminate it in static/reduced-motion modes. |
| Stale/duplicated claims | High | Phase 0 content freeze and one shared data source/prompt builder. |
| Planify claim overstatement | High | User/source verification; conservative role/capability wording. |
| AI abuse/cost/model failure | High | Limits, timeout, rate control, env model, safe offline/contact fallback. |
| Scroll choreography harms navigation | Medium-high | Native scroll, one short transition, reduced-motion path, no scroll snap/long pin. |
| Motion is technically present but visually imperceptible or generic | Medium-high | Use tunable interaction envelopes and require live-browser recordings for Phases 3B, 4, 6, and 10; evaluate purpose, hierarchy, timing, and memorability rather than screenshots alone. |
| Site becomes an interactive Hero followed by static sections | Medium | Later phases inherit the Phase 3B language through proportional section interaction while reserving signature spatial sequences for a small number of moments. |
| GSAP/R3F lifecycle leaks | Medium | Scoped cleanup, one owner, StrictMode tests, renderer diagnostics. |
| Bundle growth from Three/Drei/GSAP | Medium | Lazy chunks, selective imports, bundle inspection, reject duplicate Motion/Lenis. |
| Secondary project assets are incomplete; supplied certificate images are not yet placed locally | Medium | Gate secondary visuals in Phase 5; place/optimize the already supplied certificate assets in Phase 7 and retain metadata fallback. |
| Incremental TypeScript complexity | Medium-low | Type new boundaries first; do not mass-convert unrelated files. |
| Vercel/GitHub deployment ambiguity | Medium | Confirm canonical topology; document `vercel dev`; explicit same-origin/CORS policy. |
| External font/privacy/latency | Low-medium | Self-host compressed fonts and limit variants. |
| Custom cursor novelty/accessibility | Avoided | Do not include in initial release. |

## 30. Open Questions and Facts Requiring Verification

Phase 0 may begin after this plan reconciliation. The questions below are gates for the public fields or later features they affect, not one global prerequisite list.

### 30.1 Phase 0/Phase 1 public-content gates

These are **NEEDS USER CONFIRMATION** before the affected canonical public content/foundation can be finalized. They do not reopen any confirmed decision and need not prevent unrelated Phase 0 architecture work from starting.

1. What official institution wording may accompany the confirmed `Master of Science in Informatics Engineering` title? Completion in July 2026 is already confirmed.
2. Which current contact fields are approved for public display: email, LinkedIn, Tirana/location, and phone? Phone visibility is specifically unresolved. Availability/role-preference copy should remain null/hidden until separately confirmed.
3. What is Planify's approved current public status, Franci's role/contribution wording, and concise public description?
4. Which Planify capabilities may be stated in the Phase 0 public baseline? Evaluate booking, customer/business/staff workflows, multi-role/RBAC, authentication/authorization, notifications, localization, APIs, MongoDB, responsive/PWA/mobile work, testing, debugging, deployment, and production hardening against current evidence. Online customer payments/prepayments and Polar are excluded as stale, not questioned.
5. For the confirmed capability inventory, what evidence snippets and relative prominence should be published? Exact mobile technology names and project-specific evidence remain unresolved; the broad `Mobile` capability itself is confirmed.
6. What is the canonical production domain and deployment topology: Vercel only, or a separately configured GitHub Pages frontend plus Vercel API?

Phase 0 can represent unresolved fields as draft/hidden/null while establishing the canonical schema. It should not invent temporary public answers.

### 30.2 Phase 4 Planify gates

These are **NEEDS USER CONFIRMATION** before the deeper Planify case study is finalized, but do not block Phase 0:

1. Which specific integrations are current and publishable: Google Maps, Resend, Google Auth, notification mechanisms, localization, analytics, and any multi-location/multi-vendor terminology?
2. Which existing/additional Planify screenshots are approved for publication, and what data must be anonymized?
3. May the portfolio state that Planify is used by real businesses, and is any non-numeric adoption wording approved?

### 30.3 Phase 5 Selected Work gates

These are **NEEDS USER CONFIRMATION** before each secondary case study is finalized, but do not block Phase 0/1:

1. Is BarberSpot currently live, what is Franci's contribution, and what is its relationship to Planify?
2. Which BarberSpot capabilities are current: roles, availability, reminders, notification mechanisms, SMS, WhatsApp, and analytics?
3. Which BarberSpot screenshots/assets may be published?
4. What was Franci's exact role/contribution, date, current status, and approved feature set for the charging-station system? Is a repository/demo or publishable visual available?

If evidence is unavailable, Phase 5 must use honest system/case-study visuals and conservative copy rather than fabricated screenshots or live status.

### 30.4 Phase 7 Journey and Credentials gates

These are targeted **NEEDS USER CONFIRMATION** items for final Journey/Credentials copy; they do not block Phase 0:

1. What was the exact employer/organization or work arrangement for the IT role, and which final dates/responsibility details may be published?
2. Confirm the Business Administration institution wording, city spelling, and dates; the award title `Master's degree in Business Administration` is confirmed.
3. Confirm English/Italian proficiency wording and whether Albanian should be listed.
4. Confirm provider/details for the two older generic courses or omit/de-emphasize them behind the stronger 2026 Credentials.
5. Are there exact public verification URLs for the three supplied certificates? URLs are optional; the certificates, metadata, and externally supplied images are already confirmed.

### 30.5 Phase 8 AI gates

These decisions are important but explicitly **NON-BLOCKING FOR PHASE 0**:

1. Which OpenRouter/provider model tier, monthly cost ceiling, traffic assumption, timeout expectation, retention/logging policy, and failure behavior are approved?
2. Is any fallback model/provider authorized? Do not silently enable a paid fallback.
3. Should availability-related suggested prompts remain hidden, or has current availability been confirmed by Phase 8?

### 30.6 Phase 9/Phase 12 and optional non-blockers

These are **NON-BLOCKING FOR PHASE 0** and should be decided only before the feature that needs them:

1. Is a public GitHub profile or another professional `sameAs` link approved? (Phase 9 SEO/contact)
2. Should the current CV remain at its existing public path until a separately authorized updated CV task, and should a later new path preserve compatibility? (Phase 9/production)
3. Are analytics and/or error monitoring desired, and what privacy/consent constraints apply? (Phase 12)
4. Should the identity remain FH-monogram-only or include an optional professional photo? (visual phase; not a content-architecture blocker)
5. Are optional enhancements such as a pointer aura/custom-cursor experiment worth prototyping after accessibility/performance QA? (post-core polish only)

## 31. Explicit Stale and Inconsistent Content Discovered

### 31.1 Definitely stale/remove

- `src/App.jsx` profile `about`: "I am currently pursuing an MSc in Informatics Engineering..."
- `src/App.jsx` education period: `2024 - Present` for the MSc.
- `api/chat.js` system prompt About: "Currently pursuing an MSc..."
- `api/chat.js` education: `2024-Present` for the MSc.
- CV summary: "Currently pursuing a Master of Science in Informatics Engineering."
- CV education: `2024 - Present`.
- Any Hero/profile/SEO/AI/structured-data wording that presents Franci as a current Master's student.
- Junior-led main portfolio identity, title, or hero positioning.
- SaaS/booking-led hero identity.
- Time-sensitive availability/remote-work claims and `Usually replies within a day` unless separately confirmed at publication time.
- Public Planify online customer-payment/customer-prepayment implications and `Polar for payments`. This is explicitly **STALE / REMOVE**, not an open verification item.

### 31.2 Confirmed replacements

- `Master of Science in Informatics Engineering` **completed July 2026**.
- Public identity: **Franci Hoxha - Full-Stack Software Developer**.
- Main statement: **Building modern software experiences, from idea to production.**
- Capability line: **Web • Mobile • Backend • AI**.
- Planify label: **Flagship Software Project**.
- Reconciled planning capabilities: JavaScript, TypeScript, React, Next.js, HTML, CSS, responsive/PWA-related work, Node.js-style APIs, REST, Python, FastAPI, authentication/authorization, application logic, MongoDB, MySQL, SQL Server, Git, testing, debugging, deployment, production hardening, application integration, troubleshooting, mobile application development, and evidence-grounded AI integration/AI-assisted development.
- Java is a normal primary entry in the Languages group alongside JavaScript, TypeScript, and Python. Equal positioning does not authorize claims about Java employment, production projects, years of experience, or expert-level mastery.
- Credentials: the three confirmed 2026 Udemy entries in Section 14, with externally supplied certificate images approved for later repository placement.

### 31.3 Existing copy that must be rewritten during Phase 0/1

- `src/App.jsx` title and AI title: `Junior Full-Stack Developer`.
- `index.html` title: `Franci Hoxha | Junior Full-Stack Developer`.
- `index.html` meta description leads with Junior and narrows the brand to SaaS/booking.
- Hero availability: `Available for junior & full-stack roles`.
- Hero heading: `I build practical SaaS & booking platforms.`
- Contact: `Open to junior full-stack, frontend, React, Next.js, and internship opportunities.`
- Contact response claim: `Usually replies within a day`.
- Current work intro: `used by real businesses` is unverified.
- Current flagship label: `Flagship SaaS Project` is narrower/riskier than the recommended `Flagship Software Project`.

### 31.4 Incomplete/out-of-sync architecture and content

- The UI and AI prompt omit all three supplied 2026 certificates.
- The certificate images have been supplied externally but are not yet placed in the local repository; Phase 7 owns semantic placement and optimization.
- The CV has no section for the three supplied credentials and contains stale degree/payment wording; update/replacement is a separate future task, not part of Portfolio3D Phase 0 unless separately authorized.
- Visible Courses & Training contains only two generic course names without provider/date/detail.
- `src/App.jsx` and `api/chat.js` duplicate most professional content manually.
- `Hero.jsx` duplicates a core stack independently from `skillGroups`.
- `Navbar.jsx` hard-codes the CV path rather than using `profile.cvPath`.
- `profile.summary` is unused.
- BarberSpot highlights are passed to `ProjectCard` but never rendered.
- The full AI section and floating widget maintain separate histories and duplicate network logic.
- README does not describe the actual portfolio, serverless endpoint, env setup, or Vercel-local workflow.

### 31.5 Still requiring targeted verification

- Official institution wording for the confirmed `Master of Science in Informatics Engineering`; the title and completion date are not unresolved.
- Final public contact visibility, phone visibility, and any time-sensitive availability wording.
- Planify's current status, Franci's role/contribution wording, approved public feature subset, non-payment integrations, terminology, and publishable screenshots.
- Exact mobile technology names and evidence snippets/relative prominence for the confirmed capability inventory.
- Canonical production domain/deployment topology.
- Phase-specific BarberSpot, charging-station, Journey, language, older-course, AI-provider, monitoring, and optional visual decisions listed in Section 30.

### 31.6 CV/app discrepancies and authority rule

- CV includes Python and Java while the original app skills omitted them; both are now confirmed as normal primary entries in the Languages group. This positioning does not establish Java employment, production projects, years of experience, or expert-level mastery.
- CV claims system administration; app uses broader systems operations wording.
- CV claims support for medium-sized and large companies; app omits company scale.
- CV uses `Full-Stack Developer`; the approved replacement is `Full-Stack Software Developer`, while the app still uses `Junior Full-Stack Developer`.
- CV adds Planify multi-vendor/multi-location, real-time notifications, Google Maps, Resend, and Google Auth; these require individual evidence before publication.
- CV's `Polar for payments` wording is stale and must be removed from all future public Portfolio3D data/copy. It is not eligible for reconciliation as a current claim.
- CV says "scalable applications" and "passionate"; these conflict with the new evidence-led tone unless specifically supported/rephrased.
- CV uses Tirane/Tiranë/Korçë variants while app uses Tirana/Korce; exact public spelling should be standardized after confirmation.
- The confirmed public award title is `Master's degree in Business Administration`; institution wording, city spelling, and dates remain unpublished pending separate confirmation.

The current CV remains downloadable and unchanged, but it is not the final authority for shared data, visible copy, AI context, SEO, structured data, or architecture diagrams. Replacing/updating it requires a separate authorized task.

## 32. Final Creative Standard

The finished portfolio must pass all three tests below. Passing only the visual test or only the engineering test is not sufficient.

### 32.1 Recruiter test

Within 5-10 seconds, can a visitor answer:

- Who is Franci?
- What does he build?
- What is Planify?
- Where can I see his work, CV, and contact path?

### 32.2 Engineer test

After deeper exploration, can a reviewer answer:

- Is the work technically credible?
- Do the architecture, performance, and accessibility choices demonstrate engineering discipline?
- Are professional and product claims backed by real evidence?

### 32.3 Creative test

After interacting with the site, can a visitor answer yes to all of the following?

- Does this feel unmistakably designed and engineered rather than assembled from a portfolio template?
- Does the living software-system concept remain memorable?
- Do motion, WebGL, DOM, SVG, typography, and scroll feel like one coherent experience?
- Is there at least one interaction or transition the visitor is likely to remember after leaving?

The final target is **a distinctive interactive software-engineering portfolio with creative-developer/Awwwards-level polish, without sacrificing professional credibility**. A visually extraordinary result is required inside the evidence, semantic DOM, one-canvas, fallback, reduced-motion, accessibility, native-scroll, performance, content-integrity, AI-security, and recruiter-comprehension constraints - never instead of them.

# Next Planned Implementation Phase

Phases 0-10 now constitute the completed foundation, interaction, product-story, capability, Journey/Credentials, shared AI-assistant, closing contact/metadata, and performance/accessibility hardening work recorded in this roadmap. Their architectural rationale remains historical context, not an instruction to restart accepted phases unless a verified integration regression requires a targeted fix.

The next planned implementation step is **Phase 11 - Cross-device QA** as defined in Section 27. Phase 10 - Global motion, performance, and accessibility hardening is complete; its measurements, the two accessibility fixes, the 200% zoom methodology correction, and the deferred optional items are recorded in the Phase 10 implementation record above.
