/**
 * PRD §7.6 — GET /api/analytics/health
 * Queue health monitoring: auto-throttle background generation when queue >200.
 */

import { NextResponse } from 'next/server';
import { getQueueStats } from '@/lib/candidates-store';
import { getQueueHealth } from '@/lib/analytics-store';

export async function GET() {
  const stats = getQueueStats();
  const health = getQueueHealth(stats.pending);

  return NextResponse.json({
    ...health,
    queueStats: stats,
  });
}
