import { redirect } from 'next/navigation'
import { CatalogSection } from '@/components/products/catalog-section'
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category_name: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { category_name } = await params
  if (
    [
      'computers',
      'mens-fashion',
      'womens-fashion',
      'electronic-accessories',
    ].includes(category_name)
  )
    redirect(`/subcategories/${category_name}`)
  return (
    <CatalogSection
      kind="category"
      slug={category_name}
      searchParams={searchParams}
    />
  )
}
