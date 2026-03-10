/**
 * PRD §9.1 — Effect Wrapper Code Templates
 * Generates injectable effect wrapper code for each effect preset.
 * When includeEffects=true, this code wraps the chart component.
 */

import type { EffectPreset } from '@/types/template';

interface EffectCodeBlock {
  wrapperImport: string;
  wrapperOpen: string;
  wrapperClose: string;
  helperCode: string;
}

/**
 * Generate the effect wrapper code block for a given effect preset.
 * Returns imports, wrapper JSX open/close tags, and any helper code.
 */
export function generateEffectCode(
  effect: EffectPreset | null,
  intensity: number,
): EffectCodeBlock | null {
  if (!effect || effect === 'none') return null;

  const generator = EFFECT_GENERATORS[effect];
  if (!generator) return null;

  return generator(intensity);
}

type EffectGenerator = (intensity: number) => EffectCodeBlock;

const EFFECT_GENERATORS: Partial<Record<EffectPreset, EffectGenerator>> = {
  'neon-glow': (intensity) => ({
    wrapperImport: '',
    wrapperOpen: `      <div style={{ filter: 'drop-shadow(0 0 ${Math.round(intensity * 0.2)}px currentColor) drop-shadow(0 0 ${Math.round(intensity * 0.4)}px currentColor)', position: 'relative' }}>`,
    wrapperClose: '      </div>',
    helperCode: '',
  }),

  'glass-morphism': (intensity) => ({
    wrapperImport: '',
    wrapperOpen: `      <div style={{ background: 'rgba(15, 23, 42, ${(intensity * 0.006).toFixed(2)})', backdropFilter: 'blur(${Math.round(intensity * 0.16)}px)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 16, position: 'relative' }}>`,
    wrapperClose: '      </div>',
    helperCode: '',
  }),

  '3d-perspective': (intensity) => ({
    wrapperImport: '',
    wrapperOpen: `      <div style={{ perspective: ${800 - intensity * 4}, transformStyle: 'preserve-3d' }}>
        <div style={{ transform: 'rotateX(${Math.round(intensity * 0.08)}deg) rotateY(${Math.round(intensity * 0.05)}deg)' }}>`,
    wrapperClose: `        </div>
      </div>`,
    helperCode: '',
  }),

  'parallax-float': (intensity) => ({
    wrapperImport: `import { motion } from 'framer-motion';`,
    wrapperOpen: `      <motion.div
        animate={{ y: [0, -${Math.round(intensity * 0.08)}, 0] }}
        transition={{ duration: ${3 + (100 - intensity) * 0.04}, repeat: Infinity, ease: 'easeInOut' }}>`,
    wrapperClose: '      </motion.div>',
    helperCode: '',
  }),

  'data-pulse': (intensity) => ({
    wrapperImport: `import { motion } from 'framer-motion';`,
    wrapperOpen: `      <motion.div
        animate={{ scale: [1, ${(1 + intensity * 0.0005).toFixed(3)}, 1], opacity: [1, ${(0.85 + intensity * 0.0015).toFixed(2)}, 1] }}
        transition={{ duration: ${2 + (100 - intensity) * 0.03}, repeat: Infinity, ease: 'easeInOut' }}>`,
    wrapperClose: '      </motion.div>',
    helperCode: '',
  }),

  '3d-orbit': (intensity) => ({
    wrapperImport: `import { motion } from 'framer-motion';`,
    wrapperOpen: `      <div style={{ perspective: 800 }}>
        <motion.div
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: ${20 - intensity * 0.1}, repeat: Infinity, ease: 'linear' }}
          style={{ transformStyle: 'preserve-3d' }}>`,
    wrapperClose: `        </motion.div>
      </div>`,
    helperCode: '',
  }),

  'starfield': (intensity) => ({
    wrapperImport: '',
    wrapperOpen: `      <div style={{ position: 'relative' }}>
        {/* Starfield background */}
        <canvas ref={starfieldRef} style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: ${(intensity * 0.01).toFixed(2)} }} />
        <div style={{ position: 'relative', zIndex: 1 }}>`,
    wrapperClose: `        </div>
      </div>`,
    helperCode: `
  // Starfield effect
  const starfieldRef = useRef(null);
  useEffect(() => {
    const canvas = starfieldRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    const stars = Array.from({ length: ${Math.round(intensity * 1.5)} }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random(),
    }));
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.a += 0.005;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = \`rgba(255,255,255,\${0.3 + Math.sin(s.a) * 0.3})\`;
        ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);`,
  }),

  'noise-texture': (intensity) => ({
    wrapperImport: '',
    wrapperOpen: `      <div style={{ position: 'relative' }}>
        {/* Noise texture overlay */}
        <svg style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: ${(intensity * 0.0012).toFixed(3)}, mixBlendMode: 'overlay' }} width="100%" height="100%">
          <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves={4} stitchTiles="stitch" /></filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
        <div style={{ position: 'relative', zIndex: 1 }}>`,
    wrapperClose: `        </div>
      </div>`,
    helperCode: '',
  }),

  'scan-lines': (intensity) => ({
    wrapperImport: '',
    wrapperOpen: `      <div style={{ position: 'relative' }}>
        {/* Scan lines overlay */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: ${(intensity * 0.003).toFixed(3)}, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>`,
    wrapperClose: `        </div>
      </div>`,
    helperCode: '',
  }),

  'gradient-mesh': (intensity) => ({
    wrapperImport: '',
    wrapperOpen: `      <div style={{ position: 'relative' }}>
        {/* Gradient mesh background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: ${(intensity * 0.005).toFixed(2)}, background: \`radial-gradient(ellipse at 20% 50%, \${PALETTE[0]}40 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, \${PALETTE[1]}40 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, \${PALETTE[2]}40 0%, transparent 50%)\`, filter: 'blur(40px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>`,
    wrapperClose: `        </div>
      </div>`,
    helperCode: '',
  }),

  'hand-drawn-sketch': (intensity) => ({
    wrapperImport: '',
    wrapperOpen: `      <div style={{ position: 'relative' }}>
        {/* Hand-drawn sketch overlay */}
        <svg style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: ${(intensity * 0.004).toFixed(3)} }} width="100%" height="100%">
          <filter id="sketch"><feTurbulence type="turbulence" baseFrequency="0.02" numOctaves={3} /><feDisplacementMap in="SourceGraphic" scale="${Math.round(intensity * 0.15)}" /></filter>
        </svg>
        <div style={{ position: 'relative', zIndex: 1, filter: 'url(#sketch)' }}>`,
    wrapperClose: `        </div>
      </div>`,
    helperCode: '',
  }),
};
