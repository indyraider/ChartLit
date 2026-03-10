'use client';

import { useRef, useEffect } from 'react';

interface Props {
  width: number;
  height: number;
  intensity: number;
  config: { animate?: boolean };
  palette: string[];
}

export default function GradientMesh({ width, height, intensity, config, palette }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = config.animate ?? true;
    const blobs = palette.slice(0, 4).map((color, i) => ({
      x: width * (0.2 + (i % 2) * 0.6),
      y: height * (0.2 + Math.floor(i / 2) * 0.6),
      r: Math.min(width, height) * 0.4,
      color,
      phase: i * Math.PI / 2,
      speed: 0.005 + i * 0.002,
    }));

    let t = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (const b of blobs) {
        const offsetX = animate ? Math.sin(t * b.speed + b.phase) * 20 : 0;
        const offsetY = animate ? Math.cos(t * b.speed * 0.7 + b.phase) * 20 : 0;

        const gradient = ctx.createRadialGradient(
          b.x + offsetX, b.y + offsetY, 0,
          b.x + offsetX, b.y + offsetY, b.r,
        );
        gradient.addColorStop(0, b.color + '60');
        gradient.addColorStop(1, b.color + '00');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      t++;
      if (animate) {
        animRef.current = requestAnimationFrame(draw);
      }
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, intensity, config, palette]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0"
      style={{ opacity: (intensity / 100) * 0.6 }}
    />
  );
}
