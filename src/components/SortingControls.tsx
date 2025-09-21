import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ReviewProgressBar } from './ReviewProgressBar';
import { Eye, DollarSign, TrendingUp, Award } from 'lucide-react';

export type SortMetric = 'cpm' | 'views' | 'rate' | 'brand_fit';
export type SortOrder = 'best-to-worst' | 'worst-to-best';
export type NavigationTab = 'new' | 'undecided' | 'favorite' | 'passed';

interface SortingControlsProps {
  activeSortMetric: SortMetric;
  sortOrder: SortOrder;
  activeNavigationTab: NavigationTab;
  onSortMetricChange: (metric: SortMetric) => void;
  onSortOrderToggle: () => void;
  onNavigationTabChange: (tab: NavigationTab) => void;
  totalStart?: number;
  remainingCount?: number;
  isCompleted?: boolean;
  shouldPulse?: boolean;
}

export const SortingControls: React.FC<SortingControlsProps> = ({
  activeSortMetric,
  sortOrder,
  activeNavigationTab,
  onSortMetricChange,
  onSortOrderToggle,
  onNavigationTabChange,
  totalStart,
  remainingCount,
  isCompleted = false,
  shouldPulse = false
}) => {
  const handleSortMetricChange = (metric: SortMetric) => {
    // When a sorting button is clicked, auto-select 'new' tab
    if (activeNavigationTab !== 'new') {
      onNavigationTabChange('new');
    }
    onSortMetricChange(metric);
  };

  const handleNavigationTabChange = (tab: NavigationTab) => {
    onNavigationTabChange(tab);
  };

  const sortOptions = [
    {
      key: 'cpm' as SortMetric,
      label: 'Best CPM',
      icon: DollarSign,
      color: 'text-p600',
      bgColor: 'bg-p600 text-white',
      hoverBgColor: 'hover:bg-p500'
    },
    {
      key: 'views' as SortMetric,
      label: 'Most Views',
      icon: Eye,
      color: 'text-p500',
      bgColor: 'bg-p500 text-white',
      hoverBgColor: 'hover:bg-p400'
    },
    {
      key: 'rate' as SortMetric,
      label: 'Best Rate',
      icon: TrendingUp,
      color: 'text-p400',
      bgColor: 'bg-p400 text-white',
      hoverBgColor: 'hover:bg-p500'
    },
    {
      key: 'brand_fit' as SortMetric,
      label: 'Best Brand Fit',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600 text-white',
      hoverBgColor: 'hover:bg-purple-500'
    }
  ];

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg border-b border-p600/20">
      <div className="w-full px-4 py-6">
        <div className="relative flex items-center">
          {/* Navigation - Positioned to align with left side of card */}
          <div className="absolute left-4 flex gap-1 p-1 bg-gray-700/50 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigationTabChange('new')}
              className={`relative text-xs ${
                activeNavigationTab === 'new'
                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              New
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 bg-blue-100 text-blue-600 min-w-[1rem] h-4 text-xs border border-blue-600"
              >
                {remainingCount || 0}
              </Badge>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigationTabChange('undecided')}
              className={`relative text-xs ${
                activeNavigationTab === 'undecided'
                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Undecided
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 bg-p50 text-p600 min-w-[1rem] h-4 text-xs border border-p600"
              >
                234
              </Badge>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigationTabChange('favorite')}
              className={`relative text-xs ${
                activeNavigationTab === 'favorite'
                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Favorite
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 bg-p50 text-p500 min-w-[1rem] h-4 text-xs border border-p500"
              >
                12
              </Badge>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigationTabChange('passed')}
              className={`relative text-xs ${
                activeNavigationTab === 'passed'
                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Passed
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 bg-gray-100 text-gray-600 min-w-[1rem] h-4 text-xs"
              >
                45
              </Badge>
            </Button>
          </div>

          {/* Sort Metric Buttons - Centered over the card */}
          <div className="flex gap-3 justify-center w-full">
            {sortOptions.map((option, index) => {
              const isActive = activeSortMetric === option.key && activeNavigationTab === 'new';

              return (
                <motion.div
                  key={option.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => handleSortMetricChange(option.key)}
                    className={`relative transition-all duration-300 px-6 py-3 rounded-full font-semibold text-base ${
                      isActive
                        ? `${option.bgColor} shadow-xl transform scale-110`
                        : `bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600`
                    }`}
                  >
                    {option.label}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Countdown indicator - Positioned to align with right side of card */}
          <div className="absolute right-4 flex items-center gap-3">
            {remainingCount !== undefined && remainingCount >= 0 && (
              <motion.div
                className="bg-gradient-to-r from-p500 to-p600 text-white text-sm font-bold px-3 py-2 rounded-full shadow-lg border-2 border-white"
                initial={{ opacity: 0, scale: 0 }}
                animate={
                  shouldPulse
                    ? { opacity: 1, scale: [1, 1.15, 1] }
                    : { opacity: 1, scale: 1 }
                }
                transition={
                  shouldPulse
                    ? { duration: 0.14, ease: 'easeOut' }
                    : { delay: 0.6, type: "spring", stiffness: 400, damping: 15 }
                }
              >
                <span>
                  {remainingCount === 0 ? 'new creators added daily' : `${remainingCount} creators left`}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar - Below navigation controls */}
      {totalStart && remainingCount !== undefined && (
        <ReviewProgressBar
          totalStart={totalStart}
          remaining={remainingCount}
          isCompleted={isCompleted}
        />
      )}
    </div>
  );
};