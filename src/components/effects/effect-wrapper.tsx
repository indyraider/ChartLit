'use client';

/**
 * PRD §8.1 — EffectWrapper: Composable Layer Architecture
 * Layers: Background → Chart → Overlay → Animation
 * Wraps a chart component with the appropriate effect layers based on preset.
 */

import { type ReactNode, Suspense, lazy, useMemo } from 'react';
import type { EffectPreset, EffectConfig } from '@/types/template';
import { EFFECT_REGISTRY, type EffectLayerDef } from './effect-registry';

// -- Lazy-loaded effect components --

const BACKGROUND_COMPONENTS = {
  'starfield': lazy(() => import('./backgrounds/starfield')),
  'particle-network': lazy(() => import('./backgrounds/particle-network')),
  'gradient-mesh': lazy(() => import('./backgrounds/gradient-mesh')),
  'animated-grid': lazy(() => import('./backgrounds/animated-grid')),
  'watercolor-bleed': lazy(() => import('./backgrounds/watercolor-bleed')),
  'cluster-nebula': lazy(() => import('./backgrounds/cluster-nebula')),
  'confetti-burst': lazy(() => import('./animations/confetti-burst')),
} as const;

const OVERLAY_COMPONENTS = {
  'neon-glow': lazy(() => import('./overlays/neon-glow')),
  'glass-morphism': lazy(() => import('./overlays/glass-morphism')),
  'noise-texture': lazy(() => import('./overlays/noise-texture')),
  'hand-drawn-sketch': lazy(() => import('./overlays/hand-drawn-sketch')),
  'scan-lines': lazy(() => import('./overlays/scan-lines')),
  '3d-perspective': lazy(() => import('./overlays/three-d-perspective')),
} as const;

const ANIMATION_COMPONENTS = {
  'parallax-float': lazy(() => import('./animations/parallax-float')),
  'data-pulse': lazy(() => import('./animations/data-pulse')),
  'edge-flow': lazy(() => import('./animations/edge-flow')),
  'node-ripple': lazy(() => import('./animations/node-ripple')),
  '3d-orbit': lazy(() => import('./animations/three-d-orbit')),
} as const;

interface EffectWrapperProps {
  children: ReactNode;
  effect: EffectPreset | null;
  effectConfig: EffectConfig | null;
  palette: string[];
  width: number;
  height: number;
}

export function EffectWrapper({
  children,
  effect,
  effectConfig,
  palette,
  width,
  height,
}: EffectWrapperProps) {
  const intensity = effectConfig?.intensity ?? 75;

  const layers = useMemo(() => {
    if (!effect || effect === 'none') return { backgrounds: [], overlays: [], animations: [] };
    const def = EFFECT_REGISTRY[effect];
    if (!def) return { backgrounds: [], overlays: [], animations: [] };

    const backgrounds: EffectLayerDef[] = [];
    const overlays: EffectLayerDef[] = [];
    const animations: EffectLayerDef[] = [];

    for (const layer of def.layers) {
      const config = { ...layer.defaultConfig, ...effectConfig };
      const merged = { ...layer, defaultConfig: config };
      switch (layer.layer) {
        case 'background': backgrounds.push(merged); break;
        case 'overlay': overlays.push(merged); break;
        case 'animation': animations.push(merged); break;
      }
    }

    return { backgrounds, overlays, animations };
  }, [effect, effectConfig]);

  // No effects — render children directly
  if (!effect || effect === 'none') return <>{children}</>;

  // Build the chart with layers
  let content: ReactNode = children;

  // Wrap with overlay effects that wrap children (neon-glow, 3d-perspective)
  for (const overlay of layers.overlays) {
    const key = overlay.component as keyof typeof OVERLAY_COMPONENTS;
    const Component = OVERLAY_COMPONENTS[key];
    if (!Component) continue;

    // Some overlays wrap children (neon-glow, 3d-perspective), others are positional
    if (key === 'neon-glow' || key === '3d-perspective') {
      content = (
        <Suspense fallback={null}>
          <Component
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...{ children: content, intensity, config: overlay.defaultConfig, palette } as any}
          />
        </Suspense>
      );
    }
  }

  // Wrap with animation effects (they all wrap children)
  for (const anim of layers.animations) {
    const key = anim.component as keyof typeof ANIMATION_COMPONENTS;
    const Component = ANIMATION_COMPONENTS[key];
    if (!Component) continue;

    content = (
      <Suspense fallback={null}>
        <Component
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...{ children: content, intensity, config: anim.defaultConfig, palette, width, height } as any}
        />
      </Suspense>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      {/* Background layer */}
      {layers.backgrounds.map((bg, i) => {
        const key = bg.component as keyof typeof BACKGROUND_COMPONENTS;
        const Component = BACKGROUND_COMPONENTS[key];
        if (!Component) return null;
        return (
          <Suspense key={`bg-${i}`} fallback={null}>
            <Component
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...{ width, height, intensity, config: bg.defaultConfig, palette } as any}
            />
          </Suspense>
        );
      })}

      {/* Chart layer + animation wrappers */}
      <div className="relative z-10">
        {content}
      </div>

      {/* Positional overlay layers (noise, glass, scan-lines, hand-drawn) */}
      {layers.overlays
        .filter((o) => o.component !== 'neon-glow' && o.component !== '3d-perspective')
        .map((overlay, i) => {
          const key = overlay.component as keyof typeof OVERLAY_COMPONENTS;
          const Component = OVERLAY_COMPONENTS[key];
          if (!Component) return null;
          return (
            <Suspense key={`ov-${i}`} fallback={null}>
              <Component
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...{ width, height, intensity, config: overlay.defaultConfig, palette } as any}
              />
            </Suspense>
          );
        })}
    </div>
  );
}
