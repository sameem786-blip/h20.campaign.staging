import React from 'react';
import { motion } from 'framer-motion';

interface FavoritesSummaryProps {
  totalOffers: string;
  totalViews: string;
  favoritesCount: number;
}

export const FavoritesSummary: React.FC<FavoritesSummaryProps> = ({
  totalOffers,
  totalViews,
  favoritesCount
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mx-4 mb-4 p-6 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-xl border border-pink-200 shadow-lg"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Total Offers */}
        <motion.div
          className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-green-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="text-3xl font-bold text-green-600 mb-1">
            {totalOffers}
          </div>
          <div className="text-sm text-gray-600">
            Total Offers
          </div>
        </motion.div>

        {/* Total Views */}
        <motion.div
          className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-blue-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {totalViews}
          </div>
          <div className="text-sm text-gray-600">
            Total Views
          </div>
        </motion.div>

        {/* Favorites Count */}
        <motion.div
          className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-pink-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="text-3xl font-bold text-pink-600 mb-1">
            {favoritesCount}
          </div>
          <div className="text-sm text-gray-600">
            Favorites
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};