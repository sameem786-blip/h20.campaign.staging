"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { Creator } from "@/types/creator"
import { CreatorCard } from "@/components/creator-card"

interface PremiumTestimonialsProps {
  creators: Creator[]
}

export function PremiumTestimonials({ creators }: PremiumTestimonialsProps) {
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
    <div className="relative">
      {/* Main Creator Display */}
      <div className="relative max-w-6xl mx-auto mb-8">
        <div className="relative h-[500px]">
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
            className="p-3 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: creators.length > 1 ? 1.1 : 1 }}
            whileTap={{ scale: creators.length > 1 ? 0.95 : 1 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          {/* Dots Indicator */}
          <div className="flex gap-3">
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
          </div>

          <motion.button
            onClick={nextCreator}
            disabled={creators.length <= 1}
            className="p-3 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: creators.length > 1 ? 1.1 : 1 }}
            whileTap={{ scale: creators.length > 1 ? 0.95 : 1 }}
          >
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
