/**
 * PRD §7.4.2 — POST /api/admin/approval/:id/approve
 * Approve a candidate and publish to the gallery.
 * Supports optional edits to title, subtitle, tags, palette before publish.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCandidate, updateCandidate } from '@/lib/candidates-store';
import { verifyAdmin } from '@/lib/admin-auth';
import type { PaletteName } from '@/types/template';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = verifyAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const candidate = getCandidate(id);

  if (!candidate) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
  }

  if (candidate.reviewStatus !== 'pending' && candidate.reviewStatus !== 'revision-requested') {
    return NextResponse.json(
      { error: `Cannot approve candidate with status: ${candidate.reviewStatus}` },
      { status: 400 },
    );
  }

  // Parse optional edits
  let edits: Record<string, unknown> = {};
  try {
    const body = await request.json();
    edits = body || {};
  } catch {
    // No body — approve as-is
  }

  const updated = updateCandidate(id, {
    reviewStatus: 'approved',
    reviewerNotes: (edits.reviewerNotes as string) || 'Approved',
    ...(edits.title ? { title: edits.title as string } : {}),
    ...(edits.subtitle ? { subtitle: edits.subtitle as string } : {}),
    ...(edits.tags ? { tags: edits.tags as string[] } : {}),
    ...(edits.palette ? { palette: edits.palette as PaletteName } : {}),
  });

  console.log(`[Admin] Approved candidate ${id}: ${updated?.title}`);

  return NextResponse.json({
    id,
    status: 'approved',
    message: 'Template approved and published to gallery.',
    template: updated,
  });
}
