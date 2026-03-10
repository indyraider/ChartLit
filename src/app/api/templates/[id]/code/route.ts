/**
 * PRD §13.1 — GET /api/templates/:id/code
 * Generates self-contained, framework-specific code for a template.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SEED_TEMPLATES } from '@/lib/seed-templates';
import type { Framework, PaletteName, EffectPreset } from '@/types/template';
import { generateCode } from '@/lib/codegen';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = SEED_TEMPLATES.find((t) => t.id === id);

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const framework = (searchParams.get('framework') || 'react') as Framework;
  const includeEffects = searchParams.get('includeEffects') !== 'false';
  const includeTypes = searchParams.get('includeTypes') === 'true';
  const neo4jBoilerplate = searchParams.get('neo4jBoilerplate') === 'true';

  // Optional overrides from the modal's configured state
  const palette = (searchParams.get('palette') || template.palette) as PaletteName;
  const effect = (searchParams.get('effect') || template.effect || 'none') as EffectPreset;
  const effectIntensity = parseInt(searchParams.get('effectIntensity') || String(template.effectConfig?.intensity ?? 75), 10);

  try {
    const response = generateCode({
      template,
      framework,
      includeEffects,
      includeTypes,
      palette,
      effect,
      effectIntensity,
      neo4jBoilerplate,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Code generation failed:', error);
    return NextResponse.json(
      { error: 'Code generation failed' },
      { status: 500 }
    );
  }
}
