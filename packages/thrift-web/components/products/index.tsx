import ServerPagination from './ServerPagination'
import { ProductsTiles } from './tiles'
import { Product } from '@/types/products'
import getProducts from '@/app/products/get-products' // Corrected import path and removed default export

export const Products = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const page = Number((await searchParams).page ?? '1')
  const limit = Number((await searchParams).limit ?? '22')

  let currentPage = page,
    totalPages = 0
  let products: Product[] | null = null
  let totalCount
  try {
    ;({ products, total_count: totalCount } = await getProducts({
      page,
      limit,
    }))
    totalPages = totalCount / limit
  } catch (error) {
    console.error('Failed to fetch products:', error)
    // Handle error, maybe set an error state
  }

  return (
    <div className="container mx-auto p-4">
      {products && <ProductsTiles productsToDisplay={products} />}
      {totalPages > 1 && (
        <ServerPagination totalPages={totalPages} currentPage={currentPage} />
      )}
    </div>
  )
}
