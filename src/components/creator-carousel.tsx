'use client';

import React, { useRef, useState } from 'react';
import { Creator } from '@/types/creator';
import { CreatorCard } from './creator-card';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"

type CreatorCarouselProps = {
  creators: Creator[];
  loading: boolean;
};

export function CreatorCarousel({ creators, loading }: CreatorCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }
  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="text-center p-12 text-gray-500">
        No creators found for this campaign and stage
      </div>
    );
  }

  const nextCreator = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % creators.length)
  }

  const prevCreator = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + creators.length) % creators.length)
  }

  const goToCreator = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  return (
    <div className="relative w-full mx-auto mb-8">
        <div className="relative h-[600px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
              }}
              className="absolute inset-0"
            >
              <CreatorCard creator={creators[currentIndex]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center items-center gap-6 mt-8">
          <motion.button
            onClick={prevCreator}
            disabled={creators.length <= 1}
            className="p-3 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            whileHover={{ scale: creators.length > 1 ? 1.1 : 1 }}
            whileTap={{ scale: creators.length > 1 ? 0.95 : 1 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          {/* Dots Indicator */}
          {/* <div className="flex gap-3">
            {creators.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToCreator(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? "bg-blue-600 scale-125" : "bg-gray-300 hover:bg-gray-400"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div> */}

          <motion.button
            onClick={nextCreator}
            disabled={creators.length <= 1}
            className="p-3 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            whileHover={{ scale: creators.length > 1 ? 1.1 : 1 }}
            whileTap={{ scale: creators.length > 1 ? 0.95 : 1 }}
          >
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
  );
} 