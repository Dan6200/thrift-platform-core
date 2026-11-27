import { notFound } from 'next/navigation'
import getProducts from '@/app/products/get-products'
import { ProductsTiles } from './tiles'
import ServerPagination from './ServerPagination'
export async function CatalogSection({
  kind,
  slug,
  searchParams,
}: {
  kind: 'category' | 'subcategory'
  slug: string
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const query = await searchParams
  const pageValue = Number(query.page ?? 1),
    limitValue = Number(query.limit ?? 22)
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1
  const limit =
    Number.isSafeInteger(limitValue) && limitValue > 0 && limitValue <= 50
      ? limitValue
      : 22
  const accessories =
    kind === 'subcategory' && slug === 'electronic-accessories'
  const data = await getProducts({
    page,
    limit,
    ...(accessories
      ? { category: 'electronics', subcategory: 'accessories' }
      : { [kind]: slug }),
  })
  if (!data.total_count) notFound()
  const first = data.products[0]
  const title = accessories
    ? 'Electronic Accessories'
    : ((kind === 'category' ? first?.category_name : first?.subcategory_name) ??
      slug)
  return (
    <section className="container mx-auto p-4">
      <h1 className="text-3xl font-bold my-6">{title}</h1>
      <ProductsTiles productsToDisplay={data.products} />
      {data.total_count > limit && (
        <ServerPagination
          totalPages={Math.ceil(data.total_count / limit)}
          currentPage={page}
        />
      )}
    </section>
  )
}
