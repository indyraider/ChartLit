'use client';

import { useId } from 'react';

interface Props {
  width: number;
  height: number;
  intensity: number;
  config: { spread?: number; opacity?: number };
  palette: string[];
}

export default function WatercolorBleed({ width, height, intensity, config, palette }: Props) {
  const id = useId();
  const filterId = `watercolor-${id}`;
  const spread = config.spread ?? 20;
  const opacity = (config.opacity ?? 0.3) * (intensity / 100);

  return (
    <svg
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0"
      style={{ opacity }}
    >
      <defs>
        <filter id={filterId}>
          <feGaussianBlur stdDeviation={spread} />
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={3} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={spread * 0.8} />
        </filter>
      </defs>
      {palette.slice(0, 3).map((color, i) => (
        <ellipse
          key={i}
          cx={width * (0.2 + i * 0.3)}
          cy={height * (0.3 + (i % 2) * 0.4)}
          rx={width * 0.25}
          ry={height * 0.3}
          fill={color}
          filter={`url(#${filterId})`}
          opacity={0.4}
        />
      ))}
    </svg>
  );
}
