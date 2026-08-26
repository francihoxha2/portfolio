# Portfolio3D Master Plan

**Project:** Franci Hoxha Portfolio3D
**Document status:** Planning source of truth - implementation is not authorized by this document
**Audit date:** 2026-08-26
**Repository branch audited:** `main`
**Target outcome:** A premium, modern, highly polished interactive 3D software developer portfolio that remains fast, accessible, credible, and easy for recruiters to understand.

> Scope lock: this planning pass does not redesign components, install packages, change source code, replace the CV, delete assets, commit, or deploy. The only repository deliverable from the planning task is this document.

## 1. Executive Vision

The redesign will express **"Franci's Developer Universe"** as a coherent software system rather than a literal space scene. The site should feel like a composed digital environment built from a workstation, product interfaces, data paths, API nodes, restrained lighting, and meaningful system relationships. Every visual device must support a professional message: Franci can understand a problem, build across the stack, ship a product, and explain the result.

The experience must satisfy two reading depths at the same time:

- In the first 5-10 seconds, a recruiter can identify Franci Hoxha, the role **Full-Stack Software Developer**, the breadth **Web • Mobile • Backend • AI**, Planify as the flagship project, the main work CTA, the AI assistant, CV access, and contact access.
- On deeper exploration, an engineering or design reviewer can find project responsibilities, system capabilities, a credible stack, the progression from business and IT operations into software/product development, certificates, thoughtful 3D architecture, and evidence of delivery discipline.

The design standard is **Awwwards-level composition and polish with professional portfolio usability**. It must not become a game, a cyberpunk dashboard, a portfolio of animation tricks, or an interface whose professional content depends on WebGL.

### Non-negotiable product principles

1. **Evidence before spectacle.** DOM content, project proof, and honest claims lead; 3D reinforces them.
2. **Planify leads the work story.** It receives a dedicated flagship presentation rather than another equal card.
3. **One connected journey.** Visual continuity links the hero to Planify and the rest of the page without forcing every section into WebGL.
4. **HTML is the source of meaning.** Recruiter-critical text, links, controls, and headings remain semantic, indexable HTML.
5. **Progressive enhancement.** Identity, navigation, work, CV, AI entry points, and contact remain useful when 3D is loading, disabled, reduced, or unavailable.
6. **Content integrity.** No employer, client, user, scale, integration, certification, date, availability claim, or project capability is published without support.
7. **Performance is a feature.** The first impression cannot wait for a scene, model, font, or AI response.

### Recommended high-level technical direction

- Retain React 19 and Vite.
- Add `three`, React Three Fiber v9 (the React 19-compatible major), and selected Drei helpers.
- Use GSAP plus ScrollTrigger for the limited hero-to-Planify scroll choreography and selected DOM reveals.
- Keep native browser scrolling. Do **not** add Lenis initially.
- Do **not** add Motion initially; GSAP and CSS cover the planned motion system.
- Use one lazy-loaded WebGL canvas for the hero-to-Planify story.
- Build the Engineering Constellation with semantic DOM plus SVG, not a second WebGL canvas.
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
- Use first person in visible portfolio copy and third person in AI context.
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
| Master's degree completion | **CONFIRMED** | Completed July 2026. Present it as a completed journey milestone. |
| Exact official English Master's diploma/program wording | **NEEDS USER CONFIRMATION** | Completion and date are settled; only the exact official English wording remains unresolved. |
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
| Business Administration degree details | **NEEDS USER CONFIRMATION** | Keep the broad journey; verify exact institution, wording, location, and dates. |
| IT troubleshooting/systems background across Windows, macOS, Linux, hardware/software support, backup/recovery, and end-user support | **CONFIRMED** | Use as evidence of systems thinking; exact employer/organization and final public dates remain phase-specific verification items. |
| JavaScript, TypeScript, React, Next.js, HTML, CSS, responsive UI, integration, and PWA-related work | **CONFIRMED** | Present with evidence-led, non-expert wording. |
| Node.js-style APIs, REST, Python, FastAPI, auth, authorization, and application/business logic | **CONFIRMED** | Prioritize project evidence and avoid expert-level claims. |
| MongoDB, database-backed applications, MySQL, and SQL Server | **CONFIRMED** | Use according to demonstrated relevance and prominence. |
| Git, testing, debugging, deployment, production hardening, application integration, and troubleshooting | **CONFIRMED** | Explain actual usage instead of displaying a generic tool inventory. |
| Mobile application development | **CONFIRMED** | Keep Mobile as a top-level capability; exact mobile technologies remain targeted verification before technology-specific copy. |
| AI integration and AI-assisted development | **CONFIRMED** | Ground in the portfolio assistant, software integration, coding workflows, and supplied credentials; do not imply ML/model-training/data-science expertise. |
| Java | **CONFIRMED, SECONDARY** | May remain in the broader inventory but should not match the strongest practical stack's prominence without stronger project evidence. |
| Generic "Software Professional Course" / IT course | **NEEDS USER CONFIRMATION** | Verify provider, completion, and exact title or de-emphasize. |

## 6. Final Information Architecture

### 6.1 Page order

1. **Hero / Developer Universe** (`#top`)
2. **Planify - Flagship Software Project** (`#work`)
3. **Selected Work** (`#selected-work`)
4. **Engineering Stack** (`#stack`)
5. **Experience / Journey** (`#journey`)
6. **Credentials** (`#credentials`)
7. **AI Portfolio Assistant** (`#ai`)
8. **Contact** (`#contact`)
9. **Footer**

This order moves proof directly after identity, then explains capability, progression, selected credentials, the AI differentiator, and contact.

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

- Pointer motion can shift the scene/camera target by a maximum visual angle of roughly 1-2 degrees and translate depth layers by a few pixels.
- Interpolation must be slow and weighted, not direct cursor chasing.
- Disable pointer parallax for coarse pointers, touch, reduced motion, and low-quality mode.
- The scene has subtle idle movement (slow breathing light, slight panel drift, limited data pulses) but no object spins, orbit controls, or user-controlled camera.
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
- With reduced motion, copy is immediately present and the scene is static or near-static.
- With WebGL blocked, the layout remains visually intentional and no empty right-hand hole appears.
- At 320, 375, 390, 768, 1,024, 1,440, and ultrawide widths there is no horizontal overflow or clipped CTA.

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

### 8.2 Material and lighting language

- Base materials: rough dark metal, charcoal polymer, smoked glass used sparingly, low-intensity emissive edges.
- Avoid mirror-like chrome and high-transmission glass across large surfaces.
- One soft key light, one restrained fill/rim source, ambient/environment contribution, and at most one shadow-casting light.
- Prefer procedural lightformers/simple environment lighting over a large HDR file.
- Shadow maps: one, maximum 1,024 px desktop and 512 px reduced/mobile.
- Bloom is not part of the initial implementation. A single subtle bloom pass may be tested later on high-quality desktop only and retained only if measured cost is acceptable.

### 8.3 Geometry and rendering

- Create the workstation and modules with boxes, rounded boxes, planes, lines, and instancing before commissioning a GLB.
- Keep repeated nodes/particles instanced or batched.
- Target fewer than 100 draw calls desktop and 50 mobile/reduced mode.
- Initial triangle budget: at most approximately 150k desktop and 50k reduced/mobile; procedural target should be well below this.
- Initial particle/data-node budget: 80-150 desktop, 30-60 mobile, with no transparent overdraw cloud.
- Reuse geometries/materials and explicitly manage textures, render targets, loaders, and disposal.

### 8.4 Canvas lifecycle

Use one `DeveloperUniverseCanvas` spanning the hero and Planify transition zone:

- Lazy-load the canvas chunk after critical DOM content is committed; optionally schedule with `requestIdleCallback` plus a short maximum delay.
- Keep it sticky/absolute only through the hero-to-Planify story, not fixed behind the entire page.
- Pause or switch to demand rendering when offscreen, the document is hidden, reduced motion is active, or the scene is settled.
- Use `IntersectionObserver` and `visibilitychange` to control animation work.
- Handle `webglcontextlost` and scene-load errors by replacing the canvas with a static composition.
- Do not mount a second canvas for skills, project cards, certificates, or the AI panel.

### 8.5 Choice comparison

| Choice | Benefits | Risks | Decision |
|---|---|---|---|
| One hero-to-Planify R3F canvas | Shared camera/story, one renderer/context, reusable assets | More coordination between DOM and scene | **Recommended** |
| Canvas fixed across every section | Strong continuity | High idle cost, complex z-index/focus, harder fallbacks | Reject for v1 |
| Separate canvas per section | Local component isolation | Multiple contexts, duplicated resources, inconsistent performance | Reject |
| Large custom Blender scene | Rich bespoke detail | Asset cost, iteration time, mobile burden | Defer; use only if procedural prototype is visually insufficient |

## 9. Scroll Storytelling

### 9.1 Hero to Planify

The strongest cinematic transition should happen once:

1. Hero loads with the workstation in a composed three-quarter view.
2. As the user scrolls, the camera makes a short, bounded dolly toward the Planify monitor while nonessential modules spread/fade.
3. The monitor aligns with the perspective of the incoming DOM browser/device frame.
4. The WebGL monitor fades or masks out as the crisp HTML Planify case study takes ownership.
5. Native scroll continues into normal DOM sections.

The transition should be progress-driven, reversible, and no longer than roughly one viewport of scroll. Do not pin the user in a long cinematic corridor.

### 9.2 Later sections

- Selected Work: subtle depth reveal and pointer tilt only on fine pointers.
- Engineering Stack: lines/nodes animate into connected states as the SVG/DOM map enters.
- Journey: timeline progress line and calm staggered evidence blocks.
- Credentials: short reveal; certificate viewer opens without page transition.
- AI: terminal/chat surface resolves from a system node motif, then behaves like a normal accessible application panel.
- Contact: visual system simplifies and settles, signaling conclusion.

Use CSS and IntersectionObserver for simple reveals. Reserve GSAP ScrollTrigger for coordinated multi-element/camera sequences, not every fade-in.

### 9.3 Scroll safeguards

- Preserve native scrollbar, anchor behavior, text selection, find-in-page, keyboard scrolling, and browser history.
- Avoid nested scroll containers except chat messages and certificate modal content.
- Avoid scroll snapping.
- Recalculate triggers after fonts/assets settle and on responsive layout changes.
- In reduced motion, remove scrub/pinning and use direct section state changes.

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
- Present it in a large DOM browser/device frame with a small 3D perspective at entry, then settle nearly flat for readability.
- Add 2-4 additional screenshots only when supplied/approved: booking flow, staff/role area, customer/public flow, and responsive/mobile/PWA view.
- Use a layered interface stack to show product breadth, but do not show tiny illegible UI solely as decoration.
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

- Perspective/tilt maximum 2-3 degrees and only for fine pointers.
- Metadata animations should reveal role, problem, stack, and status; not decorative counters.
- The entire card must not become one ambiguous link if it also contains multiple controls.
- Hover enhancements must have focus and touch equivalents.
- External links announce destination/new-tab behavior accessibly.

## 12. Engineering Stack Visualization

### 12.1 Recommended approach

Build an **Interactive Engineering System Map** with semantic DOM nodes and an SVG connection layer. This provides the constellation concept without a second renderer.

- Center: `FULL-STACK`.
- Four primary clusters: Frontend, Backend, Data, Engineering/Delivery.
- Product capability appears as a cross-cutting band rather than another logo cloud.
- Each technology is a real button or focusable disclosure trigger.
- Hover/focus/tap opens a concise evidence panel explaining how the capability is used.

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

### 12.3 Skill admission rule

The capability inventory is reconciled for planning:

- Frontend: JavaScript, TypeScript, React, Next.js, HTML, CSS, responsive interfaces, frontend/backend integration, and PWA-related work.
- Backend/APIs: Node.js-style API development, REST APIs, Python, FastAPI, authentication, authorization, and application/business logic.
- Data: MongoDB, database-backed application development, MySQL, and SQL Server where relevant.
- Engineering/Delivery: Git, testing, debugging, deployment, production hardening, application integration, and troubleshooting.
- Mobile: broad mobile application development is confirmed; do not name a native stack until technology-specific evidence is reconciled.
- AI: AI integration and AI-assisted development are confirmed when grounded in the portfolio assistant, software integrations/workflows, and supplied AI credentials. Do not imply machine-learning engineering, model training, data science, or LLM research.
- Java: retain only as a secondary broader skill unless stronger project evidence supports higher prominence.

Confirmation establishes eligibility, not mastery. Every visible node still needs a short usage/evidence statement, and the map should prioritize the strongest practical stack instead of giving every technology equal visual weight. Do not add fashionable logos merely to make the map look fuller.

## 13. Experience and Journey

### 13.1 Narrative

The section should communicate this progression:

**Business understanding -> IT systems -> Software engineering -> Product development**

This is a strength: business education helps frame workflows; IT support contributes troubleshooting, reliability, system awareness, and user empathy; software engineering turns those foundations into products.

### 13.2 Presentation

- Use one chronological/causal journey rather than separate education and experience card columns.
- Each stop contains period, verified role/degree, organization only if confirmed, 1-2 evidence statements, and a short connection to the next stage.
- Give the Computer Technician & IT Support period meaningful space. Confirmed responsibilities may include Windows/macOS/Linux support, hardware/software troubleshooting, operations, backup/recovery, and end-user support.
- Do not invent an employer from the current generic `Technical Support and Systems Operations` label.
- Do not claim seniority or professional software employment that is not present.
- Present the Master's as a completed milestone: degree completed in July 2026. Never describe it as current or ongoing.
- Use the exact official English diploma/program title only after that wording is confirmed; this wording question does not reopen the confirmed completion status/date.

### 13.3 Data needed

Degree completion and the July 2026 completion date are **CONFIRMED**. The exact official English Master's diploma/program wording remains **NEEDS USER CONFIRMATION**. IT employer/self-employed context and final public dates, Business Administration institution/award wording, and availability-specific professional status remain targeted verification items for the phases that publish them.

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

### 18.1 Timing

- Micro interactions: 120-220 ms.
- Component entrances/state transitions: 280-480 ms.
- Hero/Planify cinematic movement: approximately 700-1,200 ms when time-based, or bounded scroll progress.
- Idle scene cycles: 8-20 seconds with very small amplitude.

### 18.2 Easing

- Primary entrance: CSS `cubic-bezier(0.22, 1, 0.36, 1)` / GSAP `power3.out`.
- State/camera transitions: `power2.inOut`.
- Exit: shorter and quieter than entry.
- Avoid bounce, elastic, large overshoot, and simultaneous motion in every layer.

### 18.3 Motion hierarchy

- Level 1: focus, hover, press, chip/panel state.
- Level 2: section/image reveal and project depth.
- Level 3: the single hero-to-Planify camera story.

No long intro sequence or percentage loader. Reduced-motion mode removes parallax, scrub, auto-moving particles, animated gradients, and smooth programmatic scrolling.

### 18.4 Cursor decision

Do not implement a custom cursor in the first release. Native cursor/focus behavior is clearer and lower risk. A small optional pointer aura or magnetic offset may be prototyped after accessibility/performance QA, only on fine pointers, without hiding/replacing the native cursor.

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
- Stop frame loops when settled; invalidate only on interaction where feasible.
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
- Engineering constellation SVG paths.

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

Each phase is independently reviewable. Do not begin high-cost 3D polish before content, DOM structure, and fallback behavior are approved.

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

### Phase 3 - 3D hero implementation and polish

| Field | Plan |
|---|---|
| Objective | Add the meaningful developer-workspace scene without weakening the hero. |
| Exact scope | Lazy R3F canvas, procedural workstation, Planify monitor, system nodes/links, materials, lighting, idle motion, pointer parallax, adaptive quality, context failure. |
| Likely files | `src/three/*`, `src/hooks/useSceneQuality.*`, `src/data/scene.*`, Hero scene boundary. |
| Dependencies | `three`, R3F v9, selected Drei; no GSAP required until transition if CSS/R3F state suffices. |
| Acceptance criteria | One canvas; stable 60 fps target on representative desktop and acceptable 30+ fps reduced tier; no content dependency; no context leaks after navigation/HMR. |
| Tests/validation | Performance profiles, `renderer.info`, context-loss test, reduced/mobile/static tiers, tab visibility, memory repeat test. |
| Performance | Enforce draw/triangle/DPR/light/texture budgets; pause offscreen/hidden. |
| Risks | GPU variability, StrictMode lifecycle issues, material overdraw. Downgrade early and avoid postprocessing. |

### Phase 4 - Planify flagship storytelling

| Field | Plan |
|---|---|
| Objective | Make Planify the unmistakable proof of full-product capability. |
| Exact scope | Large case-study DOM, verified content, screenshot system, role/capability/architecture blocks, live link, hero-monitor transition. |
| Likely files | `src/sections/PlanifyFlagship/*`, `src/three/scenes/*`, project data/assets, GSAP timeline module. |
| Dependencies | Approved Planify claims/screenshots; GSAP/ScrollTrigger. |
| Acceptance criteria | Section works without canvas; transition is short/reversible; screenshot readable; all claims approved; Planify dominates hierarchy. |
| Tests/validation | Scroll both directions, anchor jump, resize/refresh, reduced motion, slow image, link/alt testing. |
| Performance | Limit pinned/scrub distance; lazy additional screenshots; no extra canvas. |
| Risks | Transition alignment across aspect ratios; build breakpoint-specific scene states rather than one brittle timeline. |

### Phase 5 - Selected Work

| Field | Plan |
|---|---|
| Objective | Present BarberSpot and charging-station work with premium but secondary weight. |
| Exact scope | Two project stories/cards, confirmed status/role/stack/capabilities, real screenshots or intentional diagrams, pointer/touch/focus interactions. |
| Likely files | `src/sections/SelectedWork/*`, shared project data, `public/projects/*`. |
| Dependencies | Confirmed project details and assets. |
| Acceptance criteria | Clear status/CTA; no generic placeholder; keyboard/touch parity; no competition with Planify. |
| Tests/validation | External links, missing-image fallback, card keyboard behavior, mobile layout. |
| Performance | Lazy assets; no large video; CSS transform only for tilt. |
| Risks | Missing assets/claims. Use honest architecture visuals and shorter copy rather than fabrication. |

### Phase 6 - Engineering System Map

| Field | Plan |
|---|---|
| Objective | Replace generic skill cards with evidence-based capability exploration. |
| Exact scope | DOM/SVG map, category clusters, evidence detail panel, mobile accordion/list, focus/touch interactions. |
| Likely files | `src/sections/EngineeringStack/*`, capability data, SVG utilities. |
| Dependencies | Confirmed stack/evidence; GSAP optional for entrance only. |
| Acceptance criteria | All data accessible without hover/SVG; logical tab order; meaningful explanations; unconfirmed technologies absent. |
| Tests/validation | Keyboard, touch, screen-reader labels, high contrast, reduced motion, 200% zoom. |
| Performance | SVG line count bounded; no second WebGL canvas; animation stops after reveal. |
| Risks | Visual complexity/readability. Default to clear categories and progressive disclosure. |

### Phase 7 - Journey and Credentials

| Field | Plan |
|---|---|
| Objective | Tell the professional progression and add verified continuous-learning proof. |
| Exact scope | Integrated journey timeline, confirmed IT/education copy, three credential cards, image optimization, accessible certificate viewer. |
| Likely files | `src/sections/Journey/*`, `src/sections/Credentials/*`, dialog component, `public/certificates/*`. |
| Dependencies | Final Journey wording and relevant employment/education details; local placement of the certificate images already supplied externally. Certificate verification URLs are optional and do not block this phase. |
| Acceptance criteria | No stale MSc wording; IT background has meaningful context; modal supports focus/Escape/mobile/original; metadata remains if image fails. |
| Tests/validation | Dialog accessibility, certificate image/link fallback, mobile/zoom, date/content checks. |
| Performance | Lazy thumbnails/full images; decode only opened certificate where practical. |
| Risks | Raw certificate aspect/quality and personal data visible in images; review/crop only with authorization. |

### Phase 8 - AI Assistant redesign and endpoint hardening

| Field | Plan |
|---|---|
| Objective | Deliver one reliable recruiter-focused assistant across hero, section, nav, and floating entry points. |
| Exact scope | Shared chat provider/hook, one panel/dialog, suggested prompts, focus/error/retry behavior, prompt builder from canonical data, request validation, timeout, rate-limit integration, model env config. |
| Likely files | `src/components/ai/*`, `src/hooks/usePortfolioChat.*`, `src/sections/AiAssistant/*`, `api/chat.*`, `api/_lib/*`. |
| Dependencies | Confirmed profile, approved provider/model/rate-limit choice; existing Markdown libraries retained. |
| Acceptance criteria | One shared session; multilingual tests; no stale answer; bounded requests; safe failures; key remains server-only; AI-offline path still gives CV/contact. |
| Tests/validation | API unit tests, mocked upstream, English/Albanian/Italian manual prompts, prompt injection cases, timeout/429/5xx/empty reply, keyboard/dialog. |
| Performance | Lazy-load chat Markdown UI if beneficial; no request until user acts; bounded history. |
| Risks | Model availability/cost, prompt injection, privacy, latency. Feature must fail gracefully and never be required to read profile data. |

### Phase 9 - Contact, footer, SEO, and global polish

| Field | Plan |
|---|---|
| Objective | Conclude the story with a strong professional contact path and complete metadata. |
| Exact scope | `Let's build something useful.` contact section, confirmed channels, footer, OG/canonical/JSON-LD decision, favicon, no-JS fallback, copy polish. |
| Likely files | Contact/Footer sections, `index.html`, public icons/OG asset, shared contact data. |
| Dependencies | Confirmed public contact channels, canonical domain, social profiles. |
| Acceptance criteria | Email/LinkedIn/CV easy to find; no unconfirmed response-time/availability claim; metadata preview correct; brand returns top. |
| Tests/validation | Mail/link/CV targets, metadata validators, favicon/social preview, keyboard, noscript review. |
| Performance | OG assets not page-loaded; contact has no form/runtime dependency. |
| Risks | Public phone/privacy choice; stale production URL. Block canonical/JSON-LD fields until confirmed. |

### Phase 10 - Performance and accessibility hardening

| Field | Plan |
|---|---|
| Objective | Treat performance/accessibility as release gates, not late polish. |
| Exact scope | Bundle analysis, image/font/model optimization, adaptive thresholds, focus/contrast/motion audit, memory/frame profiling, fallbacks. |
| Likely files | Across app; quality config; asset pipeline; test config. |
| Dependencies | All main sections feature-complete. |
| Acceptance criteria | Budgets/targets met or documented tradeoff approved; no critical WCAG issue; no persistent offscreen rendering; stable memory. |
| Tests/validation | Lighthouse checkpoints, axe signals, screen reader, keyboard, CPU/network throttling, GPU profiling, context-loss. |
| Performance | This phase owns final enforcement of Section 21. |
| Risks | Late visual cuts. Measure in every earlier phase to avoid a last-minute downgrade. |

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

### 28.5 SEO/production checks

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
| Stale/duplicated claims | High | Phase 0 content freeze and one shared data source/prompt builder. |
| Planify claim overstatement | High | User/source verification; conservative role/capability wording. |
| AI abuse/cost/model failure | High | Limits, timeout, rate control, env model, safe offline/contact fallback. |
| Scroll choreography harms navigation | Medium-high | Native scroll, one short transition, reduced-motion path, no scroll snap/long pin. |
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

1. What is the exact official English Master's diploma/program wording and official institution wording? Completion in July 2026 is already confirmed.
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
2. Confirm the exact Business Administration award title, institution wording, city spelling, and dates.
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

- Master's degree **completed July 2026**. Only the exact official English diploma/program wording remains **NEEDS USER CONFIRMATION**.
- Public identity: **Franci Hoxha - Full-Stack Software Developer**.
- Main statement: **Building modern software experiences, from idea to production.**
- Capability line: **Web • Mobile • Backend • AI**.
- Planify label: **Flagship Software Project**.
- Reconciled planning capabilities: JavaScript, TypeScript, React, Next.js, HTML, CSS, responsive/PWA-related work, Node.js-style APIs, REST, Python, FastAPI, authentication/authorization, application logic, MongoDB, MySQL, SQL Server, Git, testing, debugging, deployment, production hardening, application integration, troubleshooting, mobile application development, and evidence-grounded AI integration/AI-assisted development.
- Java may remain in the broader inventory with deliberately lower prominence unless stronger project evidence supports it.
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

- Exact official English Master's diploma/program and institution wording; completion/date are not unresolved.
- Final public contact visibility, phone visibility, and any time-sensitive availability wording.
- Planify's current status, Franci's role/contribution wording, approved public feature subset, non-payment integrations, terminology, and publishable screenshots.
- Exact mobile technology names and evidence snippets/relative prominence for the confirmed capability inventory.
- Canonical production domain/deployment topology.
- Phase-specific BarberSpot, charging-station, Journey, language, older-course, AI-provider, monitoring, and optional visual decisions listed in Section 30.

### 31.6 CV/app discrepancies and authority rule

- CV includes Python and Java while the current app skills omit them; Python is now confirmed and Java is approved as a secondary broader skill.
- CV claims system administration; app uses broader systems operations wording.
- CV claims support for medium-sized and large companies; app omits company scale.
- CV uses `Full-Stack Developer`; the approved replacement is `Full-Stack Software Developer`, while the app still uses `Junior Full-Stack Developer`.
- CV adds Planify multi-vendor/multi-location, real-time notifications, Google Maps, Resend, and Google Auth; these require individual evidence before publication.
- CV's `Polar for payments` wording is stale and must be removed from all future public Portfolio3D data/copy. It is not eligible for reconciliation as a current claim.
- CV says "scalable applications" and "passionate"; these conflict with the new evidence-led tone unless specifically supported/rephrased.
- CV uses Tirane/Tiranë/Korçë variants while app uses Tirana/Korce; exact public spelling should be standardized after confirmation.
- App calls the Business Administration qualification `Master's Degree`; CV uses `Master's degree, Business Administration`; exact official award wording is **NEEDS USER CONFIRMATION**.

The current CV remains downloadable and unchanged, but it is not the final authority for shared data, visible copy, AI context, SEO, structured data, or architecture diagrams. Replacing/updating it requires a separate authorized task.

# Recommended First Implementation Phase

After this master plan is reviewed and approved, begin with **Phase 0 - Audit, content reconciliation, and baseline lock**, not the 3D hero.

Phase 0 may begin without waiting for Phase 5 project assets, Phase 7 certificate verification URLs, Phase 8 model/budget decisions, Phase 12 analytics/monitoring decisions, an optional photo, or optional cursor/polish experiments. Unresolved public fields should be represented as draft/hidden/null until their phase gate is answered.

The first implementation change set should do exactly this:

1. Create the approved incremental-TypeScript `shared/portfolio` public data model, types, and validation with explicit published/draft/hidden handling.
2. Populate the approved identity: Franci Hoxha, Full-Stack Software Developer, the exact hero statement, and `Web • Mobile • Backend • AI`.
3. Record the Master's as completed in July 2026 and remove all current-student/`2024 - Present` wording. Keep the exact official English degree title draft/hidden until confirmed.
4. Add the reconciled capability inventory with evidence fields and secondary prominence for Java; keep exact mobile stack wording draft until verified.
5. Establish a conservative Planify public baseline that uses only approved current facts and categorically excludes online customer payments/prepayments and Polar.
6. Centralize the current CV path without editing/replacing the CV, and add the three confirmed credential metadata records plus planned semantic paths for the externally supplied images; do not build the Credentials UI or add assets yet.
7. Create a server-only AI prompt builder that serializes an allowlisted published subset from the same model; remove the manually duplicated professional biography from `api/chat`.
8. Update existing visible copy, SEO data path, and AI context to remove stale current-student, Junior-led main-brand, SaaS-led hero, and payment-provider wording while preserving the current visual experience as much as practical.
9. Fix ESLint's browser/server environment split, document `vercel dev`/environment setup and phase gates, and add focused content/prompt validation tests plus typechecking.
10. Re-run build, lint, typecheck/tests, CV-link, and mocked/local AI endpoint smoke checks; record new bundle and screenshot baselines.

This phase is a content/architecture change before visual redesign. Its acceptance gate is simple: the current site still works and looks substantially the same; every published professional fact comes from one approved source; the AI cannot drift from visible content; degree completion is correct; stale education, main-positioning, availability, and payment claims are absent; later-phase decisions are recorded without blocking unrelated work; and build/lint/typecheck/tests are clean. Phase 0 must not add Three.js/R3F or begin the visual redesign. Only then should Phase 1 establish the visual foundation and Phase 2/3 begin the hero and 3D work.
