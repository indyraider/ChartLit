'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  intensity: number;
  config: { amplitude?: number; duration?: number };
}

export default function ParallaxFloat({ children, intensity, config }: Props) {
  const amplitude = (config.amplitude ?? 6) * (intensity / 100);
  const duration = config.duration ?? 4;

  return (
    <motion.div
      animate={{ y: [0, -amplitude, 0, amplitude, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}
