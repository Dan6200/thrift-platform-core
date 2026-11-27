import { CatalogSection } from '@/components/products/catalog-section'
export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ subcategory_name: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { subcategory_name } = await params
  return (
    <CatalogSection
      kind="subcategory"
      slug={subcategory_name}
      searchParams={searchParams}
    />
  )
}
