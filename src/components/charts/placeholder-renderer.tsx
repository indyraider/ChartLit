'use client';

/**
 * Placeholder chart renderer used as a stub during development.
 * Each library will get its own renderer that implements ChartRendererProps.
 */

import type { ChartRendererProps } from '@/lib/chart-loader';

export default function PlaceholderRenderer({
  chartType,
  width,
  height,
  palette,
}: ChartRendererProps) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-border-subtle bg-bg-inset"
      style={{ width, height }}
    >
      <div className="text-center">
        <div className="mb-2 flex justify-center gap-1">
          {palette.slice(0, 4).map((color, i) => (
            <div
              key={i}
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <p className="text-xs text-text-muted">{chartType}</p>
        <p className="text-[10px] text-text-dim">Renderer pending</p>
      </div>
    </div>
  );
}
