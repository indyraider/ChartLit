'use client';

/**
 * PRD §5.4 — Workspace Bottom Drawer
 * Fixed bottom drawer with horizontally scrollable chart cards.
 * Each card: title, live chart preview, size picker, export/code/remove actions.
 */

import { useState, useRef, useCallback } from 'react';
import { useAppStore, type WorkspaceChart, type UploadStatus } from '@/store';
import { ChartRenderer } from '@/components/charts/chart-renderer';
import { SizePicker } from './size-picker';
import { exportChartAsPng, exportChartAsBlob } from '@/lib/export';
import { trackEvent } from '@/lib/track';
import {
  isCanvaConnected,
  initiateCanvaOAuth,
  uploadToCanva,
  pollUploadStatus,
  buildAssetName,
} from '@/lib/canva';

export function WorkspaceDrawer() {
  const { workspace, canva, removeFromWorkspace } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  if (workspace.charts.length === 0) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-bg-base/95 backdrop-blur-md transition-transform ${
        collapsed ? 'translate-y-[calc(100%-36px)]' : ''
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-1.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-body"
        >
          <svg
            width="12" height="12" viewBox="0 0 12 12"
            className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}
          >
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          Workspace ({workspace.charts.length})
        </button>
        <span className="text-[10px] text-text-dim">Scroll to see all charts</span>
      </div>

      {/* Horizontally scrollable cards */}
      <div className="flex gap-3 overflow-x-auto px-4 py-3" style={{ scrollbarWidth: 'thin' }}>
        {workspace.charts.map((chart) => (
          <WorkspaceCard
            key={chart.id}
            chart={chart}
            copied={copied}
            exporting={exporting}
            uploadStatus={canva.uploadStatus[chart.id] ?? 'idle'}
            canvaConnected={canva.connected}
            onCopy={setCopied}
            onExporting={setExporting}
            onRemove={() => removeFromWorkspace(chart.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ---- Workspace Card ----

interface CardProps {
  chart: WorkspaceChart;
  copied: string | null;
  exporting: string | null;
  uploadStatus: UploadStatus;
  canvaConnected: boolean;
  onCopy: (id: string | null) => void;
  onExporting: (id: string | null) => void;
  onRemove: () => void;
}

function WorkspaceCard({ chart, copied, exporting, uploadStatus, canvaConnected, onCopy, onExporting, onRemove }: CardProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { workspace, setUploadStatus, setCanvaConnected } = useAppStore();
  const size = workspace.sizes[chart.id] ?? 'auto';

  const handleExportPng = useCallback(async () => {
    if (!chartRef.current) return;
    onExporting(chart.id);
    try {
      await exportChartAsPng(chartRef.current, chart.title, size, workspace.customSizes[chart.id]);
      trackEvent('export', chart.template.id, { size, title: chart.title });
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      onExporting(null);
    }
  }, [chart.id, chart.title, size, workspace.customSizes, onExporting]);

  const handleCopyCode = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        framework: chart.framework,
        includeEffects: String(chart.includeEffects),
        includeTypes: String(chart.includeTypes),
        neo4jBoilerplate: String(chart.neo4jBoilerplate),
        palette: chart.palette,
        effect: chart.effect ?? 'none',
        effectIntensity: String(chart.effectIntensity),
      });
      const res = await fetch(`/api/templates/${chart.template.id}/code?${params}`);
      const data = await res.json();
      await navigator.clipboard.writeText(data.code);
      trackEvent('code_copy', chart.template.id, { framework: chart.framework });
      onCopy(chart.id);
      setTimeout(() => onCopy(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [chart, onCopy]);

  const handleCanvaUpload = useCallback(async () => {
    if (!canvaConnected || !isCanvaConnected()) {
      try {
        await initiateCanvaOAuth();
      } catch (err) {
        console.error('Canva OAuth failed:', err);
      }
      return;
    }

    if (!chartRef.current) return;
    setUploadStatus(chart.id, 'uploading');

    try {
      const blob = await exportChartAsBlob(chartRef.current, size, workspace.customSizes[chart.id]);
      const dims = { width: chartRef.current.clientWidth, height: chartRef.current.clientHeight };
      const assetName = buildAssetName(
        chart.template.chartType,
        chart.effect,
        dims.width * 2,
        dims.height * 2,
      );

      const jobId = await uploadToCanva(blob, assetName);
      const result = await pollUploadStatus(jobId);
      setUploadStatus(chart.id, result === 'completed' ? 'success' : 'error');
      if (result === 'completed') {
        trackEvent('canva_push', chart.template.id, { assetName });
      }

      // Reset status after 3s
      setTimeout(() => setUploadStatus(chart.id, 'idle'), 3000);
    } catch (err) {
      console.error('Canva upload failed:', err);
      setUploadStatus(chart.id, 'error');
      setTimeout(() => setUploadStatus(chart.id, 'idle'), 3000);

      // If auth error, clear connected state
      if (err instanceof Error && err.message.includes('expired')) {
        setCanvaConnected(false);
      }
    }
  }, [canvaConnected, chart, size, workspace.customSizes, setUploadStatus, setCanvaConnected]);

  const handleCopyInstall = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        framework: chart.framework,
        includeEffects: String(chart.includeEffects),
        includeTypes: String(chart.includeTypes),
        palette: chart.palette,
        effect: chart.effect ?? 'none',
      });
      const res = await fetch(`/api/templates/${chart.template.id}/code?${params}`);
      const data = await res.json();
      await navigator.clipboard.writeText(data.dependencies.installCommand);
      onCopy(`${chart.id}-install`);
      setTimeout(() => onCopy(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [chart, onCopy]);

  return (
    <div className="flex w-[220px] flex-shrink-0 flex-col rounded-xl border border-border-subtle bg-bg-card">
      {/* Title + remove */}
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <h4 className="truncate text-xs font-semibold text-text-body" title={chart.title}>
          {chart.title}
        </h4>
        <button
          onClick={onRemove}
          aria-label="Remove from workspace"
          className="ml-1 flex-shrink-0 rounded p-0.5 text-text-dim hover:bg-bg-input hover:text-text-body"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Live chart preview */}
      <div ref={chartRef} className="border-b border-border-subtle bg-bg-inset p-1">
        <ChartRenderer
          template={{
            ...chart.template,
            palette: chart.palette,
            effect: chart.effect,
            effectConfig: chart.effect ? { intensity: chart.effectIntensity } : null,
          }}
          data={chart.data}
          palette={chart.palette}
          width={200}
          height={140}
        />
      </div>

      {/* Size picker */}
      <div className="border-b border-border-subtle px-3 py-2">
        <SizePicker chartId={chart.id} />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 px-2 py-2">
        {/* Image actions */}
        <div className="flex gap-1">
          <ActionButton
            label={exporting === chart.id ? 'Exporting...' : 'PNG'}
            onClick={handleExportPng}
            disabled={exporting === chart.id}
          />
          <ActionButton label="SVG" onClick={() => {}} disabled title="Coming Soon" />
          <ActionButton
            label={
              uploadStatus === 'uploading' ? 'Uploading...'
                : uploadStatus === 'success' ? 'Sent!'
                : uploadStatus === 'error' ? 'Failed'
                : canvaConnected ? 'Canva' : 'Connect'
            }
            onClick={handleCanvaUpload}
            disabled={uploadStatus === 'uploading'}
            title={canvaConnected ? 'Push to Canva' : 'Connect to Canva'}
          />
        </div>
        {/* Code actions */}
        <div className="flex gap-1">
          <ActionButton
            label={copied === chart.id ? 'Copied!' : 'Code'}
            onClick={handleCopyCode}
          />
          <ActionButton
            label={copied === `${chart.id}-install` ? 'Copied!' : 'Install'}
            onClick={handleCopyInstall}
          />
        </div>
      </div>
    </div>
  );
}

// ---- Action Button ----

function ActionButton({ label, onClick, disabled, title }: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex-1 rounded-md border border-border-subtle bg-bg-input px-1.5 py-1 text-[10px] font-medium text-text-muted transition-colors hover:border-border-active hover:text-text-body disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}
