/**
 * PRD §7.2 — AI Generation Pipeline (Mock)
 * Simulates the 4-stage AI chart generation pipeline.
 * Returns a pre-built template as if AI-generated.
 *
 * Real pipeline (behind feature flag) would:
 *   Stage 1: Parse NL prompt → structured spec (Claude Haiku)
 *   Stage 2: Generate code (Claude Sonnet)
 *   Stage 3: Render validation (Puppeteer)
 *   Stage 4: Visual quality scoring (Claude Vision)
 */

import type {
  TemplateMetadata,
  ChartType,
  Library,
  EffectPreset,
  PaletteName,
  CandidateTemplate,
  Framework,
} from '@/types/template';

// --- Prompt Parsing (Mock) ---

export interface ParsedSpec {
  chartType: ChartType | null;
  library: Library | null;
  effect: EffectPreset | null;
  palette: PaletteName | null;
  keywords: string[];
}

const CHART_TYPE_KEYWORDS: Record<string, ChartType> = {
  bar: 'bar', line: 'line', area: 'area', pie: 'pie', donut: 'donut',
  scatter: 'scatter', radar: 'radar', treemap: 'treemap', funnel: 'funnel',
  heatmap: 'heatmap', candlestick: 'candlestick', sankey: 'sankey',
  network: 'graph-force', graph: 'graph-force', force: 'graph-force',
  hierarchy: 'graph-hierarchy', chord: 'chord', gauge: 'gauge',
  radial: 'radial', waterfall: 'waterfall', globe: 'globe', surface: 'surface',
};

const LIBRARY_KEYWORDS: Record<string, Library> = {
  recharts: 'recharts', 'chart.js': 'chartjs', chartjs: 'chartjs',
  d3: 'd3', plotly: 'plotly', nivo: 'nivo', echarts: 'echarts',
  'three.js': 'threejs', threejs: 'threejs', 'three': 'threejs',
  g6: 'g6', cytoscape: 'cytoscape', sigma: 'sigma',
  'vis-network': 'vis-network', 'lightweight': 'lightweight-charts',
  'react-force-graph': 'react-force-graph',
};

const EFFECT_KEYWORDS: Record<string, EffectPreset> = {
  neon: 'neon-glow', glow: 'neon-glow', glass: 'glass-morphism',
  '3d': '3d-perspective', parallax: 'parallax-float', pulse: 'data-pulse',
  starfield: 'starfield', stars: 'starfield', noise: 'noise-texture',
  scan: 'scan-lines', gradient: 'gradient-mesh', sketch: 'hand-drawn-sketch',
  'hand-drawn': 'hand-drawn-sketch', orbit: '3d-orbit',
  particle: 'particle-network', grid: 'animated-grid',
  confetti: 'confetti-burst', watercolor: 'watercolor-bleed',
};

const PALETTE_KEYWORDS: Record<string, PaletteName> = {
  midnight: 'midnight', neon: 'neon', ocean: 'ocean', sunset: 'sunset',
  forest: 'forest', coral: 'coral', ember: 'ember', earth: 'earth',
  berry: 'berry', slate: 'slate', dark: 'midnight', warm: 'ember',
};

/**
 * PRD §5.8.2 — Parse NL prompt into structured spec.
 */
export function parsePrompt(prompt: string): ParsedSpec {
  const lower = prompt.toLowerCase();
  const words = lower.split(/\s+/);

  let chartType: ChartType | null = null;
  let library: Library | null = null;
  let effect: EffectPreset | null = null;
  let palette: PaletteName | null = null;

  // Multi-word matches first
  for (const [keyword, value] of Object.entries(CHART_TYPE_KEYWORDS)) {
    if (lower.includes(keyword)) { chartType = value; break; }
  }
  for (const [keyword, value] of Object.entries(LIBRARY_KEYWORDS)) {
    if (lower.includes(keyword)) { library = value; break; }
  }
  for (const [keyword, value] of Object.entries(EFFECT_KEYWORDS)) {
    if (lower.includes(keyword)) { effect = value; break; }
  }
  for (const [keyword, value] of Object.entries(PALETTE_KEYWORDS)) {
    if (lower.includes(keyword)) { palette = value; break; }
  }

  return { chartType, library, effect, palette, keywords: words };
}

// --- Mock Generation ---

/**
 * Quality scoring result (mock returns 75-85).
 */
export interface QualityScore {
  overall: number;
  compilation: boolean;
  rendering: boolean;
  dimensions: boolean;
  textLegibility: boolean;
  effectIntegrity: boolean;
  codeQuality: boolean;
  dataCompatibility: boolean;
}

export function mockQualityScore(): QualityScore {
  const overall = 75 + Math.floor(Math.random() * 11); // 75-85
  return {
    overall,
    compilation: true,
    rendering: true,
    dimensions: true,
    textLegibility: true,
    effectIntegrity: true,
    codeQuality: true,
    dataCompatibility: true,
  };
}

/**
 * Build a mock CandidateTemplate from a parsed spec.
 * In production, this would be AI-generated code.
 */
export function buildMockCandidate(
  spec: ParsedSpec,
  baseTemplate: TemplateMetadata,
): CandidateTemplate {
  return {
    ...baseTemplate,
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: `AI: ${baseTemplate.title}`,
    generationSource: 'ai-user',
    qualityScore: mockQualityScore().overall,
    createdAt: new Date().toISOString(),
    sourceCode: {
      react: '// AI-generated React code (mock)',
      vanilla: '// AI-generated Vanilla JS code (mock)',
      vue: '// AI-generated Vue code (mock)',
      svelte: '// AI-generated Svelte code (mock)',
    } as Record<Framework, string>,
    screenshots: [],
    reviewStatus: 'pending',
  };
}
