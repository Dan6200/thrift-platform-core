'use client'
import { MoveLeft } from 'lucide-react'
import { Card, CardContent } from '../../ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export function ProductSkeleton() {
  return (
    <div className="container mx-auto p-4 sm:p-8 my-10 md:my-20 h-full">
      {/* Go Back Link Skeleton */}
      <Skeleton className="h-7 w-32 my-4 sm:my-8" />

      {/* Main Product Card Skeleton */}
      <Card className="flex flex-col lg:flex-row gap-8 p-6 sm:p-8 rounded-xl w-full animate-pulse">
        {/* Left Side: Image Skeleton */}
        <CardContent className="w-full lg:w-1/2 h-fit">
          <Skeleton className="w-full h-96 md:h-[32rem] rounded-lg" />
        </CardContent>

        {/* Right Side: Details Skeleton */}
        <CardContent className="w-full lg:w-1/2 p-0 flex flex-col justify-center">
          <Skeleton className="h-10 w-3/4 mb-6" /> {/* Title */}
          <Skeleton className="h-8 w-1/4 mb-4" /> {/* Price */}
          <Skeleton className="h-6 w-1/3 mb-6" /> {/* Items left */}
          <div className="space-y-4 mb-6">
            <Skeleton className="h-10 w-full" /> {/* Variant Selector */}
            <Skeleton className="h-10 w-full" /> {/* Variant Selector */}
          </div>
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-12 w-32" /> {/* Quantity Selector */}
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-12 w-full" /> {/* Add to Cart Button */}
            <Skeleton className="h-12 w-full" /> {/* Buy Now Button */}
          </div>
        </CardContent>
      </Card>

      <div className="w-full lg:w-2/3 mx-auto mt-16 animate-pulse">
        {/* Description Section Skeleton */}
        <div>
          <Skeleton className="h-10 w-1/3 mb-6" /> {/* About Title */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>

        <Separator className="my-16" />

        {/* Reviews Section Skeleton */}
        <div>
          <Skeleton className="h-10 w-1/3 mb-6" /> {/* Reviews Title */}
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
