/**
 * PRD §7.6 — GET /api/analytics/gaps
 * Catalog gap detection: identify underrepresented type/library/effect combos.
 * Used to bias generation toward missing combinations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeCatalogGaps } from '@/lib/analytics-store';

export async function GET(request: NextRequest) {
  // Fetch all templates from the catalog
  let templates: Array<{ chartType: string; library: string; effect: string | null }> = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/templates?limit=1000`,
    );
    const data = await res.json();
    templates = (data.templates || []).map((t: Record<string, unknown>) => ({
      chartType: t.chartType as string,
      library: t.library as string,
      effect: t.effect as string | null,
    }));
  } catch {
    // Fall through with empty
  }

  const gaps = analyzeCatalogGaps(templates);

  // Identify truly missing combos by comparing against all possible
  const limit = Number(request.nextUrl.searchParams.get('limit')) || 20;

  return NextResponse.json({
    gaps: gaps.slice(0, limit),
    totalCombos: gaps.length,
    totalTemplates: templates.length,
    leastRepresented: gaps.slice(0, 5),
  });
}
