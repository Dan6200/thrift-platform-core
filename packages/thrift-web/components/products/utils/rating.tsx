'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'

interface RatingsProps {
  average_rating: number | null | undefined
  review_count?: number | null
  onRatingChange?: (rating: number) => void
  isInteractive?: boolean
}

export function Ratings({
  average_rating,
  review_count,
  onRatingChange,
  isInteractive = false,
}: RatingsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const stars = []
  const rating = hoverRating ?? average_rating ?? 0

  const handleClick = (index: number) => {
    if (isInteractive && onRatingChange) {
      onRatingChange(index + 1)
    }
  }

  const handleMouseEnter = (index: number) => {
    if (isInteractive) {
      setHoverRating(index + 1)
    }
  }

  const handleMouseLeave = () => {
    if (isInteractive) {
      setHoverRating(null)
    }
  }

  for (let i = 0; i < 5; i++) {
    const isFilled = i < rating

    stars.push(
      <Star
        key={`star-${i}`}
        className={cn(
          'sm:w-6 w-4',
          isFilled ? 'text-secondary' : 'text-muted-foreground/60',
          isInteractive
            ? 'cursor-pointer transition-transform duration-200 hover:scale-125'
            : '',
        )}
        fill={isFilled ? 'hsl(358 88% 58%)' : 'none'}
        onClick={() => handleClick(i)}
        onMouseEnter={() => handleMouseEnter(i)}
      />,
    )
  }

  return (
    <div
      className={cn(
        'flex items-center',
        isInteractive ? 'gap-x-1' : 'w-4/5 justify-between',
      )}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center">{stars}</div>
      {!isInteractive && review_count !== undefined && `(${review_count})`}
    </div>
  )
}
