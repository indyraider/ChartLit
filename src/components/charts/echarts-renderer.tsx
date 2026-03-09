'use client';

/**
 * ECharts renderer — covers bar, line, pie, gauge, radar, and more.
 * PRD §6.1: ECharts ^5.5 — massive chart library, WebGL support.
 */

import { useRef, useEffect } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, GaugeChart, RadarChart } from 'echarts/charts';
import {
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, RadarComponent as RadarComp,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ChartRendererProps } from '@/lib/chart-loader';

echarts.use([
  BarChart, LineChart, PieChart, GaugeChart, RadarChart,
  GridComponent, TooltipComponent, LegendComponent, TitleComponent, RadarComp,
  CanvasRenderer,
]);

export default function EchartsRenderer({
  chartType, data, palette, width, height,
}: ChartRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current?.dispose();
    const chart = echarts.init(containerRef.current, undefined, {
      renderer: 'canvas', width, height,
    });
    chartRef.current = chart;

    const option = buildOption(chartType, data, palette);
    if (option) chart.setOption(option);

    return () => { chart.dispose(); chartRef.current = null; };
  }, [chartType, data, palette, width, height]);

  return <div ref={containerRef} style={{ width, height }} />;
}

function buildOption(
  chartType: string, data: Record<string, unknown>[], palette: string[]
): echarts.EChartsCoreOption | null {
  const xKey = strKey(data);
  const vKeys = numKeys(data);
  const labels = data.map((d) => String(d[xKey]));

  const baseGrid = { top: 30, right: 20, bottom: 35, left: 50, containLabel: false };
  const baseTooltip = {
    backgroundColor: '#0F172A', borderColor: '#1E293B',
    textStyle: { color: '#E2E8F0', fontSize: 12 },
  };

  switch (chartType) {
    case 'bar':
      return {
        color: palette, grid: baseGrid, tooltip: { ...baseTooltip, trigger: 'axis' },
        xAxis: { type: 'category', data: labels, axisLine: { lineStyle: { color: '#1E293B' } }, axisLabel: { color: '#94A3B8', fontSize: 11 } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1E293B', type: 'dashed' } }, axisLabel: { color: '#94A3B8', fontSize: 11 } },
        series: vKeys.map((k, i) => ({
          type: 'bar', name: k, data: data.map((d) => Number(d[k])),
          itemStyle: { color: palette[i % palette.length], borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 40,
        })),
      };

    case 'line':
      return {
        color: palette, grid: baseGrid, tooltip: { ...baseTooltip, trigger: 'axis' },
        xAxis: { type: 'category', data: labels, axisLine: { lineStyle: { color: '#1E293B' } }, axisLabel: { color: '#94A3B8', fontSize: 11 } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1E293B', type: 'dashed' } }, axisLabel: { color: '#94A3B8', fontSize: 11 } },
        series: vKeys.map((k, i) => ({
          type: 'line', name: k, data: data.map((d) => Number(d[k])),
          smooth: true, lineStyle: { width: 2.5 },
          itemStyle: { color: palette[i % palette.length] },
        })),
      };

    case 'pie': case 'donut': {
      const vk = vKeys[0] ?? 'value';
      return {
        color: palette, tooltip: baseTooltip,
        series: [{
          type: 'pie',
          radius: chartType === 'donut' ? ['55%', '80%'] : ['0%', '80%'],
          data: data.map((d, i) => ({
            name: String(d[xKey]), value: Number(d[vk]),
            itemStyle: { color: palette[i % palette.length] },
          })),
          label: { color: '#94A3B8', fontSize: 11 },
          itemStyle: { borderColor: '#0F172A', borderWidth: 2 },
        }],
      };
    }

    case 'gauge': {
      const val = Number(data[0]?.value ?? 0);
      const max = Number(data[0]?.max ?? 100);
      return {
        series: [{
          type: 'gauge', min: 0, max,
          progress: { show: true, width: 14, itemStyle: { color: palette[0] } },
          axisLine: { lineStyle: { width: 14, color: [[1, '#1E293B']] } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { color: '#64748B', fontSize: 10 },
          pointer: { show: false },
          title: { show: true, offsetCenter: [0, '70%'], color: '#94A3B8', fontSize: 12 },
          detail: {
            valueAnimation: true, offsetCenter: [0, '0%'],
            fontSize: 28, fontWeight: 700, color: '#F1F5F9',
            formatter: '{value}',
          },
          data: [{ value: val, name: String(data[0]?.label ?? 'Score') }],
        }],
      };
    }

    case 'radar': {
      const vk = vKeys[0] ?? 'value';
      return {
        color: palette, tooltip: baseTooltip,
        radar: {
          indicator: data.map((d) => ({
            name: String(d[xKey]),
            max: Math.max(...data.map((dd) => Number(dd[vk]))) * 1.2,
          })),
          axisName: { color: '#94A3B8', fontSize: 11 },
          splitLine: { lineStyle: { color: '#1E293B' } },
          splitArea: { show: false },
          axisLine: { lineStyle: { color: '#1E293B' } },
        },
        series: [{
          type: 'radar',
          data: [{
            value: data.map((d) => Number(d[vk])),
            areaStyle: { color: palette[0] + '30' },
            lineStyle: { color: palette[0], width: 2 },
            itemStyle: { color: palette[0] },
          }],
        }],
      };
    }

    default: return null;
  }
}

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
