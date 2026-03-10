'use client';

import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  intensity: number;
  config: { rotateX?: number; rotateY?: number; depth?: number };
}

export default function ThreeDPerspective({ children, intensity, config }: Props) {
  const scale = intensity / 100;
  const rotateX = (config.rotateX ?? 8) * scale;
  const rotateY = (config.rotateY ?? -4) * scale;
  const depth = (config.depth ?? 40) * scale;

  return (
    <div style={{ perspective: 800 }}>
      <div
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          boxShadow: `0 ${depth}px ${depth * 1.5}px rgba(0,0,0,0.3)`,
          transition: 'transform 0.3s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
}
