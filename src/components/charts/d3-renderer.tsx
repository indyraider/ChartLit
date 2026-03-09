'use client';

/**
 * D3 renderer — covers bar, line, area, pie, funnel, waterfall, sankey, heatmap, treemap.
 * PRD §6.1: D3 ^7.9 — total control, SVG-native, unlimited customization.
 */

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { ChartRendererProps } from '@/lib/chart-loader';

export default function D3Renderer({
  chartType, data, palette, width, height,
}: ChartRendererProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 35, left: 45 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    switch (chartType) {
      case 'bar': renderBar(g, data, palette, w, h); break;
      case 'line': renderLine(g, data, palette, w, h); break;
      case 'area': renderArea(g, data, palette, w, h); break;
      case 'pie': case 'donut': renderPie(svg, data, palette, width, height, chartType === 'donut'); break;
      case 'funnel': renderFunnel(g, data, palette, w, h); break;
      case 'waterfall': renderWaterfall(g, data, palette, w, h); break;
      case 'heatmap': renderHeatmap(g, data, palette, w, h); break;
      default:
        g.append('text')
          .attr('x', w / 2).attr('y', h / 2)
          .attr('text-anchor', 'middle')
          .attr('fill', '#64748B').attr('font-size', 12)
          .text(`D3: ${chartType} coming soon`);
    }
  }, [chartType, data, palette, width, height]);

  return <svg ref={svgRef} />;
}

// --- Chart Implementations ---

function renderBar(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: Record<string, unknown>[], palette: string[], w: number, h: number
) {
  const xKey = strKey(data);
  const vKey = numKeys(data)[0] ?? 'value';

  const x = d3.scaleBand()
    .domain(data.map((d) => String(d[xKey])))
    .range([0, w]).padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => Number(d[vKey])) ?? 0])
    .nice().range([h, 0]);

  // Grid
  g.append('g').selectAll('line')
    .data(y.ticks(5)).enter().append('line')
    .attr('x1', 0).attr('x2', w)
    .attr('y1', (d) => y(d)).attr('y2', (d) => y(d))
    .attr('stroke', '#1E293B').attr('stroke-dasharray', '3,3');

  // Bars
  g.selectAll('.bar').data(data).enter().append('rect')
    .attr('x', (d) => x(String(d[xKey])) ?? 0)
    .attr('y', (d) => y(Number(d[vKey])))
    .attr('width', x.bandwidth())
    .attr('height', (d) => h - y(Number(d[vKey])))
    .attr('rx', 4)
    .attr('fill', (_, i) => palette[i % palette.length]);

  // Axes
  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).tickSize(0))
    .select('.domain').attr('stroke', '#1E293B');
  g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(0))
    .select('.domain').attr('stroke', '#1E293B');
  g.selectAll('.tick text').attr('fill', '#94A3B8').attr('font-size', 11);
}

function renderLine(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: Record<string, unknown>[], palette: string[], w: number, h: number
) {
  const xKey = strKey(data);
  const vKeys = numKeys(data);

  const x = d3.scalePoint()
    .domain(data.map((d) => String(d[xKey])))
    .range([0, w]).padding(0.5);

  const allVals = vKeys.flatMap((k) => data.map((d) => Number(d[k])));
  const y = d3.scaleLinear()
    .domain([0, d3.max(allVals) ?? 0]).nice().range([h, 0]);

  // Grid
  g.append('g').selectAll('line')
    .data(y.ticks(5)).enter().append('line')
    .attr('x1', 0).attr('x2', w)
    .attr('y1', (d) => y(d)).attr('y2', (d) => y(d))
    .attr('stroke', '#1E293B').attr('stroke-dasharray', '3,3');

  vKeys.forEach((vKey, i) => {
    const color = palette[i % palette.length];
    const line = d3.line<Record<string, unknown>>()
      .x((d) => x(String(d[xKey])) ?? 0)
      .y((d) => y(Number(d[vKey])))
      .curve(d3.curveMonotoneX);

    g.append('path').datum(data)
      .attr('d', line).attr('fill', 'none')
      .attr('stroke', color).attr('stroke-width', 2.5);

    // Dots
    g.selectAll(`.dot-${i}`).data(data).enter().append('circle')
      .attr('cx', (d) => x(String(d[xKey])) ?? 0)
      .attr('cy', (d) => y(Number(d[vKey])))
      .attr('r', 3.5).attr('fill', color);
  });

  // Axes
  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).tickSize(0))
    .select('.domain').attr('stroke', '#1E293B');
  g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(0))
    .select('.domain').attr('stroke', '#1E293B');
  g.selectAll('.tick text').attr('fill', '#94A3B8').attr('font-size', 11);
}

function renderArea(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: Record<string, unknown>[], palette: string[], w: number, h: number
) {
  const xKey = strKey(data);
  const vKeys = numKeys(data);

  const x = d3.scalePoint()
    .domain(data.map((d) => String(d[xKey])))
    .range([0, w]).padding(0.5);

  const allVals = vKeys.flatMap((k) => data.map((d) => Number(d[k])));
  const y = d3.scaleLinear()
    .domain([0, d3.max(allVals) ?? 0]).nice().range([h, 0]);

  vKeys.forEach((vKey, i) => {
    const color = palette[i % palette.length];

    const area = d3.area<Record<string, unknown>>()
      .x((d) => x(String(d[xKey])) ?? 0)
      .y0(h)
      .y1((d) => y(Number(d[vKey])))
      .curve(d3.curveMonotoneX);

    // Gradient
    const gradId = `grad-${i}`;
    const defs = g.append('defs');
    const grad = defs.append('linearGradient').attr('id', gradId)
      .attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.3);
    grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.02);

    g.append('path').datum(data)
      .attr('d', area).attr('fill', `url(#${gradId})`);

    const line = d3.line<Record<string, unknown>>()
      .x((d) => x(String(d[xKey])) ?? 0)
      .y((d) => y(Number(d[vKey])))
      .curve(d3.curveMonotoneX);

    g.append('path').datum(data)
      .attr('d', line).attr('fill', 'none')
      .attr('stroke', color).attr('stroke-width', 2);
  });

  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).tickSize(0))
    .select('.domain').attr('stroke', '#1E293B');
  g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(0))
    .select('.domain').attr('stroke', '#1E293B');
  g.selectAll('.tick text').attr('fill', '#94A3B8').attr('font-size', 11);
}

function renderPie(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  data: Record<string, unknown>[], palette: string[],
  width: number, height: number, isDonut: boolean
) {
  const vKey = numKeys(data)[0] ?? 'value';
  const labelKey = strKey(data);
  const radius = Math.min(width, height) / 2 - 20;

  const g = svg.append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  const pie = d3.pie<Record<string, unknown>>()
    .value((d) => Number(d[vKey]))
    .padAngle(0.02)
    .sort(null);

  const arc = d3.arc<d3.PieArcDatum<Record<string, unknown>>>()
    .innerRadius(isDonut ? radius * 0.6 : 0)
    .outerRadius(radius)
    .cornerRadius(3);

  g.selectAll('.slice').data(pie(data)).enter().append('path')
    .attr('d', arc)
    .attr('fill', (_, i) => palette[i % palette.length])
    .attr('stroke', '#0F172A').attr('stroke-width', 2);

  // Labels
  const labelArc = d3.arc<d3.PieArcDatum<Record<string, unknown>>>()
    .innerRadius(radius * 0.75)
    .outerRadius(radius * 0.75);

  g.selectAll('.label').data(pie(data)).enter().append('text')
    .attr('transform', (d) => `translate(${labelArc.centroid(d)})`)
    .attr('text-anchor', 'middle')
    .attr('fill', '#F1F5F9').attr('font-size', 10)
    .text((d) => String(d.data[labelKey]));
}

function renderFunnel(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: Record<string, unknown>[], palette: string[], w: number, h: number
) {
  const vKey = numKeys(data)[0] ?? 'value';
  const labelKey = strKey(data);
  const maxVal = d3.max(data, (d) => Number(d[vKey])) ?? 1;
  const segH = h / data.length;

  data.forEach((d, i) => {
    const ratio = Number(d[vKey]) / maxVal;
    const segW = w * ratio;
    const x = (w - segW) / 2;
    const y = i * segH;

    g.append('rect')
      .attr('x', x).attr('y', y)
      .attr('width', segW).attr('height', segH - 4)
      .attr('rx', 4)
      .attr('fill', palette[i % palette.length]);

    g.append('text')
      .attr('x', w / 2).attr('y', y + segH / 2)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('fill', '#F1F5F9').attr('font-size', 11).attr('font-weight', 600)
      .text(`${d[labelKey]} — ${Number(d[vKey]).toLocaleString()}`);
  });
}

function renderWaterfall(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: Record<string, unknown>[], palette: string[], w: number, h: number
) {
  const vKey = numKeys(data)[0] ?? 'value';
  const labelKey = strKey(data);

  // Compute running totals
  let running = 0;
  const bars = data.map((d) => {
    const val = Number(d[vKey]);
    const type = String(d.type ?? 'positive');
    const start = type === 'total' || type === 'subtotal' ? 0 : running;
    const end = type === 'total' || type === 'subtotal' ? val : running + val;
    running = end;
    return { label: String(d[labelKey]), start, end, val, type };
  });

  const allVals = bars.flatMap((b) => [b.start, b.end]);
  const minVal = Math.min(0, d3.min(allVals) ?? 0);
  const maxVal = d3.max(allVals) ?? 0;

  const x = d3.scaleBand()
    .domain(bars.map((b) => b.label))
    .range([0, w]).padding(0.3);

  const y = d3.scaleLinear()
    .domain([minVal, maxVal]).nice().range([h, 0]);

  bars.forEach((b, i) => {
    const top = y(Math.max(b.start, b.end));
    const bottom = y(Math.min(b.start, b.end));
    const color = b.type === 'total' || b.type === 'subtotal'
      ? palette[0]
      : b.val >= 0 ? palette[1] ?? '#4ADE80' : palette[2] ?? '#F87171';

    g.append('rect')
      .attr('x', x(b.label) ?? 0)
      .attr('y', top)
      .attr('width', x.bandwidth())
      .attr('height', Math.max(1, bottom - top))
      .attr('rx', 3)
      .attr('fill', color);
  });

  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).tickSize(0))
    .select('.domain').attr('stroke', '#1E293B');
  g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(0))
    .select('.domain').attr('stroke', '#1E293B');
  g.selectAll('.tick text').attr('fill', '#94A3B8').attr('font-size', 10);
}

function renderHeatmap(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: Record<string, unknown>[], palette: string[], w: number, h: number
) {
  const keys = Object.keys(data[0] ?? {});
  const xKey = keys[0] ?? 'day';
  const yKey = keys[1] ?? 'hour';
  const vKey = keys[2] ?? 'value';

  const xLabels = [...new Set(data.map((d) => String(d[xKey])))];
  const yLabels = [...new Set(data.map((d) => String(d[yKey])))];

  const x = d3.scaleBand().domain(xLabels).range([0, w]).padding(0.08);
  const y = d3.scaleBand().domain(yLabels).range([0, h]).padding(0.08);

  const vals = data.map((d) => Number(d[vKey]));
  const colorScale = d3.scaleLinear<string>()
    .domain([d3.min(vals) ?? 0, d3.max(vals) ?? 1])
    .range([palette[4] + '30', palette[0]]);

  g.selectAll('.cell').data(data).enter().append('rect')
    .attr('x', (d) => x(String(d[xKey])) ?? 0)
    .attr('y', (d) => y(String(d[yKey])) ?? 0)
    .attr('width', x.bandwidth())
    .attr('height', y.bandwidth())
    .attr('rx', 3)
    .attr('fill', (d) => colorScale(Number(d[vKey])));

  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).tickSize(0))
    .select('.domain').remove();
  g.append('g').call(d3.axisLeft(y).tickSize(0))
    .select('.domain').remove();
  g.selectAll('.tick text').attr('fill', '#94A3B8').attr('font-size', 10);
}

// --- Helpers ---

function strKey(data: Record<string, unknown>[]): string {
  if (!data[0]) return 'name';
  return Object.entries(data[0]).find(([, v]) => typeof v === 'string')?.[0] ?? Object.keys(data[0])[0];
}

function numKeys(data: Record<string, unknown>[]): string[] {
  if (!data[0]) return ['value'];
  const sk = strKey(data);
  return Object.entries(data[0])
    .filter(([k, v]) => k !== sk && typeof v === 'number' && !k.startsWith('_'))
    .map(([k]) => k);
}
