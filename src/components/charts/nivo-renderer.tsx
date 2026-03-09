'use client';

/**
 * Nivo renderer — covers radar, heatmap (and more in future).
 * PRD §6.1: Nivo ^0.87 — beautiful defaults, responsive, theming system.
 */

import { ResponsiveRadar } from '@nivo/radar';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import type { ChartRendererProps } from '@/lib/chart-loader';

export default function NivoRenderer({
  chartType, data, palette, width, height,
}: ChartRendererProps) {
  const theme = {
    text: { fill: '#94A3B8', fontSize: 11 },
    axis: {
      ticks: { text: { fill: '#94A3B8', fontSize: 10 } },
      legend: { text: { fill: '#94A3B8', fontSize: 12 } },
    },
    grid: { line: { stroke: '#1E293B' } },
    tooltip: {
      container: {
        background: '#0F172A', border: '1px solid #1E293B',
        borderRadius: 8, color: '#E2E8F0', fontSize: 12,
      },
    },
  };

  switch (chartType) {
    case 'radar': {
      const indexKey = strKey(data);
      const keys = numKeys(data);
      return (
        <div style={{ width, height }}>
          <ResponsiveRadar
            data={data as Record<string, string | number>[]}
            keys={keys}
            indexBy={indexKey}
            maxValue="auto"
            margin={{ top: 30, right: 40, bottom: 30, left: 40 }}
            borderColor={{ from: 'color' }}
            gridLabelOffset={16}
            dotSize={6}
            dotColor={{ theme: 'background' }}
            dotBorderWidth={2}
            dotBorderColor={{ from: 'color' }}
            colors={palette}
            fillOpacity={0.2}
            blendMode="normal"
            theme={theme}
            gridShape="circular"
          />
        </div>
      );
    }

    case 'heatmap': {
      const keys = Object.keys(data[0] ?? {});
      const rowKey = keys[0] ?? 'day';
      const colKey = keys[1] ?? 'hour';
      const valKey = keys[2] ?? 'value';

      // Transform flat data into Nivo heatmap format: { id, data: [{ x, y }] }
      const rows = [...new Set(data.map((d) => String(d[rowKey])))];
      const nivoData = rows.map((row) => ({
        id: row,
        data: data
          .filter((d) => String(d[rowKey]) === row)
          .map((d) => ({ x: String(d[colKey]), y: Number(d[valKey]) })),
      }));

      return (
        <div style={{ width, height }}>
          <ResponsiveHeatMap
            data={nivoData}
            margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
            axisTop={null}
            axisBottom={{ tickSize: 0, tickPadding: 8 }}
            axisLeft={{ tickSize: 0, tickPadding: 8 }}
            colors={{
              type: 'sequential',
              scheme: 'blues',
            }}
            borderRadius={3}
            borderWidth={2}
            borderColor="#0F172A"
            theme={theme}
          />
        </div>
      );
    }

    default:
      return (
        <div style={{ width, height }} className="flex items-center justify-center">
          <p className="text-xs text-text-dim">Nivo: {chartType} not yet implemented</p>
        </div>
      );
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
