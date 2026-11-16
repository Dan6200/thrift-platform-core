// Purpose: Page for displaying all products

import { Product } from '@/components/products/product'
import getProductById from '../get-product-by-id'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(+id)
  if (product == null) {
    throw notFound()
  }
  return <Product product={product} />
}
