import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { SortOrder } from './SortingControls';

interface SortOrderToggleProps {
  sortOrder: SortOrder;
  onToggle: () => void;
}

export const SortOrderToggle: React.FC<SortOrderToggleProps> = ({
  sortOrder,
  onToggle
}) => {
  const getOrderText = () => {
    return sortOrder === 'best-to-worst' ? 'Best First' : 'Worst First';
  };

  const getOrderIcon = () => {
    return sortOrder === 'best-to-worst' ? ArrowDown : ArrowUp;
  };

  return (
    <motion.div
      className="mb-4 flex justify-end"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 text-xs"
      >
        <span className="text-gray-500">{getOrderText()}</span>
        <motion.div
          animate={{ rotate: sortOrder === 'best-to-worst' ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {React.createElement(getOrderIcon(), { className: "h-3 w-3 text-gray-400" })}
        </motion.div>
      </Button>
    </motion.div>
  );
};