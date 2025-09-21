import React from 'react';
import { motion } from 'framer-motion';

interface UndecidedSummaryProps {
  totalPendingOffers: string;
  totalPendingViews: string;
  undecidedCount: number;
}

export const UndecidedSummary: React.FC<UndecidedSummaryProps> = ({
  totalPendingOffers,
  totalPendingViews,
  undecidedCount
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mx-4 mb-4 mt-2 p-6 bg-p200 rounded-xl border border-p600 shadow-lg"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Total Pending Offers */}
        <motion.div
          className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-p600"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="text-3xl font-bold color-p600 mb-1">
            {totalPendingOffers}
          </div>
          <div className="text-sm text-gray-600">
            Pending Offers
          </div>
        </motion.div>

        {/* Total Pending Views */}
        <motion.div
          className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-p600"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="text-3xl font-bold color-p600 mb-1">
            {totalPendingViews}
          </div>
          <div className="text-sm text-gray-600">
            Pending Views
          </div>
        </motion.div>

        {/* Undecided Count */}
        <motion.div
          className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-p600"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="text-3xl font-bold color-p600 mb-1">
            {undecidedCount}
          </div>
          <div className="text-sm text-gray-600">
            Undecided
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};