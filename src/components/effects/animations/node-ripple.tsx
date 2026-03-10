'use client';

import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  intensity: number;
  config: { radius?: number; duration?: number };
}

/** Graph-specific: concentric ripple on node hover. Applied via CSS custom properties. */
export default function NodeRipple({ children, intensity, config }: Props) {
  const radius = (config.radius ?? 30) * (intensity / 100);
  const duration = config.duration ?? 1.2;

  return (
    <div
      style={{
        '--node-ripple-radius': `${radius}px`,
        '--node-ripple-duration': `${duration}s`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
