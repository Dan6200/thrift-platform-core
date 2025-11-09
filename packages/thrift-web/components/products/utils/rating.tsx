'use client'
import { Product } from '@/types/products'
import { Star } from 'lucide-react'
import React from 'react'

export function Ratings({
  average_rating,

  review_count,
}: Pick<Product, 'average_rating' | 'review_count'>) {
  const stars = []

  const rating = average_rating ?? 0

  for (let i = 0; i < 5; i++) {
    const diff = rating - i

    if (diff >= 1) {
      // Full star

      stars.push(
        <Star
          key={`full-${i}`}
          className="sm:w-6 w-4 text-secondary"
          fill="hsl(358 88% 58%)"
        />,
      )
    } else if (diff > 0) {
      // Partial star

      stars.push(
        <div key={`partial-${i}`} className="relative sm:w-6 w-4 h-6">
          {/* Background star */}
          <Star
            key={`partial-bg-${i}`}
            className="absolute top-0 left-0 sm:w-6 w-4 text-muted-foreground/60"
          />

          {/* Foreground star */}
          <Star
            key={`partial-fg-${i}`}
            className="absolute top-0 left-0 sm:w-6 w-4 text-secondary"
            fill="hsl(358 88% 58%)"
            style={{ clipPath: `inset(0 ${100 - diff * 100}% 0 0)` }}
          />
        </div>,
      )
    } else {
      // Empty star

      stars.push(
        <Star
          key={`empty-${i}`}
          className="sm:w-6 w-4 text-muted-foreground/60"
        />,
      )
    }
  }

  return (
    <div className="flex w-4/5 justify-between">
      <div className="flex items-center">{stars}</div>({review_count})
    </div>
  )
}
