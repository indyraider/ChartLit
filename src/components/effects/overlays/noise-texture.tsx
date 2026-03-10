'use client';

import { useId } from 'react';

interface Props {
  width: number;
  height: number;
  intensity: number;
  config: { frequency?: number; opacity?: number };
}

export default function NoiseTexture({ width, height, intensity, config }: Props) {
  const id = useId();
  const filterId = `noise-${id}`;
  const freq = config.frequency ?? 0.65;
  const opacity = (config.opacity ?? 0.12) * (intensity / 100);

  return (
    <svg
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0"
      style={{ opacity, mixBlendMode: 'overlay' }}
    >
      <defs>
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={freq}
            numOctaves={4}
            stitchTiles="stitch"
          />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  );
}
