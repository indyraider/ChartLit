/**
 * PRD §6.4 / §14.3 — Dynamic Import Infrastructure
 * Lazy-loads chart libraries on-demand. Only loads libraries for visible charts.
 */

import type { Library } from '@/types/template';
import { type ComponentType, lazy } from 'react';

/**
 * Registry of lazy-loaded chart renderer components, keyed by library.
 * Each renderer is a React component that accepts standardized ChartRendererProps.
 */
export interface ChartRendererProps {
  config: Record<string, unknown>;
  data: Record<string, unknown>[];
  palette: string[];
  width: number;
  height: number;
  chartType: string;
  interactive?: boolean;
}

type LazyChartComponent = ComponentType<ChartRendererProps>;

// Dynamic import map — each library loads only when first needed
const LIBRARY_LOADERS: Record<Library, () => Promise<{ default: LazyChartComponent }>> = {
  recharts: () => import('@/components/charts/recharts-renderer'),
  chartjs: () => import('@/components/charts/chartjs-renderer'),
  d3: () => import('@/components/charts/d3-renderer'),
  plotly: () => import('@/components/charts/plotly-renderer'),
  nivo: () => import('@/components/charts/nivo-renderer'),
  echarts: () => import('@/components/charts/echarts-renderer'),
  threejs: () => import('@/components/charts/threejs-renderer'),
  'lightweight-charts': () => import('@/components/charts/lightweight-charts-renderer'),
  g6: () => import('@/components/charts/g6-renderer'),
  'react-force-graph': () => import('@/components/charts/react-force-graph-renderer'),
  cytoscape: () => import('@/components/charts/cytoscape-renderer'),
  sigma: () => import('@/components/charts/sigma-renderer'),
  'vis-network': () => import('@/components/charts/vis-network-renderer'),
};

// Cache of lazy components — created once per library
const lazyCache = new Map<Library, React.LazyExoticComponent<LazyChartComponent>>();

/**
 * Get a lazy-loaded chart renderer component for a given library.
 * Components are cached so the same lazy wrapper is reused.
 */
export function getChartRenderer(library: Library): React.LazyExoticComponent<LazyChartComponent> {
  let component = lazyCache.get(library);
  if (!component) {
    const loader = LIBRARY_LOADERS[library];
    if (!loader) {
      throw new Error(`No renderer registered for library: ${library}`);
    }
    component = lazy(loader);
    lazyCache.set(library, component);
  }
  return component;
}

/**
 * Check if a chart type is a graph type (uses nodes/edges data model).
 */
export function isGraphType(chartType: string): boolean {
  return chartType.startsWith('graph-');
}
