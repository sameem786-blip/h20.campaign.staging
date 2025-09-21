import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Send, Bot, User, Code, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasArtifact?: boolean;
  artifactType?: 'chart' | 'analysis' | 'code';
}

interface ChatCanvasProps {
  className?: string;
}

const sampleMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'What\'s your budget?',
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: '2',
    role: 'user',
    content: 'I have $50,000 for this campaign',
    timestamp: new Date(Date.now() - 90000),
  },
  {
    id: '3',
    role: 'assistant',
    content: 'Perfect! Based on your $50K budget, I\'ve identified the best creators that fit your requirements and will maximize your campaign ROI.',
    timestamp: new Date(Date.now() - 60000),
    hasArtifact: true,
    artifactType: 'recommendations'
  }
];

export const ChatCanvas: React.FC<ChatCanvasProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(sampleMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand you want to analyze that data. Let me create a visualization for you.',
        timestamp: new Date(),
        hasArtifact: Math.random() > 0.5,
        artifactType: ['chart', 'analysis', 'code'][Math.floor(Math.random() * 3)] as any,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const recommendedCreators = [
    { name: 'athienor6', followers: '637K', cpm: '$0.13', niche: 'Gaming' },
    { name: 'techreview_pro', followers: '845K', cpm: '$0.18', niche: 'Tech' },
    { name: 'lifestyle_jane', followers: '425K', cpm: '$0.22', niche: 'Lifestyle' },
    { name: 'fitness_guru', followers: '1.2M', cpm: '$0.15', niche: 'Fitness' },
    { name: 'food_explorer', followers: '688K', cpm: '$0.19', niche: 'Food' },
    { name: 'travel_nomad', followers: '532K', cpm: '$0.21', niche: 'Travel' },
  ];

  const renderArtifact = (type: string) => {
    switch (type) {
      case 'recommendations':
        return (
          <div>
            <p className="text-sm text-gray-600 mb-4">Given your budget, here is who we recommend you work with</p>
            <div className="grid grid-cols-3 gap-3">
              {recommendedCreators.map((creator, index) => (
                <div key={creator.name} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{creator.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <h4 className="font-medium text-sm text-gray-900 mb-1">{creator.name}</h4>
                  <p className="text-xs text-gray-600 mb-1">{creator.followers} followers</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{creator.niche}</span>
                    <span className="font-semibold text-green-600">{creator.cpm}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'chart':
        return (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">CPM Distribution Chart</h3>
            </div>
            <div className="h-48 bg-white rounded-lg border border-blue-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <PieChart className="h-12 w-12 mx-auto mb-2 text-blue-400" />
                <p className="text-sm">Interactive chart would render here</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>$0.10 - $0.15:</span>
                    <span className="font-medium">5 creators</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>$0.16 - $0.20:</span>
                    <span className="font-medium">4 creators</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>$0.21+:</span>
                    <span className="font-medium">3 creators</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'analysis':
        return (
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Creator Analysis</h3>
            </div>
            <div className="space-y-3 text-sm text-green-800">
              <p><strong>Top Performer:</strong> Creator with 637K followers, $0.13 CPM</p>
              <p><strong>Best Value:</strong> High engagement rate at competitive pricing</p>
              <p><strong>Recommendation:</strong> Focus on gaming niche creators for best ROI</p>
            </div>
          </div>
        );
      case 'code':
        return (
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-900">Analysis Code</h3>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
              <div className="text-green-400"># Creator analysis script</div>
              <div className="text-blue-400">SELECT</div>
              <div className="ml-4 text-white">creator_name, cpm, followers</div>
              <div className="text-blue-400">FROM</div>
              <div className="ml-4 text-white">favorites</div>
              <div className="text-blue-400">ORDER BY</div>
              <div className="ml-4 text-white">cpm ASC;</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={cn("mx-4 mb-4 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-[600px]">
        {/* Chat Section - Left Side */}
        <div className="w-1/2 flex flex-col border-r border-gray-200">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Market Intelligence</h3>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
          >
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "rounded-2xl px-4 py-3 text-sm max-w-[75%]",
                    message.role === 'user'
                      ? "bg-blue-500 text-white ml-auto"
                      : "bg-gray-100 text-gray-900"
                  )}>
                    <p>{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[75%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Predetermined Prompts */}
          <div className="p-4 pb-2">
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => {
                  setInputMessage('Prioritizing Reach');
                  setTimeout(() => handleSendMessage(), 100);
                }}
                className="px-3 py-1.5 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
              >
                Prioritizing Reach
              </button>
              <button
                onClick={() => {
                  setInputMessage("I'm launching on iOS");
                  setTimeout(() => handleSendMessage(), 100);
                }}
                className="px-3 py-1.5 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
              >
                I'm launching on iOS
              </button>
              <button
                onClick={() => {
                  setInputMessage('I want to drive traffic to my website');
                  setTimeout(() => handleSendMessage(), 100);
                }}
                className="px-3 py-1.5 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
              >
                I want to drive traffic to my website
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your campaign budget..."
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                size="sm"
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas/Results Section - Right Side */}
        <div className="w-1/2 flex flex-col">
          {/* Canvas Header */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recommendations</h3>
          </div>

          {/* Canvas Content */}
          <div className="flex-1 p-4 bg-gray-50/30 overflow-y-auto">
            <div className="space-y-4">
              {messages.filter(m => m.hasArtifact).map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {renderArtifact(message.artifactType || 'chart')}
                </motion.div>
              ))}

              {messages.filter(m => m.hasArtifact).length === 0 && (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm">Share your budget to get recommendations</p>
                    <p className="text-xs text-gray-400 mt-2">Creator recommendations will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};