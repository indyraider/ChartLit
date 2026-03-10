'use client';

/**
 * PRD §5.2 — Configuration Modal
 * Full-screen overlay with Designer + Developer tabs.
 * Two-column layout: controls (left) + live preview (right).
 */

import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import { ChartRenderer } from '@/components/charts/chart-renderer';
import { DesignerTab } from './designer-tab';
import { DeveloperTab } from './developer-tab';

export function ConfigurationModal() {
  const { modal, closeModal, setActiveTab, openModal } = useAppStore();
  const { template, activeTab, palette, effect, effectIntensity, data } = modal;

  // Close on Escape
  useEffect(() => {
    if (!template) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [template, closeModal]);

  // Lock body scroll when open
  useEffect(() => {
    if (template) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [template]);

  if (!template) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Configure: ${template.title}`}
    >
      <div className="my-8 w-full max-w-[960px] rounded-2xl border border-border-subtle bg-bg-base shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-text-primary">{template.title}</h2>
            <span className="rounded bg-bg-input px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-dim">
              {template.library}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Tab switcher */}
            <div className="flex rounded-lg border border-border-subtle bg-bg-input">
              <button
                onClick={() => setActiveTab('designer')}
                className={`rounded-l-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === 'designer'
                    ? 'bg-accent-designer text-white'
                    : 'text-text-muted hover:text-text-body'
                }`}
              >
                Designer
              </button>
              <button
                onClick={() => setActiveTab('developer')}
                className={`rounded-r-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === 'developer'
                    ? 'bg-accent-dev text-white'
                    : 'text-text-muted hover:text-text-body'
                }`}
              >
                Developer
              </button>
            </div>
            {/* Close */}
            <button
              onClick={closeModal}
              aria-label="Close modal"
              className="rounded-lg p-1.5 text-text-dim transition-colors hover:bg-bg-input hover:text-text-body"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body: 2-column layout */}
        <div className="flex flex-col md:flex-row">
          {/* Left column: controls */}
          <div className="flex-1 overflow-y-auto border-r border-border-subtle p-6" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {activeTab === 'designer' ? (
              <DesignerTab template={template} />
            ) : (
              <DeveloperTab template={template} />
            )}
          </div>

          {/* Right column: live preview */}
          <div className="flex w-full flex-col items-center justify-center bg-bg-inset p-6 md:w-[380px]">
            <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-card">
              <ChartRenderer
                template={{
                  ...template,
                  palette,
                  effect,
                  effectConfig: effect ? { intensity: effectIntensity } : null,
                }}
                data={data}
                palette={palette}
                width={340}
                height={Math.min(template.height, 300)}
              />
            </div>
            <p className="mt-3 text-center text-[11px] text-text-dim">
              Live preview — changes update in real-time
            </p>

            {/* Add to Workspace button */}
            <button
              onClick={() => {
                const chart = {
                  id: `${template.id}-${Date.now()}`,
                  template,
                  data,
                  palette,
                  effect,
                  effectIntensity,
                  title: template.title,
                  framework: modal.framework,
                  includeEffects: modal.includeEffects,
                  includeTypes: modal.includeTypes,
                  neo4jBoilerplate: modal.neo4jBoilerplate,
                };
                useAppStore.getState().addToWorkspace(chart);
                closeModal();
              }}
              className="mt-4 w-full rounded-lg bg-accent-dev px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dev/80"
            >
              Add to Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
