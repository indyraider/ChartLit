'use client';

/**
 * Lightweight Charts renderer — covers candlestick, line, area (financial).
 * PRD §6.1: Lightweight Charts v5 — financial charting, candlestick/OHLC.
 */

import { useRef, useEffect } from 'react';
import {
  createChart, type IChartApi, ColorType,
  CandlestickSeries, LineSeries, AreaSeries,
} from 'lightweight-charts';
import type { ChartRendererProps } from '@/lib/chart-loader';

export default function LightweightChartsRenderer({
  chartType, data, palette, width, height,
}: ChartRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current?.remove();

    const chart = createChart(containerRef.current, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94A3B8',
        fontFamily: 'DM Sans, system-ui, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1E293B40' },
        horzLines: { color: '#1E293B40' },
      },
      crosshair: {
        vertLine: { color: '#334155', labelBackgroundColor: '#0F172A' },
        horzLine: { color: '#334155', labelBackgroundColor: '#0F172A' },
      },
      timeScale: {
        borderColor: '#1E293B',
        timeVisible: false,
      },
      rightPriceScale: {
        borderColor: '#1E293B',
      },
    });

    chartRef.current = chart;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setData = (series: any, seriesData: any[]) => {
      series.setData(seriesData);
    };

    switch (chartType) {
      case 'candlestick': {
        const series = chart.addSeries(CandlestickSeries, {
          upColor: palette[0],
          downColor: palette[2] ?? '#F87171',
          borderUpColor: palette[0],
          borderDownColor: palette[2] ?? '#F87171',
          wickUpColor: palette[0],
          wickDownColor: palette[2] ?? '#F87171',
        });

        const candleData = data.map((d) => ({
          time: String(d.date ?? d.time ?? ''),
          open: Number(d.open),
          high: Number(d.high),
          low: Number(d.low),
          close: Number(d.close),
        }));

        setData(series, candleData);
        break;
      }

      case 'line': {
        const vKey = numKeys(data)[0] ?? 'value';
        const series = chart.addSeries(LineSeries, {
          color: palette[0],
          lineWidth: 2,
        });

        const lineData = data.map((d) => ({
          time: String(d.date ?? d.time ?? d.month ?? ''),
          value: Number(d[vKey]),
        }));

        setData(series, lineData);
        break;
      }

      case 'area': {
        const vKey = numKeys(data)[0] ?? 'value';
        const series = chart.addSeries(AreaSeries, {
          lineColor: palette[0],
          topColor: palette[0] + '50',
          bottomColor: palette[0] + '05',
          lineWidth: 2,
        });

        const areaData = data.map((d) => ({
          time: String(d.date ?? d.time ?? d.month ?? ''),
          value: Number(d[vKey]),
        }));

        setData(series, areaData);
        break;
      }
    }

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [chartType, data, palette, width, height]);

  return <div ref={containerRef} style={{ width, height }} />;
}

function numKeys(data: Record<string, unknown>[]): string[] {
  if (!data[0]) return ['value'];
  return Object.entries(data[0])
    .filter(([k, v]) => typeof v === 'number' && !k.startsWith('_') && !['open', 'high', 'low', 'close'].includes(k))
    .map(([k]) => k);
}
