/**
 * PRD §13.1 — POST /api/analytics/event
 * Track events: view, export, code_copy, canva_push.
 * Stub: logs to console for now.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Stub: just log the event
  console.log('[analytics]', body);
  return NextResponse.json({ ok: true });
}
