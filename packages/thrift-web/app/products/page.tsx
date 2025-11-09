// Purpose: Page for displaying all products
import { Products } from '@/components/products'
import { isProductData } from '@/types/products'
import getProducts from './get-products'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Products component now handles fetching internally
  return (
    <>
      <Products searchParams={searchParams} />
    </>
  )
}
