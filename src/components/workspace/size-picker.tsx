'use client';

/**
 * PRD §5.5.1 — Size Picker
 * Scrollable preset pills with visual aspect ratio preview.
 * Custom dimension inputs enforce 100-8000px range.
 */

import { useState } from 'react';
import { useAppStore, type SizePreset } from '@/store';
import { SIZE_PRESETS, type SizePresetConfig } from '@/lib/size-presets';

const PRESET_KEYS = Object.keys(SIZE_PRESETS) as Exclude<SizePreset, 'custom'>[];

interface Props {
  chartId: string;
}

export function SizePicker({ chartId }: Props) {
  const { workspace, setChartSize, setChartCustomSize } = useAppStore();
  const currentSize = workspace.sizes[chartId] ?? 'auto';
  const customSize = workspace.customSizes[chartId] ?? { width: 1920, height: 1080 };
  const [showCustom, setShowCustom] = useState(currentSize === 'custom');

  const handlePresetClick = (preset: SizePreset) => {
    setChartSize(chartId, preset);
    setShowCustom(preset === 'custom');
  };

  const handleCustomChange = (dim: 'width' | 'height', value: string) => {
    const num = Math.max(100, Math.min(8000, parseInt(value) || 100));
    setChartCustomSize(chartId, { ...customSize, [dim]: num });
  };

  // Get current dimensions for aspect ratio preview
  const dims = currentSize === 'custom'
    ? customSize
    : currentSize === 'auto'
      ? { width: 16, height: 9 }
      : SIZE_PRESETS[currentSize as Exclude<SizePreset, 'custom'>];

  const aspectW = dims.width || 16;
  const aspectH = dims.height || 9;
  const previewW = 28;
  const previewH = previewW * (aspectH / aspectW);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {/* Aspect ratio preview box */}
        <div
          className="flex-shrink-0 rounded border border-border-active bg-bg-input"
          style={{
            width: Math.min(previewW, 28),
            height: Math.min(previewH, 28),
            maxWidth: 28,
            maxHeight: 28,
          }}
        />
        {/* Scrollable preset pills */}
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {PRESET_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handlePresetClick(key)}
              className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
                currentSize === key
                  ? 'bg-accent-dev text-white'
                  : 'border border-border-subtle text-text-dim hover:text-text-muted'
              }`}
              title={`${(SIZE_PRESETS[key] as SizePresetConfig).label} — ${(SIZE_PRESETS[key] as SizePresetConfig).useCase}`}
            >
              {(SIZE_PRESETS[key] as SizePresetConfig).label}
            </button>
          ))}
          <button
            onClick={() => handlePresetClick('custom')}
            className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
              currentSize === 'custom'
                ? 'bg-accent-dev text-white'
                : 'border border-border-subtle text-text-dim hover:text-text-muted'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Custom dimension inputs */}
      {showCustom && (
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={customSize.width}
            onChange={(e) => handleCustomChange('width', e.target.value)}
            min={100}
            max={8000}
            className="w-16 rounded border border-border-subtle bg-bg-input px-1.5 py-0.5 text-[10px] text-text-body"
            aria-label="Width in pixels"
          />
          <span className="text-[10px] text-text-dim">×</span>
          <input
            type="number"
            value={customSize.height}
            onChange={(e) => handleCustomChange('height', e.target.value)}
            min={100}
            max={8000}
            className="w-16 rounded border border-border-subtle bg-bg-input px-1.5 py-0.5 text-[10px] text-text-body"
            aria-label="Height in pixels"
          />
          <span className="text-[10px] text-text-dim">px</span>
        </div>
      )}
    </div>
  );
}
