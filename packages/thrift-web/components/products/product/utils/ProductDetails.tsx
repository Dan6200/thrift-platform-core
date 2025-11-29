// components/products/product/utils/ProductDetails.tsx
'use client'
import { addItemAtom, shoppingCartAtom, getTotalCountAtom } from '@/atoms'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import { ShoppingCart } from '@/types/shopping-cart'
import {
  Product as ProductType,
  ProductVariant,
  ImgData,
} from '@/types/products'
import { Price } from './price'
import { VariantSelector } from './variant-selector'
import { BuyNow } from '../../utils/buy-now'
import { ShoppingCartIcon, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { QuantitySelector } from '@/components/ui/quantity-selector'

interface ProductDetailsProps {
  product: ProductType
  selectedVariant: ProductVariant | null
  displayImg: ImgData | null
  onOptionSelect: (optionName: string, value: string) => void
}

export function ProductDetails({
  product,
  selectedVariant,
  displayImg,
  onOptionSelect,
}: ProductDetailsProps) {
  const [shoppingCart, setShoppingCart] = useAtom(shoppingCartAtom)
  const addItem = useSetAtom(addItemAtom)
  const totalItems = useAtomValue(getTotalCountAtom)
  const { toast } = useToast()
  const [showToast, setShowToast] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (showToast) {
      toast({
        title: `${totalItems} Item(s) Added To Cart.`,
      })
      setShowToast(false) // Reset after showing
    }
  }, [showToast, totalItems, toast])

  const handleAddToCart = () => {
    if (!selectedVariant) return
    const itemToAdd = {
      ...product,
      ...selectedVariant,
      list_price: selectedVariant?.list_price ?? product.list_price,
      net_price: selectedVariant?.net_price ?? product.net_price,
    }
    // The logic in the shopping cart atom now handles creating a new cart if it doesn't exist
    addItem({ product: itemToAdd, quantity })
    setShowToast(true)
  }

  return (
    <div className="flex flex-col w-full h-full justify-center">
      <h2 className="text-2xl lg:text-3xl mb-6 text-left font-bold break-words">
        {product.title.replace(/\u00A0/, ' ')}
      </h2>
      <Price
        netPrice={selectedVariant?.net_price ?? product.net_price}
        listPrice={selectedVariant?.list_price ?? product.list_price}
      />
      <div className="text-md flex mb-4">
        <p>
          Items left:{'\u00A0'.repeat(4)}
          {selectedVariant?.quantity_available ?? 0}
        </p>
      </div>
      {product.variants && (
        <VariantSelector
          variants={product.variants}
          selectedVariant={selectedVariant}
          onOptionSelect={onOptionSelect}
        />
      )}
      <div className="flex items-center gap-4 my-4">
        <QuantitySelector
          quantity={quantity}
          onIncrease={() => setQuantity((q) => q + 1)}
          onDecrease={() => setQuantity((q) => q - 1)}
          maxQuantity={selectedVariant?.quantity_available}
        />
        <p className="text-sm text-muted-foreground">Select Quantity</p>
      </div>
      <div className="flex flex-col w-full my-4 gap-4 justify-between">
        <Button
          className="text-base h-12 font-bold w-full"
          onClick={handleAddToCart}
          disabled={
            !selectedVariant || selectedVariant.quantity_available === 0
          }
        >
          Add To Cart
          <span className="flex ml-2">
            <ShoppingCartIcon className="w-6" />
            <Plus className="w-6" />
          </span>
        </Button>
        <BuyNow
          imgData={displayImg ?? product.media[0]}
          netPrice={selectedVariant?.net_price ?? product.net_price}
          listPrice={selectedVariant?.list_price ?? product.list_price}
          quantityAvailable={selectedVariant?.quantity_available ?? 0}
          isProductPage={true}
        />
      </div>
    </div>
  )
}
