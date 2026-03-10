/**
 * PRD §9.3 — Dependency Manifest Registry
 * Accurate package info per library with versions, bundle sizes, and peer deps.
 */

import type { Library, Framework, ChartType, PackageDependency, DependencyManifest } from '@/types/template';

interface LibraryDeps {
  packages: PackageDependency[];
  peerDeps: PackageDependency[];
  totalSize: string;
  typesPackage?: string;
}

const LIBRARY_DEPS: Record<Library, LibraryDeps> = {
  recharts: {
    packages: [
      { name: 'recharts', version: '^2.12.7', purpose: 'Declarative React charting library' },
    ],
    peerDeps: [
      { name: 'react', version: '>=18.0', purpose: 'React runtime' },
      { name: 'react-dom', version: '>=18.0', purpose: 'React DOM rendering' },
    ],
    totalSize: '~52 kB gzip',
    typesPackage: '@types/recharts',
  },
  chartjs: {
    packages: [
      { name: 'chart.js', version: '^4.4.4', purpose: 'Canvas-based chart rendering' },
    ],
    peerDeps: [],
    totalSize: '~67 kB gzip',
    typesPackage: undefined, // chart.js ships its own types
  },
  d3: {
    packages: [
      { name: 'd3', version: '^7.9.0', purpose: 'Data-driven SVG visualization' },
    ],
    peerDeps: [],
    totalSize: '~90 kB gzip',
    typesPackage: '@types/d3',
  },
  plotly: {
    packages: [
      { name: 'plotly.js-dist-min', version: '^2.35.0', purpose: 'Scientific charting library' },
    ],
    peerDeps: [],
    totalSize: '~1.1 MB gzip',
    typesPackage: '@types/plotly.js',
  },
  nivo: {
    packages: [
      { name: '@nivo/core', version: '^0.87.0', purpose: 'Nivo core rendering engine' },
      // Chart-specific package added dynamically in buildDependencyManifest
    ],
    peerDeps: [
      { name: 'react', version: '>=18.0', purpose: 'React runtime' },
      { name: 'react-dom', version: '>=18.0', purpose: 'React DOM rendering' },
    ],
    totalSize: '~85 kB gzip',
  },
  echarts: {
    packages: [
      { name: 'echarts', version: '^5.5.1', purpose: 'Apache ECharts visualization' },
    ],
    peerDeps: [],
    totalSize: '~320 kB gzip',
  },
  threejs: {
    packages: [
      { name: 'three', version: '^0.169.0', purpose: '3D rendering engine' },
    ],
    peerDeps: [],
    totalSize: '~170 kB gzip',
    typesPackage: '@types/three',
  },
  'lightweight-charts': {
    packages: [
      { name: 'lightweight-charts', version: '^4.2.0', purpose: 'Financial charting library' },
    ],
    peerDeps: [],
    totalSize: '~45 kB gzip',
  },
  g6: {
    packages: [
      { name: '@antv/g6', version: '^5.0.0', purpose: 'Graph visualization engine' },
    ],
    peerDeps: [],
    totalSize: '~250 kB gzip',
  },
  'react-force-graph': {
    packages: [
      { name: 'react-force-graph-2d', version: '^1.25.0', purpose: 'Force-directed graph' },
    ],
    peerDeps: [
      { name: 'react', version: '>=18.0', purpose: 'React runtime' },
    ],
    totalSize: '~120 kB gzip',
  },
  cytoscape: {
    packages: [
      { name: 'cytoscape', version: '^3.30.0', purpose: 'Graph theory library' },
    ],
    peerDeps: [],
    totalSize: '~85 kB gzip',
    typesPackage: '@types/cytoscape',
  },
  sigma: {
    packages: [
      { name: 'sigma', version: '^3.0.0', purpose: 'WebGL graph renderer' },
      { name: 'graphology', version: '^0.25.0', purpose: 'Graph data structure' },
    ],
    peerDeps: [],
    totalSize: '~95 kB gzip',
  },
  'vis-network': {
    packages: [
      { name: 'vis-network', version: '^9.1.0', purpose: 'Network visualization' },
      { name: 'vis-data', version: '^7.1.0', purpose: 'Data management for vis' },
    ],
    peerDeps: [],
    totalSize: '~160 kB gzip',
  },
};

/** Effects that require framer-motion */
const FRAMER_MOTION_EFFECTS = new Set(['parallax-float', 'data-pulse', '3d-orbit']);

/** Build a complete dependency manifest for a template + framework combination */
export function buildDependencyManifest(
  library: Library,
  framework: Framework,
  includeEffects: boolean,
  includeTypes: boolean,
  effect: string | null,
  chartType?: ChartType,
): DependencyManifest {
  const libDeps = LIBRARY_DEPS[library];
  const packages = [...libDeps.packages];

  // Add chart-specific Nivo package
  if (library === 'nivo' && chartType) {
    const nivoChart = getNivoChartPackage(chartType);
    packages.push({ name: nivoChart, version: '^0.87.0', purpose: `Nivo ${chartType} component` });
  }

  // Add React wrappers for non-React frameworks using React-based libraries
  if (framework === 'vanilla' && ['recharts', 'nivo', 'react-force-graph'].includes(library)) {
    // These libraries are React-only; vanilla users need the React wrapper
    packages.push(
      { name: 'react', version: '^18.3.1', purpose: 'Required by library' },
      { name: 'react-dom', version: '^18.3.1', purpose: 'Required by library' },
    );
  }

  if (includeEffects && effect && effect !== 'none' && FRAMER_MOTION_EFFECTS.has(effect)) {
    packages.push({ name: 'framer-motion', version: '^11.0.0', purpose: 'Animation effects' });
  }

  const devDeps: PackageDependency[] = [];
  if (includeTypes) {
    if (libDeps.typesPackage) {
      devDeps.push({ name: libDeps.typesPackage, version: '^latest', purpose: 'TypeScript type definitions' });
    }
    if (framework === 'react') {
      devDeps.push({ name: '@types/react', version: '^18.3.0', purpose: 'React type definitions' });
    }
  }

  const allPkgNames = packages.map((p) => `${p.name}@${p.version}`);
  const installCommand = `npm install ${allPkgNames.join(' ')}`;

  return {
    packages,
    installCommand,
    peerDeps: libDeps.peerDeps,
    totalSize: libDeps.totalSize,
    devDeps,
  };
}

function getNivoChartPackage(chartType: ChartType): string {
  switch (chartType) {
    case 'bar': case 'bar-horizontal': case 'bar-stacked': return '@nivo/bar';
    case 'line': case 'area': return '@nivo/line';
    case 'pie': case 'donut': return '@nivo/pie';
    case 'radar': return '@nivo/radar';
    case 'heatmap': return '@nivo/heatmap';
    case 'treemap': return '@nivo/treemap';
    default: return '@nivo/bar';
  }
}
