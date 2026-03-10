/**
 * PRD §17.1 — Template Matrix Generator
 * Programmatically generates template metadata across the full
 * chart type × library × effect × palette matrix.
 *
 * Targets: 150 hand-crafted-style templates + 150 AI-style = 300+ total.
 * - 19 standard chart types × 3-4 libraries × 2 variants = ~150 standard
 * - 16 graph types × 2-3 libraries × 2 variants = ~80 graph
 * - Plus effect/palette variations
 */

import type { TemplateMetadata, ChartType, Library, EffectPreset, PaletteName, UseCase } from '@/types/template';
import { CHART_TYPES, LIBRARIES, PALETTE_NAMES, EFFECT_PRESETS } from '@/types/template';

// --- Library compatibility matrix ---

const STANDARD_CHART_TYPES: ChartType[] = [
  'bar', 'bar-horizontal', 'bar-stacked', 'line', 'area', 'pie', 'donut',
  'scatter', 'radar', 'treemap', 'heatmap', 'funnel', 'waterfall', 'sankey',
  'gauge', 'candlestick', 'radial', 'chord', 'composed',
];

const GRAPH_CHART_TYPES: ChartType[] = [
  'graph-force', 'graph-hierarchy', 'graph-radial', 'graph-circular',
  'graph-dagre', 'graph-grid', 'graph-fruchterman', 'graph-concentric',
  'graph-knowledge', 'graph-entity', 'graph-social', 'graph-dependency',
  'graph-org', 'graph-mind', 'graph-combo', 'graph-3d',
];

const SPECIAL_CHART_TYPES: ChartType[] = ['globe', 'surface'];

const STANDARD_LIBRARIES: Library[] = ['recharts', 'chartjs', 'd3', 'plotly', 'nivo', 'echarts'];
const GRAPH_LIBRARIES: Library[] = ['g6', 'react-force-graph', 'cytoscape', 'sigma', 'vis-network'];
const SPECIAL_LIBRARIES: Library[] = ['threejs'];

/** Which libraries support which chart types (simplified compatibility). */
const LIBRARY_SUPPORT: Partial<Record<Library, ChartType[]>> = {
  'recharts': ['bar', 'bar-horizontal', 'bar-stacked', 'line', 'area', 'pie', 'donut', 'scatter', 'radar', 'funnel', 'radial', 'composed'],
  'chartjs': ['bar', 'bar-horizontal', 'bar-stacked', 'line', 'area', 'pie', 'donut', 'scatter', 'radar'],
  'd3': STANDARD_CHART_TYPES,
  'plotly': ['bar', 'bar-horizontal', 'bar-stacked', 'line', 'area', 'pie', 'donut', 'scatter', 'heatmap', 'funnel', 'waterfall', 'sankey', 'gauge', 'candlestick', 'treemap', 'radar'],
  'nivo': ['bar', 'bar-horizontal', 'bar-stacked', 'line', 'area', 'pie', 'donut', 'scatter', 'radar', 'heatmap', 'funnel', 'treemap', 'chord', 'radial'],
  'echarts': STANDARD_CHART_TYPES,
  'lightweight-charts': ['candlestick', 'line', 'area', 'bar'],
  'g6': GRAPH_CHART_TYPES,
  'react-force-graph': ['graph-force', 'graph-3d', 'graph-radial'],
  'cytoscape': GRAPH_CHART_TYPES.filter((t) => !t.includes('3d')),
  'sigma': ['graph-force', 'graph-circular', 'graph-radial', 'graph-knowledge', 'graph-social'],
  'vis-network': ['graph-force', 'graph-hierarchy', 'graph-entity', 'graph-dependency', 'graph-org'],
  'threejs': ['globe', 'surface', 'graph-3d'],
};

// --- Title/subtitle generation ---

const TYPE_LABELS: Record<string, string> = {
  'bar': 'Bar', 'bar-horizontal': 'Horizontal Bar', 'bar-stacked': 'Stacked Bar',
  'line': 'Line', 'area': 'Area', 'pie': 'Pie', 'donut': 'Donut',
  'scatter': 'Scatter', 'radar': 'Radar', 'treemap': 'Treemap',
  'heatmap': 'Heatmap', 'funnel': 'Funnel', 'waterfall': 'Waterfall',
  'sankey': 'Sankey', 'gauge': 'Gauge', 'candlestick': 'Candlestick',
  'radial': 'Radial', 'chord': 'Chord', 'composed': 'Composed',
  'globe': 'Globe', 'surface': '3D Surface',
  'graph-force': 'Force Graph', 'graph-hierarchy': 'Hierarchy',
  'graph-radial': 'Radial Tree', 'graph-circular': 'Circular Layout',
  'graph-dagre': 'DAG Layout', 'graph-grid': 'Grid Graph',
  'graph-fruchterman': 'Fruchterman Layout', 'graph-concentric': 'Concentric Graph',
  'graph-knowledge': 'Knowledge Graph', 'graph-entity': 'Entity Graph',
  'graph-social': 'Social Network', 'graph-dependency': 'Dependency Graph',
  'graph-org': 'Org Chart', 'graph-mind': 'Mind Map',
  'graph-combo': 'Combo Graph', 'graph-3d': '3D Graph',
};

const EFFECT_LABELS: Record<string, string> = {
  'none': '', 'neon-glow': 'Neon', 'starfield': 'Starfield',
  'gradient-mesh': 'Gradient', 'noise-texture': 'Textured',
  'glass-morphism': 'Glass', 'particle-network': 'Particle',
  'animated-grid': 'Grid', 'hand-drawn-sketch': 'Sketched',
  '3d-perspective': '3D', 'parallax-float': 'Parallax',
  'confetti-burst': 'Confetti', 'scan-lines': 'Retro',
  'watercolor-bleed': 'Watercolor', 'data-pulse': 'Pulse',
  'force-bloom': 'Bloom', 'edge-flow': 'Flow',
  'node-ripple': 'Ripple', 'cluster-nebula': 'Nebula', '3d-orbit': 'Orbit',
};

const PALETTE_ADJECTIVES: Record<PaletteName, string> = {
  'ember': 'Warm', 'midnight': 'Dark', 'forest': 'Natural', 'sunset': 'Vivid',
  'ocean': 'Cool', 'coral': 'Bright', 'neon': 'Electric', 'earth': 'Muted',
  'berry': 'Rich', 'slate': 'Minimal',
};

const SUBTITLE_PATTERNS = [
  (type: string, _lib: string, palette: string) => `${palette}-toned ${type.toLowerCase()} visualization`,
  (type: string, lib: string, _palette: string) => `${type} chart powered by ${lib}`,
  (_type: string, lib: string, palette: string) => `${palette} ${lib} visualization`,
  (type: string, _lib: string, _palette: string) => `Clean ${type.toLowerCase()} for data storytelling`,
];

const DATA_SCHEMAS: Record<string, string> = {
  'bar': 'basic-categorical', 'bar-horizontal': 'basic-categorical', 'bar-stacked': 'stacked-categorical',
  'line': 'time-series', 'area': 'time-series', 'scatter': 'xy-pairs',
  'pie': 'categorical-single', 'donut': 'categorical-single', 'radar': 'multi-axis',
  'treemap': 'hierarchical', 'heatmap': 'matrix', 'funnel': 'stage-conversion',
  'waterfall': 'waterfall-delta', 'sankey': 'flow-links', 'gauge': 'single-value',
  'candlestick': 'ohlcv', 'radial': 'categorical-single', 'chord': 'flow-matrix',
  'composed': 'time-series', 'globe': 'geo-points', 'surface': 'xyz-grid',
};

const TYPE_USE_CASES: Record<string, UseCase[]> = {
  'bar': ['dashboard', 'report'], 'line': ['dashboard', 'presentation'],
  'area': ['dashboard', 'report'], 'pie': ['presentation', 'infographic'],
  'donut': ['presentation', 'infographic'], 'scatter': ['report', 'editorial'],
  'radar': ['report', 'presentation'], 'treemap': ['dashboard', 'report'],
  'heatmap': ['dashboard', 'report'], 'funnel': ['presentation', 'pitch-deck'],
  'waterfall': ['report', 'pitch-deck'], 'sankey': ['dashboard', 'report'],
  'gauge': ['dashboard', 'infographic'], 'candlestick': ['dashboard', 'report'],
  'radial': ['infographic', 'dashboard'], 'chord': ['report', 'editorial'],
  'composed': ['dashboard', 'report'],
};

const GRAPH_USE_CASES: UseCase[] = ['dashboard', 'report', 'presentation'];

function getUseCases(type: ChartType): UseCase[] {
  return TYPE_USE_CASES[type] || GRAPH_USE_CASES;
}

function generateTitle(type: ChartType, effect: EffectPreset | null, palette: PaletteName): string {
  const typeLabel = TYPE_LABELS[type] || type;
  const effectLabel = effect ? EFFECT_LABELS[effect] || '' : '';
  const paletteAdj = PALETTE_ADJECTIVES[palette];
  return effectLabel ? `${effectLabel} ${typeLabel}` : `${paletteAdj} ${typeLabel}`;
}

function generateSubtitle(type: ChartType, library: Library, palette: PaletteName, variant: number): string {
  const typeLabel = TYPE_LABELS[type] || type;
  const paletteAdj = PALETTE_ADJECTIVES[palette];
  const pattern = SUBTITLE_PATTERNS[variant % SUBTITLE_PATTERNS.length];
  return pattern(typeLabel, library, paletteAdj);
}

function isGraphType(type: ChartType): boolean {
  return type.startsWith('graph-');
}

// --- Generator ---

export interface GeneratorOptions {
  /** Max templates to generate. Default: 320 */
  maxTemplates?: number;
  /** Include graph types. Default: true */
  includeGraphs?: boolean;
  /** Include special types (globe, surface). Default: true */
  includeSpecial?: boolean;
  /** Effects to use. Default: subset of 6 popular effects + none */
  effects?: (EffectPreset | null)[];
}

const DEFAULT_EFFECTS: (EffectPreset | null)[] = [
  null, 'neon-glow', 'glass-morphism', 'gradient-mesh', '3d-perspective', 'hand-drawn-sketch', 'data-pulse',
];

const GRAPH_EFFECTS: (EffectPreset | null)[] = [
  null, 'force-bloom', 'edge-flow', 'node-ripple', 'cluster-nebula', 'neon-glow',
];

/**
 * Generate a full matrix of template metadata.
 * Returns ~300+ templates across all chart types, libraries, effects, and palettes.
 */
export function generateTemplateMatrix(options?: GeneratorOptions): TemplateMetadata[] {
  const {
    maxTemplates = 320,
    includeGraphs = true,
    includeSpecial = true,
  } = options || {};

  const templates: TemplateMetadata[] = [];
  let counter = 0;

  // Helper to pick a deterministic palette based on counter
  const pickPalette = (i: number): PaletteName => PALETTE_NAMES[i % PALETTE_NAMES.length];

  // --- Standard chart types ---
  for (const chartType of STANDARD_CHART_TYPES) {
    const supportedLibs = STANDARD_LIBRARIES.filter((lib) => {
      const supported = LIBRARY_SUPPORT[lib];
      return supported && supported.includes(chartType);
    });

    // Pick 3-4 libraries per type
    const libs = supportedLibs.slice(0, 4);

    for (const library of libs) {
      // 3 variants per type/library combo: none, effect A, effect B
      for (let variant = 0; variant < 3; variant++) {
        if (templates.length >= maxTemplates) break;

        const effect = variant === 0
          ? null
          : DEFAULT_EFFECTS[((counter + variant) % (DEFAULT_EFFECTS.length - 1)) + 1];
        const palette = pickPalette(counter);

        templates.push(buildTemplate(chartType, library, effect, palette, variant, counter));
        counter++;
      }
    }
  }

  // --- Graph types ---
  if (includeGraphs) {
    for (const chartType of GRAPH_CHART_TYPES) {
      const supportedLibs = GRAPH_LIBRARIES.filter((lib) => {
        const supported = LIBRARY_SUPPORT[lib];
        return supported && supported.includes(chartType);
      });

      const libs = supportedLibs.slice(0, 3);

      for (const library of libs) {
        for (let variant = 0; variant < 2; variant++) {
          if (templates.length >= maxTemplates) break;

          const effect = variant === 0 ? null : GRAPH_EFFECTS[(counter % (GRAPH_EFFECTS.length - 1)) + 1];
          const palette = pickPalette(counter);

          templates.push(buildTemplate(chartType, library, effect, palette, variant, counter));
          counter++;
        }
      }
    }
  }

  // --- Special types (globe, surface) ---
  if (includeSpecial) {
    for (const chartType of SPECIAL_CHART_TYPES) {
      for (let variant = 0; variant < 3; variant++) {
        if (templates.length >= maxTemplates) break;

        const effect = DEFAULT_EFFECTS[(counter % (DEFAULT_EFFECTS.length - 1)) + 1];
        const palette = pickPalette(counter);

        templates.push(buildTemplate(chartType, 'threejs', effect, palette, variant, counter));
        counter++;
      }
    }
  }

  return templates;
}

function buildTemplate(
  chartType: ChartType,
  library: Library,
  effect: EffectPreset | null,
  palette: PaletteName,
  variant: number,
  counter: number,
): TemplateMetadata {
  const effectSlug = effect ? effect.split('-')[0] : 'none';
  const id = `${chartType}-${library}-${effectSlug}-${String(counter).padStart(2, '0')}`;
  const isGraph = isGraphType(chartType);

  return {
    id,
    title: generateTitle(chartType, effect, palette),
    subtitle: generateSubtitle(chartType, library, palette, variant),
    chartType,
    library,
    palette,
    effect,
    effectConfig: effect ? { intensity: 60 + (counter % 30) } : null,
    dataKey: isGraph ? 'graph-default' : (DATA_SCHEMAS[chartType] || 'basic-categorical'),
    dataSchema: isGraph ? 'graph-nodes-edges' : (DATA_SCHEMAS[chartType] || 'basic-categorical'),
    tags: [
      chartType.replace('graph-', ''),
      library,
      ...(effect ? [effectSlug] : []),
      PALETTE_ADJECTIVES[palette].toLowerCase(),
    ],
    useCases: getUseCases(chartType),
    height: isGraph ? 450 : (250 + (counter % 5) * 30),
    config: {},
    renderModule: `${library}-renderer`,
    codeTemplates: {
      react: `${chartType}-${library}`,
      vanilla: `${chartType}-${library}`,
      vue: `${chartType}-${library}`,
      svelte: `${chartType}-${library}`,
    },
    layoutConfig: isGraph ? { algorithm: chartType.replace('graph-', ''), params: {} } : null,
    interactionDefaults: isGraph ? ['zoom-pan', 'node-drag', 'hover-highlight'] : [],
    maxNodes: isGraph ? 200 : null,
    neo4jBoilerplate: isGraph,
    generationSource: 'ai-background',
    qualityScore: 80 + (counter % 15),
    createdAt: new Date().toISOString(),
  };
}

/** Get a summary of the generated matrix for validation. */
export function getMatrixSummary(templates: TemplateMetadata[]) {
  const types = new Set(templates.map((t) => t.chartType));
  const libraries = new Set(templates.map((t) => t.library));
  const effects = new Set(templates.map((t) => t.effect).filter(Boolean));
  const palettes = new Set(templates.map((t) => t.palette));
  const graphCount = templates.filter((t) => t.chartType.startsWith('graph-')).length;

  return {
    total: templates.length,
    uniqueTypes: types.size,
    uniqueLibraries: libraries.size,
    uniqueEffects: effects.size,
    uniquePalettes: palettes.size,
    graphTemplates: graphCount,
    standardTemplates: templates.length - graphCount,
    typeBreakdown: Object.fromEntries(
      Array.from(types).map((type) => [type, templates.filter((t) => t.chartType === type).length]),
    ),
  };
}
