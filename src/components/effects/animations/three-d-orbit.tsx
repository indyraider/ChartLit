'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  intensity: number;
  config: { speed?: number; radius?: number };
}

/** 3D orbit effect — continuous slow rotation. Uses CSS perspective + framer-motion. */
export default function ThreeDOrbit({ children, intensity, config }: Props) {
  const speed = config.speed ?? 0.3;
  const tilt = 5 * (intensity / 100);
  const duration = 20 / speed;

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        animate={{ rotateY: [0, 360] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ transformStyle: 'preserve-3d', rotateX: tilt }}
      >
        {children}
      </motion.div>
    </div>
  );
}
