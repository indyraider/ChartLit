/**
 * PRD §5.5.1 — Size Presets
 */

import type { SizePreset } from '@/store';

export interface SizePresetConfig {
  label: string;
  width: number;
  height: number;
  useCase: string;
}

export const SIZE_PRESETS: Record<Exclude<SizePreset, 'custom'>, SizePresetConfig> = {
  auto:    { label: 'Auto',         width: 0,    height: 0,    useCase: 'Quick export' },
  '1:1':   { label: 'Square',       width: 1080, height: 1080, useCase: 'Instagram, social posts' },
  '16:9':  { label: 'Widescreen',   width: 1920, height: 1080, useCase: 'Presentations, YouTube' },
  '4:3':   { label: 'Presentation', width: 1440, height: 1080, useCase: 'Slides' },
  '3:2':   { label: 'Photo',        width: 1620, height: 1080, useCase: 'Blog headers' },
  '21:9':  { label: 'Ultra-wide',   width: 2520, height: 1080, useCase: 'Website banners' },
  '9:16':  { label: 'Story',        width: 1080, height: 1920, useCase: 'Instagram Stories, Reels' },
  a4:      { label: 'A4',           width: 2480, height: 3508, useCase: 'Print documents' },
  letter:  { label: 'Letter',       width: 2550, height: 3300, useCase: 'US Letter print' },
  '4k':    { label: '4K',           width: 3840, height: 2160, useCase: 'High-res displays' },
};
