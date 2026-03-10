'use client';

interface Props {
  width: number;
  height: number;
  intensity: number;
  config: { blur?: number; opacity?: number };
}

export default function GlassMorphism({ width, height, intensity, config }: Props) {
  const blur = (config.blur ?? 12) * (intensity / 100);
  const opacity = (config.opacity ?? 0.15) * (intensity / 100);

  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-lg"
      style={{
        width,
        height,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        border: `1px solid rgba(255, 255, 255, ${opacity * 0.5})`,
      }}
    />
  );
}
