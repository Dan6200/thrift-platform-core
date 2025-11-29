import ServerPagination from './ServerPagination'
import { ProductsTiles } from './tiles'
import { Product } from '@/types/products'
import getProducts from '@/app/products/get-products'
import { Suspense } from 'react'
import { ProductsTilesSkeleton } from './tiles-skeleton'

export const Products = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string[] | string | undefined }>
}) => {
  const page = Number((await searchParams).page ?? '1')
  const limit = Number((await searchParams).limit ?? '22')

  let currentPage = page
  let totalPages = 0
  let products: Product[] | null = null
  let totalCount

  try {
    ;({ products, total_count: totalCount } = await getProducts({
      page,
      limit,
    }))
    totalPages = Math.ceil(totalCount / limit) // Correctly calculate total pages
  } catch (error) {
    console.error('Failed to fetch products:', error)
    // In a server component, re-throwing the error will be caught by the nearest error.js boundary
    throw error
  }

  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<ProductsTilesSkeleton />}>
        {products && <ProductsTiles productsToDisplay={products} />}
      </Suspense>
      {totalPages > 1 && (
        <ServerPagination totalPages={totalPages} currentPage={currentPage} />
      )}
    </div>
  )
}
