'use client';

/**
 * PRD §8.3 — Effect Preset Registry
 * Maps each of the 20 effect presets to its layer configuration.
 */

import type { EffectPreset, EffectConfig } from '@/types/template';

export type EffectLayerType = 'background' | 'overlay' | 'animation';

export interface EffectLayerDef {
  layer: EffectLayerType;
  component: string; // key into lazy component map
  defaultConfig: Record<string, unknown>;
}

export interface EffectPresetDef {
  name: string;
  layers: EffectLayerDef[];
  description: string;
  blockedWith?: EffectPreset[]; // presets that can't combine with this one
}

export const EFFECT_REGISTRY: Record<EffectPreset, EffectPresetDef> = {
  'none': {
    name: 'None',
    layers: [],
    description: 'Clean chart, no effects',
  },
  'neon-glow': {
    name: 'Neon Glow',
    layers: [{ layer: 'overlay', component: 'neon-glow', defaultConfig: { blurRadius: 12, brightness: 1.3 } }],
    description: 'Elements emit colored light with saturated, electric feel',
    blockedWith: ['glass-morphism', 'noise-texture', 'scan-lines', 'hand-drawn-sketch'],
  },
  'starfield': {
    name: 'Starfield',
    layers: [{ layer: 'background', component: 'starfield', defaultConfig: { count: 80, speed: 0.3 } }],
    description: 'Slowly drifting star particles behind the chart',
    blockedWith: ['particle-network', 'gradient-mesh', 'animated-grid', 'cluster-nebula'],
  },
  'gradient-mesh': {
    name: 'Gradient Mesh',
    layers: [{ layer: 'background', component: 'gradient-mesh', defaultConfig: { animate: true } }],
    description: 'Smooth, organic color gradients behind the chart',
    blockedWith: ['starfield', 'particle-network', 'animated-grid', 'cluster-nebula'],
  },
  'noise-texture': {
    name: 'Noise Texture',
    layers: [{ layer: 'overlay', component: 'noise-texture', defaultConfig: { frequency: 0.65, opacity: 0.12 } }],
    description: 'Subtle grain overlay for a tactile, editorial feel',
    blockedWith: ['neon-glow', 'glass-morphism', 'scan-lines', 'hand-drawn-sketch'],
  },
  'glass-morphism': {
    name: 'Glass Morphism',
    layers: [{ layer: 'overlay', component: 'glass-morphism', defaultConfig: { blur: 12, opacity: 0.15 } }],
    description: 'Chart area feels like frosted glass',
    blockedWith: ['neon-glow', 'noise-texture', 'scan-lines', 'hand-drawn-sketch'],
  },
  'particle-network': {
    name: 'Particle Network',
    layers: [{ layer: 'background', component: 'particle-network', defaultConfig: { count: 50, linkDistance: 120 } }],
    description: 'Connected nodes forming a web behind data points',
    blockedWith: ['starfield', 'gradient-mesh', 'animated-grid', 'cluster-nebula'],
  },
  'animated-grid': {
    name: 'Animated Grid',
    layers: [{ layer: 'background', component: 'animated-grid', defaultConfig: { spacing: 30, pulseSpeed: 2 } }],
    description: 'Subtle moving gridlines that pulse or shift',
    blockedWith: ['starfield', 'gradient-mesh', 'particle-network', 'cluster-nebula'],
  },
  'hand-drawn-sketch': {
    name: 'Hand-drawn Sketch',
    layers: [{ layer: 'overlay', component: 'hand-drawn-sketch', defaultConfig: { roughness: 2, seed: 42 } }],
    description: 'Chart looks like it was drawn on paper',
    blockedWith: ['neon-glow', 'noise-texture', 'glass-morphism', 'scan-lines'],
  },
  '3d-perspective': {
    name: '3D Perspective',
    layers: [{ layer: 'overlay', component: '3d-perspective', defaultConfig: { rotateX: 8, rotateY: -4, depth: 40 } }],
    description: 'Chart tilts in 3D space with depth shadows',
    blockedWith: ['neon-glow', 'noise-texture', 'glass-morphism', 'scan-lines', 'hand-drawn-sketch'],
  },
  'parallax-float': {
    name: 'Parallax Float',
    layers: [{ layer: 'animation', component: 'parallax-float', defaultConfig: { amplitude: 6, duration: 4 } }],
    description: 'Chart elements gently bob on idle',
    blockedWith: ['data-pulse', 'confetti-burst'],
  },
  'confetti-burst': {
    name: 'Confetti Burst',
    layers: [{ layer: 'background', component: 'confetti-burst', defaultConfig: { count: 40, spread: 60 } }],
    description: 'Celebratory particle burst on chart load',
    blockedWith: ['starfield', 'particle-network', 'gradient-mesh', 'animated-grid'],
  },
  'scan-lines': {
    name: 'Scan Lines',
    layers: [{ layer: 'overlay', component: 'scan-lines', defaultConfig: { gap: 3, opacity: 0.08 } }],
    description: 'Retro CRT scan line effect',
    blockedWith: ['neon-glow', 'noise-texture', 'glass-morphism', 'hand-drawn-sketch'],
  },
  'watercolor-bleed': {
    name: 'Watercolor Bleed',
    layers: [{ layer: 'background', component: 'watercolor-bleed', defaultConfig: { spread: 20, opacity: 0.3 } }],
    description: 'Soft watercolor-style color bleeding from chart edges',
    blockedWith: ['starfield', 'particle-network', 'animated-grid', 'cluster-nebula'],
  },
  'data-pulse': {
    name: 'Data Pulse',
    layers: [{ layer: 'animation', component: 'data-pulse', defaultConfig: { bpm: 60, scale: 1.02 } }],
    description: 'Chart bars/lines pulse with a heartbeat rhythm on load',
    blockedWith: ['parallax-float', 'confetti-burst'],
  },
  'force-bloom': {
    name: 'Force Bloom',
    layers: [
      { layer: 'background', component: 'particle-network', defaultConfig: { count: 30, linkDistance: 80 } },
      { layer: 'overlay', component: 'neon-glow', defaultConfig: { blurRadius: 8, brightness: 1.2 } },
    ],
    description: 'Nodes emit particle trails; edges glow on hover',
    blockedWith: ['starfield', 'gradient-mesh'],
  },
  'edge-flow': {
    name: 'Edge Flow',
    layers: [{ layer: 'animation', component: 'edge-flow', defaultConfig: { dashSpeed: 30, dashLength: 8 } }],
    description: 'Animated dashes flow along edges showing directionality',
    blockedWith: ['parallax-float', 'data-pulse', 'confetti-burst'],
  },
  'node-ripple': {
    name: 'Node Ripple',
    layers: [{ layer: 'animation', component: 'node-ripple', defaultConfig: { radius: 30, duration: 1.2 } }],
    description: 'Concentric ripple animation on node hover/select',
    blockedWith: ['parallax-float', 'data-pulse', 'confetti-burst'],
  },
  'cluster-nebula': {
    name: 'Cluster Nebula',
    layers: [{ layer: 'background', component: 'cluster-nebula', defaultConfig: { blur: 60, opacity: 0.25 } }],
    description: 'Soft colored nebula clouds around node clusters',
    blockedWith: ['starfield', 'gradient-mesh', 'particle-network', 'animated-grid'],
  },
  '3d-orbit': {
    name: '3D Orbit',
    layers: [{ layer: 'animation', component: '3d-orbit', defaultConfig: { speed: 0.3, radius: 1.5 } }],
    description: 'Camera slowly orbits the 3D graph',
    blockedWith: ['parallax-float', 'data-pulse', 'confetti-burst'],
  },
};

/** Check if two effects are compatible (different layers, not blocked) */
export function areEffectsCompatible(a: EffectPreset, b: EffectPreset): boolean {
  if (a === 'none' || b === 'none') return true;
  const defA = EFFECT_REGISTRY[a];
  const defB = EFFECT_REGISTRY[b];
  if (defA.blockedWith?.includes(b) || defB.blockedWith?.includes(a)) return false;
  // Same layer = blocked
  const layersA = new Set(defA.layers.map(l => l.layer));
  const layersB = new Set(defB.layers.map(l => l.layer));
  for (const l of layersA) if (layersB.has(l)) return false;
  return true;
}
