import React from 'react';
import { motion } from 'framer-motion';

interface CardStackProps {
  children: React.ReactNode;
}

export const CardStack: React.FC<CardStackProps> = ({ children }) => {
  return (
    <div className="relative">
      {/* Card Stack - Multiple layers with proper Tinder-style stacking */}

      {/* Bottom card (4th layer) */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-white shadow-2xl transform translate-y-6 translate-x-3 scale-95 z-10"
        initial={{ opacity: 0, y: 24, x: 12, scale: 0.9 }}
        animate={{ opacity: 0.3, y: 24, x: 12, scale: 0.95 }}
        transition={{ delay: 0.1 }}
        style={{
          filter: 'blur(1px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      />

      {/* Third card */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-white shadow-2xl transform translate-y-4 translate-x-2 scale-97 z-20"
        initial={{ opacity: 0, y: 16, x: 8, scale: 0.92 }}
        animate={{ opacity: 0.5, y: 16, x: 8, scale: 0.97 }}
        transition={{ delay: 0.2 }}
        style={{
          filter: 'blur(0.5px)',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.2)'
        }}
      />

      {/* Second card */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-white shadow-2xl transform translate-y-2 translate-x-1 scale-99 z-30"
        initial={{ opacity: 0, y: 8, x: 4, scale: 0.94 }}
        animate={{ opacity: 0.7, y: 8, x: 4, scale: 0.99 }}
        transition={{ delay: 0.3 }}
        style={{
          boxShadow: '0 15px 30px -12px rgba(0, 0, 0, 0.15)'
        }}
      />

      {/* Main card (top) */}
      <motion.div
        className="relative z-40"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 25 }}
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {children}
      </motion.div>

    </div>
  );
};