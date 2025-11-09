'use client'
import { addItemAtom, getTotalCountAtom, shoppingCartAtom } from '@/atoms'
import { useToast } from '@/components/ui/use-toast'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { MoveLeft } from 'lucide-react'
import { ShoppingCart } from '@/types/shopping-cart'
import { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { Card, CardContent } from '../../ui/card'
import { GoBackLink } from '../go-back-link'
import { ProductImage } from '../image'
import { Product as ProductType, ProductVariant } from '@/types/products'
import { BuyNow } from '../utils/buy-now'
import { Price } from './utils/price'
import { VariantSelector } from './utils/variant-selector'

export function Product({ product }: { product: ProductType }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  )

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0])
    }
  }, [product.variants])

  const displayImg = product.media.find((img) => img.is_display_image)
  if (!displayImg)
    throw new Error('Cant find display image for product detail--Tag: 1')
  const [shoppingCart, setShoppingCart] = useAtom(shoppingCartAtom)
  const addItem = useSetAtom(addItemAtom)
  const totalItems = useAtomValue(getTotalCountAtom)
  const { toast } = useToast()
  const [showToast, setShowToast] = useState(false)
  useEffect(() => {
    if (showToast)
      toast({
        title: `${totalItems} Items Added To Cart.`,
      })
  }, [toast, showToast, totalItems])
  return (
    <div className="container mx-auto p-4 sm:px-8 h-full my-20">
      <GoBackLink className="cursor-pointer text-base md:text-lg text-blue-700 dark:text-blue-200 mb-4 block">
        <MoveLeft className="inline mr-4" />
        Go back
      </GoBackLink>
      <h2 className="text-lg sm:text-xl lg:text-2xl my-8 sm:my-16 font-bold text-justify break-words">
        {/* remove &nbsp;, that breaks the ui */}
        {product?.title.replace(/\u00A0/, ' ')}
      </h2>
      <Card
        id="product-card"
        className="flex px-4 py-6 sm:px-8 sm:py-10 flex-col gap-5 lg:gap-7 lg:flex-row items-center rounded-xl w-full lg:mx-auto"
      >
        <CardContent
          className="flex flex-col p-0 w-full lg:w-[45%] lg:h-full items-center justify-between"
          key={product?.product_id}
          id="card-content-product"
        >
          <div
            id="img-bg"
            className="bg-white h-96 sm:h-[44rem] rounded-lg w-full"
          >
            <ProductImage
              imgData={displayImg}
              className="object-contain py-4 mx-auto h-full"
              width={640}
              height={512}
            />
          </div>
          <div className="p-0 flex flex-col my-4 lg:p-4 w-full justify-between lg:h-48 lg:text-lg">
            {product.variants && (
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onSelectVariant={setSelectedVariant}
              />
            )}
            <Price
              netPrice={selectedVariant?.net_price ?? product?.net_price}
              listPrice={selectedVariant?.list_price ?? product?.list_price}
            />
            <div className="text-md flex mb-4">
              <p>
                items left:{'\u00A0'.repeat(4)}
                {selectedVariant?.quantity_available ?? 0}
              </p>
            </div>
            <div className="flex w-full mb-4 gap-2 sm:gap-4 justify-between">
              <Button
                className="text-base h-[3rem] font-bold w-full flex-1"
                onClick={() => {
                  if (!selectedVariant) return
                  const itemToAdd = { ...product, ...selectedVariant }
                  shoppingCart
                    ? addItem(itemToAdd)
                    : setShoppingCart(new ShoppingCart(itemToAdd, null))
                  setShowToast(true)
                }}
                disabled={
                  !selectedVariant || selectedVariant.quantity_available === 0
                }
              >
                Add To Cart
              </Button>
              <BuyNow
                imgData={displayImg}
                netPrice={selectedVariant?.net_price ?? product?.net_price}
                listPrice={selectedVariant?.list_price ?? product?.list_price}
                quantityAvailable={selectedVariant?.quantity_available ?? 0}
                isProductPage={true}
              />
            </div>
          </div>
        </CardContent>
        <div className="border-b-2 lg:border-l-2 lg:border-b-0 block w-[95%] lg:w-[.5pt] lg:h-80"></div>
        <CardContent
          className="p-0 px-2 w-full lg:w-[50%]"
          id="card-content-description"
        >
          <h3 className="w-full mx-auto text-xl lg:text-2xl mb-6 lg:mb-12 font-bold text-center">
            About This Product
          </h3>
          {product?.description && (
            <div className="gap-4 flex flex-col mb-8">
              {product?.description?.map((desc, index) => (
                <p
                  className="text-md break-words font-light md:text-xl"
                  key={index}
                >
                  {/* remove &nbsp; that breaks ui */}
                  {desc.replace(/\u00A0/, ' ')}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
