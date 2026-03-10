/**
 * PRD §5.5.2 — PNG Export Pipeline
 * Rasterizes chart DOM node at 2× scale with dark background and baked-in effects.
 *
 * Strategy:
 *   - SVG-based libs (Recharts, D3, Nivo, Cytoscape, Sigma, vis-network):
 *     Use html-to-canvas approach via toPng from html-to-image
 *   - Canvas-based libs (Chart.js, ECharts, Three.js, G6, react-force-graph, Lightweight Charts):
 *     Same approach — html-to-image captures the canvas element
 *
 * We use html-to-image (toPng) which handles both SVG and Canvas elements uniformly.
 */

import type { SizePreset, CustomSize } from '@/store';
import { SIZE_PRESETS, type SizePresetConfig } from '@/lib/size-presets';

/**
 * Export a chart DOM element as a PNG file download.
 * @param element - The DOM element containing the chart
 * @param title - Chart title (used in filename)
 * @param sizePreset - Size preset key
 * @param customSize - Custom dimensions if sizePreset is 'custom'
 */
export async function exportChartAsPng(
  element: HTMLElement,
  title: string,
  sizePreset: SizePreset,
  customSize?: CustomSize,
): Promise<void> {
  // Dynamically import html-to-image (keeps it out of the main bundle)
  const { toPng } = await import('html-to-image');

  // Resolve target dimensions
  const dims = resolveExportDimensions(element, sizePreset, customSize);
  const scale = 2; // PRD §5.5.2: rasterized at 2× scale

  const dataUrl = await toPng(element, {
    width: dims.width,
    height: dims.height,
    pixelRatio: scale,
    backgroundColor: '#0F172A', // PRD §5.5.2: dark background
    style: {
      transform: `scale(${dims.width / element.clientWidth})`,
      transformOrigin: 'top left',
      width: `${element.clientWidth}px`,
      height: `${element.clientHeight}px`,
    },
  });

  // Trigger download
  const filename = sanitizeFilename(title, dims.width * scale, dims.height * scale);
  downloadDataUrl(dataUrl, filename);
}

/**
 * Resolve export dimensions from preset or custom size.
 */
function resolveExportDimensions(
  element: HTMLElement,
  sizePreset: SizePreset,
  customSize?: CustomSize,
): { width: number; height: number } {
  if (sizePreset === 'custom' && customSize) {
    return { width: customSize.width, height: customSize.height };
  }

  if (sizePreset === 'auto') {
    return { width: element.clientWidth, height: element.clientHeight };
  }

  const preset = SIZE_PRESETS[sizePreset as Exclude<SizePreset, 'custom'>] as SizePresetConfig | undefined;
  if (preset && preset.width > 0) {
    return { width: preset.width, height: preset.height };
  }

  return { width: element.clientWidth, height: element.clientHeight };
}

/**
 * Generate a sanitized filename for the export.
 */
function sanitizeFilename(title: string, width: number, height: number): string {
  const safe = title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
  return `${safe}-${width}x${height}.png`;
}

/**
 * Export a chart DOM element as a PNG Blob (for upload to Canva, etc.).
 */
export async function exportChartAsBlob(
  element: HTMLElement,
  sizePreset: SizePreset,
  customSize?: CustomSize,
): Promise<Blob> {
  const { toBlob } = await import('html-to-image');

  const dims = resolveExportDimensions(element, sizePreset, customSize);
  const scale = 2;

  const blob = await toBlob(element, {
    width: dims.width,
    height: dims.height,
    pixelRatio: scale,
    backgroundColor: '#0F172A',
    style: {
      transform: `scale(${dims.width / element.clientWidth})`,
      transformOrigin: 'top left',
      width: `${element.clientWidth}px`,
      height: `${element.clientHeight}px`,
    },
  });

  if (!blob) throw new Error('Failed to generate PNG blob');
  return blob;
}

/**
 * Trigger a file download from a data URL.
 */
function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
