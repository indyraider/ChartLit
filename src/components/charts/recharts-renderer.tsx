'use client';

/**
 * Recharts renderer — covers bar, line, area, pie/donut, scatter, radar, radial, treemap.
 * PRD §6.1: Recharts ^2.12 — declarative React components, composable, great defaults.
 */

import type { ChartRendererProps } from '@/lib/chart-loader';
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar,
  Treemap,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export default function RechartsRenderer({
  chartType,
  data,
  palette,
  width,
  height,
  config,
}: ChartRendererProps) {
  const commonCartesian = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke={palette[4] + '30'} />
      <XAxis
        dataKey={getXKey(data)}
        tick={{ fill: '#94A3B8', fontSize: 11 }}
        axisLine={{ stroke: '#1E293B' }}
        tickLine={false}
      />
      <YAxis
        tick={{ fill: '#94A3B8', fontSize: 11 }}
        axisLine={{ stroke: '#1E293B' }}
        tickLine={false}
      />
      <Tooltip
        contentStyle={{
          background: '#0F172A',
          border: '1px solid #1E293B',
          borderRadius: 8,
          fontSize: 12,
          color: '#E2E8F0',
        }}
      />
    </>
  );

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
      case 'bar-horizontal':
      case 'bar-stacked': {
        const valueKeys = getValueKeys(data);
        const isHorizontal = chartType === 'bar-horizontal';
        const barRadius = config.radius as [number, number, number, number] | undefined;
        return (
          <BarChart
            data={data}
            layout={isHorizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 10, right: 10, bottom: 5, left: 10 }}
          >
            {commonCartesian}
            {valueKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={palette[i % palette.length]}
                radius={barRadius ?? [4, 4, 0, 0]}
                barSize={config.barSize as number | undefined}
                stackId={chartType === 'bar-stacked' ? 'stack' : undefined}
              />
            ))}
          </BarChart>
        );
      }

      case 'line': {
        const valueKeys = getValueKeys(data);
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: 10 }}>
            {commonCartesian}
            {valueKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={palette[i % palette.length]}
                strokeWidth={(config.strokeWidth as number) ?? 2}
                dot={config.dot !== false ? { fill: palette[i % palette.length], r: 3 } : false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        );
      }

      case 'area': {
        const valueKeys = getValueKeys(data);
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: 10 }}>
            {commonCartesian}
            {valueKeys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={palette[i % palette.length]}
                fill={palette[i % palette.length]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );
      }

      case 'pie':
      case 'donut': {
        const valueKey = getValueKeys(data)[0] ?? 'value';
        const isDonut = chartType === 'donut';
        const cutoutStr = config.cutout as string | undefined;
        const innerRadius = isDonut
          ? cutoutStr ? parseInt(cutoutStr) : 60
          : 0;
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={Math.min(width, height) / 2 - 30}
              dataKey={valueKey}
              nameKey={getXKey(data)}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: 8,
                fontSize: 12,
                color: '#E2E8F0',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#94A3B8' }}
            />
          </PieChart>
        );
      }

      case 'scatter': {
        const xKey = Object.keys(data[0] ?? {}).find((k) => k === 'x') ?? Object.keys(data[0] ?? {})[0];
        const yKey = Object.keys(data[0] ?? {}).find((k) => k === 'y') ?? Object.keys(data[0] ?? {})[1];
        return (
          <ScatterChart margin={{ top: 10, right: 10, bottom: 5, left: 10 }}>
            {commonCartesian}
            <Scatter data={data} fill={palette[0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
            </Scatter>
            <XAxis dataKey={xKey} type="number" name={xKey} tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <YAxis dataKey={yKey} type="number" name={yKey} tick={{ fill: '#94A3B8', fontSize: 11 }} />
          </ScatterChart>
        );
      }

      case 'radar': {
        const valueKeys = getValueKeys(data);
        const angleKey = getXKey(data);
        return (
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#1E293B" />
            <PolarAngleAxis dataKey={angleKey} tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <PolarRadiusAxis tick={{ fill: '#64748B', fontSize: 10 }} />
            {valueKeys.map((key, i) => (
              <Radar
                key={key}
                dataKey={key}
                stroke={palette[i % palette.length]}
                fill={palette[i % palette.length]}
                fillOpacity={0.25}
                strokeWidth={2}
              />
            ))}
            <Tooltip
              contentStyle={{
                background: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: 8,
                fontSize: 12,
                color: '#E2E8F0',
              }}
            />
          </RadarChart>
        );
      }

      case 'radial': {
        return (
          <RadialBarChart
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="20%"
            outerRadius="90%"
            startAngle={180}
            endAngle={-180}
          >
            <RadialBar
              dataKey={getValueKeys(data)[0] ?? 'value'}
              background={{ fill: '#1E293B' }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
            </RadialBar>
            <Tooltip
              contentStyle={{
                background: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: 8,
                fontSize: 12,
                color: '#E2E8F0',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#94A3B8' }}
            />
          </RadialBarChart>
        );
      }

      case 'treemap': {
        const valueKey = getValueKeys(data)[0] ?? 'value';
        return (
          <Treemap
            data={data}
            dataKey={valueKey}
            nameKey={getXKey(data)}
            aspectRatio={4 / 3}
            stroke="#0F172A"
            content={({ x, y, width: w, height: h, name, index }) => (
              <g>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={palette[(index ?? 0) % palette.length]}
                  rx={4}
                />
                {w > 40 && h > 20 && (
                  <text
                    x={x + w / 2}
                    y={y + h / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#F1F5F9"
                    fontSize={11}
                  >
                    {String(name)}
                  </text>
                )}
              </g>
            )}
          />
        );
      }

      default:
        return (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-xs text-text-dim">
              Recharts: {chartType} not yet implemented
            </p>
          </div>
        );
    }
  };

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

// --- Helpers ---

/** Get the first string-type key as the x-axis / category key */
function getXKey(data: Record<string, unknown>[]): string {
  if (!data[0]) return 'name';
  return (
    Object.entries(data[0]).find(
      ([, v]) => typeof v === 'string'
    )?.[0] ?? Object.keys(data[0])[0]
  );
}

/** Get all numeric keys (excluding the x-axis key) as value series */
function getValueKeys(data: Record<string, unknown>[]): string[] {
  if (!data[0]) return ['value'];
  const xKey = getXKey(data);
  return Object.entries(data[0])
    .filter(([k, v]) => k !== xKey && typeof v === 'number')
    .map(([k]) => k);
}
