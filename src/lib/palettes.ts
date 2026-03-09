/**
 * PRD §11 — Color Palette System
 * 10 named palettes, each with 5 colors. First color is primary/accent.
 */

import type { PaletteName } from '@/types/template';

export type PaletteColors = [string, string, string, string, string];

export const PALETTES: Record<PaletteName, PaletteColors> = {
  ember:    ['#FF6B35', '#F7C59F', '#EFEFD0', '#004E89', '#1A659E'],
  midnight: ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'],
  forest:   ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2'],
  sunset:   ['#F72585', '#B5179E', '#7209B7', '#560BAD', '#480CA8'],
  ocean:    ['#0077B6', '#00B4D8', '#48CAE4', '#90E0EF', '#CAF0F8'],
  coral:    ['#E63946', '#F1FAEE', '#A8DADC', '#457B9D', '#1D3557'],
  neon:     ['#08F7FE', '#09FBD3', '#FE53BB', '#F5D300', '#FF2281'],
  earth:    ['#D4A373', '#CCD5AE', '#E9EDC9', '#FEFAE0', '#FAEDCD'],
  berry:    ['#7B2D8E', '#D64292', '#F0729B', '#F5A3B5', '#FADBD8'],
  slate:    ['#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1'],
};

export const PALETTE_META: Record<PaletteName, { label: string; character: string }> = {
  ember:    { label: 'Ember',    character: 'Warm orange to cool blue' },
  midnight: { label: 'Midnight', character: 'Indigo monochrome' },
  forest:   { label: 'Forest',   character: 'Deep green gradient' },
  sunset:   { label: 'Sunset',   character: 'Hot pink to purple' },
  ocean:    { label: 'Ocean',    character: 'Blue to cyan' },
  coral:    { label: 'Coral',    character: 'Red accent with navy' },
  neon:     { label: 'Neon',     character: 'Cyberpunk / electric' },
  earth:    { label: 'Earth',    character: 'Warm natural tones' },
  berry:    { label: 'Berry',    character: 'Purple to pink' },
  slate:    { label: 'Slate',    character: 'Neutral gray scale' },
};
