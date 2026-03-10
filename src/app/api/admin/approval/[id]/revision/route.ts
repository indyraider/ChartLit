/**
 * PRD §7.4.2 — POST /api/admin/approval/:id/revision
 * Request revision on a candidate with reviewer notes.
 * In production, this would re-trigger generation with feedback.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCandidate, updateCandidate } from '@/lib/candidates-store';
import { verifyAdmin } from '@/lib/admin-auth';

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

  if (candidate.reviewStatus !== 'pending') {
    return NextResponse.json(
      { error: `Cannot request revision for candidate with status: ${candidate.reviewStatus}` },
      { status: 400 },
    );
  }

  let body: { notes?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Revision notes are required' }, { status: 400 });
  }

  const updated = updateCandidate(id, {
    reviewStatus: 'revision-requested',
    reviewerNotes: body.notes || 'Needs revision',
  });

  console.log(`[Admin] Requested revision for candidate ${id}: ${body.notes}`);

  return NextResponse.json({
    id,
    status: 'revision-requested',
    message: 'Revision requested. Candidate will be re-generated with feedback.',
    template: updated,
  });
}
