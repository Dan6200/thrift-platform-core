// Purpose: Page for displaying all products

import { Product } from '@/components/products/product'
import getProductById from '../get-product-by-id'
import getProducts from '../get-products'
import { ProductData, ProductSchema } from '@/types/products'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let response = await getProductById(+id)
  if (response == undefined) {
    // TODO: Add 404 page
    throw new Error('Product not found')
  }
  ProductSchema.parse(response)
  const product = response
  return <Product product={product} />
}

/**
 * Generate static paths for a few pages
 */
// Limit static generation to 200 products
const LIMIT = 200
export async function generateStaticParams() {
  const data: ProductData = await getProducts({})
  const { products } = data

  return products
    .map((product) => ({
      id: product.product_id.toString(),
    }))
    .slice(0, LIMIT)
}
