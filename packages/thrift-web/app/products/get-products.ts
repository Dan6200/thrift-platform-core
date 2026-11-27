//cspell:ignore ponyfill
import { ProductData, ProductDataSchema } from '@/types/products'
import { normalizeProduct } from '@/lib/normalize-product'

const emptyProductData: ProductData = { products: [], total_count: 0 }

export function normalizeProductData(response: unknown): ProductData {
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    return emptyProductData
  }

  const responseData = response as Record<string, unknown>
  const normalized = {
    ...responseData,
    products: Array.isArray(responseData.products)
      ? responseData.products.map(normalizeProduct)
      : responseData.products,
  }
  const parsed = ProductDataSchema.safeParse(normalized)
  return parsed.success ? parsed.data : emptyProductData
}

export default async function getProducts({
  page = 1,
  limit = 50,
  category,
  subcategory,
}: {
  page?: number
  limit?: number
  category?: string
  subcategory?: string
}): Promise<ProductData> {
  const response: unknown = await fetch(
    process.env.NEXT_PUBLIC_SERVER +
      '/v1/products?' +
      new URLSearchParams({
        ...(category ? { category } : {}),
        ...(subcategory ? { subcategory } : {}),
        sort: '-created_at',
        offset: String((page - 1) * limit),
        limit: limit.toString(),
      }),
    { next: { revalidate: 60 * 60 } },
  ).then((res) => {
    if (!res.ok) return null
    return res.json()
  })

  return normalizeProductData(response)
}
