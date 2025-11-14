// Purpose: Page for displaying all products
import { Products } from '@/components/products'

interface ProductPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductsPage({ searchParams }: ProductPageProps) {
  // Products component now handles fetching internally
  return (
    <>
      <Products searchParams={searchParams} />
    </>
  )
}
