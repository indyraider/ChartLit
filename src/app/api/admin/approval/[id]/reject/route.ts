/**
 * PRD §7.4.2 — POST /api/admin/approval/:id/reject
 * Reject a candidate with reason code and notes.
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

  if (candidate.reviewStatus === 'rejected') {
    return NextResponse.json({ error: 'Candidate already rejected' }, { status: 400 });
  }

  let body: { reason?: string; notes?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
  }

  const updated = updateCandidate(id, {
    reviewStatus: 'rejected',
    rejectionReason: body.reason || 'unspecified',
    reviewerNotes: body.notes || '',
  });

  console.log(`[Admin] Rejected candidate ${id}: ${body.reason}`);

  // In production: if user-submitted, send notification with reason + suggestion
  if (candidate.generationSource === 'ai-user' && candidate.userId) {
    console.log(`[Admin] Would notify user ${candidate.userId} of rejection`);
  }

  return NextResponse.json({
    id,
    status: 'rejected',
    message: 'Candidate rejected.',
    template: updated,
  });
}
