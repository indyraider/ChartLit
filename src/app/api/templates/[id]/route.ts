/**
 * PRD §13.1 — GET /api/templates/:id
 * Single template metadata.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SEED_TEMPLATES } from '@/lib/seed-templates';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = SEED_TEMPLATES.find((t) => t.id === id);

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  return NextResponse.json(template);
}
