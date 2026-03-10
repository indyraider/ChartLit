/**
 * PRD §9.2 — Framework Adapters
 * Transforms React component code into Vanilla JS, Vue 3, and Svelte equivalents.
 *
 * Strategy: Rather than doing complex AST transforms, we use template wrappers
 * around the core chart initialization logic extracted from the React template.
 */

import type { Framework, Library, ChartType, PaletteName } from '@/types/template';
import { PALETTES } from '@/lib/palettes';

interface AdapterOpts {
  componentName: string;
  library: Library;
  chartType: ChartType;
  palette: PaletteName;
  sampleDataInline: string;
  reactCode: string;
}

export function adaptToFramework(framework: Framework, opts: AdapterOpts): { code: string; language: string } {
  switch (framework) {
    case 'react':
      return { code: opts.reactCode, language: 'jsx' };
    case 'vanilla':
      return { code: generateVanilla(opts), language: 'js' };
    case 'vue':
      return { code: generateVue(opts), language: 'vue' };
    case 'svelte':
      return { code: generateSvelte(opts), language: 'svelte' };
    default:
      return { code: opts.reactCode, language: 'jsx' };
  }
}

// ---- Vanilla JS ----

function generateVanilla(opts: AdapterOpts): string {
  const { componentName, library, chartType, palette, sampleDataInline } = opts;
  const paletteStr = JSON.stringify(PALETTES[palette]);

  // For libraries that have vanilla-compatible APIs
  if (isImperativeLibrary(library)) {
    return generateImperativeVanilla(componentName, library, chartType, paletteStr, sampleDataInline);
  }

  // For React-only libraries (recharts, nivo), provide a note
  return `/**
 * ${componentName} — Vanilla JS
 * Note: ${library} is a React-only library. This module creates a minimal
 * React root to render the component. For a fully vanilla solution,
 * consider using Chart.js, D3, ECharts, or Plotly instead.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';

// 🎨 Replace with your color palette
const PALETTE = ${paletteStr};

// 📊 Replace with your data
const DATA = ${sampleDataInline};

/**
 * Render the chart into a container element.
 * @param {HTMLElement} container - DOM element to render into
 * @param {Array} data - Chart data (optional, uses sample data if omitted)
 */
export function render(container, data = DATA) {
  // Import the React component and render it
  // See the React tab for the full component code
  const root = createRoot(container);
  root.render(React.createElement('div', {
    style: { width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }
  }, '${chartType} chart — see React tab for ${library} component'));

  return { destroy: () => root.unmount() };
}
`;
}

function isImperativeLibrary(library: Library): boolean {
  return ['chartjs', 'd3', 'plotly', 'echarts', 'lightweight-charts', 'g6', 'cytoscape', 'sigma', 'vis-network'].includes(library);
}

function generateImperativeVanilla(
  componentName: string, library: Library, chartType: ChartType,
  paletteStr: string, sampleDataInline: string,
): string {
  const initCode = getVanillaInitCode(library, chartType);

  return `/**
 * ${componentName} — Vanilla JS (ES Module)
 * Self-contained chart with render(container, data) API.
 */

${getVanillaImport(library)}

// 🎨 Replace with your color palette
const PALETTE = ${paletteStr};

// 📊 Replace with your data
const DATA = ${sampleDataInline};

/**
 * Render the chart into a container element.
 * @param {HTMLElement} container - DOM element to render into
 * @param {Array} data - Chart data (optional, uses sample data if omitted)
 * @returns {{ destroy: () => void }} Cleanup handle
 */
export function render(container, data = DATA) {
  container.style.width = container.style.width || '100%';
  container.style.height = container.style.height || '400px';

${initCode}

  return { destroy: () => { ${getVanillaCleanup(library)} } };
}
`;
}

function getVanillaImport(library: Library): string {
  switch (library) {
    case 'chartjs': return "import { Chart, registerables } from 'chart.js';\nChart.register(...registerables);";
    case 'd3': return "import * as d3 from 'd3';";
    case 'plotly': return "import Plotly from 'plotly.js-dist-min';";
    case 'echarts': return "import * as echarts from 'echarts';";
    case 'lightweight-charts': return "import { createChart } from 'lightweight-charts';";
    case 'g6': return "import { Graph } from '@antv/g6';";
    case 'cytoscape': return "import cytoscape from 'cytoscape';";
    case 'sigma': return "import Sigma from 'sigma';\nimport Graph from 'graphology';";
    case 'vis-network': return "import { Network, DataSet } from 'vis-network/standalone';";
    default: return '';
  }
}

function getVanillaInitCode(library: Library, chartType: ChartType): string {
  switch (library) {
    case 'chartjs':
      return `  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const numKeys = Object.keys(data[0]).filter((k) => typeof data[0][k] === 'number');
  const labels = data.map((d) => d[Object.keys(d).find((k) => typeof d[k] === 'string')]);
  const chart = new Chart(canvas, {
    type: '${chartType === 'donut' ? 'doughnut' : chartType === 'area' ? 'line' : chartType === 'pie' ? 'pie' : chartType === 'radar' ? 'radar' : chartType === 'scatter' ? 'scatter' : 'bar'}',
    data: { labels, datasets: numKeys.map((k, i) => ({ label: k, data: data.map((d) => d[k]), backgroundColor: PALETTE[i % PALETTE.length] + 'CC', borderColor: PALETTE[i % PALETTE.length], borderWidth: 1, borderRadius: 4${chartType === 'area' ? ', fill: true, tension: 0.4' : ''} })) },
    options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { backgroundColor: '#0F172A' }, legend: { labels: { color: '#94A3B8' } } } },
  });`;
    case 'echarts':
      return `  const chart = echarts.init(container);
  const strKey = Object.keys(data[0]).find((k) => typeof data[0][k] === 'string');
  const numKeys = Object.keys(data[0]).filter((k) => typeof data[0][k] === 'number');
  chart.setOption({
    color: PALETTE,
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#0F172A', borderColor: '#1E293B', textStyle: { color: '#E2E8F0' } },
    xAxis: { type: 'category', data: data.map((d) => d[strKey]) },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1E293B' } } },
    series: numKeys.map((k) => ({ type: '${chartType === 'line' || chartType === 'area' ? 'line' : 'bar'}', name: k, data: data.map((d) => d[k])${chartType === 'area' ? ', areaStyle: { opacity: 0.2 }' : ''} })),
  });
  window.addEventListener('resize', () => chart.resize());`;
    case 'd3':
      return `  const svg = d3.select(container).append('svg').attr('width', container.clientWidth).attr('height', parseInt(container.style.height));
  // D3 rendering — see React tab for full implementation
  svg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').attr('fill', '#94A3B8').text('${chartType} chart');`;
    case 'plotly':
      return `  const strKey = Object.keys(data[0]).find((k) => typeof data[0][k] === 'string');
  const numKey = Object.keys(data[0]).find((k) => typeof data[0][k] === 'number');
  Plotly.newPlot(container, [{ x: data.map((d) => d[strKey]), y: data.map((d) => d[numKey]), type: '${chartType === 'line' ? 'scatter' : 'bar'}', marker: { color: data.map((_, i) => PALETTE[i % PALETTE.length]) }${chartType === 'line' ? ", mode: 'lines+markers'" : ''} }], {
    paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
    font: { color: '#94A3B8' }, margin: { t: 30, r: 20, b: 40, l: 50 },
    xaxis: { gridcolor: '#1E293B' }, yaxis: { gridcolor: '#1E293B' },
  }, { responsive: true, displayModeBar: false });`;
    case 'lightweight-charts':
      return `  const chart = createChart(container, {
    layout: { background: { color: 'transparent' }, textColor: '#94A3B8' },
    grid: { vertLines: { color: '#1E293B' }, horzLines: { color: '#1E293B' } },
  });
  const series = chart.addCandlestickSeries({ upColor: PALETTE[2], downColor: PALETTE[0] });
  series.setData(data.map((d) => ({ time: d.date, open: d.open, high: d.high, low: d.low, close: d.close })));
  chart.timeScale().fitContent();`;
    default:
      return `  // Initialize ${library} chart — see React tab for full implementation
  container.innerHTML = '<p style="color:#94A3B8;text-align:center;padding:40px">${chartType} chart</p>';`;
  }
}

function getVanillaCleanup(library: Library): string {
  switch (library) {
    case 'chartjs': return 'chart.destroy();';
    case 'echarts': return 'chart.dispose();';
    case 'plotly': return 'Plotly.purge(container);';
    case 'lightweight-charts': return 'chart.remove();';
    case 'g6': return 'graph.destroy();';
    case 'cytoscape': return 'cy.destroy();';
    default: return 'container.innerHTML = "";';
  }
}

// ---- Vue 3 ----

function generateVue(opts: AdapterOpts): string {
  const { componentName, library, chartType, palette, sampleDataInline } = opts;
  const paletteStr = JSON.stringify(PALETTES[palette]);

  if (library === 'recharts' || library === 'nivo' || library === 'react-force-graph') {
    return `<!-- ${componentName} — Vue 3 SFC -->
<!-- Note: ${library} is React-only. Consider Chart.js, D3, ECharts, or Plotly for Vue. -->
<script setup>
import { ref } from 'vue';

// 🎨 Replace with your color palette
const PALETTE = ${paletteStr};

// 📊 Replace with your data
const data = ref(${sampleDataInline});
</script>

<template>
  <div style="width: 100%; height: 400px; display: flex; align-items: center; justify-content: center; color: #94A3B8">
    <p>${chartType} chart — ${library} requires React. Use Chart.js or ECharts for Vue.</p>
  </div>
</template>
`;
  }

  return `<!-- ${componentName} — Vue 3 SFC (Composition API) -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
${getVueImport(library)}

// 🎨 Replace with your color palette
const PALETTE = ${paletteStr};

// 📊 Replace with your data
const data = ref(${sampleDataInline});

const chartContainer = ref(null);
let chartInstance = null;

onMounted(() => {
  if (!chartContainer.value) return;
${getVueInitCode(library, chartType)}
});

onUnmounted(() => {
  ${getVanillaCleanup(library).replace('chart', 'chartInstance').replace('container', 'chartContainer.value')}
});
</script>

<template>
  <div ref="chartContainer" style="width: 100%; height: 400px"></div>
</template>
`;
}

function getVueImport(library: Library): string {
  switch (library) {
    case 'chartjs': return "import { Chart, registerables } from 'chart.js';\nChart.register(...registerables);";
    case 'd3': return "import * as d3 from 'd3';";
    case 'echarts': return "import * as echarts from 'echarts';";
    case 'plotly': return "import Plotly from 'plotly.js-dist-min';";
    case 'lightweight-charts': return "import { createChart } from 'lightweight-charts';";
    case 'cytoscape': return "import cytoscape from 'cytoscape';";
    default: return '';
  }
}

function getVueInitCode(library: Library, chartType: ChartType): string {
  switch (library) {
    case 'chartjs':
      return `  const canvas = document.createElement('canvas');
  chartContainer.value.appendChild(canvas);
  const numKeys = Object.keys(data.value[0]).filter((k) => typeof data.value[0][k] === 'number');
  const labels = data.value.map((d) => d[Object.keys(d).find((k) => typeof d[k] === 'string')]);
  chartInstance = new Chart(canvas, {
    type: '${chartType === 'donut' ? 'doughnut' : chartType === 'area' ? 'line' : chartType}',
    data: { labels, datasets: numKeys.map((k, i) => ({ label: k, data: data.value.map((d) => d[k]), backgroundColor: PALETTE[i % PALETTE.length] + 'CC', borderColor: PALETTE[i % PALETTE.length], borderWidth: 1, borderRadius: 4 })) },
    options: { responsive: true, maintainAspectRatio: false },
  });`;
    case 'echarts':
      return `  chartInstance = echarts.init(chartContainer.value);
  const strKey = Object.keys(data.value[0]).find((k) => typeof data.value[0][k] === 'string');
  const numKeys = Object.keys(data.value[0]).filter((k) => typeof data.value[0][k] === 'number');
  chartInstance.setOption({
    color: PALETTE, backgroundColor: 'transparent',
    xAxis: { type: 'category', data: data.value.map((d) => d[strKey]) },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1E293B' } } },
    series: numKeys.map((k) => ({ type: '${chartType === 'line' || chartType === 'area' ? 'line' : 'bar'}', name: k, data: data.value.map((d) => d[k]) })),
  });`;
    default:
      return `  // Initialize ${library} — see React tab for full implementation`;
  }
}

// ---- Svelte ----

function generateSvelte(opts: AdapterOpts): string {
  const { componentName, library, chartType, palette, sampleDataInline } = opts;
  const paletteStr = JSON.stringify(PALETTES[palette]);

  if (library === 'recharts' || library === 'nivo' || library === 'react-force-graph') {
    return `<!-- ${componentName} — Svelte -->
<!-- Note: ${library} is React-only. Consider Chart.js, D3, ECharts, or Plotly for Svelte. -->
<script>
  // 🎨 Replace with your color palette
  const PALETTE = ${paletteStr};
  // 📊 Replace with your data
  let data = ${sampleDataInline};
</script>

<div style="width: 100%; height: 400px; display: flex; align-items: center; justify-content: center; color: #94A3B8">
  <p>${chartType} chart — ${library} requires React. Use Chart.js or ECharts for Svelte.</p>
</div>
`;
  }

  return `<!-- ${componentName} — Svelte Component -->
<script>
  import { onMount, onDestroy } from 'svelte';
${getSvelteImport(library)}

  // 🎨 Replace with your color palette
  const PALETTE = ${paletteStr};

  // 📊 Replace with your data
  let data = ${sampleDataInline};

  let chartContainer;
  let chartInstance;

  onMount(() => {
    if (!chartContainer) return;
${getSvelteInitCode(library, chartType)}
  });

  onDestroy(() => {
    ${getVanillaCleanup(library).replace('chart', 'chartInstance').replace('container', 'chartContainer')}
  });
</script>

<div bind:this={chartContainer} style="width: 100%; height: 400px"></div>
`;
}

function getSvelteImport(library: Library): string {
  switch (library) {
    case 'chartjs': return "  import { Chart, registerables } from 'chart.js';\n  Chart.register(...registerables);";
    case 'd3': return "  import * as d3 from 'd3';";
    case 'echarts': return "  import * as echarts from 'echarts';";
    case 'plotly': return "  import Plotly from 'plotly.js-dist-min';";
    case 'lightweight-charts': return "  import { createChart } from 'lightweight-charts';";
    case 'cytoscape': return "  import cytoscape from 'cytoscape';";
    default: return '';
  }
}

function getSvelteInitCode(library: Library, chartType: ChartType): string {
  switch (library) {
    case 'chartjs':
      return `    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    const numKeys = Object.keys(data[0]).filter((k) => typeof data[0][k] === 'number');
    const labels = data.map((d) => d[Object.keys(d).find((k) => typeof d[k] === 'string')]);
    chartInstance = new Chart(canvas, {
      type: '${chartType === 'donut' ? 'doughnut' : chartType === 'area' ? 'line' : chartType}',
      data: { labels, datasets: numKeys.map((k, i) => ({ label: k, data: data.map((d) => d[k]), backgroundColor: PALETTE[i % PALETTE.length] + 'CC', borderColor: PALETTE[i % PALETTE.length], borderWidth: 1, borderRadius: 4 })) },
      options: { responsive: true, maintainAspectRatio: false },
    });`;
    case 'echarts':
      return `    chartInstance = echarts.init(chartContainer);
    const strKey = Object.keys(data[0]).find((k) => typeof data[0][k] === 'string');
    const numKeys = Object.keys(data[0]).filter((k) => typeof data[0][k] === 'number');
    chartInstance.setOption({
      color: PALETTE, backgroundColor: 'transparent',
      xAxis: { type: 'category', data: data.map((d) => d[strKey]) },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1E293B' } } },
      series: numKeys.map((k) => ({ type: '${chartType === 'line' || chartType === 'area' ? 'line' : 'bar'}', name: k, data: data.map((d) => d[k]) })),
    });`;
    default:
      return `    // Initialize ${library} — see React tab for full implementation`;
  }
}
