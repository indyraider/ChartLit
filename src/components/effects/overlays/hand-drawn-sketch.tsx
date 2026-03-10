'use client';

interface Props {
  width: number;
  height: number;
  intensity: number;
  config: { roughness?: number; seed?: number };
}

export default function HandDrawnSketch({ width, height, intensity, config }: Props) {
  const roughness = (config.roughness ?? 2) * (intensity / 100);
  const seed = config.seed ?? 42;
  const opacity = Math.min(intensity / 100, 0.6);

  return (
    <svg
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0"
      style={{ opacity, mixBlendMode: 'overlay' }}
    >
      <defs>
        <filter id={`sketch-${seed}`}>
          <feTurbulence
            type="turbulence"
            baseFrequency={0.02}
            numOctaves={3}
            seed={seed}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={roughness * 3}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="none"
        stroke="rgba(148,163,184,0.15)"
        strokeWidth={1}
        filter={`url(#sketch-${seed})`}
      />
    </svg>
  );
}
