import { notFound } from 'next/navigation'
import filterByField from './filter'
import { ProductSchema } from '@/types/products'
import { ProductsTiles } from '@/components/products/tiles'
import ServerPagination from '@/components/products/ServerPagination'

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ category_name: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const page = Number((await searchParams).page ?? '1')
  const limit = Number((await searchParams).limit ?? '22')
  let currentPage = page,
    totalPages = 0
  const { category_name } = await params
  const products = await filterByField('category_name', '=', category_name)
  const moreProducts = await filterByField(
    'subcategory_name',
    '=',
    category_name,
  )
  try {
    ProductSchema.parse(products[0])
    moreProducts && ProductSchema.parse(moreProducts[0])
  } catch {
    throw new Error('Invalid product data')
  }
  const newProducts = [...products, ...moreProducts]
  if (products.length === 0 && moreProducts.length === 0) throw notFound()
  return (
    <div className="container mx-auto p-4">
      {newProducts && <ProductsTiles productsToDisplay={products} />}
      {totalPages > 1 && (
        <ServerPagination totalPages={totalPages} currentPage={currentPage} />
      )}
    </div>
  )
}
