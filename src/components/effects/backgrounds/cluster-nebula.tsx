'use client';

interface Props {
  width: number;
  height: number;
  intensity: number;
  config: { blur?: number; opacity?: number };
  palette: string[];
}

export default function ClusterNebula({ width, height, intensity, config, palette }: Props) {
  const blur = config.blur ?? 60;
  const opacity = (config.opacity ?? 0.25) * (intensity / 100);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity }}>
      {palette.slice(0, 4).map((color, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.min(width, height) * 0.5,
            height: Math.min(width, height) * 0.5,
            left: `${15 + (i % 2) * 50}%`,
            top: `${15 + Math.floor(i / 2) * 50}%`,
            background: `radial-gradient(circle, ${color}80, transparent 70%)`,
            filter: `blur(${blur}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}
