'use client';

/**
 * PRD §5.2.2 — Designer Tab
 * Data source selector, palette picker, effect selector with intensity slider.
 */

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store';
import { PALETTES, PALETTE_META } from '@/lib/palettes';
import { PALETTE_NAMES, EFFECT_PRESETS } from '@/types/template';
import type { TemplateMetadata, PaletteName, EffectPreset } from '@/types/template';
import { EFFECT_REGISTRY } from '@/components/effects/effect-registry';
import { SAMPLE_DATA } from '@/lib/sample-data';

interface Props {
  template: TemplateMetadata;
}

type DataSource = 'sample' | 'paste';

export function DesignerTab({ template }: Props) {
  const {
    modal, setModalPalette, setModalEffect, setModalEffectIntensity, setModalData,
  } = useAppStore();
  const [dataSource, setDataSource] = useState<DataSource>('sample');
  const [pasteValue, setPasteValue] = useState('');
  const [dataError, setDataError] = useState<string | null>(null);

  // Parse pasted data (CSV or JSON)
  const handlePaste = useCallback((text: string) => {
    setPasteValue(text);
    if (!text.trim()) {
      setModalData(null);
      setDataError(null);
      return;
    }

    try {
      const trimmed = text.trim();
      // JSON detection
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        setModalData(arr);
        setDataError(null);
        return;
      }

      // CSV parsing (simple: comma-delimited with header)
      const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        setDataError('CSV needs at least a header row and one data row');
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: Record<string, unknown> = {};
        headers.forEach((h, i) => {
          const val = values[i] ?? '';
          const num = Number(val);
          row[h] = val !== '' && !isNaN(num) ? num : val;
        });
        return row;
      });
      setModalData(rows);
      setDataError(null);
    } catch {
      setDataError('Could not parse data. Use CSV (comma-separated) or JSON array format.');
    }
  }, [setModalData]);

  return (
    <div className="space-y-6">
      {/* Data Source */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary">Data Source</h3>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => { setDataSource('sample'); setModalData(null); setDataError(null); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              dataSource === 'sample'
                ? 'bg-accent-dev/10 text-accent-dev border border-accent-dev/30'
                : 'border border-border-subtle bg-bg-input text-text-muted hover:text-text-body'
            }`}
          >
            Sample Data
          </button>
          <button
            onClick={() => setDataSource('paste')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              dataSource === 'paste'
                ? 'bg-accent-dev/10 text-accent-dev border border-accent-dev/30'
                : 'border border-border-subtle bg-bg-input text-text-muted hover:text-text-body'
            }`}
          >
            Paste Data
          </button>
        </div>

        {dataSource === 'sample' && (
          <div className="mt-3 rounded-lg border border-border-subtle bg-bg-inset p-3">
            <p className="text-[11px] text-text-dim">
              Using built-in sample data: <span className="font-mono text-text-muted">{template.dataKey}</span>
            </p>
            {/* Data preview: first 5 rows */}
            <DataPreview data={SAMPLE_DATA[template.dataKey] ?? []} />
          </div>
        )}

        {dataSource === 'paste' && (
          <div className="mt-3">
            <textarea
              value={pasteValue}
              onChange={(e) => handlePaste(e.target.value)}
              placeholder={'Paste CSV or JSON data here...\n\nCSV example:\nmonth,revenue\nJan,4200\nFeb,5100\n\nJSON example:\n[{"month":"Jan","revenue":4200}]'}
              className="h-32 w-full rounded-lg border border-border-subtle bg-bg-input p-3 font-mono text-xs text-text-body placeholder-text-dim outline-none transition-colors focus:border-border-active"
            />
            {dataError && (
              <div className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {dataError}
              </div>
            )}
            {modal.data && !dataError && (
              <div className="mt-2 rounded-lg bg-green-500/10 px-3 py-2 text-xs text-green-400">
                Parsed {modal.data.length} rows successfully
              </div>
            )}
          </div>
        )}
      </section>

      {/* Color Palette */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary">Color Palette</h3>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {PALETTE_NAMES.map((name) => {
            const colors = PALETTES[name];
            const isActive = modal.palette === name;
            return (
              <button
                key={name}
                onClick={() => setModalPalette(name)}
                title={PALETTE_META[name]?.label ?? name}
                className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
                  isActive
                    ? 'bg-accent-dev/10 ring-2 ring-accent-dev'
                    : 'hover:bg-bg-input'
                }`}
              >
                <div className="flex gap-0.5">
                  {colors.map((color, i) => (
                    <div
                      key={i}
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-medium text-text-dim">{name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Visual Effects */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary">Visual Effect</h3>
        <select
          value={modal.effect ?? 'none'}
          onChange={(e) => {
            const val = e.target.value as EffectPreset;
            setModalEffect(val === 'none' ? null : val);
          }}
          className="mt-2 w-full rounded-lg border border-border-subtle bg-bg-input px-3 py-2 text-xs text-text-body outline-none transition-colors focus:border-border-active"
        >
          {EFFECT_PRESETS.map((preset) => {
            const def = EFFECT_REGISTRY[preset];
            return (
              <option key={preset} value={preset}>
                {def?.name ?? preset} — {def?.description ?? ''}
              </option>
            );
          })}
        </select>

        {/* Intensity slider */}
        {modal.effect && (
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-text-muted">Intensity</label>
              <span className="text-xs font-mono text-text-dim">{modal.effectIntensity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={modal.effectIntensity}
              onChange={(e) => setModalEffectIntensity(Number(e.target.value))}
              className="mt-1 w-full accent-accent-dev"
            />
          </div>
        )}
      </section>
    </div>
  );
}

// --- Data Preview Table ---

function DataPreview({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return null;
  const keys = Object.keys(data[0]);
  const rows = data.slice(0, 5);

  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead>
          <tr>
            {keys.map((k) => (
              <th key={k} className="border-b border-border-subtle px-2 py-1 text-left font-semibold text-text-muted">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {keys.map((k) => (
                <td key={k} className="border-b border-border-subtle/50 px-2 py-1 font-mono text-text-dim">
                  {String(row[k] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 5 && (
        <p className="mt-1 text-[9px] text-text-dim">Showing 5 of {data.length} rows</p>
      )}
    </div>
  );
}
