/**
 * PRD §13.1 — GET /api/generate/:jobId
 * Poll generation status.
 * Stub: always returns "pending" for now.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Stub: mock generation is always pending
  return NextResponse.json({
    status: 'pending',
  });
}
