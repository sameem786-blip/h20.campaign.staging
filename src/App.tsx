import { useState, useEffect, useRef } from 'react';
import { SortingControls, SortMetric, SortOrder, NavigationTab } from './components/SortingControls';
import { CardStack } from './components/CardStack';
import { CreatorDossierCard } from './components/CreatorDossierCard';
import { ConfettiAnimation } from './components/ConfettiAnimation';
import { FavoritesSummary } from './components/FavoritesSummary';
import { PassedSummary } from './components/PassedSummary';
import { UndecidedSummary } from './components/UndecidedSummary';
import { ChatCanvas } from './components/ChatCanvas';
import { sampleCreator } from './data/sampleData';

function App() {
  const [sortMetric, setSortMetric] = useState<SortMetric>('cpm');
  const [sortOrder, setSortOrder] = useState<SortOrder>('best-to-worst');
  const [activeNavigationTab, setActiveNavigationTab] = useState<NavigationTab>('new');

  // Review session state
  const [totalStart] = useState(25); // Example: 25 creators to review
  const [remaining, setRemaining] = useState(25);
  const [shouldPulse, setShouldPulse] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [decisionTimes, setDecisionTimes] = useState<number[]>([]);
  const decisionStartTime = useRef<number>(Date.now());

  // Summary data (mock data)
  const favoritesSummaryData = {
    totalOffers: '$47K',
    totalViews: '2.1M',
    favoritesCount: 12
  };

  const passedSummaryData = {
    totalPassedOffers: '$89K',
    totalPassedViews: '4.7M',
    passedCount: 45
  };

  const undecidedSummaryData = {
    totalPendingOffers: '$156K',
    totalPendingViews: '8.3M',
    undecidedCount: 234
  };


  // Reset pulse after animation
  useEffect(() => {
    if (shouldPulse) {
      const timer = setTimeout(() => setShouldPulse(false), 140);
      return () => clearTimeout(timer);
    }
  }, [shouldPulse]);

  // Handle completion
  useEffect(() => {
    if (remaining === 0 && !isCompleted) {
      setIsCompleted(true);
      setShowConfetti(true);
      // Reset after completion animation
      const timer = setTimeout(() => {
        setIsCompleted(false);
        setShowConfetti(false);
        setRemaining(totalStart);
        setDecisionTimes([]);
        decisionStartTime.current = Date.now();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [remaining, isCompleted, totalStart]);

  const handleDecision = (decision: 'pass' | 'maybe' | 'favorite') => {
    // Record decision time
    const decisionTime = Date.now() - decisionStartTime.current;
    setDecisionTimes(prev => [...prev.slice(-9), decisionTime]); // Keep last 10 decisions

    // Update remaining count and trigger pulse
    if (remaining > 0) {
      setRemaining(prev => prev - 1);
      setShouldPulse(true);
    }

    // Reset timer for next decision
    decisionStartTime.current = Date.now();

    console.log(`Decision: ${decision}, Current sort: ${sortMetric} (${sortOrder}), Remaining: ${remaining - 1}`);
  };


  const handleSortMetricChange = (metric: SortMetric) => {
    setSortMetric(metric);
    console.log(`Sort metric changed to: ${metric}`);
    // In a real app, this would trigger a re-fetch/re-sort of creators
  };

  const handleSortOrderToggle = () => {
    const newOrder: SortOrder = sortOrder === 'best-to-worst' ? 'worst-to-best' : 'best-to-worst';
    setSortOrder(newOrder);
    console.log(`Sort order changed to: ${newOrder}`);
    // In a real app, this would trigger a re-order of the current creator list
  };

  const handleNavigationTabChange = (tab: NavigationTab) => {
    setActiveNavigationTab(tab);
    console.log(`Navigation tab changed to: ${tab}`);
    // In a real app, this would trigger a change in the creator list being displayed
  };

  const handleBuy = () => {
    console.log('Buy button clicked for', sampleCreator.handle);
    // Handle buy action
  };

  return (
    <div className="min-h-screen bg-p50 flex flex-col">
      {/* Sorting Controls - With progress bar and countdown pill */}
      <SortingControls
        activeSortMetric={sortMetric}
        sortOrder={sortOrder}
        activeNavigationTab={activeNavigationTab}
        onSortMetricChange={handleSortMetricChange}
        onSortOrderToggle={handleSortOrderToggle}
        onNavigationTabChange={handleNavigationTabChange}
        totalStart={totalStart}
        remainingCount={remaining}
        isCompleted={isCompleted}
        shouldPulse={shouldPulse}
      />

      {/* Main Content Area */}
      <div className="flex-1 pb-4 overflow-auto">
        {/* Favorites Summary - shown when favorites tab is active */}
        {activeNavigationTab === 'favorite' && (
          <>
            <FavoritesSummary
              totalOffers={favoritesSummaryData.totalOffers}
              totalViews={favoritesSummaryData.totalViews}
              favoritesCount={favoritesSummaryData.favoritesCount}
            />
            <ChatCanvas />
          </>
        )}

        {/* Passed Summary - shown when passed tab is active */}
        {activeNavigationTab === 'passed' && (
          <>
            <PassedSummary
              totalPassedOffers={passedSummaryData.totalPassedOffers}
              totalPassedViews={passedSummaryData.totalPassedViews}
              passedCount={passedSummaryData.passedCount}
            />
            <ChatCanvas />
          </>
        )}

        {/* Undecided Summary - shown when undecided tab is active */}
        {activeNavigationTab === 'undecided' && (
          <>
            <UndecidedSummary
              totalPendingOffers={undecidedSummaryData.totalPendingOffers}
              totalPendingViews={undecidedSummaryData.totalPendingViews}
              undecidedCount={undecidedSummaryData.undecidedCount}
            />
            <ChatCanvas />
          </>
        )}

        {/* Card Stack with Visual Depth */}
        <div className="px-4">
          <CardStack>
            <CreatorDossierCard
              creator={sampleCreator}
              onBuy={handleBuy}
              onDecision={handleDecision}
              activeSortMetric={sortMetric}
            />
          </CardStack>
        </div>
      </div>

      {/* Confetti Animation */}
      <ConfettiAnimation
        isActive={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
    </div>
  );
}

export default App;