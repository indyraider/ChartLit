'use client';

import { useEffect, useRef, useCallback, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import type { TemplateListResponse, TemplateMetadata, ChartType, Library, EffectPreset, PaletteName, UseCase } from '@/types/template';
import { CHART_TYPES, LIBRARIES, EFFECT_PRESETS, PALETTE_NAMES, USE_CASES } from '@/types/template';
import { PALETTES } from '@/lib/palettes';
import { PALETTE_META } from '@/lib/palettes';
import { ChartRenderer } from '@/components/charts/chart-renderer';
import { ConfigurationModal } from '@/components/modal/configuration-modal';
import { WorkspaceDrawer } from '@/components/workspace/workspace-drawer';
import { useCanvaAuth } from '@/hooks/use-canva-auth';
import { trackEvent } from '@/lib/track';

const LIMIT = 18;

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-base" />}>
      <HomeContent />
      <ConfigurationModal />
      <WorkspaceDrawer />
    </Suspense>
  );
}

function HomeContent() {
  const {
    gallery, setTemplates, appendTemplates, setLoading,
    setFilters, resetFilters, incrementPage,
    generation, setGenerationPrompt, setGenerationStatus,
    setGenerationJobId, setGenerationResult, setGenerationError,
    resetGeneration, openModal,
  } = useAppStore();

  const { filters } = gallery;
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);

  // Handle Canva OAuth callback params
  useCanvaAuth();

  // AI Generate handler
  const handleGenerate = useCallback(async () => {
    const prompt = generation.prompt.trim();
    if (!prompt || generation.status === 'generating') return;

    setGenerationStatus('generating');
    setGenerationResult(null);
    setGenerationError(null);

    try {
      // Submit prompt
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error('Generation request failed');
      const { jobId } = await res.json();
      setGenerationJobId(jobId);

      // Poll for result
      let attempts = 0;
      const maxAttempts = 30;
      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1000));
        const pollRes = await fetch(`/api/generate/${jobId}`);
        const data = await pollRes.json();

        if (data.status === 'complete' && data.template) {
          setGenerationResult(data.template);
          return;
        }
        if (data.status === 'failed') {
          setGenerationError(data.error || 'Generation failed', data.suggestion);
          return;
        }
        attempts++;
      }
      setGenerationError('Generation timed out', 'Try a simpler description.');
    } catch {
      setGenerationError('Failed to connect to generation service', 'Please try again.');
    }
  }, [generation.prompt, generation.status, setGenerationStatus, setGenerationResult, setGenerationError, setGenerationJobId]);

  // Initialize filters from URL on first load
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const urlFilters: Record<string, unknown> = {};
    const type = searchParams.get('type');
    const library = searchParams.get('library');
    const effect = searchParams.get('effect');
    const palette = searchParams.get('palette');
    const useCase = searchParams.get('useCase');
    const search = searchParams.get('search');
    if (type) urlFilters.type = type;
    if (library) urlFilters.library = library;
    if (effect) urlFilters.effect = effect;
    if (palette) urlFilters.palette = palette;
    if (useCase) urlFilters.useCase = useCase;
    if (search) { urlFilters.search = search; setSearchInput(search); }
    if (Object.keys(urlFilters).length > 0) setFilters(urlFilters);
  }, [searchParams, setFilters]);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.type) params.set('type', filters.type);
    if (filters.library) params.set('library', filters.library);
    if (filters.effect) params.set('effect', filters.effect);
    if (filters.palette) params.set('palette', filters.palette);
    if (filters.useCase) params.set('useCase', filters.useCase);
    if (filters.search) params.set('search', filters.search);
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : '/', { scroll: false });
  }, [filters, router]);

  // Build query string from filters
  const buildQuery = useCallback((page: number, overrideSearch?: string) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(LIMIT));
    if (filters.type) params.set('type', filters.type);
    if (filters.library) params.set('library', filters.library);
    if (filters.effect) params.set('effect', filters.effect);
    if (filters.palette) params.set('palette', filters.palette);
    if (filters.useCase) params.set('useCase', filters.useCase);
    const search = overrideSearch ?? filters.search;
    if (search) params.set('search', search);
    return params.toString();
  }, [filters]);

  // Fetch templates
  const fetchTemplates = useCallback(async (page: number, append: boolean, search?: string) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(`/api/templates?${buildQuery(page, search)}`);
      const data: TemplateListResponse = await res.json();
      if (append) {
        appendTemplates(data.templates, data.hasMore);
      } else {
        setTemplates(data.templates, data.hasMore);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [buildQuery, setTemplates, appendTemplates, setLoading]);

  // Initial load + refetch on filter change
  useEffect(() => {
    fetchTemplates(1, false, debouncedSearch);
  }, [filters.type, filters.library, filters.effect, filters.palette, filters.useCase, debouncedSearch, fetchTemplates]);

  // Sync debounced search into store
  useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && gallery.hasMore && !loadingRef.current) {
          const nextPage = gallery.page + 1;
          incrementPage();
          fetchTemplates(nextPage, true);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [gallery.hasMore, gallery.page, incrementPage, fetchTemplates]);

  // Filter toggle helpers
  const toggleFilter = <T extends string>(key: keyof typeof filters, value: T) => {
    setFilters({ [key]: filters[key] === value ? null : value } as Record<string, unknown>);
  };

  const hasActiveFilters = filters.type || filters.library || filters.effect || filters.palette || filters.useCase || filters.search;

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-black tracking-tight text-text-primary">
            ChartLit
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-input px-3 py-2">
              <input
                type="text"
                value={generation.prompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
                placeholder='Describe a chart... e.g., "a D3 bar chart with neon glow"'
                className="w-80 bg-transparent text-sm text-text-body placeholder-text-dim outline-none"
                disabled={generation.status === 'generating'}
              />
              <button
                onClick={handleGenerate}
                disabled={generation.status === 'generating' || !generation.prompt.trim()}
                className="rounded-md bg-accent-dev px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-accent-dev/80 disabled:opacity-50"
              >
                {generation.status === 'generating' ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter bar — PRD §5.1.2 */}
      <div className="border-b border-border-subtle bg-bg-card">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-text-dim">
              Filters
            </span>

            {/* Chart Type filter */}
            <FilterDropdown
              label="Type"
              active={filters.type}
              options={[...CHART_TYPES].map(t => ({ value: t, label: t }))}
              onSelect={(v) => toggleFilter('type', v as ChartType)}
            />

            {/* Library filter */}
            <FilterDropdown
              label="Library"
              active={filters.library}
              options={LIBRARIES.map(l => ({ value: l, label: l }))}
              onSelect={(v) => toggleFilter('library', v as Library)}
            />

            {/* Effect filter */}
            <FilterDropdown
              label="Effect"
              active={filters.effect}
              options={EFFECT_PRESETS.filter(e => e !== 'none').map(e => ({ value: e, label: e }))}
              onSelect={(v) => toggleFilter('effect', v as EffectPreset)}
            />

            {/* Palette filter — color swatches */}
            <PaletteFilter
              active={filters.palette}
              onSelect={(v) => toggleFilter('palette', v as PaletteName)}
            />

            {/* Use Case filter */}
            <FilterDropdown
              label="Use Case"
              active={filters.useCase}
              options={USE_CASES.map(u => ({ value: u, label: u }))}
              onSelect={(v) => toggleFilter('useCase', v as UseCase)}
            />

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={() => { resetFilters(); setSearchInput(''); }}
                className="shrink-0 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                Clear all
              </button>
            )}

            {/* Search */}
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search..."
              className="ml-auto w-48 shrink-0 rounded-lg border border-border-subtle bg-bg-input px-3 py-1.5 text-xs text-text-body placeholder-text-dim outline-none transition-colors focus:border-border-active"
            />
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {filters.type && <ActivePill label={`Type: ${filters.type}`} onRemove={() => setFilters({ type: null })} />}
              {filters.library && <ActivePill label={`Library: ${filters.library}`} onRemove={() => setFilters({ library: null })} />}
              {filters.effect && <ActivePill label={`Effect: ${filters.effect}`} onRemove={() => setFilters({ effect: null })} />}
              {filters.palette && <ActivePill label={`Palette: ${filters.palette}`} onRemove={() => setFilters({ palette: null })} />}
              {filters.useCase && <ActivePill label={`Use Case: ${filters.useCase}`} onRemove={() => setFilters({ useCase: null })} />}
              {filters.search && <ActivePill label={`Search: "${filters.search}"`} onRemove={() => { setFilters({ search: '' }); setSearchInput(''); }} />}
            </div>
          )}
        </div>
      </div>

      {/* Gallery — PRD §5.1.1 Masonry Grid */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {gallery.loading && gallery.templates.length === 0 ? (
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
          <>
            {/* AI Generation Result / Shimmer — PRD §5.8.1 */}
            {generation.status !== 'idle' && (
              <div className="mb-6">
                {generation.status === 'generating' && (
                  <div className="overflow-hidden rounded-xl border border-accent-dev/30 bg-bg-card">
                    <div className="h-[200px] animate-pulse bg-gradient-to-r from-bg-inset via-accent-dev/5 to-bg-inset" />
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-dev/30 border-t-accent-dev" />
                        <span className="text-sm font-medium text-text-muted">
                          Generating chart from &quot;{generation.prompt}&quot;...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {generation.status === 'complete' && generation.result && (
                  <div className="overflow-hidden rounded-xl border-2 border-accent-dev/50 bg-bg-card shadow-lg shadow-accent-dev/10">
                    <div className="relative">
                      <span className="absolute left-3 top-3 z-10 rounded-full bg-accent-dev px-2 py-0.5 text-[10px] font-bold text-white">
                        AI Generated
                      </span>
                      <div
                        className="cursor-pointer bg-bg-inset"
                        onClick={() => openModal(generation.result!)}
                        style={{ height: 220 }}
                      >
                        <ChartRenderer
                          template={generation.result}
                          width={600}
                          height={220}
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-[15px] font-bold text-text-primary">
                        {generation.result.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-text-muted">{generation.result.subtitle}</p>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => openModal(generation.result!)}
                          className="rounded-md bg-accent-dev px-3 py-1 text-xs font-semibold text-white hover:bg-accent-dev/80"
                        >
                          Configure
                        </button>
                        <button
                          onClick={handleGenerate}
                          className="rounded-md border border-border-subtle px-3 py-1 text-xs font-medium text-text-muted hover:text-text-body"
                        >
                          Regenerate
                        </button>
                        <button
                          onClick={resetGeneration}
                          className="rounded-md border border-border-subtle px-3 py-1 text-xs font-medium text-text-dim hover:text-text-body"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {generation.status === 'failed' && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                    <p className="text-sm font-medium text-red-400">
                      {generation.error || 'Generation failed'}
                    </p>
                    {generation.suggestion && (
                      <p className="mt-1 text-xs text-text-dim">{generation.suggestion}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={handleGenerate}
                        className="rounded-md bg-accent-dev px-3 py-1 text-xs font-semibold text-white hover:bg-accent-dev/80"
                      >
                        Retry
                      </button>
                      <button
                        onClick={resetGeneration}
                        className="rounded-md border border-border-subtle px-3 py-1 text-xs font-medium text-text-dim hover:text-text-body"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {gallery.templates.map((template, idx) => (
                <GalleryCard key={template.id} template={template} index={idx} />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            {gallery.hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-8">
                {gallery.loading && (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-border-subtle border-t-accent-dev" />
                )}
              </div>
            )}
          </>
        )}

        {gallery.templates.length === 0 && !gallery.loading && (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-lg font-medium text-text-muted">
              No templates match your filters
            </p>
            <button
              onClick={() => { resetFilters(); setSearchInput(''); }}
              className="mt-3 text-sm text-accent-dev hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Gallery Card with staggered fade-in ---

function GalleryCard({ template, index }: { template: import('@/types/template').TemplateMetadata; index: number }) {
  const openModal = useAppStore((s) => s.openModal);
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // Stagger based on column position
          const delay = (index % 3) * 80;
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  const paletteColors = PALETTES[template.palette];

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={`${template.title} — ${template.subtitle}`}
      onClick={() => { trackEvent('view', template.id); openModal(template); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trackEvent('view', template.id); openModal(template); } }}
      className={`group relative mb-6 cursor-pointer break-inside-avoid overflow-hidden rounded-xl border border-border-subtle bg-bg-card transition-all duration-300 hover:-translate-y-1 hover:border-border-active hover:shadow-lg hover:shadow-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-dev focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      {/* Chart preview */}
      <div
        className="overflow-hidden bg-bg-inset"
        style={{ height: template.height }}
      >
        {visible && (
          <ChartRenderer
            template={template}
            width={380}
            height={template.height}
          />
        )}
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
}

// --- Filter Dropdown Component ---

function FilterDropdown({
  label,
  active,
  options,
  onSelect,
}: {
  label: string;
  active: string | null;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={ref} className="relative shrink-0" onKeyDown={handleKeyDown}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          active
            ? 'border-accent-dev/50 bg-accent-dev/10 text-accent-dev'
            : 'border-border-subtle bg-bg-input text-text-muted hover:border-border-active hover:text-text-body'
        }`}
      >
        {active ?? label}
        <span className="ml-1 text-[10px]">▾</span>
      </button>
      {open && (
        <div role="listbox" aria-label={label} className="absolute left-0 top-full z-40 mt-1 max-h-64 w-48 overflow-y-auto rounded-lg border border-border-subtle bg-bg-card shadow-xl shadow-black/30">
          {options.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={active === opt.value}
              onClick={() => { onSelect(opt.value); setOpen(false); }}
              className={`block w-full px-3 py-2 text-left text-xs transition-colors ${
                active === opt.value
                  ? 'bg-accent-dev/10 text-accent-dev'
                  : 'text-text-body hover:bg-bg-input'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Palette Filter (color swatches) ---

function PaletteFilter({
  active,
  onSelect,
}: {
  active: PaletteName | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      {PALETTE_NAMES.map((name) => {
        const colors = PALETTES[name];
        const isActive = active === name;
        return (
          <button
            key={name}
            onClick={() => onSelect(name)}
            title={PALETTE_META[name]?.label ?? name}
            className={`flex gap-px rounded-full p-0.5 transition-all ${
              isActive
                ? 'ring-2 ring-accent-dev ring-offset-1 ring-offset-bg-card'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            {colors.slice(0, 3).map((color, i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </button>
        );
      })}
    </div>
  );
}

// --- Active Filter Pill ---

function ActivePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-dev/10 px-2 py-0.5 text-[10px] font-medium text-accent-dev">
      {label}
      <button onClick={onRemove} className="ml-0.5 hover:text-white">×</button>
    </span>
  );
}
