'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store';
import type { TemplateListResponse } from '@/types/template';
import { PALETTES } from '@/lib/palettes';
import { ChartRenderer } from '@/components/charts/chart-renderer';

export default function Home() {
  const { gallery, setTemplates, setLoading } = useAppStore();

  useEffect(() => {
    async function loadTemplates() {
      setLoading(true);
      try {
        const res = await fetch('/api/templates?page=1&limit=18');
        const data: TemplateListResponse = await res.json();
        setTemplates(data.templates, data.hasMore);
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, [setTemplates, setLoading]);

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-black tracking-tight text-text-primary">
            ChartLit
          </h1>
          <div className="flex items-center gap-3">
            {/* AI Generate bar — PRD §5.8.1 */}
            <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-input px-3 py-2">
              <input
                type="text"
                placeholder='Describe a chart... e.g., "a D3 bar chart with neon glow"'
                className="w-80 bg-transparent text-sm text-text-body placeholder-text-dim outline-none"
              />
              <button className="rounded-md bg-accent-dev px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-accent-dev/80">
                Generate
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter bar — PRD §5.1.2 */}
      <div className="border-b border-border-subtle bg-bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-6 py-3">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-text-dim">
            Filters
          </span>
          {['All Types', 'Libraries', 'Effects', 'Palettes', 'Use Cases'].map(
            (label) => (
              <button
                key={label}
                className="shrink-0 rounded-full border border-border-subtle bg-bg-input px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-border-active hover:text-text-body"
              >
                {label}
              </button>
            )
          )}
          <input
            type="text"
            placeholder="Search..."
            className="ml-auto w-48 shrink-0 rounded-lg border border-border-subtle bg-bg-input px-3 py-1.5 text-xs text-text-body placeholder-text-dim outline-none transition-colors focus:border-border-active"
          />
        </div>
      </div>

      {/* Gallery — PRD §5.1.1 Masonry Grid */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {gallery.loading ? (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="mb-6 break-inside-avoid animate-pulse rounded-xl border border-border-subtle bg-bg-card"
              >
                <div
                  className="rounded-t-xl bg-bg-inset"
                  style={{ height: 200 + (i % 3) * 60 }}
                />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 rounded bg-bg-input" />
                  <div className="h-3 w-1/2 rounded bg-bg-input" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {gallery.templates.map((template) => {
              const paletteColors = PALETTES[template.palette];
              return (
                <div
                  key={template.id}
                  className="group relative mb-6 cursor-pointer break-inside-avoid overflow-hidden rounded-xl border border-border-subtle bg-bg-card transition-all duration-200 hover:-translate-y-1 hover:border-border-active hover:shadow-lg hover:shadow-black/20"
                >
                  {/* Chart preview — live rendered via ChartRenderer */}
                  <div
                    className="overflow-hidden bg-bg-inset"
                    style={{ height: template.height }}
                  >
                    <ChartRenderer
                      template={template}
                      width={380}
                      height={template.height}
                    />
                  </div>

                  {/* Card info */}
                  <div className="p-4">
                    <h3 className="text-[15px] font-bold text-text-primary">
                      {template.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {template.subtitle}
                    </p>

                    {/* Badges */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-bg-input px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-dim">
                        {template.library}
                      </span>
                      {template.effect && (
                        <span className="rounded bg-bg-input px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-dim">
                          {template.effect}
                        </span>
                      )}
                      <div className="ml-auto flex gap-0.5">
                        {paletteColors.slice(0, 4).map((color, i) => (
                          <div
                            key={i}
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Tag pills */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-bg-input px-2 py-0.5 text-[10px] text-text-dim"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="rounded-lg bg-bg-card/90 px-3 py-1.5 text-xs font-semibold text-accent-dev backdrop-blur-sm">
                      View Code
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {gallery.templates.length === 0 && !gallery.loading && (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-lg font-medium text-text-muted">
              No templates match your filters
            </p>
            <button className="mt-3 text-sm text-accent-dev hover:underline">
              Clear all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
