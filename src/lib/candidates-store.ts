/**
 * PRD §7.4 — Candidates Persistence Store (Mock)
 * In-memory store for CandidateTemplate objects awaiting admin review.
 * Uses globalThis for cross-route sharing in development.
 * Production would use a database (PostgreSQL).
 */

import type { CandidateTemplate, Framework } from '@/types/template';

function getStore() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (!g.__candidateStore) g.__candidateStore = new Map<string, CandidateTemplate>();
  return g.__candidateStore as Map<string, CandidateTemplate>;
}

/** Add a candidate to the approval queue. */
export function addCandidate(candidate: CandidateTemplate): void {
  getStore().set(candidate.id, candidate);
}

/** Get a single candidate by ID. */
export function getCandidate(id: string): CandidateTemplate | undefined {
  return getStore().get(id);
}

/** Get all candidates, optionally filtered. */
export function getCandidates(filters?: {
  status?: CandidateTemplate['reviewStatus'];
  chartType?: string;
  library?: string;
  effect?: string;
  scoreMin?: number;
  scoreMax?: number;
  source?: string;
  rejectionReason?: string;
}): CandidateTemplate[] {
  let candidates = Array.from(getStore().values());

  if (filters) {
    if (filters.status) {
      candidates = candidates.filter((c) => c.reviewStatus === filters.status);
    }
    if (filters.chartType) {
      candidates = candidates.filter((c) => c.chartType === filters.chartType);
    }
    if (filters.library) {
      candidates = candidates.filter((c) => c.library === filters.library);
    }
    if (filters.effect) {
      candidates = candidates.filter((c) => c.effect === filters.effect);
    }
    if (filters.scoreMin !== undefined) {
      candidates = candidates.filter((c) => (c.qualityScore ?? 0) >= filters.scoreMin!);
    }
    if (filters.scoreMax !== undefined) {
      candidates = candidates.filter((c) => (c.qualityScore ?? 100) <= filters.scoreMax!);
    }
    if (filters.source) {
      candidates = candidates.filter((c) => c.generationSource === filters.source);
    }
    if (filters.rejectionReason) {
      candidates = candidates.filter((c) => c.rejectionReason === filters.rejectionReason);
    }
  }

  // Priority sort: user-submitted first, then by quality score desc
  candidates.sort((a, b) => {
    const aUser = a.generationSource === 'ai-user' ? 0 : 1;
    const bUser = b.generationSource === 'ai-user' ? 0 : 1;
    if (aUser !== bUser) return aUser - bUser;
    return (b.qualityScore ?? 0) - (a.qualityScore ?? 0);
  });

  return candidates;
}

/** Update a candidate's review status and metadata. */
export function updateCandidate(
  id: string,
  updates: Partial<Pick<CandidateTemplate, 'reviewStatus' | 'reviewerNotes' | 'rejectionReason' | 'title' | 'subtitle' | 'tags' | 'palette'>>,
): CandidateTemplate | undefined {
  const store = getStore();
  const candidate = store.get(id);
  if (!candidate) return undefined;

  const updated = {
    ...candidate,
    ...updates,
    // Auto-set reviewedAt when status changes
    ...(updates.reviewStatus && updates.reviewStatus !== candidate.reviewStatus
      ? { reviewedAt: new Date().toISOString() }
      : {}),
  };
  store.set(id, updated);
  return updated;
}

/** Remove a candidate (for emergency unpublish). */
export function removeCandidate(id: string): boolean {
  return getStore().delete(id);
}

/** Get queue statistics. */
export function getQueueStats() {
  const candidates = Array.from(getStore().values());
  const pending = candidates.filter((c) => c.reviewStatus === 'pending').length;
  const approved = candidates.filter((c) => c.reviewStatus === 'approved').length;
  const rejected = candidates.filter((c) => c.reviewStatus === 'rejected').length;
  const revision = candidates.filter((c) => c.reviewStatus === 'revision-requested').length;
  const borderline = candidates.filter(
    (c) => c.reviewStatus === 'pending' && (c.qualityScore ?? 0) >= 65 && (c.qualityScore ?? 0) <= 75,
  ).length;

  return { total: candidates.length, pending, approved, rejected, revision, borderline };
}

/** Seed some mock candidates for development. */
export function seedMockCandidates(): void {
  const store = getStore();
  if (store.size > 0) return; // Already seeded

  const mockCandidates: CandidateTemplate[] = [
    {
      id: 'candidate-1',
      title: 'AI: Neon Bar Chart',
      subtitle: 'Glowing bar chart with neon effect',
      chartType: 'bar',
      library: 'recharts',
      palette: 'neon',
      effect: 'neon-glow',
      effectConfig: { intensity: 80 },
      dataKey: 'categorical',
      dataSchema: 'basic-categorical',
      tags: ['bar', 'neon', 'glow'],
      useCases: ['dashboard', 'presentation'],
      height: 400,
      config: {},
      renderModule: '/templates/bar/recharts-neon',
      codeTemplates: {},
      layoutConfig: null,
      interactionDefaults: [],
      maxNodes: null,
      neo4jBoilerplate: false,
      generationSource: 'ai-user',
      qualityScore: 82,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      sourceCode: {
        react: '// AI-generated React code',
        vanilla: '// AI-generated Vanilla JS code',
        vue: '// AI-generated Vue code',
        svelte: '// AI-generated Svelte code',
      } as Record<Framework, string>,
      screenshots: [],
      promptText: 'Create a neon glowing bar chart',
      reviewStatus: 'pending',
    },
    {
      id: 'candidate-2',
      title: 'AI: Ocean Line Chart',
      subtitle: 'Smooth line chart with ocean palette',
      chartType: 'line',
      library: 'd3',
      palette: 'ocean',
      effect: 'gradient-mesh',
      effectConfig: { intensity: 60 },
      dataKey: 'time-series',
      dataSchema: 'basic-time-series',
      tags: ['line', 'ocean', 'gradient'],
      useCases: ['report', 'dashboard'],
      height: 350,
      config: {},
      renderModule: '/templates/line/d3-ocean',
      codeTemplates: {},
      layoutConfig: null,
      interactionDefaults: [],
      maxNodes: null,
      neo4jBoilerplate: false,
      generationSource: 'ai-background',
      qualityScore: 71,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      sourceCode: {
        react: '// AI-generated React code',
        vanilla: '// AI-generated Vanilla JS code',
        vue: '// AI-generated Vue code',
        svelte: '// AI-generated Svelte code',
      } as Record<Framework, string>,
      screenshots: [],
      reviewStatus: 'pending',
    },
    {
      id: 'candidate-3',
      title: 'AI: Glass Pie Chart',
      subtitle: 'Pie chart with glassmorphism effect',
      chartType: 'pie',
      library: 'echarts',
      palette: 'midnight',
      effect: 'glass-morphism',
      effectConfig: { intensity: 70 },
      dataKey: 'categorical',
      dataSchema: 'basic-categorical',
      tags: ['pie', 'glass', 'modern'],
      useCases: ['presentation', 'infographic'],
      height: 400,
      config: {},
      renderModule: '/templates/pie/echarts-glass',
      codeTemplates: {},
      layoutConfig: null,
      interactionDefaults: [],
      maxNodes: null,
      neo4jBoilerplate: false,
      generationSource: 'ai-user',
      qualityScore: 78,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      sourceCode: {
        react: '// AI-generated React code',
        vanilla: '// AI-generated Vanilla JS code',
        vue: '// AI-generated Vue code',
        svelte: '// AI-generated Svelte code',
      } as Record<Framework, string>,
      screenshots: [],
      promptText: 'Make a pie chart with glass morphism midnight theme',
      userId: 'user-123',
      reviewStatus: 'pending',
    },
  ];

  for (const c of mockCandidates) {
    store.set(c.id, c);
  }
}
