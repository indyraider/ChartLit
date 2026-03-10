'use client';

interface Props {
  width: number;
  height: number;
  intensity: number;
  config: { gap?: number; opacity?: number };
}

export default function ScanLines({ width, height, intensity, config }: Props) {
  const gap = config.gap ?? 3;
  const opacity = (config.opacity ?? 0.08) * (intensity / 100);

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        width,
        height,
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent ${gap}px,
          rgba(0, 0, 0, ${opacity}) ${gap}px,
          rgba(0, 0, 0, ${opacity}) ${gap + 1}px
        )`,
      }}
    />
  );
}
