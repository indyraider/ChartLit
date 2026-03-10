/**
 * PRD §17.4 — GET /api/admin/validate
 * Run validation suite on all templates.
 * Returns pass/fail for metadata and code export checks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SEED_TEMPLATES } from '@/lib/seed-templates';
import { validateBatch } from '@/lib/template-validator';

export async function GET(request: NextRequest) {
  const showFailed = request.nextUrl.searchParams.get('failedOnly') === 'true';
  const validation = validateBatch(SEED_TEMPLATES);

  if (showFailed) {
    return NextResponse.json({
      ...validation,
      results: validation.results.filter((r) => !r.passed),
    });
  }

  // Don't return all 300+ full results by default — just the summary + failures
  const failures = validation.results.filter((r) => !r.passed);

  return NextResponse.json({
    total: validation.total,
    passed: validation.passed,
    failed: validation.failed,
    failures,
  });
}
