'use client';

/**
 * Chart.js renderer — covers bar, line, area, pie/donut, scatter, radar, gauge.
 * PRD §6.1: Chart.js ^4.4 — canvas-based, performant, rich animation API.
 */

import { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from 'chart.js';
import type { ChartRendererProps } from '@/lib/chart-loader';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend
);

ChartJS.defaults.color = '#94A3B8';
ChartJS.defaults.borderColor = '#1E293B';
ChartJS.defaults.font.family = 'DM Sans, system-ui, sans-serif';
ChartJS.defaults.font.size = 11;

export default function ChartjsRenderer({
  chartType, data, palette, width, height, config,
}: ChartRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();

    const chartConfig = buildConfig(chartType, data, palette, config);
    if (!chartConfig) return;

    chartRef.current = new ChartJS(canvasRef.current, chartConfig);
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, [chartType, data, palette, config]);

  return (
    <div style={{ width, height }} className="flex items-center justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
}

function buildConfig(
  chartType: string, data: Record<string, unknown>[],
  palette: string[], config: Record<string, unknown>
): ChartConfiguration | null {
  const labels = data.map((d) => String(xVal(d)));
  const vKeys = numKeys(data);

  const tooltip = {
    backgroundColor: '#0F172A', borderColor: '#1E293B', borderWidth: 1,
    titleColor: '#F1F5F9', bodyColor: '#E2E8F0', cornerRadius: 8,
  };
  const gridColor = '#1E293B40';

  switch (chartType) {
    case 'bar': case 'bar-horizontal': case 'bar-stacked':
      return {
        type: 'bar',
        data: {
          labels,
          datasets: vKeys.map((k, i) => ({
            label: k, data: data.map((d) => Number(d[k])),
            backgroundColor: palette[i % palette.length] + 'CC',
            borderColor: palette[i % palette.length], borderWidth: 1, borderRadius: 4,
          })),
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          indexAxis: chartType === 'bar-horizontal' ? 'y' : 'x',
          scales: {
            x: { stacked: chartType === 'bar-stacked', grid: { color: gridColor } },
            y: { stacked: chartType === 'bar-stacked', grid: { color: gridColor } },
          },
          plugins: { tooltip, legend: { display: vKeys.length > 1, labels: { color: '#94A3B8' } } },
        },
      };

    case 'line':
      return {
        type: 'line',
        data: {
          labels,
          datasets: vKeys.map((k, i) => ({
            label: k, data: data.map((d) => Number(d[k])),
            borderColor: palette[i % palette.length],
            backgroundColor: palette[i % palette.length] + '20',
            borderWidth: (config.strokeWidth as number) ?? 2,
            pointRadius: config.dot === false ? 0 : 3,
            pointBackgroundColor: palette[i % palette.length], tension: 0.4,
          })),
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { x: { grid: { color: gridColor } }, y: { grid: { color: gridColor } } },
          plugins: { tooltip, legend: { display: vKeys.length > 1, labels: { color: '#94A3B8' } } },
        },
      };

    case 'area':
      return {
        type: 'line',
        data: {
          labels,
          datasets: vKeys.map((k, i) => ({
            label: k, data: data.map((d) => Number(d[k])),
            borderColor: palette[i % palette.length],
            backgroundColor: palette[i % palette.length] + '30',
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0,
          })),
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { x: { grid: { color: gridColor } }, y: { grid: { color: gridColor } } },
          plugins: { tooltip, legend: { display: vKeys.length > 1, labels: { color: '#94A3B8' } } },
        },
      };

    case 'pie': case 'donut': {
      const vk = vKeys[0] ?? 'value';
      return {
        type: chartType === 'donut' ? 'doughnut' : 'pie',
        data: {
          labels,
          datasets: [{
            data: data.map((d) => Number(d[vk])),
            backgroundColor: data.map((_, i) => palette[i % palette.length] + 'CC'),
            borderColor: data.map((_, i) => palette[i % palette.length]), borderWidth: 2,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          cutout: (config.cutout as string) ?? (chartType === 'donut' ? '65%' : undefined),
          plugins: { tooltip, legend: { display: true, position: 'bottom', labels: { color: '#94A3B8' } } },
        },
      } as ChartConfiguration;
    }

    case 'scatter': {
      const xk = Object.keys(data[0] ?? {}).find((k) => k === 'x') ?? Object.keys(data[0] ?? {})[0];
      const yk = Object.keys(data[0] ?? {}).find((k) => k === 'y') ?? Object.keys(data[0] ?? {})[1];
      return {
        type: 'scatter',
        data: {
          datasets: [{
            data: data.map((d) => ({ x: Number(d[xk]), y: Number(d[yk]) })),
            backgroundColor: data.map((_, i) => palette[i % palette.length] + 'CC'),
            pointRadius: (config.markerSize as number) ?? 6, borderWidth: 1,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { x: { grid: { color: gridColor } }, y: { grid: { color: gridColor } } },
          plugins: { tooltip, legend: { display: false } },
        },
      } as ChartConfiguration;
    }

    case 'radar': {
      const ak = xKey(data);
      return {
        type: 'radar',
        data: {
          labels: data.map((d) => String(d[ak])),
          datasets: vKeys.map((k, i) => ({
            label: k, data: data.map((d) => Number(d[k])),
            borderColor: palette[i % palette.length],
            backgroundColor: palette[i % palette.length] + '25',
            borderWidth: 2, pointBackgroundColor: palette[i % palette.length], pointRadius: 3,
          })),
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { r: { grid: { color: '#1E293B' }, angleLines: { color: '#1E293B' }, pointLabels: { color: '#94A3B8' }, ticks: { color: '#64748B', backdropColor: 'transparent' } } },
          plugins: { tooltip, legend: { display: vKeys.length > 1, labels: { color: '#94A3B8' } } },
        },
      } as ChartConfiguration;
    }

    case 'gauge': {
      const val = Number(data[0]?.value ?? 0);
      const max = Number(data[0]?.max ?? 100);
      return {
        type: 'doughnut',
        data: { datasets: [{ data: [val, max - val], backgroundColor: [palette[0], '#1E293B'], borderWidth: 0 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          rotation: -90, circumference: 180, cutout: '75%',
          plugins: { tooltip, legend: { display: false } },
        },
      } as ChartConfiguration;
    }

    default: return null;
  }
}

function xVal(d: Record<string, unknown>) {
  return d[xKey([d])];
}
function xKey(data: Record<string, unknown>[]): string {
  if (!data[0]) return 'name';
  return Object.entries(data[0]).find(([, v]) => typeof v === 'string')?.[0] ?? Object.keys(data[0])[0];
}
function numKeys(data: Record<string, unknown>[]): string[] {
  if (!data[0]) return ['value'];
  const xk = xKey(data);
  return Object.entries(data[0]).filter(([k, v]) => k !== xk && typeof v === 'number' && !k.startsWith('_')).map(([k]) => k);
}
