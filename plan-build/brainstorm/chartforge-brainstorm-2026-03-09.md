# Brainstorm: ChartForge — The variant.com of Charts

**Created:** 2026-03-09
**Status:** Draft
**PRD Source:** ChartForge-PRD-v2.md

## Vision

ChartForge is a visual chart marketplace where designers browse and export publication-ready visualizations, and developers copy production code. An AI generation engine continuously expands the catalog across 13 charting/graph libraries, 20+ visual effect presets, and 10+ color palettes. Dual-mode output: designers get PNG/SVG export with Canva push; developers get framework-targeted source code with dependency manifests.

The AI pipeline is the core moat — it turns a static gallery into an ever-expanding universe of chart templates.

## Existing Context

**Greenfield build.** No existing codebase. Only the PRD exists. Everything described below must be built from scratch.

**Tech stack (from PRD Section 14):**
- Frontend: Next.js 14+ (App Router), Tailwind CSS 4, Zustand, Shiki
- Backend: Node.js 20+, Express/Hono, PostgreSQL/SQLite, Redis, BullMQ
- AI: Claude API (Sonnet for code gen + vision scoring, Haiku for prompt parsing)
- Rendering: 8 charting libs + 5 graph libs (dynamic import)
- Effects: tsParticles, Framer Motion, anime.js, GSAP, CSS Houdini, SVG filters
- Storage: S3/R2 for assets, Redis for prompt cache
- Validation: Puppeteer (headless Chromium) for render validation

## Components Identified

### 1. Gallery SPA (Browse Layer)
- **Responsibility**: Masonry grid with infinite scroll, multi-axis filtering, search, card rendering with live chart previews
- **Upstream (receives from)**: Template Catalog API (paginated template metadata), Chart Render Modules (live previews)
- **Downstream (sends to)**: Configuration Modal (on card click), Analytics API (view events)
- **External dependencies**: None (all internal)
- **Hands test**: PASS — reads from API, renders cards, handles scroll/filter client-side

### 2. Chart Render Engine (Multi-Library)
- **Responsibility**: Dynamically loads the correct charting library and renders a chart from template metadata + data
- **Upstream (receives from)**: Template metadata (chartType, library, config, dataKey), sample data, palette, effect config
- **Downstream (sends to)**: Gallery cards (live preview), Configuration Modal (interactive preview), Export pipeline (PNG/SVG capture)
- **External dependencies**: 13 npm packages (recharts, chart.js, d3, plotly.js, @nivo/*, echarts, three, lightweight-charts, @antv/g6, react-force-graph, cytoscape, sigma, vis-network)
- **Hands test**: PASS conditionally — each library must be wrapped in a standardized render interface. The PRD calls for a `renderModule` per template. Need a `ChartRenderer` abstraction that takes metadata and delegates to the right library.

### 3. Visual Effects System
- **Responsibility**: Composable visual layers (background, overlay, animation) that wrap chart renders
- **Upstream (receives from)**: Template effect config (effectKey, intensity, sub-options), user overrides from modal
- **Downstream (sends to)**: Chart Render Engine (wraps output), Export pipeline (effects baked into PNG)
- **External dependencies**: tsparticles, framer-motion, animejs, gsap, lottie-web. CSS Houdini (browser-native). SVG filters (browser-native).
- **Hands test**: PARTIAL FAIL — CSS Houdini (Paint API) has limited browser support (no Firefox, no Safari). PRD lists Chrome 95+, Firefox 95+, Safari 16+ as browser targets. Effects using Houdini will silently not render in Firefox/Safari. **Need fallback strategy for Houdini-dependent effects (Noise Texture, Gradient Mesh, Watercolor Bleed).**

### 4. Configuration Modal
- **Responsibility**: Two-tab modal (Designer/Developer) for customizing chart data, palette, effects, title, and previewing/exporting
- **Upstream (receives from)**: Gallery card click (template metadata), Chart Render Engine (live preview)
- **Downstream (sends to)**: Workspace Panel (add configured chart), Export System (direct export), Code Generation API (developer tab)
- **External dependencies**: None (all internal)
- **Hands test**: PASS

### 5. Data Connection & Validation
- **Responsibility**: Parse CSV/JSON input, validate against per-chart-type schemas, provide data preview
- **Upstream (receives from)**: User file upload or paste, sample data defaults
- **Downstream (sends to)**: Chart Render Engine (parsed data), Configuration Modal (validation status)
- **External dependencies**: CSV parser (papaparse or similar). JSON parsing is native.
- **Hands test**: PASS — but PRD states "User CSV/JSON data never leaves the browser." All parsing must be client-side. No server round-trips for data processing.

### 6. Workspace Panel
- **Responsibility**: Persistent bottom drawer with configured chart cards, per-chart size picker, export/copy actions
- **Upstream (receives from)**: Configuration Modal (add chart), user interactions (size changes, remove)
- **Downstream (sends to)**: Export System (PNG/SVG), Canva Upload (push), Code Generation API (copy code)
- **External dependencies**: None
- **Hands test**: PASS

### 7. Export System (PNG/SVG)
- **Responsibility**: Render charts at specified dimensions with effects baked in, produce PNG/SVG blobs
- **Upstream (receives from)**: Workspace Panel (export trigger), size presets, chart render + effects
- **Downstream (sends to)**: Browser download (PNG/SVG file), Canva Upload API (PNG blob)
- **External dependencies**: html-to-image or dom-to-image for SVG-based libs. Canvas.toBlob() for canvas-based libs. Need 2x scaling for retina.
- **Hands test**: PARTIAL FAIL — SVG→Canvas→PNG pipeline is complex. D3/Recharts/Nivo produce SVG; need to serialize SVG, render to canvas at target size, then export as PNG. Foreign object elements in SVG can break this. **Need to verify SVG serialization works for each library's output.** Also: Three.js and Chart.js are canvas-native, so different export path.

### 8. Canva Integration (OAuth + Upload)
- **Responsibility**: OAuth 2.0 + PKCE flow to connect Canva account, upload chart PNGs as Canva assets
- **Upstream (receives from)**: Workspace Panel (push to Canva trigger), Export System (PNG blob)
- **Downstream (sends to)**: Canva Connect API (/v1/asset-uploads), user notification (upload status)
- **External dependencies**: Canva Connect API (OAuth endpoints + asset upload endpoint). Backend proxy for token exchange (CORS).
- **Hands test**: FAIL until configured — needs Canva developer app registration, client ID, OAuth redirect URI configured, backend proxy endpoint. **Without Canva app credentials, this entire feature is dead.** Environment variables needed: CANVA_CLIENT_ID, CANVA_REDIRECT_URI. Token storage in DB.

### 9. Code Generation API
- **Responsibility**: Generate framework-specific source code from template metadata. Serve via /api/templates/:id/code
- **Upstream (receives from)**: Template metadata, framework selector (react/vanilla/vue/svelte), effect toggle, TypeScript toggle
- **Downstream (sends to)**: Developer Tab in modal (code preview), Workspace Panel (copy code action)
- **External dependencies**: Handlebars or tagged template literals for code templates. Prettier for formatting. Shiki for syntax highlighting (client-side).
- **Hands test**: PASS conditionally — requires a code template for every (library × framework × effect) combination. At launch: 13 libraries × 4 frameworks × 20 effects = potentially 1,040 code template variants. **This is the hardest combinatorial problem in the build.** Need a composable code template system, not 1,040 individual templates.

### 10. Template Catalog API
- **Responsibility**: Serve paginated template metadata, support filtering by type/library/effect/palette/useCase/search
- **Upstream (receives from)**: Template storage (JSON files or DB), AI Pipeline (publishes new templates)
- **Downstream (sends to)**: Gallery SPA (template cards), Configuration Modal (single template detail), Code Generation API (template metadata)
- **External dependencies**: PostgreSQL or SQLite for metadata. S3/R2 for screenshots and code files.
- **Hands test**: PASS

### 11. AI Generation Pipeline (Background)
- **Responsibility**: Continuously generate new chart templates, validate through quality gates, queue for human approval
- **Upstream (receives from)**: Diversity scheduler (generation targets), catalog gap analysis, reviewer feedback loop
- **Downstream (sends to)**: Quality Gate System (validation), Approval Queue (candidates), Template Catalog (on approval)
- **External dependencies**: Claude API (Anthropic) — Sonnet for code gen + visual scoring, Haiku for prompt parsing. Puppeteer for render validation. BullMQ + Redis for job queue. S3 for generated assets.
- **Hands test**: FAIL without wiring — needs: ANTHROPIC_API_KEY env var, Redis connection, S3 bucket configured, Puppeteer installed with headless Chromium. Also needs the code template system (Component 9) to generate valid framework code. **The AI generates React code as primary output, but the quality gate checks all 4 frameworks — so the code generation system must exist before the AI pipeline can validate.**

### 12. AI User-Facing Generation
- **Responsibility**: Parse natural language prompts, generate custom charts on-demand, serve personal results
- **Upstream (receives from)**: User prompt from gallery header, prompt cache (Redis)
- **Downstream (sends to)**: Quality Gate System (automated validation), user's personal session (instant result), Approval Queue (if user submits to gallery)
- **External dependencies**: Same as background pipeline + Redis prompt cache
- **Hands test**: Same as Component 11 — depends on the full pipeline being wired

### 13. Human Approval Queue (Admin)
- **Responsibility**: Internal web app for reviewers to approve/reject/request-revision on AI-generated templates
- **Upstream (receives from)**: AI Pipeline (validated candidates with scores + screenshots)
- **Downstream (sends to)**: Template Catalog (on approve), AI Pipeline (revision feedback), Analytics (rejection reasons)
- **External dependencies**: Auth system for admin users. Separate admin UI.
- **Hands test**: PASS once built — but this is a separate internal application

### 14. Analytics System
- **Responsibility**: Track template views, exports, code copies, Canva pushes, generation events
- **Upstream (receives from)**: All user interactions (gallery, modal, workspace, export, AI generation)
- **Downstream (sends to)**: AI Pipeline feedback loop (popular template analysis), admin dashboard (metrics)
- **External dependencies**: PostHog or custom analytics backend. DB for event storage.
- **Hands test**: PASS — straightforward event tracking

### 15. Color Palette System
- **Responsibility**: Normalize 5-color palettes across all 13 charting libraries' theming APIs
- **Upstream (receives from)**: Template metadata (default palette), user selection in modal
- **Downstream (sends to)**: Chart Render Engine (library-specific color mapping)
- **External dependencies**: None — pure adapter code per library
- **Hands test**: PASS — but requires 13 palette adapter implementations (one per library)

### 16. Sample Data System
- **Responsibility**: Provide realistic sample datasets for each chart type's data schema
- **Upstream (receives from)**: Template metadata (dataKey, dataSchema)
- **Downstream (sends to)**: Chart Render Engine (default data for preview), Data Validation (schema definitions)
- **External dependencies**: None
- **Hands test**: PASS

## Rough Dependency Map

```
[Sample Data] ──────────────────────┐
[Color Palette Adapters] ──────────┐│
                                   ││
[Template Catalog API] ──────────┐ ││
                                 │ ││
[Chart Render Engine] ←──────────┤←┤│
  ├── 13 library wrappers        │ ││
  └── render isolation           │ ││
                                 │ ││
[Visual Effects System] ←────────┼─┘│
  ├── 6 effect libraries         │  │
  └── composability rules        │  │
                                 │  │
[Gallery SPA] ←──────────────────┘  │
  ├── masonry grid                  │
  ├── infinite scroll               │
  ├── multi-axis filtering          │
  └── search                       │
                                    │
[Configuration Modal] ←─────────────┘
  ├── Designer Tab (data, palette, effects)
  ├── Developer Tab (code preview, framework selector)
  └── Live preview
       │
       ├──→ [Data Connection & Validation]
       │      └── CSV/JSON parser (client-side)
       │
       ├──→ [Code Generation API] (server-side)
       │      ├── code template registry
       │      ├── framework transpilation
       │      └── Prettier formatting
       │
       └──→ [Workspace Panel]
              ├── size picker
              ├──→ [Export System] → PNG/SVG download
              ├──→ [Canva Integration] → OAuth + upload
              └──→ Code copy actions

[AI Generation Pipeline] (background service)
  ├── diversity scheduler
  ├── Claude API (code gen)
  ├── Puppeteer (render validation)
  ├── Claude Vision (quality scoring)
  ├── BullMQ + Redis (job queue)
  └──→ [Human Approval Queue] (admin app)
         └──→ [Template Catalog API] (on approval)

[AI User-Facing Generation] (on-demand)
  ├── prompt parsing (Claude Haiku)
  ├── prompt cache (Redis)
  ├── same pipeline stages 1-4
  └──→ personal session result
         └──→ [Approval Queue] (if user submits)

[Analytics System]
  ├── event tracking (all user interactions)
  └──→ AI Pipeline feedback loop
```

## Critical Wiring Risks

### Risk 1: Code Template Combinatorial Explosion
13 libraries × 4 frameworks × 20+ effects = 1,000+ potential code template variants. This is the single biggest complexity challenge. The code generation system MUST use a composable template architecture — chart code templates per library, effect wrapper templates per effect, framework adapters that transform React to Vue/Svelte/Vanilla. Cannot be a flat matrix of templates.

### Risk 2: CSS Houdini Browser Support Gap
PRD specifies Firefox 95+ and Safari 16+ support. CSS Houdini Paint API is not supported in either. Effects that depend on Houdini (Noise Texture, Gradient Mesh, Watercolor Bleed) will silently fail. Need CSS/SVG fallbacks for these effects in non-Chrome browsers.

### Risk 3: AI Pipeline Depends on Nearly Everything
The AI pipeline generates code → validates it compiles → renders it → screenshots it → scores the screenshot. This means the pipeline depends on: the code template system, all 13 library wrappers, the effect system, the palette system, Puppeteer, and Claude API. **It cannot be built or tested until most of the frontend rendering stack exists.**

### Risk 4: SVG Export Pipeline Fragility
SVG-based libraries (Recharts, D3, Nivo, Cytoscape, Sigma) produce SVG that must be serialized → drawn to canvas → exported as PNG. This pipeline breaks when: foreign objects are present, external stylesheets aren't inlined, gradients use relative URLs, or text rendering differs between SVG and canvas. Each library needs its own export path verification.

### Risk 5: Canva Integration is a Black Box Until Registered
The Canva Connect API requires a registered developer app with approved scopes. Until the Canva app is registered and credentials are obtained, the entire Canva flow cannot be tested. This should be an early action item.

### Risk 6: Graph Libraries Have Fundamentally Different Data Models
Standard chart libs take rows/columns. Graph libs take nodes/edges. The data connection, validation, and sample data systems need to handle both paradigms. The AI pipeline also needs to generate graph-specific code with layout configs, interaction handlers, and different data shapes.

## Open Questions

1. **Build order for MVP**: The PRD includes AI pipeline, admin approval queue, and Canva integration as MVP. Should we stage the build to get the gallery + render engine + code export working first (pure frontend value), then layer AI and integrations?

2. **Code template architecture**: Composable templates with chart base + effect wrapper + framework adapter? Or generate everything via AI from the start (dogfooding the AI pipeline)?

3. **Hosting/deployment**: PRD mentions S3/R2, PostgreSQL, Redis, Puppeteer. What's the deployment target? Vercel for frontend, separate backend service? Docker compose? Kubernetes?

4. **Canva app registration status**: Has a Canva developer app been registered? Do we have credentials?

5. **Claude API key**: Is the Anthropic API key available and budgeted?

6. **Initial template seeding**: The PRD calls for 150 hand-crafted + 150 AI-generated templates at launch. Who builds the 150 hand-crafted ones? Is this a separate content workstream?

## Risks and Concerns

- **Scope is enormous for a single build.** This PRD describes 5+ distinct applications (gallery SPA, admin approval queue, AI pipeline service, Canva OAuth proxy, code generation server). Phasing is critical.
- **13 charting libraries = 13 integration surfaces.** Each needs: render wrapper, palette adapter, export path, code template, sample data. Even at 2-3 days per library, that's 6-8 weeks of library integration work.
- **AI pipeline cannot be validated without the rendering stack.** Circular dependency: AI generates templates → validation needs render engine → render engine needs templates to test against.
- **Performance risk from loading multiple large libraries.** Plotly alone is ~3MB. Three.js is ~600KB. Even with dynamic import, users browsing diverse templates will accumulate heavy downloads.
