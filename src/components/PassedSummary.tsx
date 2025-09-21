import React from 'react';
import { motion } from 'framer-motion';

interface PassedSummaryProps {
  totalPassedOffers: string;
  totalPassedViews: string;
  passedCount: number;
}

export const PassedSummary: React.FC<PassedSummaryProps> = ({
  totalPassedOffers,
  totalPassedViews,
  passedCount
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mx-4 mb-4 p-6 bg-gradient-to-r from-gray-50 via-red-50 to-orange-50 rounded-xl border border-gray-300 shadow-lg"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Total Passed Offers */}
        <motion.div
          className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-red-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="text-3xl font-bold text-red-600 mb-1">
            {totalPassedOffers}
          </div>
          <div className="text-sm text-gray-600">
            Passed Offers
          </div>
        </motion.div>

        {/* Total Passed Views */}
        <motion.div
          className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-orange-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {totalPassedViews}
          </div>
          <div className="text-sm text-gray-600">
            Passed Views
          </div>
        </motion.div>

        {/* Passed Count */}
        <motion.div
          className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-300"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="text-3xl font-bold text-gray-600 mb-1">
            {passedCount}
          </div>
          <div className="text-sm text-gray-600">
            Passed
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};