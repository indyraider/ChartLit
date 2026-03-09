/**
 * PRD §13.1 — GET /api/templates
 * Paginated template catalog with multi-axis filtering.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SEED_TEMPLATES } from '@/lib/seed-templates';
import type { GalleryFilters, TemplateMetadata } from '@/types/template';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const page = parseInt(params.get('page') || '1', 10);
  const limit = parseInt(params.get('limit') || '18', 10);
  const type = params.get('type') as GalleryFilters['type'];
  const library = params.get('library') as GalleryFilters['library'];
  const effect = params.get('effect') as GalleryFilters['effect'];
  const palette = params.get('palette') as GalleryFilters['palette'];
  const useCase = params.get('useCase') as GalleryFilters['useCase'];
  const search = params.get('search') || '';

  let filtered: TemplateMetadata[] = [...SEED_TEMPLATES];

  // Apply AND-combined filters
  if (type) filtered = filtered.filter((t) => t.chartType === type);
  if (library) filtered = filtered.filter((t) => t.library === library);
  if (effect) filtered = filtered.filter((t) => t.effect === effect);
  if (palette) filtered = filtered.filter((t) => t.palette === palette);
  if (useCase) filtered = filtered.filter((t) => t.useCases.includes(useCase));
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        t.library.toLowerCase().includes(q) ||
        (t.effect?.toLowerCase().includes(q) ?? false)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const templates = filtered.slice(start, start + limit);
  const hasMore = start + limit < total;

  return NextResponse.json({ templates, total, page, hasMore });
}
