/**
 * PRD §7.7 — POST /api/generate/:jobId/variations
 * Generate 3 AI variations of a completed generation.
 * Mock: returns the same template with slight modifications.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;

  // Mock: return 3 "variations" (in production, would re-run pipeline with style tweaks)
  const variations = Array.from({ length: 3 }, (_, i) => ({
    id: `var-${jobId}-${i}`,
    variationIndex: i,
    description: ['Different color palette', 'Alternative layout', 'Minimalist style'][i],
  }));

  return NextResponse.json({ jobId, variations });
}
