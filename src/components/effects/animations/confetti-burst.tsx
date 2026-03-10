'use client';

import { useEffect, useRef } from 'react';

interface Props {
  width: number;
  height: number;
  intensity: number;
  config: { count?: number; spread?: number };
  palette: string[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  w: number;
  h: number;
  color: string;
  life: number;
  maxLife: number;
}

export default function ConfettiBurst({ width, height, intensity, config, palette }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const count = Math.round((config.count ?? 40) * (intensity / 100));
    const spread = config.spread ?? 60;

    const particles: Particle[] = Array.from({ length: count }, () => {
      const angle = (Math.random() - 0.5) * (spread / 30) * Math.PI;
      const speed = 3 + Math.random() * 5;
      return {
        x: width / 2,
        y: height / 2,
        vx: Math.sin(angle) * speed,
        vy: -Math.cos(angle) * speed - 2,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        w: 4 + Math.random() * 4,
        h: 6 + Math.random() * 6,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 0,
        maxLife: 80 + Math.random() * 40,
      };
    });

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      for (const p of particles) {
        if (p.life >= p.maxLife) continue;
        alive = true;
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.rotation += p.rotSpeed;
        p.vx *= 0.99;

        const alpha = 1 - p.life / p.maxLife;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      ctx.globalAlpha = 1;
      if (alive) {
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
    />
  );
}
