'use client';

/**
 * PRD §6.4 — ChartRenderer Abstraction
 * Takes TemplateMetadata + data + palette → renders the correct chart via dynamic import.
 * Wraps in Suspense (skeleton while loading) and ErrorBoundary (fallback on crash).
 */

import { Suspense, useMemo } from 'react';
import { getChartRenderer, isGraphType, type ChartRendererProps } from '@/lib/chart-loader';
import { PALETTES } from '@/lib/palettes';
import { SAMPLE_DATA, GRAPH_SAMPLE_DATA } from '@/lib/sample-data';
import type { TemplateMetadata, PaletteName } from '@/types/template';
import { ChartErrorBoundary } from './chart-error-boundary';
import { EffectWrapper } from '@/components/effects/effect-wrapper';

interface Props {
  template: TemplateMetadata;
  data?: Record<string, unknown>[] | null;
  palette?: PaletteName;
  width: number;
  height: number;
  interactive?: boolean;
}

function ChartSkeleton({ width, height }: { width: number; height: number }) {
  return (
    <div
      className="flex animate-pulse items-center justify-center rounded-lg bg-bg-inset"
      style={{ width, height }}
    >
      <div className="h-4 w-20 rounded bg-bg-input" />
    </div>
  );
}

export function ChartRenderer({
  template,
  data,
  palette,
  width,
  height,
  interactive = false,
}: Props) {
  const paletteKey = palette ?? template.palette;
  const paletteColors = PALETTES[paletteKey];

  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;

    // Use graph sample data for graph types
    if (isGraphType(template.chartType)) {
      const graphData = GRAPH_SAMPLE_DATA[template.dataKey];
      if (graphData) {
        // Flatten nodes/edges into a single array with a _type discriminator
        // Each renderer will handle this appropriately
        return graphData.nodes.map((n) => ({ ...n, _type: 'node' }));
      }
    }

    return SAMPLE_DATA[template.dataKey] ?? SAMPLE_DATA['monthly-revenue'];
  }, [data, template.chartType, template.dataKey]);

  const LazyChart = getChartRenderer(template.library);

  const rendererProps: ChartRendererProps = {
    config: template.config,
    data: chartData,
    palette: [...paletteColors],
    width,
    height,
    chartType: template.chartType,
    interactive,
  };

  return (
    <ChartErrorBoundary chartType={template.chartType}>
      <Suspense fallback={<ChartSkeleton width={width} height={height} />}>
        <EffectWrapper
          effect={template.effect}
          effectConfig={template.effectConfig}
          palette={[...paletteColors]}
          width={width}
          height={height}
        >
          <LazyChart {...rendererProps} />
        </EffectWrapper>
      </Suspense>
    </ChartErrorBoundary>
  );
}
