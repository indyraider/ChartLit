# Build Plan: ChartForge

**Created:** 2026-03-09
**Brainstorm:** plan-build/brainstorm/chartforge-brainstorm-2026-03-09.md
**PRD Source:** ChartForge-PRD-v2.md
**Status:** Draft

## Overview

ChartForge is a visual chart marketplace with AI-powered template generation. This plan follows a **rendering-first** strategy: build the gallery, render engine, effects, and code export first, then layer AI generation and external integrations on top of a proven rendering stack.

**Deployment:** Next.js frontend on Vercel. Backend API + AI pipeline on Railway with managed Redis and PostgreSQL. Mock all external services (Canva, Claude API) initially.

**Build phases:**
1. Foundation (project setup, data models, core infrastructure)
2. Chart Render Engine (multi-library rendering with isolation)
3. Visual Effects System (composable effect layers)
4. Gallery & Browse Experience (masonry grid, filtering, infinite scroll)
5. Configuration Modal (designer + developer tabs)
6. Code Generation System (multi-framework code export)
7. Workspace & Export (workspace panel, PNG export, size presets)
8. Canva Integration (OAuth + upload, initially mocked)
9. AI Generation Pipeline (background + user-facing, initially mocked)
10. Admin Approval Queue (internal reviewer tool)
11. Analytics & Feedback Loops (event tracking, pipeline feedback)
12. Template Seeding & Launch Prep (seed catalog, polish, deploy)

---

## Component Inventory

| # | Component | Inputs | Outputs | External Deps |
|---|-----------|--------|---------|---------------|
| 1 | Next.js App Shell | — | Routing, layout, theme | Tailwind 4, DM Sans, JetBrains Mono |
| 2 | Template Catalog API | DB (templates table) | Paginated template JSON | PostgreSQL/SQLite |
| 3 | Sample Data Registry | Template dataKey | Dataset arrays/objects | None |
| 4 | Data Schema Registry | Template dataSchema | Schema definition + validation rules | None |
| 5 | Color Palette System | Palette key | 5-color array + per-library adapter | None (13 adapters) |
| 6 | Chart Render Engine | Template metadata + data + palette | Live chart React component | 13 npm chart/graph packages |
| 7 | Visual Effects System | Effect key + intensity + config | Background/Overlay/Animation wrappers | tsparticles, framer-motion, animejs, gsap, lottie-web |
| 8 | Gallery SPA | Catalog API response | Masonry grid of live chart cards | IntersectionObserver |
| 9 | Configuration Modal | Template metadata, user data | Configured chart ready for workspace | CSV parser (papaparse) |
| 10 | Code Generation API | Template + framework + toggles | Source code string + dependency manifest | Prettier, code templates |
| 11 | Workspace Panel | Configured charts array | Bottom drawer with export actions | Session/URL state |
| 12 | Export System | Chart render + size preset | PNG/SVG blob | html-to-image, canvas API |
| 13 | Canva Integration | PNG blob + OAuth token | Canva asset upload | Canva Connect API (mocked) |
| 14 | AI Pipeline (Background) | Generation schedule + specs | Validated candidate templates | Claude API (mocked), Puppeteer, BullMQ, Redis |
| 15 | AI User-Facing Generation | NL prompt | Personal chart result | Claude API (mocked), Redis cache |
| 16 | Admin Approval Queue | Candidate templates | Approved/rejected decisions | Admin auth |
| 17 | Analytics System | User events | Event records + aggregations | PostHog or custom |

---

## Integration Contracts

### Contract 1: Catalog API → Gallery SPA
```
Source: GET /api/templates
Target: Gallery masonry grid
What flows: Paginated array of TemplateMetadata objects (id, title, subtitle,
            chartType, library, palette, effect, tags, useCases, height,
            renderModule, thumbnailUrl)
How: REST API. Query params: type, library, effect, palette, useCase,
     search, page (default 1), limit (default 18)
Response: { templates: TemplateMetadata[], total: number, page: number,
            hasMore: boolean }
Error path: 500 → show "Failed to load templates" with retry button.
            Empty result → "No templates match your filters" with clear-filters CTA.
```

### Contract 2: Chart Render Engine → Gallery Card
```
Source: ChartRenderer component
Target: Gallery card preview area
What flows: React component rendering a live chart
How: Dynamic import of render module based on template.renderModule path.
     Props: { template: TemplateMetadata, data: DataPoint[], palette: string[],
              width: number, height: number }
Error path: Render error → show fallback static thumbnail image.
            Library load timeout (>5s) → show skeleton with "Loading..." text.
```

### Contract 3: Chart Render Engine → Export System
```
Source: ChartRenderer (rendered DOM node)
Target: Export pipeline
What flows: DOM node reference or canvas element
How: For SVG-based libs (Recharts, D3, Nivo, Cytoscape, Sigma, vis-network):
       serialize SVG → draw to canvas at 2x target size → canvas.toBlob('image/png')
     For Canvas-based libs (Chart.js, Three.js, ECharts, G6, react-force-graph,
       Lightweight Charts):
       canvas.toBlob('image/png') directly at 2x target size
Auth/Config: None
Error path: Export failure → toast "Export failed. Try a smaller size."
```

### Contract 4: Code Generation API → Developer Tab
```
Source: GET /api/templates/:id/code
Target: Developer tab code preview
What flows: { code: string, language: string, dependencies: DependencyManifest }
How: REST API. Query params: framework (react|vanilla|vue|svelte),
     includeEffects (boolean), includeTypes (boolean)
Response: {
  code: string,                    // formatted source code
  language: 'jsx'|'js'|'vue'|'svelte'|'tsx'|'ts',
  dependencies: {
    packages: [{ name, version, purpose }],
    installCommand: string,
    peerDeps: [{ name, version }],
    totalSize: string,
    devDeps: [{ name, version }]
  }
}
Error path: 500 → show "Code generation failed" in code block area.
```

### Contract 5: Gallery → Configuration Modal
```
Source: Gallery card click handler
Target: Modal open with template data
What flows: TemplateMetadata object (full template record)
How: Client-side state update. Set modal.template = clicked template.
     Modal reads from Zustand store.
Auth/Config: None
Error path: None (synchronous state update)
```

### Contract 6: Configuration Modal → Workspace Panel
```
Source: "Add to Workspace" button in modal
Target: Workspace charts array
What flows: WorkspaceChart object: { id, template, data, palette, effect,
            effectIntensity, title, framework, includeEffects, includeTypes }
How: Push to workspace.charts[] in Zustand store. Close modal.
Error path: Workspace full (>20 charts) → toast "Workspace limit reached"
```

### Contract 7: Export System → Canva Upload
```
Source: PNG blob from export pipeline
Target: POST /api/canva/upload → Canva Connect API
What flows: FormData with PNG blob, chart title, dimensions
How: POST multipart/form-data to backend proxy. Backend forwards to
     Canva /v1/asset-uploads with OAuth token from DB.
Auth/Config: Canva OAuth token (stored server-side per user session).
             CANVA_CLIENT_ID env var on backend.
Error path: 401 → re-initiate OAuth flow. 429 → "Rate limited, try again
            in 60s." 500 → "Upload failed" with retry.
```

### Contract 8: AI Pipeline → Approval Queue
```
Source: AI generation pipeline (stages 1-4 complete)
Target: Approval queue database table
What flows: CandidateTemplate: { id, title, subtitle, chartType, library,
            effect, palette, tags, useCases, sourceCode (all 4 frameworks),
            screenshots (3 viewport sizes), qualityScore (0-100),
            generationSource ('background'|'user'), userId (if user-submitted),
            promptText, createdAt }
How: Insert into candidates table after all automated quality gates pass.
     BullMQ job triggers insert.
Auth/Config: DB write access for pipeline service.
Error path: Insert failure → retry 3x → move to dead letter queue.
```

### Contract 9: Approval Queue → Template Catalog
```
Source: Reviewer approve action in admin UI
Target: Templates table + S3 assets
What flows: Approved template metadata + code + screenshots
How: POST /admin/approval/:id/approve triggers:
     1. Copy candidate record to templates table
     2. Upload code files to S3
     3. Screenshots already in S3 from pipeline
     4. Invalidate catalog cache
Auth/Config: Admin auth (JWT or session-based)
Error path: Publish failure → mark as "approved-pending-publish" → retry.
```

### Contract 10: User Prompt → AI Generation
```
Source: POST /api/generate
Target: AI pipeline (on-demand mode)
What flows: { prompt: string, userId: string }
How: 1. Parse prompt → structured spec (Claude Haiku)
     2. Check Redis cache for matching existing template
     3. If cache hit → return existing template immediately
     4. If miss → run pipeline stages 1-4 → return personal result
     5. Enqueue as BullMQ job, return jobId for polling
Response: { jobId: string } → poll GET /api/generate/:jobId
          Completed: { status: 'complete', template: TemplateMetadata }
Auth/Config: ANTHROPIC_API_KEY, Redis connection
Error path: Rate limit (>10/day free) → 429. Pipeline failure →
            { status: 'failed', error: string, suggestion: string }
```

---

## End-to-End Flows

### Flow 1: Designer browses → exports PNG
```
1. User loads gallery page
2. Next.js SSR renders gallery shell + skeleton cards
3. GET /api/templates?page=1&limit=18 → first batch of template metadata
4. For each visible card: dynamic import(template.renderModule) → load chart library
5. ChartRenderer renders live chart with sample data + palette + effect
6. User scrolls → IntersectionObserver triggers → GET /api/templates?page=2
7. User clicks a card → modal opens (template metadata loaded to Zustand)
8. Designer Tab active: live preview renders chart at full size
9. User uploads CSV → papaparse parses client-side → validates against dataSchema
10. Chart re-renders with user data
11. User selects palette → chart re-renders with new colors
12. User enables "Neon Glow" effect → effect wrapper applies to chart
13. User clicks "Add to Workspace" → WorkspaceChart added to workspace.charts[]
14. Modal closes → workspace panel visible at bottom
15. User selects "16:9 (1920×1080)" size preset
16. User clicks "Export PNG"
17. Export system: render chart at 3840×2160 (2x) → canvas → blob → download
18. User clicks "Push to Canva" → POST /api/canva/upload → Canva API → success toast
```

### Flow 2: Developer browses → copies code
```
1. Steps 1-6 same as Flow 1
7. User clicks a card → modal opens
8. User switches to Developer Tab
9. GET /api/templates/:id/code?framework=react&includeEffects=true → code response
10. Shiki highlights code in dark theme
11. Dependency manifest displayed below code
12. User switches framework to "Vue 3" → new GET request → code + manifest update
13. User clicks "Copy Code" → clipboard write → toast "Copied!"
14. User clicks "Copy Install" → clipboard write → toast "Copied!"
15. User clicks "Download .vue" → file download
```

### Flow 3: User generates chart via AI prompt
```
1. User types "a D3 bar chart with neon glow showing quarterly revenue"
   in gallery header prompt bar
2. POST /api/generate { prompt: "..." }
3. Backend: Claude Haiku parses → { chartType: 'bar', library: 'd3',
   effect: 'neon-glow', dataSchema: 'quarterly-revenue' }
4. Redis cache check → miss
5. BullMQ job created → { jobId: "gen-abc123" }
6. Frontend: shimmer placeholder card appears at position 1 in gallery
7. Frontend polls: GET /api/generate/gen-abc123 every 2s
8. Pipeline: Claude Sonnet generates React component code
9. Pipeline: ESLint validates → pass
10. Pipeline: Puppeteer renders component → captures screenshot
11. Pipeline: Claude Sonnet Vision scores screenshot → 78/100 → pass
12. Pipeline: job complete → template metadata + code stored
13. Frontend poll returns: { status: 'complete', template: {...} }
14. Shimmer card replaced with live-rendered chart + "AI Generated" badge
15. User can click → configure → export/copy code (personal result)
16. User clicks "Submit to Gallery" → POST /api/generate/:jobId/submit
17. Template enters approval queue
```

### Flow 4: Reviewer approves template (admin)
```
1. Reviewer opens admin approval queue dashboard
2. GET /admin/approval/queue?status=pending&sort=priority
3. Queue sorted: user-submitted first, then by quality score
4. Reviewer clicks a candidate → detail view with:
   - 3 viewport screenshots
   - Code preview (all 4 frameworks)
   - Quality score breakdown
   - Generation source + prompt
5. Reviewer evaluates against criteria (Section 7.4.3)
6. Reviewer clicks "Approve" (or "Approve with edits" to adjust metadata)
7. POST /admin/approval/:id/approve { edits: { title: "...", tags: [...] } }
8. Backend: copies to templates table, uploads assets, invalidates cache
9. Template appears in public gallery on next page load
10. If user-submitted: notification sent to originating user
```

### Error Flow: AI generation fails
```
1. User submits prompt
2. Pipeline stage 2 (code gen): Claude generates broken code
3. Pipeline stage 2 retry: ESLint fails → error feedback appended to prompt → retry
4. After 3 retries: compilation still fails
5. Job marked as failed: { status: 'failed', error: 'Code compilation failed',
   suggestion: 'Try simplifying your request or specifying a different library' }
6. Frontend: shimmer card replaced with error card + retry button + suggestion text
7. Failure logged with prompt text + error details for pipeline improvement
```

---

## Issues Found

### Issue 1: CSS Houdini Paint API — Browser Support Gap
**Type:** Phantom Dependency
**Detail:** Effects "Noise Texture" (Gradient Mesh), "Watercolor Bleed" use CSS Houdini Paint API. Firefox and Safari don't support it. PRD requires Firefox 95+ and Safari 16+.
**Fix:** Implement CSS/SVG filter fallbacks for these effects. Use `CSS.paintWorklet` feature detection. Fallback: SVG feTurbulence for noise, CSS radial gradients for mesh, SVG feGaussianBlur + feComponentTransfer for watercolor.

### Issue 2: Code Template Combinatorial Explosion
**Type:** Architecture Gap
**Detail:** Naive approach would require 13 libs × 4 frameworks × 20 effects = 1,040 templates.
**Fix:** Composable code generation architecture:
- **Chart templates** (13): One per library. Generates the chart rendering code.
- **Effect wrappers** (20): One per effect. Generates the wrapping/overlay code (React).
- **Framework adapters** (4): Transform React output to Vue SFC, Svelte component, Vanilla JS module.
- Total templates: 13 + 20 + 4 = 37 templates, composed at generation time.

### Issue 3: Graph Data Model Divergence
**Type:** Data Model Split
**Detail:** Standard charts use row/column data. Graphs use nodes/edges. Data connection, validation, schemas, and sample data all need dual-paradigm support.
**Fix:** Two data pipeline branches in the Data Connection component. `chartType.startsWith('graph-')` → use GraphDataParser with node/edge schema. Otherwise → use TabularDataParser with column schema.

### Issue 4: Canva App Registration Required
**Type:** External Blocker (deferred)
**Detail:** Canva Connect API requires registered developer app with approved scopes. No credentials available.
**Fix:** Mock the entire Canva flow for initial build. Build the OAuth + upload code against mock endpoints. Wire real Canva API when credentials are obtained.

### Issue 5: AI Pipeline Circular Dependency
**Type:** Build Order Dependency
**Detail:** AI pipeline needs render engine to validate templates. Render engine needs templates to test. But the pipeline generates templates.
**Fix:** Rendering-first build order. Create 10-20 hand-crafted seed templates during Phase 2 (Render Engine) to test rendering. AI pipeline (Phase 9) is built on top of the proven render stack.

### Issue 6: Library Bundle Sizes
**Type:** Performance Risk
**Detail:** plotly.js (~3MB), three.js (~600KB), echarts (~1MB), d3 (~300KB). Loading multiple libraries degrades performance.
**Fix:** Strict dynamic import per library. Preload only the library for visible cards. Use `React.lazy()` + Suspense for each library wrapper. Consider lightweight alternatives (plotly.js-basic-dist for Plotly).

### Issue 7: SVG Export Reliability per Library
**Type:** Integration Risk
**Detail:** SVG → Canvas → PNG pipeline is fragile per library. Foreign objects, external styles, relative gradient URLs all break it.
**Fix:** Per-library export adapter. Test each library's export path explicitly during Phase 7. Use html-to-image as primary with library-specific fallbacks.

---

## PRD Task List

### Phase 1: Foundation
- [ ] [PRD §14.1] Initialize Next.js 14+ project with App Router
- [ ] [PRD §14.1] Configure Tailwind CSS 4 with dark theme design tokens from §15.1
- [ ] [PRD §15.2] Set up DM Sans and JetBrains Mono font loading
- [ ] [PRD §14.1] Configure Zustand store with state shape from §12.1
- [ ] [PRD §14.2] Set up backend API project (Express or Hono on Node.js 20+)
- [ ] [PRD §14.2] Configure SQLite database (local dev) with template and candidate tables
- [ ] [PRD §10.1] Define TypeScript types for TemplateMetadata schema
- [ ] [PRD §10.1] Define TypeScript types for graph-specific metadata fields (layoutConfig, interactionDefaults, maxNodes, neo4jBoilerplate)
- [ ] [PRD §12.1] Define TypeScript types for all client state (gallery, modal, workspace, canva)
- [ ] [PRD §13.1] Stub all API endpoints from §13.1 with placeholder responses
- [ ] [PRD §16] Configure ESLint, Prettier, and TypeScript strict mode
- [ ] [PRD §16] Set up CSP headers and HTTPS configuration
- [ ] [PRD §14.3] Set up dynamic import infrastructure for chart library chunking

### Phase 2: Chart Render Engine
- [ ] [PRD §6.4] Create ChartRenderer abstraction component (takes TemplateMetadata + data + palette → renders chart)
- [ ] [PRD §6.4] Implement render isolation: each chart in a sandboxed container (prevent library conflicts)
- [ ] [PRD §6.4] Implement lazy loading: dynamic import() per library, only load when chart is in viewport
- [ ] [PRD §6.1] Create Recharts render wrapper (bar, line, area, pie, scatter, radar, treemap, radial bar)
- [ ] [PRD §6.1] Create Chart.js render wrapper (bar, line, area, pie, scatter, radar, gauge, candlestick)
- [ ] [PRD §6.1] Create D3 render wrapper (bar, line, area, pie, scatter, radar, treemap, heatmap, funnel, waterfall, sankey, gauge, candlestick, radial, chord, globe)
- [ ] [PRD §6.1] Create Plotly render wrapper (bar, line, area, pie, scatter, radar, treemap, heatmap, funnel, waterfall, sankey, candlestick, globe, 3d surface)
- [ ] [PRD §6.1] Create Nivo render wrapper (bar, line, area, pie, scatter, radar, treemap, heatmap, sankey, radial, chord)
- [ ] [PRD §6.1] Create ECharts render wrapper (bar, line, area, pie, scatter, radar, treemap, heatmap, funnel, waterfall, sankey, gauge, candlestick, radial, chord, globe, 3d surface)
- [ ] [PRD §6.1] Create Three.js render wrapper (3D bar, 3D pie, 3D scatter, globe, 3D surface)
- [ ] [PRD §6.1] Create Lightweight Charts render wrapper (candlestick, line, area)
- [ ] [PRD §6.1] Create G6 (AntV) render wrapper (force, hierarchy, radial, circular, dagre, grid, fruchterman, concentric, knowledge graph, entity-relationship, social, dependency, org chart, mind map, combo/subgraph)
- [ ] [PRD §6.1] Create react-force-graph render wrapper (2D/3D force, knowledge graph, social, dependency, 3D fly-through)
- [ ] [PRD §6.1] Create Cytoscape.js render wrapper (force, hierarchy, radial, circular, dagre, knowledge graph, entity-relationship, social, dependency, org chart, mind map, combo)
- [ ] [PRD §6.1] Create Sigma.js render wrapper (force, circular, fruchterman, knowledge graph, social)
- [ ] [PRD §6.1] Create vis-network render wrapper (force, hierarchy, dagre, knowledge graph, entity-relationship, social, dependency, org chart)
- [ ] [PRD §11] Create palette normalization layer: paletteAdapter with 13 library-specific mappers
- [ ] [PRD §11] Implement all 10 named palettes (Ember, Midnight, Forest, Sunset, Ocean, Coral, Neon, Earth, Berry, Slate)
- [ ] [PRD §6.3] Implement graph-specific interactions: zoom/pan, node drag, hover highlight, click expand/collapse, node search
- [ ] [PRD §6.3] Implement GraphJSON normalization format for all graph libraries
- [ ] Create 10-20 hand-crafted seed templates (mix of standard charts + graphs) for render testing

### Phase 3: Visual Effects System
- [ ] [PRD §8.1] Implement effect layer architecture: background layer + chart layer + overlay layer + animation layer
- [ ] [PRD §8.1] Create EffectWrapper component that composes layers around ChartRenderer
- [ ] [PRD §8.2] Implement tsParticles integration for background effects (stars, confetti, connections, bubbles)
- [ ] [PRD §8.2] Implement Framer Motion integration for animation effects (spring, stagger, float, layout transitions)
- [ ] [PRD §8.2] Implement anime.js integration for timeline animations (path morphing, SVG draw, stagger cascades)
- [ ] [PRD §8.2] Implement GSAP integration for complex animations (scroll-triggered, SVG morphing)
- [ ] [PRD §8.2] Implement Lottie integration for decorative overlay elements
- [ ] [PRD §8.2] Implement CSS filter + blend mode effects (glow/bloom, glass morphism, vignette, chromatic aberration)
- [ ] [PRD §8.2] Implement SVG filter effects (feTurbulence for hand-drawn, displacement map for distortion)
- [ ] [PRD §8.2] Implement Canvas 2D shader effects (scan lines, halftone)
- [ ] [PRD §8.2] Implement CSS Houdini Paint API effects WITH fallbacks for Firefox/Safari (noise texture, gradient mesh, watercolor bleed)
- [ ] [PRD §8.3] Create all 20 effect presets: None, Neon Glow, Starfield, Gradient Mesh, Noise Texture, Glass Morphism, Particle Network, Animated Grid, Hand-drawn Sketch, 3D Perspective, Parallax Float, Confetti Burst, Scan Lines, Watercolor Bleed, Data Pulse, Force Bloom, Edge Flow, Node Ripple, Cluster Nebula, 3D Orbit
- [ ] [PRD §8.4] Implement composability rules: max 1 background + 1 overlay + 1 animation
- [ ] [PRD §8.4] Block invalid combinations (Glass Morphism + Noise Texture; 3D Perspective + canvas-based charts)
- [ ] [PRD §8.4] Implement effect intensity slider (0-100%) with toggle for complete removal
- [ ] [PRD §8.4] Implement mobile degradation: reduce particle counts, disable blur overlays, skip 3D transforms on low-power devices

### Phase 4: Gallery & Browse Experience
- [ ] [PRD §5.1.1] Implement 3-column masonry grid (3 cols >1024px, 2 >640px, 1 mobile)
- [ ] [PRD §5.1.1] Each card shows live rendered chart preview with real sample data and effects
- [ ] [PRD §5.1.1] Cards vary in height based on chart type for organic masonry flow
- [ ] [PRD §5.1.1] Implement IntersectionObserver for infinite scroll (6 cards per threshold)
- [ ] [PRD §5.1.1] Implement skeleton loading states while chart renders initialize
- [ ] [PRD §5.1.1] Implement staggered fade-in animation on card entry
- [ ] [PRD §5.1.2] Implement Chart Type filter (horizontal pill bar with all 19+ standard types + graph types)
- [ ] [PRD §5.1.2] Implement Library filter (dropdown or pill bar with all 13 libraries)
- [ ] [PRD §5.1.2] Implement Effect filter (dropdown or pill bar with all effect preset names)
- [ ] [PRD §5.1.2] Implement Palette filter (color swatch row with 10+ palettes)
- [ ] [PRD §5.1.2] Implement Use Case filter (dropdown with 8 use cases)
- [ ] [PRD §5.1.2] Implement real-time full-text search on title, subtitle, tags, library, effect
- [ ] [PRD §5.1.2] All filters AND-combined
- [ ] [PRD §5.1.3] Card anatomy: chart preview, title + subtitle, library badge, effect badge, palette dots (4 circles), tag pills
- [ ] [PRD §5.1.3] Card hover state: border color shifts, 4px lift, colored shadow, "View Code" badge fade-in
- [ ] [PRD §13.1] Implement GET /api/templates endpoint with pagination and all filter query params
- [ ] [PRD §16] Gallery pages SSR-rendered for SEO (canonical URLs per chart type)
- [ ] [PRD §16] WCAG 2.1 AA: keyboard navigation for gallery cards
- [ ] [PRD §16] Performance: 8 skeleton cards render in <100ms, charts hydrate within 500ms of library load

### Phase 5: Configuration Modal
- [ ] [PRD §5.2.1] Full-screen overlay modal (max-width 960px) with header, close button, tab switcher
- [ ] [PRD §5.2.1] Shared chart title input (editable, pre-filled with template name)
- [ ] [PRD §5.2.1] Shared live preview panel (right column, interactive, real-time updates)
- [ ] [PRD §5.2.2] Designer Tab: Data Source 3-tab switcher (Sample Data | Upload CSV | Paste Data)
- [ ] [PRD §5.2.2] Designer Tab: Required Data Format schema guide (always visible) with column table and copyable CSV example with Copy + Use This buttons
- [ ] [PRD §5.2.2] Designer Tab: Color Palette 5×2 swatch grid, click to swap, instant preview
- [ ] [PRD §5.2.2] Designer Tab: Visual Effects selector dropdown + intensity slider + toggle + sub-options
- [ ] [PRD §5.2.2] Designer Tab: Data Validation status banner (green/amber/red)
- [ ] [PRD §5.3] CSV parser (papaparse): comma-delimited with header row, numeric auto-detection
- [ ] [PRD §5.3] JSON support in paste mode: auto-detect CSV vs JSON from first character
- [ ] [PRD §5.3] Graph data format: accept { nodes: [...], edges: [...] } JSON structure
- [ ] [PRD §5.3] Accept Neo4j-style property graph JSON from Cypher query exports
- [ ] [PRD §5.3] Data preview table: show first 5 rows (or 10 nodes + 10 edges for graphs)
- [ ] [PRD §5.3] Schema validation against DATA_SCHEMAS per chart type
- [ ] [PRD §16] Data privacy: user CSV/JSON data never leaves the browser
- [ ] [PRD §5.2.3] Developer Tab: Framework selector pill bar (React | Vanilla JS | Vue 3 | Svelte)
- [ ] [PRD §5.2.3] Developer Tab: Syntax-highlighted code block (Shiki, dark theme, line numbers, scrollable)
- [ ] [PRD §5.2.3] Developer Tab: Dependency manifest (package list with versions + purposes)
- [ ] [PRD §5.2.3] Developer Tab: Copy Actions (Copy Code | Copy Install | Download file | Copy Everything)
- [ ] [PRD §5.2.3] Developer Tab: Data Shape Guide (collapsible, TypeScript interface)
- [ ] [PRD §5.2.3] Developer Tab: Effect code toggle (include/exclude effect layer code)
- [ ] [PRD §5.2.3] Developer Tab: Neo4j Connection toggle (graph templates only, adds neo4j-driver boilerplate)
- [ ] [PRD §5.7.2] TypeScript types toggle (default off for JS, on for TS users)
- [ ] [PRD §5.7.1] Generated code: clean, minimal, self-contained, commented at customization points
- [ ] [PRD §5.7.1] PALETTE constant extracted at top of file
- [ ] [PRD §5.7.1] Animation durations, sizes, thresholds as named constants
- [ ] [PRD §16] Modal: 2-col → stacked layout at mobile widths. Code block full-width with horizontal scroll.
- [ ] [PRD §16] ARIA labels on all interactive elements. Keyboard navigation for tabs, code blocks.

### Phase 6: Code Generation System
- [ ] [PRD §9.1] Define template metadata → code generation mapping
- [ ] [PRD §9.1] Create code template registry: chart templates (per library) + effect wrappers (per effect) + framework adapters
- [ ] [PRD §9.1] Implement composable code generation: chart base code + effect wrapper injection + framework transformation
- [ ] [PRD §9.2] React output: functional components with hooks, default export, typed props
- [ ] [PRD §9.2] Vanilla JS output: ES module with render(container, data) function
- [ ] [PRD §9.2] Vue 3 output: SFC with Composition API, <script setup>, reactive refs
- [ ] [PRD §9.2] Svelte output: component with reactive declarations, onMount for library init
- [ ] [PRD §9.3] Dependency manifest generation: packages array, installCommand, peerDeps, totalSize, devDeps
- [ ] [PRD §9.3] Bundle size estimates (from bundlephobia data or hardcoded estimates)
- [ ] [PRD §9.4] Post-processing: Prettier formatting on generated code
- [ ] [PRD §9.4] Code quality: ESLint clean, React strict mode compatible, no console.log
- [ ] [PRD §9.4] All components self-contained (single file, no relative imports except effect module)
- [ ] [PRD §9.4] Sample data included as default prop/variable with replacement comment
- [ ] [PRD §13.1] Implement GET /api/templates/:id/code endpoint
- [ ] [PRD §13.1] Implement GET /api/templates/:id/dependencies endpoint

### Phase 7: Workspace & Export
- [ ] [PRD §5.4] Fixed bottom drawer, horizontally scrollable
- [ ] [PRD §5.4] Each card: title with upload status, live chart preview (180px), size picker
- [ ] [PRD §5.4] Image actions: Export PNG, Export SVG (Phase 2 deferred), Push to Canva
- [ ] [PRD §5.4] Code actions: Copy Code (last-selected framework), Copy Install Command
- [ ] [PRD §5.4] Card actions: Remove chart from workspace
- [ ] [PRD §5.5.1] Size picker: visual aspect ratio preview box, scrollable preset pills, custom dimension inputs
- [ ] [PRD §5.5.1] All 11 size presets: Auto, Square (1:1), Widescreen (16:9), Presentation (4:3), Photo (3:2), Ultra-wide (21:9), Story (9:16), A4, Letter, 4K, Custom (100-8000px)
- [ ] [PRD §5.5.2] PNG export: rasterized at 2× scale, dark background (#0F172A), effects baked in
- [ ] [PRD §5.5.2] SVG export stub (Phase 2 feature — placeholder "Coming Soon" label)
- [ ] [PRD §5.5.2] Export pipeline: SVG-based libs → serialize SVG → canvas → PNG. Canvas-based libs → canvas.toBlob directly.
- [ ] [PRD §16] PNG export <1.5s for any size up to 4K
- [ ] [PRD §16] Verify export path for each of the 13 libraries individually

### Phase 8: Canva Integration (Mocked)
- [ ] [PRD §5.6] OAuth 2.0 + PKCE flow UI: "Connect to Canva" button, redirect, callback handling
- [ ] [PRD §5.6] Backend proxy for token exchange (POST /auth/canva, GET /auth/canva/callback)
- [ ] [PRD §5.6] Mock Canva OAuth: return fake token on callback for local dev
- [ ] [PRD §13.1] POST /api/canva/upload: mock upload endpoint that simulates success after 2s delay
- [ ] [PRD §13.1] GET /api/canva/upload/:jobId: mock poll endpoint that returns completed status
- [ ] [PRD §5.6] Asset name includes chart type + effect + dimensions (e.g., "Bar Chart — Neon Glow — 1920×1080")
- [ ] [PRD §5.6] Per-chart and batch upload support
- [ ] [PRD §16] Sequential upload queue with progress UI
- [ ] [PRD §5.6] Upload status tracking in workspace cards
- [ ] Build real Canva integration behind feature flag (activate when credentials obtained)

### Phase 9: AI Generation Pipeline (Mocked)
- [ ] [PRD §7.2] Stage 1 — Prompt Assembly: structured generation prompt with library API reference, effect spec, data schema
- [ ] [PRD §7.2] Stage 2 — Code Generation: mock Claude API → return pre-built template code (initially)
- [ ] [PRD §7.2] Stage 3 — Render Validation: Puppeteer renders component, captures screenshots at 3 viewport sizes
- [ ] [PRD §7.2] Stage 4 — Visual Quality Scoring: mock vision scoring → return score 75-85 (initially)
- [ ] [PRD §7.5] Compilation gate: ESLint + TypeScript compiler (0 errors, ≤3 warnings)
- [ ] [PRD §7.5] Render gate: headless browser renders component (no JS errors, not blank, renders within 5s)
- [ ] [PRD §7.5] Dimensions gate: chart fills container (visible area >60%)
- [ ] [PRD §7.5] Text legibility gate: no text <10px, no overlapping elements
- [ ] [PRD §7.5] Effect integrity gate: no artifacts, no z-index bleed
- [ ] [PRD §7.5] Code quality gate: all 4 framework outputs compile
- [ ] [PRD §7.5] Data compatibility gate: chart renders with 3 different test datasets
- [ ] [PRD §7.5] Retry logic: max 3 retries with error feedback in prompt
- [ ] [PRD §14.2] BullMQ + Redis job queue for pipeline orchestration
- [ ] [PRD §14.2] S3/R2 storage for generated code + screenshots
- [ ] [PRD §7.3.1] Diversity scheduler: target distribution across chart types, libraries, effects
- [ ] [PRD §7.3.1] Batch cadence: 100+ candidates/week in batches of 20
- [ ] [PRD §7.3.1] No auto-publish: every template goes through approval queue
- [ ] [PRD §5.8.1] Generate bar in gallery header: prompt input + generate button
- [ ] [PRD §5.8.1] Shimmer/loading state on placeholder card during generation
- [ ] [PRD §5.8.1] Result injection: generated chart as first gallery card with "AI Generated" badge
- [ ] [PRD §5.8.1] Regenerate + Refine buttons on result card
- [ ] [PRD §5.8.2] NL prompt parsing: chart type, library, effect, palette, use case, data type, style direction, combinations
- [ ] [PRD §5.8.3] Generation states: Idle, Generating, Success, Failed (with error + retry + suggestion)
- [ ] [PRD §7.3.2] Cache check: if existing template ≥80% spec overlap, surface immediately
- [ ] [PRD §7.3.2] User results are personal (not public gallery)
- [ ] [PRD §7.3.2] "Submit to Gallery" button on personal results → enters approval queue
- [ ] [PRD §7.7] "Suggest alternatives" button in configuration modal (3 AI variations)
- [ ] [PRD §7.7] "Generate similar" button on workspace cards (same data shape, different style)
- [ ] [PRD §7.8.1] Rate limiting: 10 generations/user/day (free tier)
- [ ] [PRD §13.1] POST /api/generate endpoint (returns jobId)
- [ ] [PRD §13.1] GET /api/generate/:jobId endpoint (poll status)
- [ ] [PRD §13.1] POST /api/generate/:jobId/variations endpoint
- [ ] [PRD §13.1] POST /api/generate/:jobId/submit endpoint
- [ ] Wire real Claude API behind feature flag (activate when key obtained)

### Phase 10: Admin Approval Queue
- [ ] [PRD §7.4.1] Approval queue dashboard: sortable list with thumbnail, title, type, library, effect, score, source, timestamp
- [ ] [PRD §7.4.1] Priority sorting: user-submitted first, then by quality score, underrepresented combos boosted
- [ ] [PRD §7.4.1] Batch review: select multiple candidates, approve/reject in bulk
- [ ] [PRD §7.4.1] Filters: status, chart type, library, effect, score range, source, date range
- [ ] [PRD §7.4.2] Approve action: publish template to gallery (immediate)
- [ ] [PRD §7.4.2] Approve with edits: adjust title, subtitle, tags, palette before publish
- [ ] [PRD §7.4.2] Request revision: reviewer notes → re-generation with feedback → re-enter queue
- [ ] [PRD §7.4.2] Reject action: mark reason code + notes, log for analysis
- [ ] [PRD §7.4.3] Review criteria guidance displayed in UI (visual quality, correctness, code quality, effect integrity, uniqueness, appropriateness, metadata completeness)
- [ ] [PRD §7.4.5] Borderline quality (score 65-75) flagged for senior reviewer
- [ ] [PRD §7.4.5] User-submitted rejection → user notification with reason + suggestion
- [ ] [PRD §7.4.5] Queue overflow: pause background pipeline at >200 pending, resume at <100
- [ ] [PRD §7.4.5] Emergency unpublish: any reviewer can unpublish immediately
- [ ] [PRD §13.1] GET /admin/approval/queue endpoint
- [ ] [PRD §13.1] POST /admin/approval/:id/approve endpoint
- [ ] [PRD §13.1] POST /admin/approval/:id/revision endpoint
- [ ] [PRD §13.1] POST /admin/approval/:id/reject endpoint
- [ ] [PRD §13.1] GET /admin/approval/stats endpoint
- [ ] Admin authentication (JWT or session-based, separate from public users)

### Phase 11: Analytics & Feedback Loops
- [ ] [PRD §13.1] POST /api/analytics/event endpoint (track view, export, code_copy, canva_push)
- [ ] [PRD §7.6] Approval feedback loop: reviewer rejection notes categorize into prompt improvements
- [ ] [PRD §7.6] User engagement feedback: track most-exported/copied templates → bias generation
- [ ] [PRD §7.6] Automated failure analysis: categorize quality gate failures → improve prompts
- [ ] [PRD §7.6] Catalog gap detection: identify underrepresented type/library/effect combos
- [ ] [PRD §7.6] Style evolution: track reviewer approval patterns → adjust generation weights
- [ ] [PRD §7.6] Queue health monitoring: auto-throttle background gen when queue >200
- [ ] [PRD §12.2] Template popularity metrics (views, exports, code copies) for ranking

### Phase 12: Template Seeding & Launch Prep
- [ ] [PRD §17.1] Seed batch: 150 hand-crafted templates (19 standard types × 3-4 libs × 2 variants + 16 graph types × 2-3 libs)
- [ ] [PRD §17.1] AI batch: 150+ AI-generated templates across full matrix (requires real Claude API)
- [ ] [PRD §17.1] Total at launch: 300+ templates including 80+ graph/network templates
- [ ] [PRD §17.4] Every template renders correctly with default sample data + 3 additional test datasets
- [ ] [PRD §17.4] Code export compiles for all 4 frameworks per template
- [ ] [PRD §17.4] Auto-generated title, subtitle, tags, use cases per template
- [ ] [PRD §16] Full accessibility audit (WCAG 2.1 AA)
- [ ] [PRD §16] Performance audit: initial JS <150KB gzip, each library chunk <100KB gzip
- [ ] [PRD §16] Cross-browser testing: Chrome 95+, Firefox 95+, Safari 16+, Edge 95+
- [ ] [PRD §16] Mobile responsiveness audit at 320px width
- [ ] [PRD §16] Security audit: PKCE, encrypted tokens, CSP, rate limiting
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway
- [ ] Configure production PostgreSQL, Redis, S3/R2

---

## Wiring Checklist

Dependencies ordered: things that other things depend on come first.

### Foundation Wiring (Phase 1)
- [ ] TypeScript types for TemplateMetadata match §10.1 schema exactly (including graph fields)
- [ ] Zustand store shape matches §12.1 client state exactly
- [ ] All API endpoint stubs return correctly shaped responses
- [ ] Dynamic import infrastructure works for at least one chart library
- [ ] Design tokens from §15.1 are Tailwind CSS variables (not hardcoded hex values)
- [ ] Font loading: DM Sans and JetBrains Mono load without FOUT

### Render Engine Wiring (Phase 2)
- [ ] ChartRenderer accepts TemplateMetadata + data + palette + dimensions → renders chart
- [ ] Each library wrapper implements the same interface (standardized props)
- [ ] Library wrappers handle their own cleanup on unmount (no memory leaks)
- [ ] Palette adapter transforms 5-color array to each library's theming API format
- [ ] Render isolation: two different libraries rendering side-by-side don't conflict
- [ ] Dynamic import: library code only loads when a chart using it enters the viewport
- [ ] Skeleton/fallback renders while library is loading
- [ ] Error boundary catches render failures and shows fallback image
- [ ] Graph libraries receive nodes/edges data (not row/column data)
- [ ] Graph layout configs are applied correctly (force params, hierarchy direction, etc.)
- [ ] Graph interactions (zoom, drag, hover, search) work in gallery preview mode

### Effects Wiring (Phase 3)
- [ ] EffectWrapper composes background + chart + overlay + animation layers in correct z-order
- [ ] Effect intensity slider (0-100%) actually scales effect parameters
- [ ] Effect toggle (on/off) completely removes effect DOM elements when off
- [ ] Composability rules enforced: can't select two overlays, two backgrounds, etc.
- [ ] Houdini effects have working CSS/SVG fallbacks for Firefox and Safari
- [ ] Mobile degradation: effects detect low-power devices and reduce/skip heavy effects
- [ ] Effects don't block chart interactivity (tooltips, axes still work)
- [ ] Effects render correctly in export pipeline (baked into PNG)

### Gallery Wiring (Phase 4)
- [ ] GET /api/templates returns paginated data matching gallery expectations
- [ ] Gallery filters update URL query params (shareable filtered views)
- [ ] IntersectionObserver triggers load at correct scroll position
- [ ] Cards render live charts (not static images) using ChartRenderer
- [ ] Filter state persists across card clicks (return to same filtered view after closing modal)
- [ ] Search is debounced (300ms) to avoid excessive API calls
- [ ] SSR renders gallery shell for SEO; client hydrates with live charts

### Modal Wiring (Phase 5)
- [ ] Click card → modal opens with correct template metadata
- [ ] Live preview updates in real-time when palette, effect, or data changes
- [ ] Data validation runs automatically on upload/paste and displays correct status
- [ ] Developer tab code preview calls /api/templates/:id/code and renders with Shiki
- [ ] Framework switching triggers new API call and updates code + dependencies
- [ ] "Add to Workspace" pushes correctly shaped WorkspaceChart to Zustand store
- [ ] Modal close returns to gallery with filters preserved
- [ ] Neo4j toggle only appears for graph templates (chartType starts with 'graph-')
- [ ] Data Shape Guide shows correct TypeScript interface for the template's data schema

### Code Generation Wiring (Phase 6)
- [ ] /api/templates/:id/code returns compilable code for all 4 frameworks
- [ ] Effect wrapper code is included when includeEffects=true, excluded when false
- [ ] TypeScript types are included when includeTypes=true
- [ ] Dependency manifest lists all required packages with correct versions
- [ ] Install command is a valid npm install one-liner
- [ ] Generated code passes ESLint recommended config (0 errors)
- [ ] React output passes React strict mode without warnings
- [ ] Each generated file is self-contained (no relative imports)
- [ ] Sample data is included as default prop with replacement comment
- [ ] PALETTE constant is at top of file
- [ ] Neo4j boilerplate is included for graph templates when neo4jBoilerplate=true

### Export Wiring (Phase 7)
- [ ] Export pipeline works for all 13 libraries (tested individually)
- [ ] PNG export at 2x scale produces correct dimensions
- [ ] Dark background (#0F172A) is applied to all exports
- [ ] Effects are baked into PNG (not just overlaid in DOM)
- [ ] Size presets produce correct pixel dimensions
- [ ] Custom dimensions enforce 100-8000px range
- [ ] Export completes in <1.5s for sizes up to 4K
- [ ] Download triggers correct filename (template title + dimensions + .png)

### Canva Wiring (Phase 8)
- [ ] OAuth flow: click → redirect → callback → token stored → "Connected" state shown
- [ ] Upload: PNG blob → POST /api/canva/upload → Canva API → status poll → success
- [ ] Asset name format: "Chart Type — Effect — WxH"
- [ ] Upload status reflected in workspace card (pending/success/error)
- [ ] Re-auth flow triggers on 401 response
- [ ] Rate limiting: 429 response shows "try again" with countdown
- [ ] Mock endpoints simulate realistic timing and responses

### AI Pipeline Wiring (Phase 9)
- [ ] Prompt parsing → structured spec correctly maps NL to template fields
- [ ] Cache check uses Redis → returns existing template on hit
- [ ] Code generation → ESLint validation → retry with error feedback works
- [ ] Puppeteer renders generated component without crashes
- [ ] Screenshot capture produces usable images at 3 viewport sizes
- [ ] Quality scoring → pass/fail decision at threshold 70
- [ ] Passing candidates are inserted into approval queue DB table
- [ ] Failing candidates are logged with failure reason
- [ ] BullMQ job lifecycle: created → processing → completed/failed
- [ ] User-facing generation: prompt → jobId → poll → result in <15s
- [ ] Personal results appear as gallery cards in user's session only
- [ ] "Submit to Gallery" adds to approval queue with generationSource='user'
- [ ] Rate limiting enforced at 10/user/day

### Approval Queue Wiring (Phase 10)
- [ ] Queue loads candidates sorted by priority (user-submitted first)
- [ ] Approve → template appears in public gallery on next load
- [ ] Approve with edits → metadata changes saved before publish
- [ ] Request revision → feedback stored → candidate re-enters pipeline
- [ ] Reject → reason logged → candidate marked rejected
- [ ] Queue overflow → background pipeline pauses at >200 pending
- [ ] Emergency unpublish → template removed from gallery immediately

### Analytics Wiring (Phase 11)
- [ ] View events fire when cards scroll into viewport
- [ ] Export events fire on PNG download
- [ ] Code copy events fire on clipboard write
- [ ] Canva push events fire on successful upload
- [ ] Generation events fire on prompt submission and completion
- [ ] Feedback loop data is accessible to AI pipeline scheduler

---

## Build Order

**Phase 1: Foundation** (no dependencies)
→ Checkpoint

**Phase 2: Chart Render Engine** (depends on Phase 1: types, dynamic import infra)
→ Checkpoint

**Phase 3: Visual Effects System** (depends on Phase 2: chart renders to wrap)
→ Checkpoint

**Phase 4: Gallery & Browse Experience** (depends on Phase 2 + 3: charts + effects to display)
→ Checkpoint

**Phase 5: Configuration Modal** (depends on Phase 4: gallery to open from, Phase 2+3: render + effects)
→ Checkpoint

**Phase 6: Code Generation System** (depends on Phase 2: library knowledge for templates. Can partially parallelize with Phase 5)
→ Checkpoint

**Phase 7: Workspace & Export** (depends on Phase 5: modal feeds workspace, Phase 2+3: render for export)
→ Checkpoint

**Phase 8: Canva Integration** (depends on Phase 7: export pipeline provides PNG blobs. Mocked.)
→ Checkpoint

**Phase 9: AI Generation Pipeline** (depends on Phase 2+3+6: render engine + effects + code gen all must exist. Mocked AI.)
→ Checkpoint

**Phase 10: Admin Approval Queue** (depends on Phase 9: pipeline feeds candidates)
→ Checkpoint

**Phase 11: Analytics & Feedback Loops** (depends on Phases 4-10: events from all user interactions)
→ Checkpoint

**Phase 12: Template Seeding & Launch Prep** (depends on everything: full stack must work)
→ Final PRD Compliance Audit
