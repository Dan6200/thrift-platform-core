// components/products/tiles-skeleton.tsx
import ProductCardSkeleton from './utils/product-card-skeleton'

export const ProductsTilesSkeleton = () => {
  return (
    <div className="mx-auto">
      <div className="my-8 w-full sm:px-2 sm:py-2 md:px-4 md:py-4 mx-auto place-items-center grid grid-cols-2 gap-y-4 sm:gap-y-8 md:gap-y-16 lg:gap-y-32 gap-2 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
