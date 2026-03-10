/**
 * PRD §7.4.5 — POST /api/admin/approval/:id/unpublish
 * Emergency unpublish: immediately remove an approved template.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCandidate, removeCandidate } from '@/lib/candidates-store';
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

  removeCandidate(id);
  console.log(`[Admin] Emergency unpublished candidate ${id}: ${candidate.title}`);

  return NextResponse.json({
    id,
    status: 'unpublished',
    message: 'Template has been immediately unpublished.',
  });
}
