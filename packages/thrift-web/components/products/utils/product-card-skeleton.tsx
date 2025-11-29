// components/products/utils/product-card-skeleton.tsx
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductCardSkeleton() {
  return (
    <Card className="h-fit flex flex-col w-full overflow-hidden rounded-sm animate-pulse">
      {/* Image Skeleton */}
      <Skeleton className="w-full h-[10rem] sm:h-[12rem] md:h-[14rem] lg:h-[16rem]" />

      <CardFooter className="p-2 sm:p-4 flex flex-1 flex-col gap-3 sm:gap-4 justify-between">
        {/* Title Skeleton */}
        <Skeleton className="h-5 w-4/5" />
        {/* Ratings Skeleton */}
        <Skeleton className="h-5 w-3/5" />
        {/* Price Skeleton */}
        <Skeleton className="h-7 w-2/5" />
      </CardFooter>
    </Card>
  )
}
