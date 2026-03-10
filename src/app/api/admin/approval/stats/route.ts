/**
 * PRD §13.1 — GET /api/admin/approval/stats
 * Returns approval queue statistics.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getQueueStats, seedMockCandidates } from '@/lib/candidates-store';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  seedMockCandidates();
  const stats = getQueueStats();
  return NextResponse.json(stats);
}
