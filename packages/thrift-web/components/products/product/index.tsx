'use client'
import {
  addItemAtom,
  getTotalCountAtom,
  isSmallScreenAtom,
  shoppingCartAtom,
} from '@/atoms'
import { useToast } from '@/components/ui/use-toast'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { MoveLeft } from 'lucide-react'
import { ShoppingCart } from '@/types/shopping-cart'
import { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { Card, CardContent } from '../../ui/card'
import { GoBackLink } from '../go-back-link'
import { ProductImage } from '../image'
import {
  ImgData,
  Product as ProductType,
  ProductVariant,
} from '@/types/products'
import { BuyNow } from '../utils/buy-now'
import { Price } from './utils/price'
import { VariantSelector } from './utils/variant-selector'
import { ProductReviews } from './utils/product-reviews'
import { Separator } from '@radix-ui/react-dropdown-menu'
import { Description } from './utils/description'

export function Product({ product }: { product: ProductType }) {
  const isSmallScreen = useAtomValue(isSmallScreenAtom)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  )

  const [imageVariants, setImageVariants] = useState<Record<string, ImgData>>(
    {},
  )

  useEffect(() => {
    /* product.media is of type ImgData */
    const variants = product.media.reduce(
      (acc, img) => {
        acc[img.variant_id.toString()] = img
        return acc
      },
      {} as Record<string, ImgData>,
    )
    setImageVariants(variants)
  }, [product.media])

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0])
    }
  }, [product.variants])

  const handleOptionSelect = (optionName: string, value: string) => {
    if (!selectedVariant) return

    const currentOptions = Object.fromEntries(
      selectedVariant.options.map((opt) => [opt.option_name, opt.value]),
    )

    const nextOptions = {
      ...currentOptions,
      [optionName]: value,
    }

    const nextVariant = product.variants?.find((variant) =>
      variant.options.every(
        (opt) => nextOptions[opt.option_name] === opt.value,
      ),
    )

    if (nextVariant) {
      setSelectedVariant(nextVariant)
    }
    // If no matching variant is found, the selection state does not change.
  }

  const displayImg = selectedVariant
    ? imageVariants[selectedVariant?.variant_id]
    : null

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
    <div className="container mx-auto p-4 sm:px-8 my-20">
      <GoBackLink className="w-fit cursor-pointer text-base md:text-lg text-blue-700 dark:text-blue-200 my-4 sm:my-8 block">
        <MoveLeft className="inline mr-4" />
        Go back
      </GoBackLink>
      <Card
        id="product-card"
        className="h-full flex px-4 py-6 sm:px-8 sm:py-10 flex-col gap-5 lg:gap-7 lg:flex-row items-center rounded-xl w-full lg:mx-auto"
      >
        <CardContent
          className="flex flex-col p-0 w-full h-fit lg:w-[45%]"
          key={product?.product_id}
          id="card-content-product"
        >
          <div id="img-bg" className="rounded-lg overflow-clip w-full">
            <ProductImage
              imgData={displayImg ?? product?.media[0]}
              className="object-contain h-full"
              width={640}
              height={512}
            />
          </div>
          <Separator className="border my-8 border-border" />
          {!isSmallScreen ? (
            <ProductReviews
              product_id={product.product_id}
              average_rating={product.average_rating}
              review_count={product.review_count}
            />
          ) : (
            <div className="p-0 flex flex-col my-4 lg:p-4 w-full justify-between lg:text-lg h-full">
              <h2 className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-center font-bold break-words">
                {/* remove &nbsp;, that breaks the ui */}
                {product?.title.replace(/\u00A0/, ' ')}
              </h2>
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
              {product.variants && (
                <VariantSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onOptionSelect={handleOptionSelect}
                />
              )}
              <div className="flex flex-col w-full mb-4 gap-2 sm:gap-4 justify-between">
                <Button
                  className="text-base h-10 font-bold w-full"
                  onClick={() => {
                    if (!selectedVariant) return
                    const itemToAdd = {
                      ...product,
                      ...selectedVariant,
                      list_price:
                        selectedVariant?.list_price ?? product.list_price,
                      net_price:
                        selectedVariant?.net_price ?? product.net_price,
                    }
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
                  imgData={displayImg ?? product.media[0]}
                  netPrice={selectedVariant?.net_price ?? product?.net_price}
                  listPrice={selectedVariant?.list_price ?? product?.list_price}
                  quantityAvailable={selectedVariant?.quantity_available ?? 0}
                  isProductPage={true}
                />
              </div>
            </div>
          )}
        </CardContent>
        <Separator className="border-b-2 lg:border-l-2 lg:border-b-0 block w-[95%] lg:w-[.5pt] lg:h-screen border-border" />
        <CardContent
          className="p-0 px-2 w-full lg:w-[50%] flex flex-col justify-between h-full"
          id="card-content-description"
        >
          {isSmallScreen ? (
            <Description description={product?.description} />
          ) : (
            <div className="p-0 flex flex-col my-4 lg:p-4 w-full justify-between lg:text-lg h-full">
              <h2 className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-center font-bold break-words">
                {/* remove &nbsp;, that breaks the ui */}
                {product?.title.replace(/\u00A0/, ' ')}
              </h2>
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
              {product.variants && (
                <VariantSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onOptionSelect={handleOptionSelect}
                />
              )}
              <div className="flex flex-col w-full mb-4 gap-2 sm:gap-4 justify-between">
                <Button
                  className="text-base h-10 font-bold w-full"
                  onClick={() => {
                    if (!selectedVariant) return
                    const itemToAdd = {
                      ...product,
                      ...selectedVariant,
                      list_price:
                        selectedVariant?.list_price ?? product.list_price,
                      net_price:
                        selectedVariant?.net_price ?? product.net_price,
                    }
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
                  imgData={displayImg ?? product.media[0]}
                  netPrice={selectedVariant?.net_price ?? product?.net_price}
                  listPrice={selectedVariant?.list_price ?? product?.list_price}
                  quantityAvailable={selectedVariant?.quantity_available ?? 0}
                  isProductPage={true}
                />
              </div>
            </div>
          )}
          <Separator className="border my-8 border-border" />
          {isSmallScreen ? (
            <ProductReviews
              product_id={product.product_id}
              average_rating={product.average_rating}
              review_count={product.review_count}
            />
          ) : (
            <Description description={product?.description} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
