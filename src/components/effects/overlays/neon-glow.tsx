'use client';

import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  intensity: number;
  config: { blurRadius?: number; brightness?: number };
  palette: string[];
}

export default function NeonGlow({ children, intensity, config, palette }: Props) {
  const blur = (config.blurRadius ?? 12) * (intensity / 100);
  const brightness = 1 + ((config.brightness ?? 1.3) - 1) * (intensity / 100);
  const color = palette[0] ?? '#6366F1';

  return (
    <div className="relative">
      <div
        style={{
          filter: `brightness(${brightness}) drop-shadow(0 0 ${blur}px ${color}) drop-shadow(0 0 ${blur * 2}px ${color}40)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
