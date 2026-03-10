'use client';

import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  intensity: number;
  config: { dashSpeed?: number; dashLength?: number };
}

/** Graph-specific: animated dashes along edges. Applied via CSS animation. */
export default function EdgeFlow({ children, intensity, config }: Props) {
  const speed = (config.dashSpeed ?? 30) * (intensity / 100);
  const dashLen = config.dashLength ?? 8;

  return (
    <div
      style={{
        // Inject CSS custom properties for graph renderers to pick up
        '--edge-flow-speed': `${speed}`,
        '--edge-flow-dash': `${dashLen}`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
