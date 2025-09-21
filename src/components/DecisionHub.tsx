import React from 'react';
import { Button } from './ui/button';
import { X, Meh, Heart } from 'lucide-react';

interface DecisionHubProps {
  onDecision: (decision: 'pass' | 'maybe' | 'favorite') => void;
}

export const DecisionHub: React.FC<DecisionHubProps> = ({ onDecision }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-center">
        {/* Decision Buttons - Center Only */}
        <div className="flex justify-center gap-4">
          <Button
            variant="destructive"
            size="lg"
            onClick={() => onDecision('pass')}
            className="rounded-full h-16 w-16 bg-p600 hover:bg-p500 border-2 border-white"
          >
            <X className="h-8 w-8" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => onDecision('maybe')}
            className="rounded-full h-16 w-16 bg-p400 hover:bg-p500 text-white border-2 border-white"
          >
            <Meh className="h-8 w-8" />
          </Button>

          <Button
            variant="default"
            size="lg"
            onClick={() => onDecision('favorite')}
            className="gradient-button rounded-full h-16 w-16 border-2 border-white"
          >
            <Heart className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
};