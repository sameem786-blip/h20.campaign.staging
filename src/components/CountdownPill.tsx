import React from 'react';
import { motion } from 'framer-motion';

interface CountdownPillProps {
  remaining: number;
  shouldPulse?: boolean;
}

export const CountdownPill: React.FC<CountdownPillProps> = ({
  remaining,
  shouldPulse = false
}) => {
  if (remaining < 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50">
      <motion.div
        className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg border-2 border-white"
        animate={shouldPulse ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.14, ease: 'easeOut' }}
      >
        {remaining === 0 ? 'Done' : `${remaining} left`}
      </motion.div>
    </div>
  );
};