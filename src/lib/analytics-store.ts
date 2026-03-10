/**
 * PRD §12.2, §7.6 — Analytics Event Store (Mock)
 * In-memory store for analytics events and feedback loop analysis.
 * Production would use a time-series database or analytics service.
 */

export type EventType = 'view' | 'export' | 'code_copy' | 'canva_push' | 'render_test' | 'compile_test';

export interface AnalyticsEvent {
  id: string;
  type: EventType;
  templateId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TemplatePopularity {
  templateId: string;
  views: number;
  exports: number;
  codeCopies: number;
  canvaPushes: number;
  total: number;
}

export interface CatalogGap {
  chartType: string;
  library: string;
  effect: string;
  count: number;
}

export interface RejectionCategory {
  reason: string;
  count: number;
  percentage: number;
}

export interface ApprovalPattern {
  chartType: string;
  library: string;
  effect: string;
  approvalRate: number;
  totalReviewed: number;
}

function getEventStore() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (!g.__analyticsEvents) g.__analyticsEvents = [] as AnalyticsEvent[];
  return g.__analyticsEvents as AnalyticsEvent[];
}

/** Record an analytics event. */
export function trackEvent(type: EventType, templateId: string, metadata?: Record<string, unknown>): void {
  const events = getEventStore();
  events.push({
    id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    templateId,
    timestamp: new Date().toISOString(),
    metadata,
  });
}

/** Get all events, optionally filtered by type or template. */
export function getEvents(filters?: {
  type?: EventType;
  templateId?: string;
  since?: string;
}): AnalyticsEvent[] {
  let events = getEventStore();

  if (filters) {
    if (filters.type) events = events.filter((e) => e.type === filters.type);
    if (filters.templateId) events = events.filter((e) => e.templateId === filters.templateId);
    if (filters.since) {
      const sinceTime = new Date(filters.since).getTime();
      events = events.filter((e) => new Date(e.timestamp).getTime() >= sinceTime);
    }
  }

  return events;
}

/** Get template popularity metrics sorted by total engagement. */
export function getPopularityMetrics(): TemplatePopularity[] {
  const events = getEventStore();
  const metrics = new Map<string, TemplatePopularity>();

  for (const event of events) {
    if (!metrics.has(event.templateId)) {
      metrics.set(event.templateId, {
        templateId: event.templateId,
        views: 0,
        exports: 0,
        codeCopies: 0,
        canvaPushes: 0,
        total: 0,
      });
    }
    const m = metrics.get(event.templateId)!;
    switch (event.type) {
      case 'view': m.views++; break;
      case 'export': m.exports++; break;
      case 'code_copy': m.codeCopies++; break;
      case 'canva_push': m.canvaPushes++; break;
    }
    m.total++;
  }

  return Array.from(metrics.values()).sort((a, b) => b.total - a.total);
}

/** Analyze catalog gaps: find underrepresented type/library/effect combos. */
export function analyzeCatalogGaps(
  existingTemplates: Array<{ chartType: string; library: string; effect: string | null }>,
  expectedCombos?: Array<{ chartType: string; library: string; effect: string }>,
): CatalogGap[] {
  const comboCounts = new Map<string, CatalogGap>();

  // If expected combos provided, seed all with count 0 to show missing entries
  if (expectedCombos) {
    for (const combo of expectedCombos) {
      const key = `${combo.chartType}|${combo.library}|${combo.effect}`;
      if (!comboCounts.has(key)) {
        comboCounts.set(key, { ...combo, count: 0 });
      }
    }
  }

  for (const t of existingTemplates) {
    const key = `${t.chartType}|${t.library}|${t.effect || 'none'}`;
    if (!comboCounts.has(key)) {
      comboCounts.set(key, {
        chartType: t.chartType,
        library: t.library,
        effect: t.effect || 'none',
        count: 0,
      });
    }
    comboCounts.get(key)!.count++;
  }

  // Return sorted by count ascending (least represented first, missing = 0)
  return Array.from(comboCounts.values()).sort((a, b) => a.count - b.count);
}

/** Analyze rejection categories for prompt improvement feedback. */
export function analyzeRejections(
  candidates: Array<{ rejectionReason?: string; reviewStatus: string }>,
): RejectionCategory[] {
  const rejected = candidates.filter((c) => c.reviewStatus === 'rejected' && c.rejectionReason);
  if (rejected.length === 0) return [];

  const counts = new Map<string, number>();
  for (const c of rejected) {
    const reason = c.rejectionReason!;
    counts.set(reason, (counts.get(reason) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: Math.round((count / rejected.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

/** Track reviewer approval patterns for style evolution. */
export function analyzeApprovalPatterns(
  candidates: Array<{
    chartType: string;
    library: string;
    effect: string | null;
    reviewStatus: string;
  }>,
): ApprovalPattern[] {
  const reviewed = candidates.filter(
    (c) => c.reviewStatus === 'approved' || c.reviewStatus === 'rejected',
  );

  const combos = new Map<string, { approved: number; total: number; chartType: string; library: string; effect: string }>();

  for (const c of reviewed) {
    const key = `${c.chartType}|${c.library}|${c.effect || 'none'}`;
    if (!combos.has(key)) {
      combos.set(key, {
        approved: 0,
        total: 0,
        chartType: c.chartType,
        library: c.library,
        effect: c.effect || 'none',
      });
    }
    const entry = combos.get(key)!;
    entry.total++;
    if (c.reviewStatus === 'approved') entry.approved++;
  }

  return Array.from(combos.values())
    .map((entry) => ({
      chartType: entry.chartType,
      library: entry.library,
      effect: entry.effect,
      approvalRate: entry.total > 0 ? Math.round((entry.approved / entry.total) * 100) : 0,
      totalReviewed: entry.total,
    }))
    .sort((a, b) => b.approvalRate - a.approvalRate);
}

/** Get queue health status for auto-throttle. */
export function getQueueHealth(pendingCount: number): {
  status: 'healthy' | 'warning' | 'overflow';
  shouldPauseGeneration: boolean;
  shouldResumeGeneration: boolean;
  pendingCount: number;
} {
  return {
    status: pendingCount > 200 ? 'overflow' : pendingCount > 150 ? 'warning' : 'healthy',
    shouldPauseGeneration: pendingCount > 200,
    shouldResumeGeneration: pendingCount < 100,
    pendingCount,
  };
}
