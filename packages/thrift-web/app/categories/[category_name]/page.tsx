import { notFound } from 'next/navigation'
import filterByField from './filter'
import { ProductSchema, Product } from '@/types/products'
import { ProductsTiles } from '@/components/products/tiles'
import ServerPagination from '@/components/products/ServerPagination'
import { Suspense } from 'react'
import { ProductsTilesSkeleton } from '@/components/products/tiles-skeleton'

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ category_name: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const page = Number((await searchParams).page ?? '1')
  const limit = Number((await searchParams).limit ?? '22')
  let currentPage = page
  const { category_name } = await params

  // Fetch products from both category and subcategory
  const productsPromise = filterByField('category_name', '=', category_name)
  const moreProductsPromise = filterByField(
    'subcategory_name',
    '=',
    category_name,
  )

  const [products, moreProducts] = await Promise.all([
    productsPromise,
    moreProductsPromise,
  ])

  const combinedProducts = [...products, ...moreProducts]

  // Validate at least one product to avoid crashing on empty results
  if (combinedProducts.length > 0) {
    try {
      ProductSchema.parse(combinedProducts[0])
    } catch {
      throw new Error('Invalid product data')
    }
  }

  if (combinedProducts.length === 0) {
    notFound()
  }

  // Paginate the combined results
  const totalPages = Math.ceil(combinedProducts.length / limit)
  const productsToDisplay = combinedProducts.slice(
    (page - 1) * limit,
    page * limit,
  )

  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<ProductsTilesSkeleton />}>
        <ProductsTiles productsToDisplay={productsToDisplay} />
      </Suspense>
      {totalPages > 1 && (
        <ServerPagination totalPages={totalPages} currentPage={currentPage} />
      )}
    </div>
  )
}
