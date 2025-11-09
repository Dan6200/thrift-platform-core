//cspell:ignore ponyfill
import { ProductData, ProductDataSchema } from '@/types/products'

export default async function getProducts({
  page = 1,
  limit = 50,
}: {
  page?: number
  limit?: number
}) {
  // fetch products
  const response = await fetch(
    process.env.NEXT_PUBLIC_SERVER +
      '/v1/products?' +
      new URLSearchParams({
        sort: '-created_at',
        offset: String((page - 1) * limit),
        limit: limit.toString(),
      }),
    { next: { revalidate: 60 * 60 } },
  ).then((res) => {
    if (res.status >= 400) return null
    return res.json()
  })

  ProductDataSchema.parse(response)

  const { products, total_count } = response

  return { products, total_count } as ProductData
}
