//cspell: ignore semibold jotai
import { ProductsTiles } from './tiles'
import { Product } from '@/types/products'
import getProducts from '@/app/products/get-products'
import { Suspense } from 'react'
import { ProductsTilesSkeleton } from './tiles-skeleton'

/** Display products in a grid
 * for home page only
 * @returns A grid of products
 * @description This component displays pre-fetched products in a grid. It also
 * fetches more products from the API when the last page is reached
 * */

export const ProductsHome = async () => {
  const page = 1,
    limit = 22
  let products: Product[] = []
  try {
    ;({ products } = await getProducts({
      page,
      limit,
    }))
  } catch (error) {
    console.error('Failed to fetch products:', error)
    // In a server component, re-throwing the error will be caught by the nearest error.js boundary
    throw error
  }

  return (
    <div className="container mx-auto my-0">
      <h4 className="w-full mx-auto my-4 text-xl md:text-3xl font-bold text-center">
        New Arrivals
      </h4>
      <Suspense fallback={<ProductsTilesSkeleton />}>
        <ProductsTiles productsToDisplay={products} />
      </Suspense>
    </div>
  )
}
