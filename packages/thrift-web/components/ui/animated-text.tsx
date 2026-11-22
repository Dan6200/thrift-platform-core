// components/AnimatedText.tsx
'use client'

import { motion, Transition, useReducedMotion } from 'framer-motion'
import React from 'react'

interface AnimatedTextProps {
  as?: 'div' | 'h1'
  id?: string
  text: string
  delim?: string
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

export default function AnimatedText({
  as = 'div',
  id,
  text,
  delim,
  className,
}: AnimatedTextProps) {
  // 1. Split the text into an array of words
  const reducedMotion = useReducedMotion()
  const Element = as === 'h1' ? motion.h1 : motion.div
  const words = text.split(delim ?? ' ')

  return (
    <Element
      id={id}
      className={`overflow-hidden flex flex-wrap ${className}`}
      variants={containerVariants}
      initial={reducedMotion ? false : 'hidden'}
      animate="visible"
    >
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <motion.span
            className="block w-full"
            variants={reducedMotion ? undefined : wordVariants}
          >
            {word}
          </motion.span>
        </React.Fragment>
      ))}
    </Element>
  )
}
