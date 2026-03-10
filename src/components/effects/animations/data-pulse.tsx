'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  intensity: number;
  config: { bpm?: number; scale?: number };
}

export default function DataPulse({ children, intensity, config }: Props) {
  const bpm = config.bpm ?? 60;
  const maxScale = 1 + ((config.scale ?? 1.02) - 1) * (intensity / 100);
  const duration = 60 / bpm;

  return (
    <motion.div
      animate={{ scale: [1, maxScale, 1] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{ transformOrigin: 'center center' }}
    >
      {children}
    </motion.div>
  );
}
