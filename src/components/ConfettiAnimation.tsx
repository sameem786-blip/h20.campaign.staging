import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  isActive,
  onComplete
}) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    if (isActive) {
      const pieces: ConfettiPiece[] = [];
      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -20,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5
        });
      }
      setConfetti(pieces);

      // Clear confetti after animation
      const timer = setTimeout(() => {
        setConfetti([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: piece.color,
                left: piece.x,
                top: piece.y
              }}
              initial={{
                y: -20,
                rotation: piece.rotation,
                scale: piece.scale,
                opacity: 1
              }}
              animate={{
                y: window.innerHeight + 20,
                rotation: piece.rotation + 720,
                opacity: 0
              }}
              transition={{
                duration: 3,
                ease: 'easeIn',
                delay: Math.random() * 0.5
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};