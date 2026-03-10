/**
 * PRD §17.1 — POST /api/admin/seed
 * Trigger template seeding. GET returns current catalog summary.
 */

import { NextResponse } from 'next/server';
import { SEED_TEMPLATES } from '@/lib/seed-templates';
import { getMatrixSummary } from '@/lib/template-generator';

export async function GET() {
  const summary = getMatrixSummary(SEED_TEMPLATES);
  return NextResponse.json(summary);
}
