import React from 'react';
import { ProgressData } from '../types/creator';

interface ProgressIndicatorProps {
  progress: ProgressData;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ progress }) => {
  return (
    <div className="w-full flex justify-center py-4">
      <div className="text-lg font-medium text-muted-foreground">
        Card {progress.current} of {progress.total}
      </div>
    </div>
  );
};