'use client';

import { useRef, useEffect } from 'react';

interface Props {
  width: number;
  height: number;
  intensity: number;
  config: { spacing?: number; pulseSpeed?: number };
  palette: string[];
}

export default function AnimatedGrid({ width, height, intensity, config, palette }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spacing = config.spacing ?? 30;
    const pulseSpeed = config.pulseSpeed ?? 2;
    const color = palette[0] ?? '#6366F1';
    let t = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const baseAlpha = 0.06 * (intensity / 100);

      // Vertical lines
      for (let x = 0; x <= width; x += spacing) {
        const pulse = Math.sin(t * 0.01 * pulseSpeed + x * 0.02) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.strokeStyle = color;
        ctx.globalAlpha = baseAlpha + pulse * 0.04;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= height; y += spacing) {
        const pulse = Math.sin(t * 0.01 * pulseSpeed + y * 0.02) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.strokeStyle = color;
        ctx.globalAlpha = baseAlpha + pulse * 0.04;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      t++;
      animRef.current = requestAnimationFrame(draw);
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
    />
  );
}
