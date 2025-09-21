import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewProgressBarProps {
  totalStart: number;
  remaining: number;
  isCompleted?: boolean;
}

export const ReviewProgressBar: React.FC<ReviewProgressBarProps> = ({
  totalStart,
  remaining,
  isCompleted = false
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const percent = totalStart > 0 ? Math.max(0, 1 - remaining / totalStart) : 0;
  const isNearEnd = remaining <= 3 && remaining > 0;

  useEffect(() => {
    if (isCompleted) {
      // Show completion animation then fade out
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isCompleted]);

  if (!isVisible && !isCompleted) return null;

  return (
    <AnimatePresence>
      {(isVisible || isCompleted) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gray-800 border-t border-gray-700"
        >
          <div className="relative h-2">
            {/* Background bar */}
            <div className="absolute inset-0 bg-gray-600" />

            {/* Progress bar */}
            <motion.div
              className={`absolute left-0 top-0 h-full transition-colors duration-300 ${
                isNearEnd
                  ? 'bg-orange-500'
                  : isCompleted
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              }`}
              style={{
                height: isNearEnd ? '3px' : '2px',
                top: isNearEnd ? '-0.5px' : '0px'
              }}
              initial={{ width: 0 }}
              animate={{
                width: isCompleted ? '100%' : `${percent * 100}%`
              }}
              transition={{
                duration: isCompleted ? 0.4 : 0.3,
                ease: 'easeOut'
              }}
            />
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};