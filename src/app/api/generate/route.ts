/**
 * PRD §13.1 — POST /api/generate
 * Submit NL prompt for AI chart generation. Returns job ID.
 * Stub: returns mock job ID.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prompt } = body as { prompt: string };

  if (!prompt || prompt.trim().length === 0) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  // Stub: generate a fake job ID
  const jobId = `gen-${Date.now().toString(36)}`;

  return NextResponse.json({ jobId });
}
