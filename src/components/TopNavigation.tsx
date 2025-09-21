import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface TopNavigationProps {
  activeFilter: 'undecided' | 'favorite' | 'passed';
  onFilterChange: (filter: 'undecided' | 'favorite' | 'passed') => void;
  counts: {
    undecided: number;
    favorite: number;
    passed: number;
  };
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeFilter,
  onFilterChange,
  counts
}) => {
  return (
    <div className="border-b bg-background sticky top-0 z-40">
      <div className="flex items-center justify-between py-4 px-4 max-w-6xl mx-auto">
        {/* Main Filter Tabs - Prominent center position */}
        <div className="flex-1 flex justify-center">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <div className="relative">
              <Button
                variant={activeFilter === 'undecided' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onFilterChange('undecided')}
                className="relative pr-8"
              >
                Undecided
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 bg-blue-100 text-blue-800 min-w-[1.2rem] h-5 text-xs"
                >
                  {counts.undecided}
                </Badge>
              </Button>
            </div>

            <div className="relative">
              <Button
                variant={activeFilter === 'favorite' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onFilterChange('favorite')}
                className="relative pr-8"
              >
                Favorite
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 bg-purple-100 text-purple-800 min-w-[1.2rem] h-5 text-xs"
                >
                  {counts.favorite}
                </Badge>
              </Button>
            </div>
          </div>
        </div>

        {/* Passed - Less prominent right position */}
        <div className="relative">
          <Button
            variant={activeFilter === 'passed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange('passed')}
            className="relative pr-8 text-gray-600 hover:text-gray-900"
          >
            Passed
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 bg-gray-100 text-gray-600 min-w-[1.2rem] h-5 text-xs"
            >
              {counts.passed}
            </Badge>
          </Button>
        </div>
      </div>
    </div>
  );
};