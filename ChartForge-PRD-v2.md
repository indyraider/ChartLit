# ◈ ChartForge

## Product Requirements Document

### *The variant.com of charts.*

A visual chart marketplace where designers browse and export publication-ready visualizations, and developers copy production code. Multi-library rendering. Visual effects layers. Direct Canva integration.

|                  |               |
|------------------|---------------|
| **Field**        | **Detail**    |
| Version          | 2.0           |
| Status           | Draft         |
| Last Updated     | March 9, 2026 |
| Product Lead     | [Your Name] |
| Engineering Lead | [Your Name] |
| Target Launch    | TBD           |

# Table of Contents

**1. Product Vision & Positioning**

**2. Goals & Success Metrics**

**3. User Personas**

**4. Information Architecture**

**5. Feature Specifications**

## 5.1 Chart Gallery (Browse Experience)

## 5.2 Chart Configuration Modal

## 5.3 Data Connection & Validation

## 5.4 Workspace Panel

## 5.5 Export System & Size Controls

## 5.6 Canva Integration

## 5.7 Developer Tab & Code Export

## 5.8 AI Generation Interface

**6. Multi-Library Rendering Engine**

## 6.1 Supported Charting Libraries

## 6.2 Chart Type × Library Matrix

## 6.3 Rendering Strategy

**7. AI Template Generation Engine (Core)**

## 7.1 Why AI Generation Is MVP

## 7.2 Generation Pipeline Architecture

## 7.3 Prompt → Template Workflow

## 7.4 Quality Gate System

## 7.5 Continuous Generation Loop

## 7.6 User-Facing AI Generation

## 7.7 AI Models & Infrastructure

**8. Visual Effects System**

## 8.1 Effect Layer Architecture

## 8.2 Effect Libraries & Capabilities

## 8.3 Effect Presets

## 8.4 Effect Composability Rules

**9. Code Export System**

## 9.1 Code Generation Pipeline

## 9.2 Framework Targets

## 9.3 Dependency Manifest

## 9.4 Code Preview & Copy UX

**10. Chart Template Taxonomy**

**11. Color Palette System**

**12. Data Architecture**

**13. API & Integration Specs**

**14. Technical Architecture**

**15. UI/UX Specifications**

**16. Non-Functional Requirements**

**17. Content Strategy (Gallery Scale)**

**18. Future Roadmap**

**19. Open Questions & Risks**

---

# 1. Product Vision & Positioning

## 1.1 Vision

**ChartForge is the variant.com of charts — powered by an AI generation engine that makes the catalog genuinely endless.** Just as variant.com became the definitive gallery for UI component inspiration, ChartForge does the same for data visualization. But where a human-curated gallery hits a ceiling, ChartForge’s AI continuously generates new chart templates across multiple charting libraries, visual effect layers, and color palettes — producing production-ready code and export-ready images. The AI generation engine is not a future feature; it is the core product moat. It is the system that turns ChartForge from a gallery of 200 hand-crafted templates into an ever-expanding universe of thousands of unique chart styles that no competitor can replicate.

## 1.2 Problem Statement

The data visualization ecosystem has two fundamental gaps:

- **No visual discovery layer.** Charting libraries (D3, Chart.js, Recharts, Plotly, etc.) have docs with basic examples, but there is no cross-library gallery where users can browse the full spectrum of what’s possible and compare styles side by side. Discovering a beautiful chart today requires stumbling across it on someone’s blog or CodePen.

- **Charts are ugly by default.** Every charting library produces functional but visually unremarkable output out of the box. Getting a chart to look publication-ready requires deep knowledge of the library’s API, plus layering in animations, gradients, particles, glow effects, or 3D transforms — techniques most users never explore.

- **The copy-paste gap.** When a developer does find a chart style they like, recreating it means reverse-engineering someone else’s code. There is no “View source” button that gives you clean, dependency-aware, framework-targeted code you can drop into a project.

- **Export-to-design is still broken.** Getting charts from code into Canva, Figma, or PowerPoint still requires screenshots and manual resizing.

## 1.3 Solution

ChartForge solves all four problems with a system where AI is the engine, not a feature:

1.  **AI-generated endless catalog:** An AI pipeline continuously generates new chart templates — writing real charting library code (D3, Chart.js, Recharts, etc.), applying visual effect layers, and producing framework-specific exports. Every generated template is validated by automated quality gates (compiles, renders, passes visual regression) before entering the gallery. This is the moat: competitors can’t replicate a catalog that grows daily by itself.

2.  **Visual-first gallery:** An endlessly scrollable Pinterest-style grid of chart styles, filterable by type, library, effect, palette, and use case. AI generation ensures the scroll never ends.

3.  **Multi-library rendering:** Charts are rendered using the best library for the job — Recharts, Chart.js, D3, Plotly, Nivo, Three.js, and more. The AI understands each library’s API and generates idiomatic code per library.

4.  **Visual effects layer:** Each chart can be enhanced with composable effect layers — particles, glow, gradients, noise, glass morphism, 3D perspective — and the AI can generate novel effect combinations that humans wouldn’t think to try.

5.  **Dual-mode output:** Designers get PNG/SVG export at precise dimensions with Canva push. Developers get a code tab with clean, copy-pasteable source code, a dependency manifest, and framework-specific variants.

## 1.4 Product Principles

- **AI is the engine, not a feature.** The AI generation pipeline is the core system that scales the catalog. It runs continuously, producing new templates that are validated and published without human intervention. Manual curation adds polish; AI provides scale.

- **Endlessly browseable.** The AI pipeline continuously generates candidate templates that pass automated quality gates, then enter a human approval queue before publishing. The catalog grows steadily and predictably, always staying ahead of what users can exhaust.

- **Library-agnostic.** Users pick a visual style; the library is an implementation detail. The AI generates across all supported libraries.

- **Effects are first-class.** Visual effects are a primary axis of differentiation. The AI explores effect combinations that humans wouldn’t think to try.

- **Code is the product (for developers).** Generated code must be production-quality: clean, commented, minimal deps, framework-idiomatic. AI output passes the same quality bar as hand-written code.

- **Zero-config beauty.** Every chart looks stunning with default settings. Customization is additive, not required.

- **Non-destructive.** Users can swap data, palette, effects, and export size without starting over.

## 1.5 Competitive Positioning

|                          |                                |                                                                                                    |
|--------------------------|--------------------------------|----------------------------------------------------------------------------------------------------|
| **Product**              | **What It Does**               | **ChartForge Differentiator**                                                                      |
| variant.com              | UI component gallery with code | ChartForge is this, but for charts. Visual-first browsing with real data + code export.            |
| Recharts / Chart.js / D3 | Charting libraries             | ChartForge uses these as rendering engines. Users don’t pick a library — they pick a visual style. |
| Datawrapper / RAWGraphs  | Data-first chart builders      | ChartForge is visual-first. Browse styles before touching data.                                    |
| CodePen / Observable     | Code playgrounds               | ChartForge is curated, styled, and export-ready. Not a sandbox.                                    |
| Canva Charts             | Simple chart widget in Canva   | ChartForge offers 10× the variety and pushes charts into Canva as premium assets.                  |

---

# 2. Goals & Success Metrics

## 2.1 Primary Goals

1.  Launch with 300+ AI-generated + human-curated templates across 8+ charting libraries, 5+ graph visualization libraries, and 20+ visual effect presets including graph-specific effects.

2.  AI pipeline generates 50+ validated new templates per week from day one, growing the catalog faster than users can browse.

3.  Enable designers to export a chart in under 60 seconds from first pageview.

4.  Enable developers to copy chart code with full dependency manifest in under 30 seconds.

5.  Achieve 40%+ Canva connection rate among design-track users.

6.  Achieve 60%+ code copy rate among developer-track users.

7.  Users can describe a chart in natural language and get a generated, browseable result in under 15 seconds.

## 2.2 Key Performance Indicators

|                                     |                             |                                                                     |
|-------------------------------------|-----------------------------|---------------------------------------------------------------------|
| **KPI**                             | **Target**                  | **Measurement**                                                     |
| Gallery browse depth                | > 20 cards viewed          | Average cards scrolled per session                                  |
| Time to first export (designer)     | < 60s                      | Median pageview → PNG download or Canva push                        |
| Time to first code copy (developer) | < 30s                      | Median pageview → code copy event                                   |
| Code copy rate                      | > 60%                      | Sessions with at least one code copy / dev-tab sessions             |
| Data upload success rate            | > 85%                      | Uploads passing schema validation / total uploads                   |
| Canva push rate                     | > 3 charts/session         | Average charts sent per connected session                           |
| Effect usage rate                   | > 45%                      | Charts configured with non-default effects / total configured       |
| Template catalog growth             | +50/week (AI)               | Net new validated templates published weekly by AI pipeline         |
| AI automated pass rate              | > 70%                      | Templates passing all automated quality gates / total generated     |
| AI approval rate                    | 60–75%                      | Templates approved by reviewers / templates entering approval queue |
| AI prompt-to-personal time          | < 15 seconds               | User submits prompt → personal chart result rendered                |
| Approval queue turnaround           | < 4 hours (user-submitted) | Median time from user submission to reviewer decision               |
| Return visit rate                   | > 35%                      | Users returning within 7 days                                       |

---

# 3. User Personas

## 3.1 Content Designer — “Sarah”

Creates social media graphics and reports in Canva. Wants beautiful charts that match her brand. Doesn’t write code. Needs: **browse → connect data → export PNG → push to Canva.** Cares about exact size presets (1:1, 16:9, Story). Values palette customization and visual effects that make charts feel premium.

## 3.2 Frontend Developer — “Marcos”

Building a React SaaS dashboard. Browsing for chart styles that look better than default Chart.js. Needs: **browse → preview with his data shape → copy React code + npm install command.** Cares about clean code, minimal dependencies, and framework-idiomatic output. Wants to know which library powers each chart.

## 3.3 Data Journalist — “Aisha”

Publishes data stories with embedded visualizations. Uses D3 heavily. Browses ChartForge for **visual inspiration and D3-specific implementations** she hasn’t seen before. Exports both vanilla JS code for articles and high-res PNGs for social media promotion. Particularly interested in effects that add editorial flair (animated gridlines, noise textures).

## 3.4 Startup Founder — “Jin”

Building pitch decks and investor reports. Not technical. Needs charts that look like they came from a design agency. Browses by **use case (“pitch deck”, “financial report”)**. Exports at exact presentation dimensions. Pushes to Canva for slide assembly.

---

# 4. Information Architecture

ChartForge is a single-page application with four logical layers:

|           |                     |                                                                                                                                                           |
|-----------|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Layer** | **Component**       | **Description**                                                                                                                                           |
| Browse    | Chart Gallery       | Masonry grid with infinite scroll. Multi-axis filtering (type, library, effect, palette, use case). Text search. Tag pills.                               |
| Configure | Configuration Modal | Two-tab modal: Designer Tab (data, palette, effects, title, preview) and Developer Tab (code preview, framework selector, dependency list, copy actions). |
| Build     | Workspace Panel     | Persistent bottom drawer. Horizontally scrollable chart cards. Per-chart size picker. Export PNG / Push Canva / Copy Code.                                |
| Export    | Export System       | Dual-track output: image export (PNG/SVG, size presets, Canva push) and code export (framework-targeted source, dependency manifest, bundle preview).     |

*User flow:* Gallery → Card Click → Configure (Designer or Developer tab) → Add to Workspace → Export Image / Copy Code

---

# 5. Feature Specifications

## 5.1 Chart Gallery (Browse Experience)

### 5.1.1 Layout & Infinite Scroll

- 3-column masonry grid (3 cols > 1024px, 2 > 640px, 1 mobile). Each card shows a live rendered chart preview with real sample data.

- IntersectionObserver triggers loading 6 more cards per scroll threshold. Templates are served from a paginated catalog API.

- Cards vary in height based on chart type (compact sparklines vs. tall radial charts) to create organic masonry flow.

- Skeleton loading states while chart renders initialize. Staggered fade-in animation on card entry.

### 5.1.2 Multi-Axis Filtering

The gallery supports simultaneous filtering across multiple dimensions. All filters are AND-combined:

|                 |                      |                                                                                                                                                                           |
|-----------------|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Filter Axis** | **UI Element**       | **Options**                                                                                                                                                               |
| Chart Type      | Horizontal pill bar  | Bar, Line, Area, Pie/Donut, Scatter, Radar, Radial, Treemap, Heatmap, Funnel, Waterfall, Gauge, Sankey, 3D, Composed, Graph/Network, Knowledge Graph, Org Chart, Mind Map |
| Library         | Dropdown or pill bar | Recharts, Chart.js, D3, Plotly, Nivo, ECharts, Three.js, Lightweight Charts, G6, react-force-graph, Cytoscape.js, Sigma.js, vis-network                                   |
| Effect          | Dropdown or pill bar | None, Glow/Neon, Particles, Gradient Mesh, Noise Texture, Glass, Animated Grid, 3D Perspective, Parallax, Hand-drawn/Sketch                                               |
| Palette         | Color swatch row     | All named palettes (10+ at launch)                                                                                                                                        |
| Use Case        | Dropdown             | Dashboard, Presentation, Social Media, Report, Infographic, Pitch Deck, Editorial, Print                                                                                  |
| Search          | Text input in header | Real-time full-text search on title, subtitle, tags, library name, effect name                                                                                            |

### 5.1.3 Card Anatomy

- **Chart preview:** Live-rendered chart (not static image). Actual sample data with the template’s effects applied.

- **Title + subtitle:** Template name and one-line description.

- **Library badge:** Small pill showing the rendering library (e.g., “D3”, “Recharts”).

- **Effect badge:** If effects are applied, a second pill shows the effect name (e.g., “Glow”, “Particles”).

- **Palette dots:** 4 small colored circles showing the palette.

- **Tag pills:** Filterable category tags (comparison, trend, composition, etc.).

- **Hover state:** Border color shifts to primary palette color. Card lifts 4px. Colored shadow appears. “View Code” badge fades in (for developer users).

## 5.2 Chart Configuration Modal

Full-screen overlay (max-width 960px). Contains **two tabs** at the top: **Designer** and **Developer**. The modal header, title input, and live preview are shared between both tabs. Tab-specific controls appear below.

### 5.2.1 Shared Elements

- **Modal header:** Template title, close button, tab switcher (Designer \| Developer).

- **Chart title input:** Editable text field, pre-filled with template name.

- **Live preview panel:** Right column. Renders chart with current data, palette, effects, and title. Interactive (tooltips, axes). Updates in real time.

### 5.2.2 Designer Tab

|                      |                                    |                                                                                                                                                                             |
|----------------------|------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Section**          | **Component**                      | **Behavior**                                                                                                                                                                |
| Data Source          | 3-tab switcher                     | Sample Data (default) \| Upload CSV \| Paste Data                                                                                                                           |
| Required Data Format | Schema guide (always visible)      | Description, column table (name/type/required/desc), copyable CSV example with Copy + Use This buttons                                                                      |
| Color Palette        | 5×2 swatch grid                    | 10+ named palettes. Click to swap. Instant preview update.                                                                                                                  |
| Visual Effects       | Effect selector + intensity slider | Dropdown of available effects for this chart type. Intensity slider (0–100%). Toggle to enable/disable. Some effects have sub-options (e.g., particle density, glow color). |
| Data Validation      | Status banner                      | Green (all required columns found) / Amber (missing columns listed) / Red (parse error)                                                                                     |

### 5.2.3 Developer Tab

|                     |                               |                                                                                                                               |
|---------------------|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| **Section**         | **Component**                 | **Behavior**                                                                                                                  |
| Framework Selector  | Pill bar                      | React (default) \| Vanilla JS \| Vue 3 \| Svelte. Switching regenerates code.                                                 |
| Code Preview        | Syntax-highlighted code block | Full component source code. Line numbers. Scrollable. Dark theme syntax highlighting (Prism or Shiki).                        |
| Dependency Manifest | Package list + copy button    | Shows npm package names and versions. One-click copy of the full npm install command.                                         |
| Copy Actions        | Button group                  | Copy Code \| Copy Install Command \| Download as File (.jsx, .vue, .svelte, .js)                                              |
| Data Shape Guide    | Collapsible section           | Shows the TypeScript interface / prop type for the chart’s data input.                                                        |
| Effect Code         | Toggle                        | Include/exclude effect layer code. When included, adds the effect library imports and wrapper components.                     |
| Neo4j Connection    | Toggle (graph templates only) | Include neo4j-driver import and Bolt connection boilerplate with Cypher query stub. Adds neo4j-driver to dependency manifest. |

## 5.3 Data Connection & Validation

Same specification as v1 PRD. CSV parser handles comma-delimited data with header row. Numeric auto-detection. Schema validation against DATA_SCHEMAS per chart type. Three sources: sample data, file upload, paste.

Additionally in v2:

- **JSON support:** Accept JSON array-of-objects in paste mode. Auto-detect CSV vs JSON from first character.

- **Graph data format:** For graph/network templates, accept { nodes: [...], edges: [...] } JSON structure. Nodes require id; edges require source and target. Additional properties (label, group, weight) are optional. Also accept Neo4j-style property graph JSON exported from Cypher queries.

- **Data preview table:** Show first 5 rows (or first 10 nodes + 10 edges for graph data) in a compact table after successful parse, so users can verify before applying.

- **Column remapping (Phase 2):** Dropdown per required column to map user’s column names to expected schema fields.

## 5.4 Workspace Panel

Fixed bottom drawer, horizontally scrollable. Each card (400px wide) shows: title with upload status, live chart preview (180px), size picker, and three action tracks:

- **Image actions:** Export PNG, Export SVG, Push to Canva.

- **Code actions:** Copy Code (uses last-selected framework), Copy Install Command.

- **Card actions:** Remove chart from workspace.

## 5.5 Export System & Size Controls

Each workspace card includes an inline size picker. Same spec as v1: visual aspect ratio preview box, scrollable preset pills, custom dimension inputs, description line.

### 5.5.1 Size Presets

|              |           |                   |                             |
|--------------|-----------|-------------------|-----------------------------|
| **Preset**   | **Label** | **Dimensions**    | **Use Case**                |
| Auto         | Auto      | Match render size | Quick export                |
| Square       | 1:1       | 1080 × 1080       | Instagram, social posts     |
| Widescreen   | 16:9      | 1920 × 1080       | Presentations, YouTube      |
| Presentation | 4:3       | 1440 × 1080       | Slides                      |
| Photo        | 3:2       | 1620 × 1080       | Blog headers                |
| Ultra-wide   | 21:9      | 2520 × 1080       | Website banners             |
| Story        | 9:16      | 1080 × 1920       | Instagram Stories, Reels    |
| A4           | A4        | 2480 × 3508       | Print documents             |
| Letter       | Letter    | 2550 × 3300       | US Letter print             |
| 4K           | 4K        | 3840 × 2160       | High-res displays           |
| Custom       | Custom    | User-defined      | Any dimensions (100–8000px) |

### 5.5.2 Export Formats

- **PNG:** Rasterized at 2× scale. Dark background (#0F172A). Effects baked in.

- **SVG (Phase 2):** Vector export for charts without canvas-dependent effects. Effects that require rasterization fall back to PNG.

- **Canva push:** Same rendering pipeline as PNG. Uploaded via Canva Connect API asset upload endpoint.

## 5.6 Canva Integration

Same OAuth 2.0 + PKCE flow as v1. Backend proxies token exchange due to CORS. Upload via POST /v1/asset-uploads. Poll job status. Per-chart and batch upload supported.

The key addition in v2: the asset name sent to Canva now includes the chart type and effect, e.g., **"Bar Chart — Neon Glow — 1920×1080"**, making charts searchable in the user’s Canva library.

## 5.7 Developer Tab & Code Export

This is the core differentiator that makes ChartForge the **variant.com of charts**. The Developer Tab in the configuration modal provides production-ready source code for any chart in the gallery.

### 5.7.1 Code Generation Requirements

- **Clean and minimal.** Generated code should be something a senior developer would write. No scaffolding noise, no framework boilerplate beyond what’s needed, no inline SVG dumps.

- **Self-contained.** Each exported component works as a single file. All props are typed (TypeScript optional toggle). Sample data is included as a default prop.

- **Commented.** Key customization points are annotated: // Change palette colors here, // Adjust animation duration, // Replace with your data, etc.

- **Effect-inclusive.** If an effect layer is enabled, the code includes the effect wrapper, its imports, and any CSS needed. A toggle lets developers exclude effects for a bare chart.

- **Framework-idiomatic.** React code uses hooks and functional components. Vue code uses Composition API. Svelte code uses reactive declarations. Vanilla JS uses modern ES modules.

### 5.7.2 Code Preview UX

- Syntax-highlighted code block using Prism.js or Shiki. Dark theme (matching app chrome).

- Line numbers. Scrollable with max-height.

- Framework selector pills above the code block: React \| Vanilla JS \| Vue 3 \| Svelte.

- Toggle: Include TypeScript types (default off for JS, on for TS users).

- Toggle: Include effect layer code (default on if chart has an effect).

### 5.7.3 Dependency Manifest

Below the code block, a clear dependency section shows:

- **Package list:** Each dependency as a row with name, version, and purpose (e.g., “recharts ^2.12 — chart rendering”).

- **Install command:** Pre-formatted one-liner: npm install recharts tsparticles framer-motion. One-click copy button.

- **Peer dependencies:** If the chart requires React 18+, or a specific D3 version, this is called out with a warning icon.

- **Bundle size estimate:** Approximate gzipped size of the chart dependencies (fetched from bundlephobia data or estimated).

### 5.7.4 Copy & Download Actions

|               |                  |                                                                                            |
|---------------|------------------|--------------------------------------------------------------------------------------------|
| **Action**    | **Button Label** | **Behavior**                                                                               |
| Copy code     | Copy Code        | Copies the full component source to clipboard. Toast confirmation.                         |
| Copy install  | Copy Install     | Copies the npm install command to clipboard.                                               |
| Download file | Download .jsx    | Downloads the component as a file. Extension matches framework (.jsx, .vue, .svelte, .js). |
| Copy all      | Copy Everything  | Copies a formatted block: install command + blank line + full source code.                 |

## 5.8 AI Generation Interface

In addition to browsing existing templates, users can **describe a chart they want and have the AI generate it in real time**. This is both a user-facing feature and the surface layer of the core AI pipeline described in Section 7.

### 5.8.1 Generate Bar (Gallery Header)

- **Prompt input:** A prominent text input in the gallery header, styled distinctly from the search bar. Placeholder: “Describe a chart... e.g., a D3 bar chart with neon glow showing quarterly revenue”

- **Generate button:** Triggers the AI pipeline. Shows a shimmer/loading state on a placeholder card in the gallery while generating.

- **Result injection:** The generated chart appears as the first card in the gallery with a “✨ AI Generated” badge. User can click to configure, export, or copy code like any other template.

- **Iteration:** “Regenerate” button on the result card produces a new variation. “Refine” opens the prompt with the current template as context.

### 5.8.2 Natural Language Capabilities

The AI prompt system understands requests across multiple axes:

|                    |                                                                          |                                                              |
|--------------------|--------------------------------------------------------------------------|--------------------------------------------------------------|
| **Request Type**   | **Example Prompt**                                                       | **AI Interprets**                                            |
| Chart type         | “a waterfall chart”                                                      | chartType: waterfall                                         |
| Library preference | “using D3” or “in Chart.js”                                              | library: d3 or chartjs                                       |
| Visual effect      | “with a neon glow” or “particle background”                              | effect: neon-glow or starfield                               |
| Color/mood         | “in warm earth tones” or “cyberpunk colors”                              | palette: earth or neon                                       |
| Use case           | “for a pitch deck” or “for Instagram”                                    | useCases: [pitch-deck] or [social]                       |
| Data type          | “showing monthly revenue vs expenses”                                    | dataSchema: dual-series-monthly                              |
| Style direction    | “minimalist” or “hand-drawn sketch style”                                | effect: none (minimal) or hand-drawn                         |
| Combination        | “A 3D bar chart in Plotly with glass morphism for a financial dashboard” | type: bar-3d, lib: plotly, effect: glass, useCase: dashboard |

### 5.8.3 Generation States

- **Idle:** Prompt input visible, no generation in progress.

- **Generating:** Shimmer card placeholder in gallery position 1. Progress text: “Generating your chart...” (typically 5–15 seconds).

- **Success:** Chart renders live in the gallery card. “✨ AI Generated” badge. Click to open configure modal. Regenerate and Refine buttons visible.

- **Failed:** Card shows error state with retry button and suggestion to simplify the prompt. Failures are logged for pipeline improvement.

---

# 6. Multi-Library Rendering Engine

## 6.1 Supported Charting Libraries

ChartForge renders charts using the best library for each visual style. The rendering library is an implementation detail — users choose a visual style, not a library.

|                    |             |                                                                         |                                                                                         |
|--------------------|-------------|-------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| **Library**        | **Version** | **Strengths**                                                           | **Best For**                                                                            |
| Recharts           | ^2.12       | Declarative React components, composable, great defaults                | Standard bar/line/area/pie/radar charts with clean styling                              |
| Chart.js           | ^4.4        | Canvas-based, performant, rich animation API                            | Animated charts, doughnut/polar, real-time data feel                                    |
| D3.js              | ^7.9        | Total control, SVG-native, unlimited customization                      | Treemaps, Sankey diagrams, force layouts, bespoke visualizations                        |
| Plotly.js          | ^2.33       | Scientific-grade, 3D support, interactive hover                         | 3D scatter/surface plots, statistical charts, contour maps                              |
| Nivo               | ^0.87       | Beautiful defaults, responsive, theming system                          | Heatmaps, bump charts, chord diagrams, waffle charts                                    |
| ECharts            | ^5.5        | Massive chart library, WebGL support, globe/map charts                  | Gauge charts, candlestick, geographic data, complex dashboards                          |
| Three.js           | ^r160       | 3D WebGL rendering, custom geometries                                   | 3D bar charts, globe visualizations, data sculptures                                    |
| Lightweight Charts | ^4.1        | Financial charting, candlestick/OHLC                                    | Stock charts, trading dashboards, time-series financial data                            |
| G6 (AntV)          | ^5.0        | Graph engine: 10+ layouts, Canvas/SVG/WebGL, React nodes, 3D            | Force-directed graphs, knowledge graphs, network topology, entity-relationship maps     |
| react-force-graph  | ^1.44       | React component for 2D/3D/VR/AR force-directed graphs, WebGL            | Interactive network exploration, social graphs, dependency trees, 3D graph fly-throughs |
| Cytoscape.js       | ^3.30       | Most extensive open-source graph library: layouts, styling, events      | Biological networks, knowledge graphs, complex network analysis, graph algorithms       |
| Sigma.js           | ^2.4        | WebGL graph renderer, handles thousands of nodes, works with graphology | Large-scale network visualization, social network analysis, Wikipedia-scale graphs      |
| vis-network        | ^9.1        | Canvas-based, clustering, physics simulation, interactive editing       | Neo4j visualization (via neovis.js), org charts, network monitoring, graph editing      |

## 6.2 Chart Type × Library Matrix

Each chart type can be rendered by one or more libraries. The matrix below shows which libraries support which types. Each library-type combination produces a visually distinct template, multiplying catalog size.

**Standard Charts:**

|                       |              |              |        |            |          |             |              |
|-----------------------|--------------|--------------|--------|------------|----------|-------------|--------------|
| **Chart Type**        | **Recharts** | **Chart.js** | **D3** | **Plotly** | **Nivo** | **ECharts** | **Three.js** |
| Bar (vertical)        | ✓            | ✓            | ✓      | ✓          | ✓        | ✓           | ✓ 3D         |
| Bar (horizontal)      | ✓            | ✓            | ✓      | ✓          | ✓        | ✓           | —            |
| Bar (stacked/grouped) | ✓            | ✓            | ✓      | ✓          | ✓        | ✓           | —            |
| Line                  | ✓            | ✓            | ✓      | ✓          | ✓        | ✓           | —            |
| Area (single/stacked) | ✓            | ✓            | ✓      | ✓          | ✓        | ✓           | —            |
| Pie / Donut           | ✓            | ✓            | ✓      | ✓          | ✓        | ✓           | ✓ 3D         |
| Scatter               | ✓            | ✓            | ✓      | ✓          | ✓        | ✓           | ✓ 3D         |
| Radar / Spider        | ✓            | ✓            | ✓      | ✓          | ✓        | ✓           | —            |
| Treemap               | ✓            | —            | ✓      | ✓          | ✓        | ✓           | —            |
| Heatmap               | —            | —            | ✓      | ✓          | ✓        | ✓           | —            |
| Funnel                | —            | —            | ✓      | ✓          | —        | ✓           | —            |
| Waterfall             | —            | —            | ✓      | ✓          | —        | ✓           | —            |
| Sankey                | —            | —            | ✓      | ✓          | ✓        | ✓           | —            |
| Gauge                 | —            | ✓            | ✓      | —          | —        | ✓           | —            |
| Candlestick           | —            | ✓            | ✓      | ✓          | —        | ✓           | —            |
| Radial Bar            | ✓            | —            | ✓      | —          | ✓        | ✓           | —            |
| Chord / Arc           | —            | —            | ✓      | —          | ✓        | ✓           | —            |
| Globe / Map           | —            | —            | ✓      | ✓          | —        | ✓           | ✓            |
| 3D Surface            | —            | —            | —      | ✓          | —        | ✓           | ✓            |

*Each ✓ represents at least one distinct template. With 10 palettes and 15 effects, the combinatorial space per chart type is massive.*

**Graph / Network Visualizations:**

|                      |        |                       |                  |              |                 |              |              |
|----------------------|--------|-----------------------|------------------|--------------|-----------------|--------------|--------------|
| **Graph Type**       | **G6** | **react-force-graph** | **Cytoscape.js** | **Sigma.js** | **vis-network** | **D3-force** | **Three.js** |
| Force-directed       | ✓      | ✓ 2D/3D               | ✓                | ✓            | ✓               | ✓            | ✓ 3D         |
| Hierarchical / Tree  | ✓      | —                     | ✓                | —            | ✓               | ✓            | —            |
| Radial Layout        | ✓      | —                     | ✓                | —            | —               | ✓            | —            |
| Circular Layout      | ✓      | —                     | ✓                | ✓            | —               | ✓            | —            |
| Dagre (DAG)          | ✓      | —                     | ✓                | —            | ✓               | ✓            | —            |
| Grid Layout          | ✓      | —                     | ✓                | —            | —               | ✓            | —            |
| Fruchterman          | ✓ GPU  | —                     | —                | ✓            | —               | ✔            | —            |
| Concentric           | ✓      | —                     | ✓                | —            | —               | ✓            | —            |
| Knowledge Graph      | ✓      | ✓                     | ✓                | ✓            | ✓               | ✓            | —            |
| Entity-Relationship  | ✓      | —                     | ✓                | —            | ✓               | ✓            | —            |
| Social Network       | ✓      | ✓                     | ✓                | ✓            | ✓               | ✓            | ✓ 3D         |
| Dependency Tree      | ✓      | ✓                     | ✓                | —            | ✓               | ✓            | —            |
| Org Chart            | ✓      | —                     | ✓                | —            | ✓               | ✓            | —            |
| Mind Map             | ✓      | —                     | ✓                | —            | —               | ✓            | —            |
| Combo / Subgraph     | ✓      | —                     | ✓                | —            | —               | —            | —            |
| 3D Graph Fly-through | —      | ✓ 3D                  | —                | —            | —               | —            | ✓            |

*Graph templates use the same effect and palette systems as standard charts. Force-directed graphs with Neon Glow or Particle Network effects are some of the most visually striking templates in the gallery.*

## 6.3 Graph Explorer Specifics

Graph visualizations differ from traditional charts in several key ways that affect rendering, data handling, and code export:

- **Data model:** Graphs use a nodes + edges model (not rows of data). Each node has an id, label, optional group/category, and optional properties. Each edge has source, target, optional label/weight. ChartForge normalizes this into a standard GraphJSON format that all graph libraries can consume.

- **Layout as a first-class concept:** Unlike charts (where layout is implicit), graph visualizations depend heavily on layout algorithms. Each template specifies its layout (force, hierarchical, radial, dagre, etc.) and layout parameters (spring strength, repulsion, link distance). Users can adjust layout parameters in the configuration modal.

- **Interactivity:** Graph templates are inherently more interactive than charts. Default interactions include: zoom/pan, node drag, hover highlight (shows connected nodes), click expand/collapse, and node search. These interactions are included in exported code.

- **Neo4j / Property Graph compatibility:** Graph data schemas support Neo4j-style property graph format natively. Sample data includes labeled nodes and typed relationships (e.g., Person -[:KNOWS]-> Person). Code export can optionally include Neo4j driver boilerplate for direct database connection.

- **Performance:** Graphs can have thousands of nodes. WebGL-based libraries (Sigma.js, react-force-graph-3d, G6 WebGL mode) are preferred for large graph templates. Templates are tagged with recommended max node counts.

- **3D exploration:** react-force-graph-3d and Three.js enable 3D graph fly-throughs where users orbit, zoom, and navigate through the graph in 3D space. These produce some of the most visually impressive templates in the gallery and are excellent for marketing / hero sections.

## 6.4 Rendering Strategy

- **Lazy loading:** Charting libraries are loaded on-demand via dynamic import(). Only the libraries needed for visible cards are fetched.

- **Render isolation:** Each chart renders inside a sandboxed container. Library conflicts (e.g., D3 + Recharts both manipulating SVG) are avoided via component-level isolation.

- **Canvas fallback:** For Chart.js and Three.js (canvas-based), export uses the canvas element directly. For SVG-based libraries (Recharts, D3, Nivo), SVG → Canvas → PNG pipeline is used.

- **Server-side catalog:** Templates are defined as JSON metadata + render module path. New templates can be added without rebuilding the app.

---

# 7. AI Template Generation Engine (Core)

This is the **most important system in ChartForge** and the primary competitive moat. The AI generation engine is not a convenience feature — it is the infrastructure that makes the product possible at scale. It operates in two modes: a **continuous background pipeline** that autonomously expands the catalog, and a **user-facing prompt interface** that generates custom charts on demand.

## 7.1 Why AI Generation Is MVP

Three strategic reasons this must ship at launch:

1.  **Catalog scale is the product.** The value proposition is “endless charts.” A hand-curated gallery of 200 templates is a demo. An AI-generated catalog of 2,000+ templates that grows by 50/week is a product. Users must feel that the gallery never runs out of new, interesting styles.

2.  **Defensibility.** Any competitor can hire designers to create 200 chart templates. No competitor can replicate an AI pipeline that generates valid, multi-library, multi-effect chart code at scale. The pipeline’s accumulated training data, quality gate heuristics, and prompt engineering become harder to replicate every week it runs.

3.  **User-facing generation drives retention.** “Describe the chart you want” is the feature that makes users come back. It transforms ChartForge from a static gallery (visit once, find what you need, leave) into a generative tool (come back whenever you need something new). This is the difference between a resource and a product.

## 7.2 Generation Pipeline Architecture

The AI generation pipeline has five stages:

|                            |                                                                        |                                                                                             |                                                                                                                    |
|----------------------------|------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| **Stage**                  | **Input**                                                              | **Output**                                                                                  | **Quality Gate**                                                                                                   |
| 1\. Prompt Assembly        | Template spec (chart type, library, effect, palette) or user NL prompt | Structured generation prompt with library API reference, effect layer spec, and data schema | Prompt passes schema validation                                                                                    |
| 2\. Code Generation        | Structured prompt                                                      | Chart component source code (React primary, then transpiled to other frameworks)            | Code compiles without errors (ESLint clean)                                                                        |
| 3\. Render Validation      | Compiled component + sample data                                       | Screenshot of rendered chart at 3 viewport sizes                                            | Chart renders without JS errors. Not blank. Dimensions within bounds.                                              |
| 4\. Visual Quality Scoring | Rendered screenshot                                                    | Numeric quality score (0–100) + pass/fail                                                   | Score > 70 to pass. Checks: color contrast, text legibility, layout balance, no overlap, effects render correctly |
| 5\. Approval Queue         | Validated template + score + screenshots                               | Approved or rejected template with reviewer notes                                           | Human reviewer approves, requests revision, or rejects. See Section 7.4.                                           |
| 6\. Catalog Publish        | Approved template metadata + code + screenshots                        | Published template in gallery API                                                           | All metadata fields populated. Code export works for all 4 frameworks. Reviewer approval on record.                |

*No template reaches the public gallery without a human reviewer approving it. Stages 1–4 are fully automated. Stage 5 is human. Stage 6 is automated upon approval.*

## 7.3 Prompt → Template Workflow

### 7.3.1 Background Generation (Automated → Approval Queue)

A scheduled job runs the generation pipeline continuously, producing candidate templates that enter the human approval queue:

- **Diversity scheduler:** Maintains a target distribution across chart types, libraries, and effects. If the catalog is heavy on Recharts bar charts, the scheduler biases generation toward underrepresented combinations (D3 heatmaps, Plotly 3D scatter, etc.).

- **Trend-aware generation:** Tracks which templates users browse, export, and copy most. Generates more candidates in popular categories and styles.

- **Novel combination explorer:** Deliberately generates unusual combinations (Sankey + particle background, candlestick + hand-drawn sketch) to expand the frontier of what’s possible.

- **Batch cadence:** Target: 100+ candidate templates per week generated in batches of 20. After automated quality gates (stages 1–4), passing candidates enter the approval queue. Target: 50+ approved and published per week.

- **No auto-publish:** The pipeline never publishes directly to the gallery. Every template passes through the human approval queue regardless of its automated quality score.

### 7.3.2 User-Facing Generation (On-Demand)

When a user submits a natural language prompt:

1.  Prompt is parsed into a structured template spec (chart type, library, effect, palette, data schema).

2.  If an existing approved template closely matches (≥ 80% spec overlap), surface it instantly with “Close match found” + option to generate fresh.

3.  If no close match, run stages 1–4 of the generation pipeline. Target: < 15 seconds to rendered result.

4.  Display the result as a live card **in the user’s personal session only** (not the public gallery). User can configure, export, and copy code from this personal result immediately.

5.  User-generated templates that the user exports, copies code from, or explicitly “submits to gallery” enter the same approval queue as background-generated templates. They are not auto-published.

6.  If the template is approved by a reviewer, it is published to the public gallery and the original user is notified.

*This means users get instant value (they can use their generated chart immediately for personal export/code) while the public gallery remains curated and quality-controlled.*

## 7.4 Human Approval Pipeline

This is the gatekeeper between AI generation and the public gallery. **No template is published without explicit human approval.** The approval pipeline is a dedicated internal tool used by the ChartForge content team.

### 7.4.1 Approval Queue Dashboard

An internal web application (not user-facing) where reviewers manage incoming candidates:

- **Queue view:** Sortable list of pending candidates with: thumbnail screenshot, title, chart type, library, effect, automated quality score (0–100), generation source (background scheduler / user prompt), timestamp.

- **Priority sorting:** Candidates are ranked by: (1) user-submitted templates first (users are waiting), (2) automated quality score descending, (3) underrepresented chart type/library combos get a boost.

- **Batch review:** Reviewers can select multiple candidates and approve/reject in bulk with shared notes.

- **Filters:** Filter by status (pending, approved, revision-requested, rejected), chart type, library, effect, score range, generation source, date range.

### 7.4.2 Review Actions

|                    |                                                |                                                                                                                                                                                        |
|--------------------|------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Action**         | **Result**                                     | **Details**                                                                                                                                                                            |
| Approve            | Template published to public gallery           | Reviewer confirms visual quality, code quality, and appropriateness. Published immediately upon approval.                                                                              |
| Approve with edits | Template published after minor changes         | Reviewer adjusts title, subtitle, tags, or palette assignment. No re-generation needed.                                                                                                |
| Request revision   | Template returns to pipeline for re-generation | Reviewer provides notes (e.g., “text overlaps at this viewport”, “effect too intense”). AI re-generates with the feedback appended to the prompt. Re-enters queue after re-generation. |
| Reject             | Template discarded, logged for analysis        | Reviewer marks reason: poor visual quality, broken rendering, inappropriate content, too similar to existing template, or library incompatibility. Logged to improve the pipeline.     |

### 7.4.3 Review Criteria

Reviewers evaluate each candidate against these criteria:

- **Visual quality:** Does the chart look professional and visually distinctive? Would a designer or developer be proud to use it?

- **Correctness:** Does the chart accurately represent the sample data? Are axes, labels, and legends correct?

- **Code quality:** Is the exported code clean, readable, and free of unnecessary complexity? Does it compile for all 4 frameworks?

- **Effect integrity:** If effects are applied, do they enhance (not obscure) the data visualization? No artifacts, z-index issues, or performance problems?

- **Uniqueness:** Is this template sufficiently different from existing templates in the catalog? Duplicates or near-duplicates are rejected.

- **Appropriateness:** No offensive content, brand violations, or misleading data representations.

- **Metadata completeness:** Title, subtitle, tags, use cases, and schema definition are accurate and helpful.

### 7.4.4 SLA & Throughput

|                                       |                                                |
|---------------------------------------|------------------------------------------------|
| **Metric**                            | **Target**                                     |
| Time to review (background-generated) | < 48 hours from entering queue                |
| Time to review (user-submitted)       | < 4 hours during business hours               |
| Reviewer throughput                   | ~20 templates/hour (including batch review)    |
| Approval rate (target)                | 60–75% of candidates that pass automated gates |
| Revision rate                         | 15–25% (sent back with feedback)               |
| Rejection rate                        | 10–20%                                         |
| Reviewers needed at launch            | 1–2 part-time (at 100 candidates/week)         |
| Reviewers needed at scale (500+/week) | 2–3 full-time or community moderators          |

### 7.4.5 Escalation & Edge Cases

- **Borderline quality (score 65–75):** Flagged for senior reviewer. These often need minor tweaks that push them over the quality bar.

- **User-submitted templates:** Prioritized in the queue. If rejected, the user is notified with a reason and suggestion to refine their prompt. The user can still use the template privately.

- **Reviewer disagreements:** If two reviewers disagree, a third reviewer (or team lead) breaks the tie.

- **Queue overflow:** If the queue exceeds 200 pending candidates, the background pipeline pauses generation until the queue drains below 100. User-facing generation is unaffected.

- **Emergency removal:** Any published template can be unpublished immediately by any reviewer if a post-publish issue is discovered (broken rendering, user report, etc.).

## 7.5 Automated Quality Gates

Before templates reach the approval queue, they must pass all automated quality gates. Failed templates are logged and used to improve the pipeline:

|                    |                                              |                                                       |                                                     |
|--------------------|----------------------------------------------|-------------------------------------------------------|-----------------------------------------------------|
| **Gate**           | **Check**                                    | **Threshold**                                         | **On Failure**                                      |
| Compilation        | ESLint + TypeScript compiler                 | 0 errors, ≤ 3 warnings                                | Retry with error feedback in prompt (max 3 retries) |
| Render             | Headless browser renders component           | No JS errors, canvas/SVG not blank, renders within 5s | Retry with simplified config                        |
| Dimensions         | Chart fills container, no overflow           | Chart visible area > 60% of container                | Adjust padding/margins and re-render                |
| Visual Quality     | Vision model scores screenshot               | Score > 70/100                                       | Discard. Log for analysis.                          |
| Text Legibility    | All labels readable, no overlaps             | No text smaller than 10px, no overlapping elements    | Retry with adjusted font sizes                      |
| Effect Integrity   | Effect layer renders without artifacts       | No black boxes, no z-index bleed, animation runs      | Retry without effect, or with simpler effect        |
| Code Quality       | Exported code compiles for all 4 frameworks  | All 4 framework outputs compile                       | Fix framework-specific issues, re-validate          |
| Data Compatibility | Chart renders with 3 different test datasets | All 3 render correctly                                | Adjust data mapping logic                           |

## 7.6 Continuous Generation Loop

The AI pipeline is a self-improving system. Reviewer decisions feed back into the generation process:

- **Approval feedback loop:** When reviewers reject or request revisions, their notes are categorized and used to fine-tune generation prompts. If 30% of Plotly heatmap candidates are rejected for “overlapping labels,” the prompt template for Plotly heatmaps is updated with explicit spacing constraints.

- **User engagement feedback:** Published templates that users export/copy most are analyzed. The pipeline generates more candidates with similar characteristics (chart type, library, effect, palette), increasing the likelihood of producing templates reviewers will approve.

- **Automated failure analysis:** Templates that fail automated quality gates (stages 1–4) are categorized by failure type. Common failures trigger prompt engineering improvements before candidates ever reach reviewers.

- **Catalog gap detection:** The system identifies underrepresented combinations in the published catalog and biases generation toward those gaps, giving reviewers a diverse set of candidates rather than more of what already exists.

- **Style evolution:** The pipeline tracks design trends and reviewer approval patterns. If reviewers consistently approve glass-morphism effects and reject CRT scan-line effects, generation weights adjust accordingly.

- **Queue health monitoring:** If the approval queue backs up beyond 200 pending, the pipeline auto-throttles background generation. If the queue is nearly empty, it increases batch sizes to keep reviewers productive.

## 7.7 User-Facing AI Generation

Beyond the prompt bar in the gallery header (Section 5.8), AI generation surfaces in two additional places. **All user-generated results are personal** — usable immediately for export and code copy, but not published to the public gallery without approval:

- **Configuration modal — “Suggest alternatives”:** When viewing any template, a button generates 3 AI variations: same chart type with different libraries, effects, or palettes. Results appear as a carousel below the preview. User can submit favorites to the approval queue.

- **Workspace — “Generate similar”:** On any workspace card, a button generates a template with the same data shape but a different visual style. Useful for comparing multiple visualizations of the same data. Results are personal workspace items.

## 7.8 AI Models & Infrastructure

|                        |                                   |                                                                                                  |
|------------------------|-----------------------------------|--------------------------------------------------------------------------------------------------|
| **Component**          | **Technology**                    | **Purpose**                                                                                      |
| Code generation        | Claude Sonnet (via Anthropic API) | Generates chart component code from structured prompts. Understands all 8 charting library APIs. |
| Prompt parsing         | Claude Haiku (via Anthropic API)  | Parses user NL prompts into structured template specs. Fast, low-cost.                           |
| Visual quality scoring | Claude Sonnet (vision)            | Scores rendered chart screenshots on visual quality, legibility, and layout.                     |
| Render validation      | Headless Chromium (Puppeteer)     | Renders generated components, captures screenshots, checks for JS errors.                        |
| Pipeline orchestration | Bull/BullMQ + Redis               | Job queue for batch generation, retries, scheduling, and priority management.                    |
| Template storage       | PostgreSQL + S3                   | Metadata in DB, generated code + screenshots in S3.                                              |
| Prompt cache           | Redis                             | Caches structured prompts → template matches to avoid regenerating near-duplicates.              |

### 7.8.1 Cost Management

- **Background generation:** Batch runs during off-peak hours. Budget: ~\$200–500/month for 50+ templates/week. Each template costs ~\$0.15–0.40 in API calls (prompt + 1–3 retries + visual scoring).

- **User-facing generation:** Rate-limited to 10 generations/user/day (free tier), 50/day (pro). Each generation costs ~\$0.10–0.25. Cached matches cost nothing.

- **Scaling:** As the catalog grows, cache hit rate increases. Most user prompts will match existing templates, reducing per-request AI cost over time.

---

# 8. Visual Effects System

Effects are **composable visual layers** that wrap or enhance a chart. They are the primary axis of differentiation — the same bar chart with different effects becomes a completely different visual experience. Effects are independent of the charting library.

## 8.1 Effect Layer Architecture

Each chart template renders in a layered stack:

4.  **Background layer:** Gradient, mesh, noise texture, particle system, or animated pattern. Renders behind the chart.

5.  **Chart layer:** The data visualization itself, rendered by the charting library.

6.  **Overlay layer:** Glow, bloom, glass morphism, scan lines, or vignette. Renders on top of the chart.

7.  **Animation layer:** Entry animations, hover effects, or continuous motion (pulse, float, wave) applied to the chart or its elements.

Effects from different layers can be combined. For example: particle background + glow overlay + wave animation on a D3 bar chart.

## 8.2 Effect Libraries & Capabilities

|                                               |             |                                                                                                               |                      |
|-----------------------------------------------|-------------|---------------------------------------------------------------------------------------------------------------|----------------------|
| **Library**                                   | **Version** | **Effect Types**                                                                                              | **Layer**            |
| tsParticles                                   | ^3.3        | Particle backgrounds (stars, snow, confetti, connections, bubbles)                                            | Background           |
| Three.js                                      | ^r160       | 3D perspective, depth-of-field, floating geometry backgrounds, globe effects                                  | Background / Overlay |
| Framer Motion                                 | ^11.0       | Entry animations (spring, stagger), hover morph, layout transitions                                           | Animation            |
| anime.js                                      | ^3.2        | Timeline animations, path morphing, SVG draw, stagger cascades                                                | Animation            |
| CSS Houdini / Paint API                       | Native      | Noise textures, gradient meshes, generative patterns, custom borders                                          | Background           |
| GSAP                                          | ^3.12       | Complex timeline sequences, scroll-triggered animation, SVG morphing                                          | Animation            |
| Lottie (lottie-web)                           | ^5.12       | Pre-built micro-animations, loading states, decorative elements                                               | Overlay              |
| CSS filters + blend modes                     | Native      | Glow/bloom (blur + brightness), glass morphism (backdrop-blur + transparency), vignette, chromatic aberration | Overlay              |
| SVG filters (feTurbulence, feDisplacementMap) | Native      | Hand-drawn/sketch effect, paper texture, water ripple, distortion                                             | Overlay              |
| Canvas 2D shaders                             | Native      | Scan lines, CRT effect, halftone, pixelation, gradient wipe                                                   | Overlay              |

## 8.3 Effect Presets

Users don’t configure effects from scratch — they select from curated presets. Each preset combines one or more effect layers:

|                   |                                             |                                                                              |                                                                      |
|-------------------|---------------------------------------------|------------------------------------------------------------------------------|----------------------------------------------------------------------|
| **Preset Name**   | **Layers Used**                             | **Description**                                                              | **Good For**                                                         |
| None              | —                                           | Clean chart, no effects                                                      | Professional reports, minimal dashboards                             |
| Neon Glow         | Overlay: CSS glow + bloom                   | Elements emit colored light. Saturated, electric feel.                       | Dark-mode dashboards, gaming, tech                                   |
| Starfield         | Background: tsParticles (stars)             | Slowly drifting star particles behind the chart                              | Presentations, hero sections                                         |
| Gradient Mesh     | Background: CSS Houdini mesh                | Smooth, organic color gradients behind the chart                             | Marketing, brand-heavy contexts                                      |
| Noise Texture     | Overlay: SVG feTurbulence                   | Subtle grain overlay for a tactile, editorial feel                           | Print-style reports, editorial content                               |
| Glass Morphism    | Overlay: backdrop-blur + bg opacity         | Chart area feels like frosted glass                                          | Modern UI, over-image layouts                                        |
| Particle Network  | Background: tsParticles (connections)       | Connected nodes forming a web behind data points                             | Tech dashboards, network/relationship data                           |
| Animated Grid     | Background: CSS grid animation              | Subtle moving gridlines that pulse or shift                                  | Data dashboards, real-time feeds                                     |
| Hand-drawn Sketch | Overlay: SVG displacement + rough edges     | Chart looks like it was drawn on paper                                       | Creative briefs, informal presentations                              |
| 3D Perspective    | Chart: CSS transform + shadow               | Chart tilts in 3D space with depth shadows                                   | Hero sections, landing pages, feature showcases                      |
| Parallax Float    | Animation: Framer Motion float              | Chart elements gently bob on scroll or idle                                  | Landing pages, portfolio sites                                       |
| Confetti Burst    | Animation: tsParticles (confetti)           | Celebratory particle burst on chart load or data update                      | Dashboards showing wins, milestones                                  |
| Scan Lines        | Overlay: Canvas 2D shader                   | Retro CRT scan line effect                                                   | Retro-tech, cyberpunk, gaming dashboards                             |
| Watercolor Bleed  | Background: CSS Houdini paint               | Soft watercolor-style color bleeding from chart edges                        | Creative/artistic, portfolio pieces                                  |
| Data Pulse        | Animation: anime.js timeline                | Chart bars/lines pulse with a heartbeat rhythm on load                       | Real-time data, health/fitness dashboards                            |
| Force Bloom       | Background: particle trails + Overlay: glow | Nodes emit particle trails during force simulation; edges glow on hover      | Graph exploration, knowledge graph demos                             |
| Edge Flow         | Animation: GSAP + CSS                       | Animated dashes flow along edges showing directionality                      | Dependency trees, data flow diagrams, Neo4j relationship exploration |
| Node Ripple       | Animation: Framer Motion                    | Concentric ripple animation on node hover/select, spreading to neighbors     | Social networks, influence mapping, graph exploration                |
| Cluster Nebula    | Background: tsParticles + CSS gradient      | Node clusters surrounded by soft colored nebula clouds matching group colors | Community detection, knowledge graph clusters, org charts            |
| 3D Orbit          | Animation: Three.js auto-rotate             | Camera slowly orbits the 3D graph, pausing on user interaction               | Hero sections, graph showcases, 3D network demos                     |

## 8.4 Effect Composability Rules

- A chart can have at most one background effect, one overlay effect, and one animation effect simultaneously.

- Some combinations are blocked (e.g., Glass Morphism overlay + Noise Texture overlay — both are overlays).

- 3D Perspective cannot be combined with canvas-based charts (Chart.js, Three.js) because CSS transform doesn’t affect canvas internals.

- Effect intensity is controllable via a 0–100% slider. At 0%, the effect is invisible but still loaded (for code export). Toggle removes it entirely.

- Effects must degrade gracefully on mobile: reduce particle counts, disable blur-heavy overlays, skip 3D transforms on low-power devices.

---

# 9. Code Export System

## 9.1 Code Generation Pipeline

Each chart template is defined as a structured metadata object that a code generator transforms into framework-specific source code:

7.  **Template metadata:** Defines chart type, library, config props, sample data shape, palette, and effect layers.

8.  **Code template registry:** Each library + framework combination has a code template (Handlebars or tagged template literals) that accepts template metadata and outputs source code.

9.  **Effect code modules:** Each effect preset has its own code module per framework. These are injected as wrapper components or additional imports.

10. **Post-processing:** Generated code is formatted with Prettier, annotated with customization comments, and validated syntactically.

## 9.2 Framework Targets

|               |                                                 |                    |                                                                         |
|---------------|-------------------------------------------------|--------------------|-------------------------------------------------------------------------|
| **Framework** | **Output Format**                               | **File Extension** | **Notes**                                                               |
| React         | Functional component with hooks                 | .jsx / .tsx        | Default export. Props for data, palette, dimensions. Hooks for effects. |
| Vanilla JS    | ES module with render(container, data) function | .js                | No framework dependency. Uses DOM APIs + library directly.              |
| Vue 3         | SFC with Composition API                        | .vue               | Uses \<script setup> syntax. Reactive refs for data.                   |
| Svelte        | Component with reactive declarations            | .svelte            | Uses \$: reactivity. onMount for library init.                          |

## 9.3 Dependency Manifest

Every code export includes a structured dependency manifest:

|                |                                                   |                                                      |
|----------------|---------------------------------------------------|------------------------------------------------------|
| **Field**      | **Example**                                       | **Description**                                      |
| packages       | [{ name: "recharts", version: "^2.12.0" }, ...] | Array of npm package objects                         |
| installCommand | npm install recharts framer-motion                | One-liner copy-paste install command                 |
| peerDeps       | [{ name: "react", version: ">=18.0" }]         | Required peer dependencies (shown as warnings)       |
| totalSize      | ~45 kB gzip                                       | Estimated bundle size contribution                   |
| devDeps        | [{ name: "@types/d3", version: "^7.4" }]        | TypeScript type packages (only when TS toggle is on) |

## 9.4 Code Quality Standards

- All generated code must pass ESLint with recommended config (no errors, max 3 warnings).

- React output must pass React strict mode without warnings.

- All components must be self-contained: one file, no relative imports (except effect module if enabled).

- Sample data is included as a default prop / variable. Clearly commented for replacement.

- Color values are extracted as a PALETTE constant at the top of the file for easy customization.

- Animation durations, sizes, and thresholds are extracted as named constants.

- No console.log statements in exported code.

---

# 10. Chart Template Taxonomy

Templates are organized in a multi-axis taxonomy. The total template count is the product of unique combinations across chart type, library, palette, and effects:

|                               |                    |                     |
|-------------------------------|--------------------|---------------------|
| **Axis**                      | **Count (Launch)** | **Count (6-Month)** |
| Chart types (standard)        | 19                 | 30+                 |
| Graph / Network types         | 16                 | 25+                 |
| Charting libraries            | 8                  | 10+                 |
| Graph visualization libraries | 5                  | 7+                  |
| Color palettes                | 10                 | 20+                 |
| Effect presets                | 15                 | 25+                 |
| Framework targets (code)      | 4                  | 5+ (add Angular)    |
| Estimated unique templates    | 300+               | 2,000+              |

*Not all combinations are valid (see 7.4 composability rules). The catalog is curated: each template is hand-reviewed to ensure visual quality before being added to the gallery.*

## 10.1 Template Metadata Schema

|                     |                |                                                                                                                                                                                                                                                                                                                                       |
|---------------------|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Field**           | **Type**       | **Description**                                                                                                                                                                                                                                                                                                                       |
| id                  | string         | Unique ID: {type}-{library}-{effect}-{variant} (e.g., bar-d3-neon-01)                                                                                                                                                                                                                                                                 |
| title               | string         | Display name on card                                                                                                                                                                                                                                                                                                                  |
| subtitle            | string         | One-line description                                                                                                                                                                                                                                                                                                                  |
| chartType           | enum           | Primary type: bar, line, area, pie, scatter, radar, treemap, heatmap, funnel, waterfall, sankey, gauge, candlestick, radial, chord, globe, surface, composed, graph-force, graph-hierarchy, graph-radial, graph-circular, graph-dagre, graph-knowledge, graph-entity, graph-social, graph-dependency, graph-org, graph-mind, graph-3d |
| library             | enum           | Rendering library: recharts, chartjs, d3, plotly, nivo, echarts, threejs, lightweight-charts, g6, react-force-graph, cytoscape, sigma, vis-network                                                                                                                                                                                    |
| palette             | string         | Default palette key                                                                                                                                                                                                                                                                                                                   |
| effect              | string \| null | Default effect preset key (null for no effect)                                                                                                                                                                                                                                                                                        |
| effectConfig        | object \| null | Effect-specific config (intensity, sub-options)                                                                                                                                                                                                                                                                                       |
| dataKey             | string         | Key into SAMPLE_DATA for default dataset                                                                                                                                                                                                                                                                                              |
| dataSchema          | string         | Key into DATA_SCHEMAS for validation/docs                                                                                                                                                                                                                                                                                             |
| tags                | string[]     | Filterable tags (comparison, trend, composition, etc.)                                                                                                                                                                                                                                                                                |
| useCases            | string[]     | Use case tags (dashboard, presentation, social, report, etc.)                                                                                                                                                                                                                                                                         |
| height              | number         | Default card preview height in px                                                                                                                                                                                                                                                                                                     |
| config              | object         | Library-specific chart configuration (radius, barSize, strokeWidth, etc.)                                                                                                                                                                                                                                                             |
| renderModule        | string         | Path to the render component module                                                                                                                                                                                                                                                                                                   |
| codeTemplates       | object         | Map of framework → code template path                                                                                                                                                                                                                                                                                                 |
| layoutConfig        | object \| null | Graph-only: layout algorithm name + parameters (springLength, repulsion, iterations, etc.)                                                                                                                                                                                                                                            |
| interactionDefaults | string[]     | Graph-only: default interactions enabled (zoom-pan, node-drag, hover-highlight, click-expand, search)                                                                                                                                                                                                                                 |
| maxNodes            | number \| null | Graph-only: recommended max node count for performant rendering                                                                                                                                                                                                                                                                       |
| neo4jBoilerplate    | boolean        | Graph-only: if true, code export includes optional Neo4j driver connection boilerplate                                                                                                                                                                                                                                                |

---

# 11. Color Palette System

10 named palettes at launch, each containing 5 colors. The first color is the primary/accent. Palettes are applied uniformly across all charting libraries via a normalization layer that maps palette colors to each library’s theming API.

|             |                                                  |                          |
|-------------|--------------------------------------------------|--------------------------|
| **Palette** | **Colors**                                       | **Character**            |
| Ember       | \#FF6B35, \#F7C59F, \#EFEFD0, \#004E89, \#1A659E | Warm orange to cool blue |
| Midnight    | \#6366F1, \#818CF8, \#A5B4FC, \#C7D2FE, \#E0E7FF | Indigo monochrome        |
| Forest      | \#2D6A4F, \#40916C, \#52B788, \#74C69D, \#95D5B2 | Deep green gradient      |
| Sunset      | \#F72585, \#B5179E, \#7209B7, \#560BAD, \#480CA8 | Hot pink to purple       |
| Ocean       | \#0077B6, \#00B4D8, \#48CAE4, \#90E0EF, \#CAF0F8 | Blue to cyan             |
| Coral       | \#E63946, \#F1FAEE, \#A8DADC, \#457B9D, \#1D3557 | Red accent with navy     |
| Neon        | \#08F7FE, \#09FBD3, \#FE53BB, \#F5D300, \#FF2281 | Cyberpunk / electric     |
| Earth       | \#D4A373, \#CCD5AE, \#E9EDC9, \#FEFAE0, \#FAEDCD | Warm natural tones       |
| Berry       | \#7B2D8E, \#D64292, \#F0729B, \#F5A3B5, \#FADBD8 | Purple to pink           |
| Slate       | \#334155, \#475569, \#64748B, \#94A3B8, \#CBD5E1 | Neutral gray scale       |

**Palette normalization layer:** Each charting library has a different theming API. A paletteAdapter module maps ChartForge’s 5-color array to each library’s format: Recharts (fill/stroke props), Chart.js (backgroundColor/borderColor arrays), D3 (d3.scaleOrdinal), Plotly (colorway), Nivo (colors prop), ECharts (color option), Three.js (material colors).

---

# 12. Data Architecture

## 12.1 Client State

|                       |                                                     |                                                     |
|-----------------------|-----------------------------------------------------|-----------------------------------------------------|
| **State**             | **Type**                                            | **Scope**                                           |
| gallery.templates[] | TemplateMetadata[]                                | Loaded from API, paginated, filtered client-side    |
| gallery.filters       | { type, library, effect, palette, useCase, search } | Current active filter state                         |
| gallery.visibleCount  | number                                              | Infinite scroll cursor                              |
| modal.template        | TemplateMetadata \| null                            | Currently open template                             |
| modal.activeTab       | 'designer' \| 'developer'                           | Active modal tab                                    |
| modal.data            | object[] \| null                                  | Connected user data                                 |
| modal.palette         | string                                              | Selected palette override                           |
| modal.effect          | string \| null                                      | Selected effect override                            |
| modal.effectIntensity | number                                              | Effect intensity 0–100                              |
| modal.framework       | 'react' \| 'vanilla' \| 'vue' \| 'svelte'           | Selected code framework                             |
| modal.includeEffects  | boolean                                             | Include effect code in export                       |
| modal.includeTypes    | boolean                                             | Include TypeScript types                            |
| workspace.charts[]  | WorkspaceChart[]                                  | Configured charts with data, palette, effect, title |
| workspace.sizes       | Record\<number, SizePreset>                        | Per-chart export size                               |
| canva.connected       | boolean                                             | OAuth connection status                             |
| canva.uploadStatus    | Record\<number, status>                            | Per-chart upload state                              |

## 12.2 Backend Data (Template Catalog)

- Template metadata is stored as JSON files or database records. Each template has a unique ID, render module reference, and code template references.

- New templates can be added via a CMS or file-based workflow without app rebuild (hot-reloadable catalog).

- Template popularity metrics (views, exports, code copies) are tracked for ranking and surfacing trending styles.

---

# 13. API & Integration Specifications

## 13.1 ChartForge API

|                                 |            |                                                                                                        |
|---------------------------------|------------|--------------------------------------------------------------------------------------------------------|
| **Endpoint**                    | **Method** | **Description**                                                                                        |
| /api/templates                  | GET        | Paginated template catalog. Query params: type, library, effect, palette, useCase, search, page, limit |
| /api/templates/:id              | GET        | Single template metadata                                                                               |
| /api/templates/:id/code         | GET        | Generated code. Query params: framework, includeEffects, includeTypes                                  |
| /api/templates/:id/dependencies | GET        | Dependency manifest for a template + framework                                                         |
| /auth/canva                     | GET        | Initiate Canva OAuth flow (PKCE)                                                                       |
| /auth/canva/callback            | GET        | Handle Canva OAuth redirect                                                                            |
| /api/canva/upload               | POST       | Upload PNG/SVG to Canva (proxy to /v1/asset-uploads)                                                   |
| /api/canva/upload/:jobId        | GET        | Poll Canva upload job status                                                                           |
| /api/analytics/event            | POST       | Track events: view, export, code_copy, canva_push                                                      |
| /api/generate                   | POST       | Submit NL prompt for AI chart generation. Returns job ID.                                              |
| /api/generate/:jobId            | GET        | Poll generation status. Returns template metadata + rendered preview on completion.                    |
| /api/generate/:jobId/variations | POST       | Generate 3 variations of an existing AI-generated template.                                            |
| /api/generate/:jobId/submit     | POST       | Submit a user-generated template to the public approval queue.                                         |
| /admin/approval/queue           | GET        | List pending candidates. Query params: status, chartType, library, score, source, page.                |
| /admin/approval/:id/approve     | POST       | Approve a candidate. Optionally include metadata edits (title, tags, etc.).                            |
| /admin/approval/:id/revision    | POST       | Request revision with reviewer notes. Triggers re-generation with feedback.                            |
| /admin/approval/:id/reject      | POST       | Reject a candidate with reason code and notes.                                                         |
| /admin/approval/stats           | GET        | Dashboard stats: queue depth, approval/rejection rates, avg review time, throughput.                   |

## 13.2 Canva Connect API

Same spec as v1. OAuth 2.0 + PKCE. Asset upload via POST /v1/asset-uploads. Poll GET /v1/asset-uploads/{id}. Rate limit: 30 req/min/user.

---

# 14. Technical Architecture

## 14.1 Frontend Stack

|                   |                                                         |                                                                                             |
|-------------------|---------------------------------------------------------|---------------------------------------------------------------------------------------------|
| **Layer**         | **Technology**                                          | **Notes**                                                                                   |
| Framework         | Next.js 14+ (App Router)                                | SSR for SEO on gallery pages. Client components for interactive charts.                     |
| Charts            | Multi-library (dynamic import)                          | Recharts, Chart.js, D3, Plotly, Nivo, ECharts, Three.js, Lightweight Charts                 |
| Effects           | tsParticles, Framer Motion, anime.js, CSS Houdini, GSAP | Composable effect layers loaded on-demand                                                   |
| Styling           | Tailwind CSS 4                                          | Dark theme. DM Sans (UI) + JetBrains Mono (code).                                           |
| Code highlighting | Shiki                                                   | Server-compatible syntax highlighting. Multiple theme support.                              |
| State             | Zustand or React Context                                | Lightweight. Workspace persists in session (or URL state for shareability).                 |
| Export            | SVG/Canvas → PNG pipeline                               | Library-specific: SVG serialization (Recharts/D3/Nivo) or canvas.toBlob (Chart.js/Three.js) |
| Build             | Vite or Turbopack (via Next.js)                         | Tree-shaking per library. Dynamic chunks per chart type.                                    |

## 14.2 Backend Stack

|                    |                               |                                                                            |
|--------------------|-------------------------------|----------------------------------------------------------------------------|
| **Layer**          | **Technology**                | **Notes**                                                                  |
| Runtime            | Node.js 20+                   | Or Bun for faster cold starts                                              |
| Framework          | Express or Hono               | Lightweight API routes + OAuth proxy                                       |
| Template catalog   | JSON files + optional CMS     | Hot-reloadable. No rebuild needed for new templates.                       |
| Code generation    | Handlebars / tagged templates | Per-library, per-framework code templates                                  |
| Auth               | OAuth 2.0 + PKCE (Canva)      | Encrypted token storage per user                                           |
| Database           | PostgreSQL or SQLite          | User sessions, token storage, analytics events                             |
| File handling      | Multer                        | PNG upload parsing for Canva proxy                                         |
| Analytics          | PostHog or custom             | Template views, exports, code copies, Canva pushes                         |
| AI code generation | Claude API (Anthropic)        | Sonnet for code gen + visual scoring. Haiku for prompt parsing.            |
| AI job queue       | BullMQ + Redis                | Batch scheduling, retry logic, priority management for generation pipeline |
| Render validation  | Puppeteer (headless Chromium) | Renders AI-generated components, captures screenshots, checks for errors   |
| Asset storage      | S3 or R2 (Cloudflare)         | Generated code files, rendered screenshots, template assets                |

## 14.3 Key Architecture Decisions

- **AI pipeline as a first-class backend service:** The AI generation pipeline runs as a separate service with its own job queue, not as an ad-hoc script. It has dedicated compute, its own retry logic, and publishes templates to the catalog API. This ensures the gallery grows even if the main app has issues.

- **Dynamic import for chart libraries:** Libraries are chunked and loaded on-demand. A user browsing Recharts charts never downloads D3. First paint shows skeleton cards, then charts hydrate as their library loads.

- **Effect layer isolation:** Effects render in their own DOM layer (z-indexed divs or canvas overlays), keeping chart rendering and effect rendering completely independent. This means any effect can pair with any library.

- **Code generation on server:** Code is generated server-side via the /api/templates/:id/code endpoint. This keeps code templates out of the client bundle and allows server-side Prettier formatting.

- **Template catalog as data:** Templates are JSON metadata, not hardcoded components. This enables the AI pipeline to publish directly to the catalog, A/B testing template rankings, and analytics-driven gallery ordering.

- **Render modules as dynamic components:** Each template’s renderModule path points to a lazy-loaded React component. AI-generated templates produce the same module format as hand-crafted ones — the gallery doesn’t know the difference.

- **Prompt → template cache:** A Redis-backed cache maps structured prompt specs to existing template IDs. User-facing generation checks this cache first, returning instant results for prompts that match existing templates. This reduces AI cost as the catalog grows.

---

# 15. UI/UX Specifications

## 15.1 Design Tokens

|               |                        |                                           |
|---------------|------------------------|-------------------------------------------|
| **Token**     | **Value**              | **Usage**                                 |
| bg-base       | \#080E1A               | Page body                                 |
| bg-card       | \#0F172A               | Cards, modals                             |
| bg-inset      | \#0B1120               | Preview panels, code blocks, schema guide |
| bg-input      | \#1E293B               | Inputs, idle buttons, pills               |
| border-subtle | \#1E293B               | Default borders                           |
| border-active | \#334155               | Hover/focus borders                       |
| text-primary  | \#F1F5F9               | Headings, titles                          |
| text-body     | \#E2E8F0               | Body content                              |
| text-muted    | \#94A3B8               | Labels, descriptions                      |
| text-dim      | \#64748B               | Placeholders, tag pills                   |
| accent-canva  | \#00C4CC               | Canva brand elements                      |
| accent-dev    | \#10B981               | Developer tab accent (emerald)            |
| success       | \#4ADE80 / bg \#052E16 | Validation passed                         |
| warning       | \#FCD34D / bg \#451A03 | Missing data, errors                      |

## 15.2 Typography

|                       |                         |                 |
|-----------------------|-------------------------|-----------------|
| **Element**           | **Font**                | **Weight**      |
| Page hero             | DM Sans, clamp(28–48px) | 900             |
| Section headers       | DM Sans, 20–22px        | 800             |
| Card title            | DM Sans, 15px           | 700             |
| Body                  | DM Sans, 14px           | 400–500         |
| Labels                | DM Sans, 12–13px        | 600             |
| Code / data           | JetBrains Mono, 11–13px | 400             |
| Library/effect badges | DM Sans, 10px           | 700 (uppercase) |

---

# 16. Non-Functional Requirements

|                 |                                                                                                                                                 |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| **Category**    | **Requirement**                                                                                                                                 |
| Performance     | Gallery renders 8 skeleton cards in < 100ms. Charts hydrate within 500ms of library load. No library loaded until its charts are in viewport.  |
| Bundle size     | Initial JS bundle < 150 kB gzip (excluding chart libraries). Each library chunk < 100 kB gzip.                                                |
| Export speed    | PNG export < 1.5s for any size up to 4K. Code generation < 500ms.                                                                             |
| Accessibility   | WCAG 2.1 AA. Keyboard navigation for gallery, modal, tabs, code blocks. ARIA labels on all interactive elements.                                |
| Responsiveness  | Full functionality at 320px width. Gallery: 3 → 2 → 1 col. Modal: 2-col → stacked. Code block: full-width with horizontal scroll.               |
| Browser support | Chrome 95+, Firefox 95+, Safari 16+, Edge 95+.                                                                                                  |
| Data privacy    | User CSV/JSON data never leaves the browser. Only exported images are sent to Canva (with explicit consent). No telemetry on user data content. |
| Security        | PKCE for OAuth. Encrypted token storage. HTTPS only. CSP headers. Rate limiting on all API endpoints.                                           |
| SEO             | Gallery pages SSR-rendered for search indexing. Each chart type gets a canonical URL (chartforge.dev/charts/bar, etc.).                         |
| Code quality    | All generated code passes ESLint recommended. React output passes strict mode. No console.log in exports.                                       |

---

# 17. Content Strategy (Gallery Scale)

The “endless scrolling” promise is not aspirational — it’s a **system design requirement**. The AI generation pipeline (Section 7) is the engine. This section describes how it scales the catalog.

## 17.1 Launch Catalog (Week 0)

- **Seed batch:** 150 hand-crafted templates. 19 standard chart types × 3–4 libraries each × 2 visual variants + 16 graph types × 2–3 libraries each. These serve as the training exemplars and quality benchmark for the AI pipeline.

- **AI batch:** 150+ AI-generated templates, produced by running the generation pipeline against the full chart type × library × effect matrix, including graph/network templates. All passing quality gates.

- **Total at launch:** 300+ templates including 80+ graph/network templates. Enough for a rich browsing experience from day one.

## 17.2 Growth Engine (Ongoing)

|                                 |                          |                             |                                                                                          |
|---------------------------------|--------------------------|-----------------------------|------------------------------------------------------------------------------------------|
| **Source**                      | **Volume**               | **Cadence**                 | **Quality Gate**                                                                         |
| AI background pipeline          | 100+ candidates/week     | Continuous (batches of 20)  | Automated gates → human approval queue. ~60–75% approval rate = 60–75 published/week.    |
| AI user-prompted generation     | Variable (10–50+/day)    | Real-time, on demand        | Automated gates only for personal use. Enters approval queue if user submits to gallery. |
| Effect multiplication           | 3–5× per base template   | Applied to new AI templates | Automated: render + visual scoring per effect combo                                      |
| Palette expansion               | Multiplies all templates | New palettes added monthly  | Color contrast validation, accessibility check                                           |
| Human curation                  | 10–20/month              | Ongoing                     | Manual review for flagship / featured templates                                          |
| Community submissions (Phase 3) | TBD                      | PR-based                    | Manual review + automated quality gates                                                  |

## 17.3 Catalog Targets

|               |               |              |
|---------------|---------------|--------------|
| **Milestone** | **Templates** | **Timeline** |
| Launch        | 300+          | Week 0       |
| Month 1       | 500+          | Week 4       |
| Month 3       | 1,500+        | Week 12      |
| Month 6       | 3,500+        | Week 24      |
| Year 1        | 7,000+        | Week 52      |

*At 7,000+ templates with infinite scroll loading 6 at a time, a user would need to scroll through 1,100+ pages to see everything. That’s genuinely endless.*

## 17.4 Quality Bar

- AI-generated templates pass automated quality gates (Section 7.5) and then require human reviewer approval (Section 7.4) before publication.

- Templates scoring 65–70 on automated visual quality are flagged for senior reviewer attention. Below 65 are auto-rejected before reaching the queue.

- Every template must render correctly with default sample data and at least 3 additional test datasets.

- Code export must compile and render without errors for all 4 frameworks.

- Each template gets auto-generated title, subtitle, tags, use case labels, and schema definition (by the AI).

---

# 18. Future Roadmap

**Note:** AI generation, multi-library rendering, visual effects, developer code export, and Canva integration are all MVP (Phase 1). The roadmap below covers features beyond launch.

## 18.1 Phase 2 (Months 2–4)

- **Column remapping UI:** Let users map their CSV column names to chart axes via dropdowns.

- **SVG export:** Vector export for charts without raster-dependent effects.

- **Custom palette builder:** 5-color palette editor with hex input and save-to-library.

- **Batch export:** ZIP download of all workspace charts with consistent naming.

- **Angular + SolidJS framework targets:** Expand code export to 6 frameworks.

- **Light/dark chart background toggle:** Switch between dark and white chart backgrounds.

- **Embed code:** Generate \<iframe> or \<script> embed snippets for static chart hosting.

- **AI style transfer:** “Make this chart look like [screenshot]” — upload a reference image and the AI generates a chart template that mimics the style.

## 18.2 Phase 3 (Months 5–8)

- **Live data connections:** Google Sheets URL, Airtable, REST API as live data sources.

- **Template sharing:** Share configured charts via URL. Recipients see the chart with all settings preserved.

- **Community template submissions:** Public GitHub repo for template PRs. Reviewed and published to gallery.

- **Figma plugin:** Push charts into Figma frames via the Figma REST API.

- **Chart annotations:** Add labels, callouts, arrows, and highlights before export.

- **Team workspaces:** Shared workspace with brand palettes and approved chart styles.

- **AI data analysis:** Upload a CSV and the AI recommends the best chart types, effects, and configurations for your specific data.

## 18.3 Phase 4 (Months 9–12)

- **Template analytics dashboard:** Most viewed, most copied, trending styles. Inform the AI pipeline’s generation weights.

- **Premium templates / marketplace:** Designer-submitted premium templates with revenue share.

- **Real-time collaboration:** Multiple users editing the same workspace simultaneously.

- **ChartForge CLI:** npx chartforge add bar-d3-neon-01 — scaffolds the component directly into a project.

- **AI fine-tuning on user preferences:** The AI learns individual user style preferences and biases its suggestions accordingly.

- **Chart animation timeline editor:** Frame-by-frame control over chart entry animations and transitions.

---

# 19. Open Questions & Risks

## 19.1 Open Questions

|        |                                                                                                                  |             |            |
|--------|------------------------------------------------------------------------------------------------------------------|-------------|------------|
| **\#** | **Question**                                                                                                     | **Owner**   | **Status** |
| 1      | Should we generate TypeScript by default or make it opt-in?                                                      | Engineering | Open       |
| 2      | What’s the rate limit for user-facing AI generation? Free vs. Pro tiers?                                         | Product     | Open       |
| 3      | Should AI-generated templates be visually distinguished from hand-crafted ones in the gallery?                   | Design      | Open       |
| 4      | How do we handle library version conflicts if a user copies code from two templates using different D3 versions? | Engineering | Open       |
| 5      | Should the AI pipeline be open-sourced or kept proprietary?                                                      | Business    | Open       |
| 6      | Do we need a separate mobile-optimized experience or is responsive sufficient?                                   | Design      | Open       |
| 7      | What’s our policy when AI generates a template that closely resembles a copyrighted chart design?                | Legal       | Open       |
| 8      | Should users be able to fork and edit AI-generated code directly in-browser (CodeSandbox-style)?                 | Product     | Open       |
| 9      | How do we handle AI cost spikes if user-facing generation goes viral?                                            | Engineering | Open       |
| 10     | Should the AI generation prompt history be saved per user for repeat generation?                                 | Product     | Open       |

## 19.2 Risks

|                                                                              |            |                |                                                                                                                                                                            |
|------------------------------------------------------------------------------|------------|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Risk**                                                                     | **Impact** | **Likelihood** | **Mitigation**                                                                                                                                                             |
| AI generates code that compiles but produces visually poor/broken charts     | Critical   | High           | Multi-stage quality gates: compile → render → visual scoring → data compatibility. Templates must pass ALL gates. Continuous improvement of scoring prompts.               |
| AI generation costs exceed budget at scale                                   | High       | Medium         | Cache layer reduces repeat generation. Background batches run off-peak. User-facing generation has rate limits. Monitor cost/template weekly.                              |
| AI-generated code has security vulnerabilities (XSS via SVG injection, etc.) | Critical   | Low            | Generated code is sandboxed during render validation. Static analysis scan on all generated code. No dynamic eval() in generated output.                                   |
| Multi-library bundle size bloats initial load                                | High       | High           | Aggressive dynamic import. No chart library in main bundle. Skeleton cards for perceived perf.                                                                             |
| Effect + chart rendering conflicts                                           | Medium     | Medium         | Effect layer isolation architecture. Comprehensive visual regression tests per combination.                                                                                |
| Generated code quality varies across 6+ libraries × 4 frameworks             | High       | Medium         | Automated compile + render tests. CI validates every template × framework combo.                                                                                           |
| Canva API rate limits block batch operations                                 | Medium     | Medium         | Sequential upload queue with progress UI. Warn before large batches.                                                                                                       |
| Users game the AI generation to produce inappropriate/off-brand content      | Medium     | Medium         | Content policy enforcement on prompts. Visual moderation on generated output. Rate limiting per user.                                                                      |
| AI model API (Claude) has downtime, degrading generation availability        | High       | Low            | Queue-based architecture with retry logic. Background generation builds buffer of unpublished templates. User-facing generation shows graceful fallback to catalog search. |

*End of Document*
