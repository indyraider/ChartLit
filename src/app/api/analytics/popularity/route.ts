/**
 * PRD §12.2 — GET /api/analytics/popularity
 * Template popularity metrics (views, exports, code copies) for ranking.
 */

import { NextResponse } from 'next/server';
import { getPopularityMetrics } from '@/lib/analytics-store';

export async function GET() {
  const metrics = getPopularityMetrics();
  return NextResponse.json({ metrics, total: metrics.length });
}
