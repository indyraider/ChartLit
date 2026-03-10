/**
 * PRD §13.1 — GET /api/admin/approval/queue
 * Returns candidates in the approval queue with filtering and sorting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCandidates, seedMockCandidates } from '@/lib/candidates-store';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authError = verifyAdmin(request);
  if (authError) return authError;

  // Seed mock data on first access
  seedMockCandidates();

  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status') as 'pending' | 'approved' | 'revision-requested' | 'rejected' | null;
  const chartType = searchParams.get('chartType');
  const library = searchParams.get('library');
  const effect = searchParams.get('effect');
  const scoreMin = searchParams.get('scoreMin');
  const scoreMax = searchParams.get('scoreMax');
  const source = searchParams.get('source');

  const candidates = getCandidates({
    status: status || undefined,
    chartType: chartType || undefined,
    library: library || undefined,
    effect: effect || undefined,
    scoreMin: scoreMin ? Number(scoreMin) : undefined,
    scoreMax: scoreMax ? Number(scoreMax) : undefined,
    source: source || undefined,
  });

  return NextResponse.json({ candidates, total: candidates.length });
}
