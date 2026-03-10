/**
 * PRD §9.1 — Chart Code Template Registry
 * Generates self-contained React component code for each library × chartType.
 * Each template includes sample data as a default constant, palette at the top,
 * and all necessary imports.
 */

import type { Library, ChartType, PaletteName } from '@/types/template';
import { PALETTES } from '@/lib/palettes';

interface ChartCodeOpts {
  library: Library;
  chartType: ChartType;
  palette: PaletteName;
  config: Record<string, unknown>;
  componentName: string;
  dataKey: string;
  sampleDataInline: string;
}

/**
 * Generate React (JSX) code for a chart.
 * Returns a self-contained component string with imports, palette, sample data, and render.
 */
export function generateReactChartCode(opts: ChartCodeOpts): string {
  const paletteColors = PALETTES[opts.palette];
  const paletteStr = JSON.stringify(paletteColors);

  const generator = LIBRARY_GENERATORS[opts.library];
  if (!generator) {
    return fallbackTemplate(opts, paletteStr);
  }

  return generator(opts, paletteStr);
}

// ---- Library-specific generators ----

type LibraryGenerator = (opts: ChartCodeOpts, paletteStr: string) => string;

const LIBRARY_GENERATORS: Partial<Record<Library, LibraryGenerator>> = {
  recharts: generateRecharts,
  chartjs: generateChartjs,
  d3: generateD3,
  plotly: generatePlotly,
  nivo: generateNivo,
  echarts: generateEcharts,
  'lightweight-charts': generateLightweightCharts,
  g6: generateG6,
  cytoscape: generateCytoscape,
};

// ---- Recharts ----

function generateRecharts(opts: ChartCodeOpts, paletteStr: string): string {
  const { componentName, chartType, sampleDataInline } = opts;

  const imports = getRechartsImports(chartType);
  const chartJsx = getRechartsJsx(chartType);

  return `import { ${imports} } from 'recharts';

// 🎨 Replace with your color palette
const PALETTE = ${paletteStr};

// 📊 Replace with your data
const DATA = ${sampleDataInline};

export default function ${componentName}() {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
${chartJsx}
      </ResponsiveContainer>
    </div>
  );
}
`;
}

function getRechartsImports(chartType: ChartType): string {
  const base = 'ResponsiveContainer, Tooltip';
  switch (chartType) {
    case 'bar': case 'bar-horizontal': case 'bar-stacked':
      return `BarChart, Bar, XAxis, YAxis, CartesianGrid, ${base}`;
    case 'line':
      return `LineChart, Line, XAxis, YAxis, CartesianGrid, ${base}`;
    case 'area':
      return `AreaChart, Area, XAxis, YAxis, CartesianGrid, ${base}`;
    case 'pie': case 'donut':
      return `PieChart, Pie, Cell, Legend, ${base}`;
    case 'scatter':
      return `ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Cell, ${base}`;
    case 'radar':
      return `RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ${base}`;
    case 'radial':
      return `RadialBarChart, RadialBar, Cell, Legend, ${base}`;
    case 'treemap':
      return `Treemap, ${base}`;
    default:
      return `BarChart, Bar, XAxis, YAxis, CartesianGrid, ${base}`;
  }
}

function getRechartsJsx(chartType: ChartType): string {
  switch (chartType) {
    case 'bar': case 'bar-stacked':
      return `        <BarChart data={DATA} margin={{ top: 10, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={PALETTE[4] + '30'} />
          <XAxis dataKey={Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string')} tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8, color: '#E2E8F0' }} />
          {Object.keys(DATA[0]).filter((k) => typeof DATA[0][k] === 'number').map((key, i) => (
            <Bar key={key} dataKey={key} fill={PALETTE[i % PALETTE.length]} radius={[4, 4, 0, 0]}${chartType === 'bar-stacked' ? ' stackId="stack"' : ''} />
          ))}
        </BarChart>`;
    case 'bar-horizontal':
      return `        <BarChart data={DATA} layout="vertical" margin={{ top: 10, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={PALETTE[4] + '30'} />
          <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <YAxis dataKey={Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string')} type="category" tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8, color: '#E2E8F0' }} />
          {Object.keys(DATA[0]).filter((k) => typeof DATA[0][k] === 'number').map((key, i) => (
            <Bar key={key} dataKey={key} fill={PALETTE[i % PALETTE.length]} radius={[0, 4, 4, 0]} />
          ))}
        </BarChart>`;
    case 'line':
      return `        <LineChart data={DATA} margin={{ top: 10, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={PALETTE[4] + '30'} />
          <XAxis dataKey={Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string')} tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8, color: '#E2E8F0' }} />
          {Object.keys(DATA[0]).filter((k) => typeof DATA[0][k] === 'number').map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={PALETTE[i % PALETTE.length]} strokeWidth={2} dot={{ fill: PALETTE[i % PALETTE.length], r: 3 }} />
          ))}
        </LineChart>`;
    case 'area':
      return `        <AreaChart data={DATA} margin={{ top: 10, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={PALETTE[4] + '30'} />
          <XAxis dataKey={Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string')} tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8, color: '#E2E8F0' }} />
          {Object.keys(DATA[0]).filter((k) => typeof DATA[0][k] === 'number').map((key, i) => (
            <Area key={key} type="monotone" dataKey={key} stroke={PALETTE[i % PALETTE.length]} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.2} strokeWidth={2} />
          ))}
        </AreaChart>`;
    case 'pie': case 'donut':
      return `        <PieChart>
          <Pie data={DATA} cx="50%" cy="50%" innerRadius={${chartType === 'donut' ? 60 : 0}} outerRadius={120} dataKey={Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'number')} nameKey={Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string')} paddingAngle={2} stroke="none">
            {DATA.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8, color: '#E2E8F0' }} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
        </PieChart>`;
    case 'scatter':
      return `        <ScatterChart margin={{ top: 10, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={PALETTE[4] + '30'} />
          <XAxis dataKey="x" type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <YAxis dataKey="y" type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8, color: '#E2E8F0' }} />
          <Scatter data={DATA} fill={PALETTE[0]}>
            {DATA.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Scatter>
        </ScatterChart>`;
    case 'radar':
      return `        <RadarChart data={DATA} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#1E293B" />
          <PolarAngleAxis dataKey={Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string')} tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <PolarRadiusAxis tick={{ fill: '#64748B', fontSize: 10 }} />
          {Object.keys(DATA[0]).filter((k) => typeof DATA[0][k] === 'number').map((key, i) => (
            <Radar key={key} dataKey={key} stroke={PALETTE[i % PALETTE.length]} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.25} strokeWidth={2} />
          ))}
          <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8, color: '#E2E8F0' }} />
        </RadarChart>`;
    default:
      return `        <BarChart data={DATA}>
          <Bar dataKey="value" fill={PALETTE[0]} />
        </BarChart>`;
  }
}

// ---- Chart.js ----

function generateChartjs(opts: ChartCodeOpts, paletteStr: string): string {
  const { componentName, chartType, sampleDataInline } = opts;
  const cjsType = getChartjsType(chartType);
  const datasetCode = getChartjsDataset(chartType);

  return `import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// 🎨 Replace with your color palette
const PALETTE = ${paletteStr};

// 📊 Replace with your data
const DATA = ${sampleDataInline};

export default function ${componentName}() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();

    const labels = DATA.map((d) => d[Object.keys(d).find((k) => typeof d[k] === 'string')] ?? '');
${datasetCode}

    chartRef.current = new Chart(canvasRef.current, {
      type: '${cjsType}',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: { backgroundColor: '#0F172A', borderColor: '#1E293B', borderWidth: 1 },
          legend: { display: datasets.length > 1, labels: { color: '#94A3B8' } },
        },
        scales: ${cjsType === 'pie' || cjsType === 'doughnut' || cjsType === 'radar' ? 'undefined' : `{
          x: { grid: { color: '#1E293B40' }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: '#1E293B40' }, ticks: { color: '#94A3B8' } },
        }`},
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, []);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
`;
}

function getChartjsType(chartType: ChartType): string {
  switch (chartType) {
    case 'pie': return 'pie';
    case 'donut': return 'doughnut';
    case 'radar': return 'radar';
    case 'scatter': return 'scatter';
    case 'line': case 'area': return 'line';
    default: return 'bar';
  }
}

function getChartjsDataset(chartType: ChartType): string {
  if (chartType === 'pie' || chartType === 'donut') {
    return `    const numKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'number');
    const datasets = [{
      data: DATA.map((d) => d[numKey]),
      backgroundColor: DATA.map((_, i) => PALETTE[i % PALETTE.length] + 'CC'),
      borderColor: DATA.map((_, i) => PALETTE[i % PALETTE.length]),
      borderWidth: 2,
    }];`;
  }
  if (chartType === 'scatter') {
    return `    const datasets = [{
      data: DATA.map((d) => ({ x: d.x, y: d.y })),
      backgroundColor: DATA.map((_, i) => PALETTE[i % PALETTE.length] + 'CC'),
      pointRadius: 6,
    }];`;
  }
  return `    const numKeys = Object.keys(DATA[0]).filter((k) => typeof DATA[0][k] === 'number');
    const datasets = numKeys.map((key, i) => ({
      label: key,
      data: DATA.map((d) => d[key]),
      backgroundColor: PALETTE[i % PALETTE.length] + 'CC',
      borderColor: PALETTE[i % PALETTE.length],
      borderWidth: ${chartType === 'area' ? '2, fill: true, tension: 0.4' : '1, borderRadius: 4'},
    }));`;
}

// ---- D3 ----

function generateD3(opts: ChartCodeOpts, paletteStr: string): string {
  const { componentName, chartType, sampleDataInline } = opts;

  return `import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// 🎨 Replace with your color palette
const PALETTE = ${paletteStr};

// 📊 Replace with your data
const DATA = ${sampleDataInline};

export default function ${componentName}() {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 35, left: 45 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    svg.attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', \`translate(\${margin.left},\${margin.top})\`);

${getD3ChartCode(chartType)}

    // Axes
    g.selectAll('.tick text').attr('fill', '#94A3B8').attr('font-size', 11);
  }, []);

  return <svg ref={svgRef} />;
}
`;
}

function getD3ChartCode(chartType: ChartType): string {
  switch (chartType) {
    case 'bar':
      return `    const strKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string');
    const numKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'number');

    const x = d3.scaleBand().domain(DATA.map((d) => d[strKey])).range([0, w]).padding(0.3);
    const y = d3.scaleLinear().domain([0, d3.max(DATA, (d) => d[numKey])]).nice().range([h, 0]);

    g.selectAll('.bar').data(DATA).enter().append('rect')
      .attr('x', (d) => x(d[strKey])).attr('y', (d) => y(d[numKey]))
      .attr('width', x.bandwidth()).attr('height', (d) => h - y(d[numKey]))
      .attr('rx', 4).attr('fill', (_, i) => PALETTE[i % PALETTE.length]);

    g.append('g').attr('transform', \`translate(0,\${h})\`).call(d3.axisBottom(x).tickSize(0));
    g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(0));`;
    case 'line':
      return `    const strKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string');
    const numKeys = Object.keys(DATA[0]).filter((k) => typeof DATA[0][k] === 'number');

    const x = d3.scalePoint().domain(DATA.map((d) => d[strKey])).range([0, w]).padding(0.5);
    const allVals = numKeys.flatMap((k) => DATA.map((d) => d[k]));
    const y = d3.scaleLinear().domain([0, d3.max(allVals)]).nice().range([h, 0]);

    numKeys.forEach((key, i) => {
      const line = d3.line().x((d) => x(d[strKey])).y((d) => y(d[key])).curve(d3.curveMonotoneX);
      g.append('path').datum(DATA).attr('d', line).attr('fill', 'none')
        .attr('stroke', PALETTE[i % PALETTE.length]).attr('stroke-width', 2.5);
      g.selectAll(\`.dot-\${i}\`).data(DATA).enter().append('circle')
        .attr('cx', (d) => x(d[strKey])).attr('cy', (d) => y(d[key]))
        .attr('r', 3.5).attr('fill', PALETTE[i % PALETTE.length]);
    });

    g.append('g').attr('transform', \`translate(0,\${h})\`).call(d3.axisBottom(x).tickSize(0));
    g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(0));`;
    case 'area':
      return `    const strKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string');
    const numKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'number');

    const x = d3.scalePoint().domain(DATA.map((d) => d[strKey])).range([0, w]).padding(0.5);
    const y = d3.scaleLinear().domain([0, d3.max(DATA, (d) => d[numKey])]).nice().range([h, 0]);

    const area = d3.area().x((d) => x(d[strKey])).y0(h).y1((d) => y(d[numKey])).curve(d3.curveMonotoneX);
    const line = d3.line().x((d) => x(d[strKey])).y((d) => y(d[numKey])).curve(d3.curveMonotoneX);

    g.append('path').datum(DATA).attr('d', area).attr('fill', PALETTE[0]).attr('fill-opacity', 0.2);
    g.append('path').datum(DATA).attr('d', line).attr('fill', 'none').attr('stroke', PALETTE[0]).attr('stroke-width', 2);

    g.append('g').attr('transform', \`translate(0,\${h})\`).call(d3.axisBottom(x).tickSize(0));
    g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(0));`;
    case 'pie': case 'donut':
      return `    const numKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'number');
    const labelKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string');
    const radius = Math.min(w, h) / 2;

    const pieG = svg.append('g').attr('transform', \`translate(\${w/2 + margin.left},\${h/2 + margin.top})\`);
    const pie = d3.pie().value((d) => d[numKey]).sort(null).padAngle(0.02);
    const arc = d3.arc().innerRadius(${chartType === 'donut' ? 'radius * 0.6' : '0'}).outerRadius(radius).cornerRadius(3);

    pieG.selectAll('.slice').data(pie(DATA)).enter().append('path')
      .attr('d', arc).attr('fill', (_, i) => PALETTE[i % PALETTE.length]).attr('stroke', '#0F172A').attr('stroke-width', 2);`;
    case 'funnel':
      return `    const numKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'number');
    const labelKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string');
    const maxVal = d3.max(DATA, (d) => d[numKey]);
    const segH = h / DATA.length;

    DATA.forEach((d, i) => {
      const ratio = d[numKey] / maxVal;
      const segW = w * ratio;
      const xPos = (w - segW) / 2;
      g.append('rect').attr('x', xPos).attr('y', i * segH)
        .attr('width', segW).attr('height', segH - 4).attr('rx', 4)
        .attr('fill', PALETTE[i % PALETTE.length]);
      g.append('text').attr('x', w / 2).attr('y', i * segH + segH / 2)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('fill', '#F1F5F9').attr('font-size', 11)
        .text(\`\${d[labelKey]} — \${d[numKey].toLocaleString()}\`);
    });`;
    default:
      return `    // ${chartType} — customize D3 rendering here
    g.append('text').attr('x', w/2).attr('y', h/2)
      .attr('text-anchor', 'middle').attr('fill', '#94A3B8').attr('font-size', 14)
      .text('${chartType} chart');`;
  }
}

// ---- Plotly ----

function generatePlotly(opts: ChartCodeOpts, paletteStr: string): string {
  const { componentName, chartType, sampleDataInline } = opts;
  const traceCode = getPlotlyTrace(chartType);

  return `import { useRef, useEffect } from 'react';
import Plotly from 'plotly.js-dist-min';

// 🎨 Replace with your color palette
const PALETTE = ${paletteStr};

// 📊 Replace with your data
const DATA = ${sampleDataInline};

export default function ${componentName}() {
  const plotRef = useRef(null);

  useEffect(() => {
    if (!plotRef.current) return;

${traceCode}

    const layout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: '#94A3B8', family: 'DM Sans, system-ui, sans-serif', size: 11 },
      margin: { t: 30, r: 20, b: 40, l: 50 },
      xaxis: { gridcolor: '#1E293B', linecolor: '#1E293B' },
      yaxis: { gridcolor: '#1E293B', linecolor: '#1E293B' },
      showlegend: false,
    };

    Plotly.newPlot(plotRef.current, traces, layout, { responsive: true, displayModeBar: false });
    return () => Plotly.purge(plotRef.current);
  }, []);

  return <div ref={plotRef} style={{ width: '100%', height: 400 }} />;
}
`;
}

function getPlotlyTrace(chartType: ChartType): string {
  switch (chartType) {
    case 'scatter':
      return `    const traces = [{
      x: DATA.map((d) => d.x),
      y: DATA.map((d) => d.y),
      mode: 'markers',
      marker: { color: DATA.map((_, i) => PALETTE[i % PALETTE.length]), size: 12, opacity: 0.8 },
      type: 'scatter',
    }];`;
    case 'bar':
      return `    const strKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string');
    const numKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'number');
    const traces = [{
      x: DATA.map((d) => d[strKey]),
      y: DATA.map((d) => d[numKey]),
      type: 'bar',
      marker: { color: DATA.map((_, i) => PALETTE[i % PALETTE.length]) },
    }];`;
    case 'line':
      return `    const strKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string');
    const numKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'number');
    const traces = [{
      x: DATA.map((d) => d[strKey]),
      y: DATA.map((d) => d[numKey]),
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: PALETTE[0], width: 2.5 },
      marker: { color: PALETTE[0], size: 6 },
    }];`;
    default:
      return `    const strKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string');
    const numKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'number');
    const traces = [{
      x: DATA.map((d) => d[strKey]),
      y: DATA.map((d) => d[numKey]),
      type: 'bar',
      marker: { color: DATA.map((_, i) => PALETTE[i % PALETTE.length]) },
    }];`;
  }
}

// ---- Nivo ----

function generateNivo(opts: ChartCodeOpts, paletteStr: string): string {
  const { componentName, chartType, sampleDataInline } = opts;
  const { nivoImport, nivoComponent } = getNivoComponent(chartType);

  return `import { ${nivoImport} } from '${getNivoPackage(chartType)}';

// 🎨 Replace with your color palette
const PALETTE = ${paletteStr};

// 📊 Replace with your data
const DATA = ${sampleDataInline};

export default function ${componentName}() {
  return (
    <div style={{ width: '100%', height: 400 }}>
${nivoComponent}
    </div>
  );
}
`;
}

function getNivoPackage(chartType: ChartType): string {
  switch (chartType) {
    case 'bar': case 'bar-horizontal': case 'bar-stacked': return '@nivo/bar';
    case 'line': case 'area': return '@nivo/line';
    case 'pie': case 'donut': return '@nivo/pie';
    case 'radar': return '@nivo/radar';
    case 'heatmap': return '@nivo/heatmap';
    default: return '@nivo/bar';
  }
}

function getNivoComponent(chartType: ChartType): { nivoImport: string; nivoComponent: string } {
  switch (chartType) {
    case 'bar': case 'bar-horizontal': case 'bar-stacked':
      return {
        nivoImport: 'ResponsiveBar',
        nivoComponent: `      <ResponsiveBar
        data={DATA}
        keys={Object.keys(DATA[0]).filter((k) => typeof DATA[0][k] === 'number')}
        indexBy={Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string')}
        margin={{ top: 10, right: 10, bottom: 40, left: 50 }}
        padding={0.3}
        colors={PALETTE}
        borderRadius={4}
        theme={{ axis: { ticks: { text: { fill: '#94A3B8', fontSize: 11 } } }, grid: { line: { stroke: '#1E293B' } }, tooltip: { container: { background: '#0F172A', color: '#E2E8F0', borderRadius: 8 } } }}
        ${chartType === 'bar-horizontal' ? 'layout="horizontal"' : ''}
        ${chartType === 'bar-stacked' ? 'groupMode="stacked"' : ''}
      />`,
      };
    case 'radar':
      return {
        nivoImport: 'ResponsiveRadar',
        nivoComponent: `      <ResponsiveRadar
        data={DATA}
        keys={Object.keys(DATA[0]).filter((k) => typeof DATA[0][k] === 'number')}
        indexBy={Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string')}
        margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
        borderColor={{ from: 'color' }}
        gridLabelOffset={20}
        dotSize={6}
        colors={PALETTE}
        fillOpacity={0.25}
        theme={{ axis: { ticks: { text: { fill: '#94A3B8', fontSize: 11 } } }, grid: { line: { stroke: '#1E293B' } } }}
      />`,
      };
    case 'heatmap':
      return {
        nivoImport: 'ResponsiveHeatMap',
        nivoComponent: `      <ResponsiveHeatMap
        data={DATA}
        margin={{ top: 40, right: 10, bottom: 40, left: 60 }}
        colors={{ type: 'sequential', scheme: 'blues' }}
        theme={{ axis: { ticks: { text: { fill: '#94A3B8', fontSize: 10 } } } }}
      />`,
      };
    default:
      return {
        nivoImport: 'ResponsiveBar',
        nivoComponent: `      <ResponsiveBar data={DATA} colors={PALETTE} />`,
      };
  }
}

// ---- ECharts ----

function generateEcharts(opts: ChartCodeOpts, paletteStr: string): string {
  const { componentName, chartType, sampleDataInline } = opts;

  return `import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

// 🎨 Replace with your color palette
const PALETTE = ${paletteStr};

// 📊 Replace with your data
const DATA = ${sampleDataInline};

export default function ${componentName}() {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current, null, { renderer: 'canvas' });

    const strKey = Object.keys(DATA[0]).find((k) => typeof DATA[0][k] === 'string');
    const numKeys = Object.keys(DATA[0]).filter((k) => typeof DATA[0][k] === 'number');

    chart.setOption({
      color: PALETTE,
      backgroundColor: 'transparent',
      textStyle: { color: '#94A3B8', fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 11 },
      tooltip: { trigger: '${chartType === 'pie' || chartType === 'donut' ? 'item' : 'axis'}', backgroundColor: '#0F172A', borderColor: '#1E293B', textStyle: { color: '#E2E8F0' } },
      ${chartType === 'pie' || chartType === 'donut' ? '' : `xAxis: { type: 'category', data: DATA.map((d) => d[strKey]), axisLine: { lineStyle: { color: '#1E293B' } } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1E293B' } } },`}
      series: ${getEchartsSeries(chartType)},
    });

    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: 400 }} />;
}
`;
}

function getEchartsSeries(chartType: ChartType): string {
  switch (chartType) {
    case 'pie': case 'donut':
      return `[{
        type: 'pie',
        radius: ${chartType === 'donut' ? "['40%', '70%']" : "'70%'"},
        data: DATA.map((d, i) => ({ value: d[numKeys[0]], name: d[strKey], itemStyle: { color: PALETTE[i % PALETTE.length] } })),
      }]`;
    default:
      return `numKeys.map((key, i) => ({
        type: '${chartType === 'line' ? 'line' : chartType === 'area' ? 'line' : 'bar'}',
        name: key,
        data: DATA.map((d) => d[key]),
        ${chartType === 'area' ? 'areaStyle: { opacity: 0.2 },' : ''}
        ${chartType === 'bar' ? 'barWidth: 32, itemStyle: { borderRadius: [4, 4, 0, 0] },' : ''}
        smooth: ${chartType === 'line' || chartType === 'area'},
      }))`;
  }
}

// ---- Lightweight Charts ----

function generateLightweightCharts(opts: ChartCodeOpts, paletteStr: string): string {
  const { componentName, sampleDataInline } = opts;

  return `import { useRef, useEffect } from 'react';
import { createChart } from 'lightweight-charts';

// 🎨 Replace with your color palette
const PALETTE = ${paletteStr};

// 📊 Replace with your data
const DATA = ${sampleDataInline};

export default function ${componentName}() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: { background: { color: 'transparent' }, textColor: '#94A3B8' },
      grid: { vertLines: { color: '#1E293B' }, horzLines: { color: '#1E293B' } },
    });

    const series = chart.addCandlestickSeries({
      upColor: PALETTE[2] ?? '#4ADE80',
      downColor: PALETTE[0] ?? '#EF4444',
      borderUpColor: PALETTE[2] ?? '#4ADE80',
      borderDownColor: PALETTE[0] ?? '#EF4444',
      wickUpColor: PALETTE[2] ?? '#4ADE80',
      wickDownColor: PALETTE[0] ?? '#EF4444',
    });

    series.setData(DATA.map((d) => ({
      time: d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })));

    chart.timeScale().fitContent();

    const onResize = () => chart.applyOptions({ width: containerRef.current.clientWidth });
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.remove(); };
  }, []);

  return <div ref={containerRef} style={{ width: '100%' }} />;
}
`;
}

// ---- Graph Libraries (G6, Cytoscape) ----

function generateG6(opts: ChartCodeOpts, paletteStr: string): string {
  const { componentName, sampleDataInline } = opts;

  return `import { useRef, useEffect } from 'react';
import { Graph } from '@antv/g6';

// 🎨 Replace with your color palette
const PALETTE = ${paletteStr};

// 📊 Replace with your data (nodes + edges)
const DATA = ${sampleDataInline};

export default function ${componentName}() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: 400,
      data: {
        nodes: DATA.nodes.map((n, i) => ({
          id: n.id,
          style: { fill: PALETTE[i % PALETTE.length], stroke: PALETTE[i % PALETTE.length] + '80', lineWidth: 2, r: 20 },
          label: n.label,
        })),
        edges: DATA.edges.map((e) => ({
          source: e.source,
          target: e.target,
          style: { stroke: '#475569', lineWidth: 1.5 },
        })),
      },
      layout: { type: 'force', preventOverlap: true },
      modes: { default: ['drag-node', 'zoom-canvas', 'drag-canvas'] },
    });

    graph.render();
    return () => graph.destroy();
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: 400 }} />;
}
`;
}

function generateCytoscape(opts: ChartCodeOpts, paletteStr: string): string {
  const { componentName, sampleDataInline } = opts;

  return `import { useRef, useEffect } from 'react';
import cytoscape from 'cytoscape';

// 🎨 Replace with your color palette
const PALETTE = ${paletteStr};

// 📊 Replace with your data (nodes + edges)
const DATA = ${sampleDataInline};

export default function ${componentName}() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...DATA.nodes.map((n, i) => ({
          data: { id: n.id, label: n.label ?? n.id },
          style: { 'background-color': PALETTE[i % PALETTE.length] },
        })),
        ...DATA.edges.map((e) => ({
          data: { source: e.source, target: e.target, label: e.label ?? '' },
        })),
      ],
      style: [
        { selector: 'node', style: { label: 'data(label)', color: '#F1F5F9', 'font-size': '11px', 'text-valign': 'center', width: 40, height: 40 } },
        { selector: 'edge', style: { 'line-color': '#475569', 'target-arrow-color': '#475569', 'target-arrow-shape': 'triangle', width: 1.5, 'curve-style': 'bezier' } },
      ],
      layout: { name: 'cose', animate: false },
    });

    return () => cy.destroy();
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: 400 }} />;
}
`;
}

// ---- Fallback ----

function fallbackTemplate(opts: ChartCodeOpts, paletteStr: string): string {
  return `// 🎨 Replace with your color palette
const PALETTE = ${paletteStr};

// 📊 Replace with your data
const DATA = ${opts.sampleDataInline};

export default function ${opts.componentName}() {
  return (
    <div style={{ width: '100%', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
      <p>${opts.chartType} chart (${opts.library}) — customize this template</p>
    </div>
  );
}
`;
}
