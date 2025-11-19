// components/AnimatedText.tsx
'use client'

import { motion, Transition } from 'framer-motion'
import React from 'react'

interface AnimatedTextProps {
  text: string
  className?: string // Optional for styling the container
}

// Define the animation states (variants)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    // Stagger the children's start time by 0.05 seconds
    transition: { staggerChildren: 0.5 },
  },
}

const wordVariants = {
  hidden: { opacity: 0, y: 20 }, // Start off-screen and invisible
  visible: {
    opacity: 1,
    y: 0, // Slide into position
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    } as Transition,
  },
}

export default function AnimatedText({ text, className }: AnimatedTextProps) {
  // 1. Split the text into an array of words
  const words = text.split(' ')

  return (
    <motion.div
      className={`overflow-hidden flex flex-wrap ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <motion.span
            className="inline-block mr-2" // Keep words on the same line with a small margin
            variants={wordVariants}
          >
            {word}
          </motion.span>
          {/* Add a non-breaking space after each word (except the last) */}
          {index < words.length - 1 && '\u00A0'}
        </React.Fragment>
      ))}
    </motion.div>
  )
}
