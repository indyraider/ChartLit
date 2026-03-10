/**
 * PRD §13.1 — POST /api/analytics/event
 * Track events: view, export, code_copy, canva_push.
 * GET returns events with optional filtering.
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackEvent, getEvents } from '@/lib/analytics-store';
import type { EventType } from '@/lib/analytics-store';

const VALID_TYPES: EventType[] = ['view', 'export', 'code_copy', 'canva_push', 'render_test', 'compile_test'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, templateId, metadata } = body as {
      type: string;
      templateId: string;
      metadata?: Record<string, unknown>;
    };

    if (!type || !VALID_TYPES.includes(type as EventType)) {
      return NextResponse.json(
        { error: `Invalid event type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 },
      );
    }

    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
    }

    trackEvent(type as EventType, templateId, metadata);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type') as EventType | null;
  const templateId = searchParams.get('templateId');
  const since = searchParams.get('since');

  const events = getEvents({
    type: type || undefined,
    templateId: templateId || undefined,
    since: since || undefined,
  });

  return NextResponse.json({ events, total: events.length });
}
