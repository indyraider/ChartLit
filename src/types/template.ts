/**
 * PRD §10.1 — Template Metadata Schema
 * Core type definitions for ChartForge/ChartLit templates.
 */

// --- Enums ---

export const CHART_TYPES = [
  'bar', 'bar-horizontal', 'bar-stacked', 'line', 'area', 'pie', 'donut',
  'scatter', 'radar', 'treemap', 'heatmap', 'funnel', 'waterfall', 'sankey',
  'gauge', 'candlestick', 'radial', 'chord', 'globe', 'surface', 'composed',
  // Graph types
  'graph-force', 'graph-hierarchy', 'graph-radial', 'graph-circular',
  'graph-dagre', 'graph-grid', 'graph-fruchterman', 'graph-concentric',
  'graph-knowledge', 'graph-entity', 'graph-social', 'graph-dependency',
  'graph-org', 'graph-mind', 'graph-combo', 'graph-3d',
] as const;

export type ChartType = typeof CHART_TYPES[number];

export const LIBRARIES = [
  'recharts', 'chartjs', 'd3', 'plotly', 'nivo', 'echarts', 'threejs',
  'lightweight-charts', 'g6', 'react-force-graph', 'cytoscape', 'sigma',
  'vis-network',
] as const;

export type Library = typeof LIBRARIES[number];

export const EFFECT_PRESETS = [
  'none', 'neon-glow', 'starfield', 'gradient-mesh', 'noise-texture',
  'glass-morphism', 'particle-network', 'animated-grid', 'hand-drawn-sketch',
  '3d-perspective', 'parallax-float', 'confetti-burst', 'scan-lines',
  'watercolor-bleed', 'data-pulse', 'force-bloom', 'edge-flow',
  'node-ripple', 'cluster-nebula', '3d-orbit',
] as const;

export type EffectPreset = typeof EFFECT_PRESETS[number];

export const PALETTE_NAMES = [
  'ember', 'midnight', 'forest', 'sunset', 'ocean',
  'coral', 'neon', 'earth', 'berry', 'slate',
] as const;

export type PaletteName = typeof PALETTE_NAMES[number];

export const FRAMEWORKS = ['react', 'vanilla', 'vue', 'svelte'] as const;
export type Framework = typeof FRAMEWORKS[number];

export const USE_CASES = [
  'dashboard', 'presentation', 'social', 'report',
  'infographic', 'pitch-deck', 'editorial', 'print',
] as const;

export type UseCase = typeof USE_CASES[number];

// --- Effect Layer ---

export type EffectLayer = 'background' | 'overlay' | 'animation';

export interface EffectConfig {
  intensity: number; // 0-100
  [key: string]: unknown; // Effect-specific sub-options
}

// --- Graph-specific ---

export interface LayoutConfig {
  algorithm: string;
  params: Record<string, number | string | boolean>;
}

export type GraphInteraction =
  | 'zoom-pan'
  | 'node-drag'
  | 'hover-highlight'
  | 'click-expand'
  | 'search';

// --- Template Metadata (PRD §10.1) ---

export interface TemplateMetadata {
  id: string; // e.g., "bar-d3-neon-01"
  title: string;
  subtitle: string;
  chartType: ChartType;
  library: Library;
  palette: PaletteName;
  effect: EffectPreset | null;
  effectConfig: EffectConfig | null;
  dataKey: string;
  dataSchema: string;
  tags: string[];
  useCases: UseCase[];
  height: number; // Default card preview height in px
  config: Record<string, unknown>; // Library-specific chart config
  renderModule: string; // Path to render component module
  codeTemplates: Partial<Record<Framework, string>>; // framework → code template path

  // Graph-only fields
  layoutConfig: LayoutConfig | null;
  interactionDefaults: GraphInteraction[];
  maxNodes: number | null;
  neo4jBoilerplate: boolean;

  // Metadata
  thumbnailUrl?: string;
  generationSource?: 'manual' | 'ai-background' | 'ai-user';
  qualityScore?: number;
  createdAt?: string;
}

// --- Data Schemas ---

export interface DataSchemaField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  description: string;
}

export interface DataSchema {
  id: string;
  description: string;
  fields: DataSchemaField[];
  exampleCsv: string;
  isGraph: boolean;
}

// Graph data format
export interface GraphNode {
  id: string;
  label?: string;
  group?: string;
  [key: string]: unknown;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  weight?: number;
  [key: string]: unknown;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// --- Dependency Manifest (PRD §9.3) ---

export interface PackageDependency {
  name: string;
  version: string;
  purpose: string;
}

export interface DependencyManifest {
  packages: PackageDependency[];
  installCommand: string;
  peerDeps: PackageDependency[];
  totalSize: string;
  devDeps: PackageDependency[];
}

// --- Code Generation Response ---

export interface CodeGenerationResponse {
  code: string;
  language: 'jsx' | 'js' | 'vue' | 'svelte' | 'tsx' | 'ts';
  dependencies: DependencyManifest;
}

// --- API Response Types ---

export interface TemplateListResponse {
  templates: TemplateMetadata[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface GenerateResponse {
  jobId: string;
}

export interface GenerateStatusResponse {
  status: 'pending' | 'generating' | 'complete' | 'failed';
  template?: TemplateMetadata;
  error?: string;
  suggestion?: string;
}

// --- Candidate (AI Pipeline → Approval Queue) ---

export interface CandidateTemplate extends TemplateMetadata {
  sourceCode: Record<Framework, string>;
  screenshots: string[]; // URLs for 3 viewport sizes
  promptText?: string;
  userId?: string;
  reviewStatus: 'pending' | 'approved' | 'revision-requested' | 'rejected';
  reviewerNotes?: string;
  rejectionReason?: string;
  reviewedAt?: string;
}

// --- Filter State ---

export interface GalleryFilters {
  type: ChartType | null;
  library: Library | null;
  effect: EffectPreset | null;
  palette: PaletteName | null;
  useCase: UseCase | null;
  search: string;
}
