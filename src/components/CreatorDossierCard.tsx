import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo, useAnimation } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ChevronDown, ShoppingCart, MessageCircle, Send, Heart, X as XIcon, Meh } from 'lucide-react';
import { Creator } from '../types/creator';
import { cn } from '@/lib/utils';

interface CreatorDossierCardProps {
  creator: Creator;
  onBuy: () => void;
  onDecision: (decision: 'pass' | 'maybe' | 'favorite') => void;
  activeSortMetric: 'cpm' | 'views' | 'rate';
}

export const CreatorDossierCard: React.FC<CreatorDossierCardProps> = ({
  creator,
  onBuy,
  onDecision,
  activeSortMetric
}) => {
  const [showConversations, setShowConversations] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-30, 0, 30]);
  const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0, 0.5, 1, 0.5, 0]);
  const cardControls = useAnimation();

  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = async (_event: any, info: PanInfo) => {
    const threshold = 150;
    setIsDragging(false);

    if (Math.abs(info.offset.x) > threshold && !isTransitioning) {
      // Determine which decision based on drag direction
      const decision = info.offset.x > 0 ? 'favorite' : 'pass';
      handleDecisionClick(decision);
    } else {
      // Snap back to center smoothly if not swiped far enough
      await cardControls.start({
        x: 0,
        rotate: 0,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25
        }
      });
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    console.log('Sending message to', creator.handle, ':', chatMessage);
    setChatMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleDecisionClick = async (decision: 'pass' | 'maybe' | 'favorite') => {
    if (isTransitioning) return; // Prevent multiple clicks during transition

    setIsTransitioning(true);

    // Determine slide direction and rotation based on decision
    const slideDirection = decision === 'pass' ? -1000 : decision === 'favorite' ? 1000 : -1000;
    const rotationDirection = decision === 'pass' ? -45 : decision === 'favorite' ? 45 : -30;

    try {
      // Animate current card out with smooth Tinder-like motion
      await cardControls.start({
        x: slideDirection,
        rotate: rotationDirection,
        opacity: 0,
        scale: 0.8,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.5
        }
      });

      // Call the original decision handler
      onDecision(decision);

      // Reset position instantly (off-screen) for next card
      cardControls.set({
        x: 0,
        rotate: 0,
        opacity: 1,
        scale: 1
      });

      // Reset conversation state for new card
      setShowConversations(false);
      setChatMessage('');

      // Animate the new card in with a subtle entrance
      await cardControls.start({
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.2,
          ease: "easeOut"
        }
      });

    } catch (error) {
      console.log('Animation cancelled or interrupted');
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col perspective-1000 relative overflow-hidden">
      {/* Card stack - multiple cards underneath for depth */}
      {[2, 1, 0].map((depth) => (
        <motion.div
          key={depth}
          className="absolute inset-0 mx-4 my-4"
          style={{
            zIndex: depth === 0 ? 10 : 5 - depth,
            scale: 1 - (depth * 0.02),
            y: depth * 8,
            opacity: depth === 0 ? 1 : 0.8 - (depth * 0.2)
          }}
        >
          {depth === 0 ? (
            // Top card - fully interactive
            <motion.div
              ref={cardRef}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              style={{ x, rotate }}
              animate={cardControls}
              className={cn(
                "cursor-grab active:cursor-grabbing h-full w-full",
                isDragging && "z-20"
              )}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <Card className="shadow-2xl border-2 border-gray-100 overflow-hidden bg-gradient-to-br from-white via-white to-gray-50 h-full flex flex-col relative">
                {/* Drag feedback overlays */}
                <motion.div
                  className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-30 pointer-events-none"
                  style={{
                    opacity: useTransform(x, [-300, -100, 0], [1, 0.3, 0])
                  }}
                >
                  <div className="text-6xl text-red-500 font-bold transform -rotate-12">
                    PASS
                  </div>
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-30 pointer-events-none"
                  style={{
                    opacity: useTransform(x, [0, 100, 300], [0, 0.3, 1])
                  }}
                >
                  <div className="text-6xl text-green-500 font-bold transform rotate-12">
                    LIKE
                  </div>
                </motion.div>

                {/* Top Section - Creator + Videos + Stats */}
                <div className="flex flex-1">
                  {/* Left Side - Creator Info & Key Metrics */}
                  <div className="w-1/2 p-8 flex flex-col overflow-hidden">
                    {/* Creator Header */}
                    <div className="flex items-center gap-6 mb-8">
                      <motion.img
                        src={creator.avatar}
                        alt={creator.handle}
                        className="w-20 h-20 rounded-full object-cover shadow-lg ring-4 ring-white"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      />
                      <div className="flex-1">
                        <motion.h2
                          className="text-3xl font-bold text-gray-900 mb-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          {creator.handle}
                        </motion.h2>
                        <motion.p
                          className="text-xl text-gray-600"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {creator.metrics.detailed.followers} followers
                        </motion.p>
                        <motion.p
                          className="text-lg text-gray-500"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          YouTube
                        </motion.p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={onBuy}
                          size="lg"
                          className="gradient-button text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
                        >
                          <ShoppingCart className="h-6 w-6 mr-3" />
                          Buy Now
                        </Button>
                      </motion.div>
                    </div>

                    {/* Key Metrics - Reordered based on active sort metric */}
                    <motion.div
                      className="grid grid-cols-4 gap-4 mb-8"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {(() => {
                        const allMetrics = [
                          { key: 'views', value: creator.metrics.summary.views.amount, label: "Views", rank: creator.metrics.summary.views.rank, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
                          { key: 'rate', value: creator.metrics.summary.rate.amount, label: "Rate", rank: creator.metrics.summary.rate.rank, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
                          { key: 'cpm', value: creator.metrics.summary.cpm.amount, label: "CPM", rank: creator.metrics.summary.cpm.rank, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
                          { key: 'brand_fit', value: creator.metrics.detailed.brand_fit, label: "Brand Fit", rank: "N/A", color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" }
                        ];

                        // Find the active metric and move it to the front
                        const activeMetric = allMetrics.find(m => m.key === activeSortMetric);
                        const otherMetrics = allMetrics.filter(m => m.key !== activeSortMetric);
                        const orderedMetrics = activeMetric ? [activeMetric, ...otherMetrics] : allMetrics;

                        return orderedMetrics.map((metric, index) => {
                          const isActive = metric.key === activeSortMetric;

                          return (
                            <motion.div
                              key={metric.label}
                              className={`text-center p-3 rounded-xl backdrop-blur shadow-md transition-all duration-300 ${
                                isActive
                                  ? `${metric.bgColor} ${metric.borderColor} border-2 shadow-lg transform scale-105`
                                  : 'bg-white/80 border border-gray-200'
                              }`}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className={`text-2xl font-bold ${metric.color} mb-1`}>
                                {metric.value}
                              </div>
                              <div className={`text-sm mb-1 ${isActive ? 'text-gray-800 font-semibold' : 'text-gray-600'}`}>
                                {metric.label}
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isActive
                                  ? `${metric.color} bg-white shadow-sm`
                                  : 'text-gray-500 bg-gray-100'
                              }`}>
                                {metric.rank === "N/A" ? "N/A" : `Rank #${metric.rank}`}
                              </div>
                            </motion.div>
                          );
                        });
                      })()}
                    </motion.div>

                    {/* Channel Description */}
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                        YouTube channel focused almost entirely on Minecraft gameplay Shorts with frequent, high-view highlight-style videos and 915K subscribers, signaling a clear gaming focus and credible reach for partnerships.
                      </p>
                    </motion.div>

                    {/* Recent Videos - Moved from right side */}
                    <motion.div
                      className="mb-8"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                    >
                      <h3 className="text-2xl font-semibold mb-6">Recent Videos</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {creator.videos.slice(0, 3).map((video, index) => (
                          <motion.div
                            key={video.id}
                            className="space-y-3"
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="relative overflow-hidden rounded-lg">
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full aspect-square object-cover"
                              />
                            </div>
                            <h4 className="font-medium text-sm line-clamp-2">
                              {video.title}
                            </h4>
                            <p className="text-xs text-gray-500">{video.views} views</p>
                            <p className="text-xs text-gray-500">{video.posted}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>


                  </div>

                  {/* Right Side - Stats, Rate Packages */}
                  <div className="w-1/2 p-8 bg-gray-50/50 flex flex-col">
                    {/* Detailed Stats */}
                    <motion.div
                      className="mb-8"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h3 className="text-2xl font-semibold mb-2">Video Performance</h3>
                      <p className="text-sm text-gray-500 mb-6">Data from YouTube</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {[
                          { label: "Median Views", value: creator.metrics.detailed.median_views },
                          { label: "Mean Views", value: creator.metrics.detailed.mean_views },
                          { label: "Most Viewed", value: creator.metrics.detailed.most_viewed },
                          { label: "Total Views", value: creator.metrics.detailed.total_views }
                        ].map((stat, index) => (
                          <motion.div
                            key={stat.label}
                            className="bg-gradient-to-br from-white to-gray-100 p-4 rounded-lg border border-gray-200"
                            transition={{ delay: index * 0.05 }}
                          >
                            <span className="text-gray-600 text-sm block mb-1">{stat.label}:</span>
                            <span className="font-medium text-lg">
                              {stat.value}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Rate Packages */}
                    <motion.div
                      className="mb-8"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h3 className="text-2xl font-semibold mb-4">Rate Packages</h3>
                      <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
                        {creator.rates.status}
                      </Badge>
                      <div className="grid grid-cols-2 gap-4">
                        {creator.rates.packages.slice(0, 2).map((pkg, index) => (
                          <motion.div
                            key={index}
                            className="border-2 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white border-gray-200"
                            transition={{ delay: index * 0.1 }}
                          >
                            <h4 className="font-medium text-gray-900 mb-2 text-lg">{pkg.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                            <p className="text-2xl font-bold text-green-600">
                              {pkg.price}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Chat Interface */}
                    <motion.div
                      className="mb-8"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 }}
                    >
                      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <MessageCircle className="h-5 w-5 text-gray-500" />
                          <Input
                            placeholder={`Message ${creator.handle}...`}
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 border-gray-300 focus:border-p500 focus:ring-p500"
                          />
                          <Button
                            onClick={handleSendMessage}
                            className="gradient-button px-4 py-2"
                            disabled={!chatMessage.trim()}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>

                    {/* Conversation History */}
                    <motion.div
                      className="flex-1 min-h-0 mt-4"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.75 }}
                    >
                      <button
                        onClick={() => setShowConversations(!showConversations)}
                        className="w-full flex items-center justify-between gap-4 p-4 hover:bg-gray-50 transition-colors rounded-lg mb-4"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold">Conversation History</h3>
                          <Badge variant="secondary" className="text-sm">
                            {creator.conversation.history.length} messages
                          </Badge>
                        </div>
                        <motion.div
                          animate={{ rotate: showConversations ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {showConversations && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="h-32 overflow-y-auto space-y-3 pr-2">
                              {creator.conversation.history.map((message, index) => (
                                <div
                                  key={index}
                                  className={cn(
                                    "p-4 rounded-lg shadow-sm max-w-[70%]",
                                    message.author === "Our Team"
                                      ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-900 ml-auto"
                                      : "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900"
                                  )}
                                >
                                  <div className="text-xs text-gray-500 mb-2">
                                    {message.author} • {message.timestamp}
                                  </div>
                                  <p className="text-sm leading-relaxed">{message.body}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </div>

                {/* Action Buttons - Centered at bottom */}
                <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-10">
                  <motion.div
                    className="flex gap-6 bg-white/20 backdrop-blur-md rounded-full px-8 py-4 shadow-lg border border-white/30"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="text-center">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleDecisionClick('pass')}
                        disabled={isTransitioning}
                        className={`rounded-full h-16 w-16 p-0 bg-red-500 hover:bg-red-400 text-white border-white shadow-md mb-2 transition-all duration-200 ${
                          isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                        }`}
                      >
                        <XIcon className="h-7 w-7" />
                      </Button>
                      <p className="text-sm text-gray-600">Pass</p>
                    </div>
                    <div className="text-center">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleDecisionClick('maybe')}
                        disabled={isTransitioning}
                        className={`rounded-full h-16 w-16 p-0 bg-yellow-500 hover:bg-yellow-400 text-white border-white shadow-md mb-2 transition-all duration-200 ${
                          isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                        }`}
                      >
                        <Meh className="h-7 w-7" />
                      </Button>
                      <p className="text-sm text-gray-600">Not Sure</p>
                    </div>
                    <div className="text-center">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleDecisionClick('favorite')}
                        disabled={isTransitioning}
                        className={`rounded-full h-16 w-16 p-0 gradient-button border-white shadow-md mb-2 transition-all duration-200 ${
                          isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                        }`}
                      >
                        <Heart className="h-7 w-7" />
                      </Button>
                      <p className="text-sm text-gray-600">Favorite</p>
                    </div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ) : (
            // Background cards - static for depth effect
            <div className="h-full w-full">
              <Card className="shadow-xl border-2 border-gray-200 overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 h-full flex flex-col">
                <div className="flex flex-1">
                  <div className="w-1/2 p-8 flex flex-col">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-20 h-20 rounded-full bg-gray-300 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-8 bg-gray-300 rounded animate-pulse mb-2"></div>
                        <div className="h-6 bg-gray-300 rounded animate-pulse w-2/3"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="text-center p-6 rounded-xl bg-gray-200/50 backdrop-blur">
                          <div className="h-10 bg-gray-300 rounded animate-pulse mb-2"></div>
                          <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-1/2 p-8 bg-gray-100/50 flex flex-col">
                    <div className="mb-8">
                      <div className="h-8 bg-gray-300 rounded animate-pulse mb-4"></div>
                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-20 bg-gray-300 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};