// components/products/product/utils/ProductDetails.tsx
'use client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/atoms'
import { Product as ProductType, ProductVariant } from '@/types/products'
import { Price } from './price'
import { VariantSelector } from './variant-selector'
import { ShoppingCartIcon, Plus, Zap } from 'lucide-react'
import { useState } from 'react'
import { QuantitySelector } from '@/components/ui/quantity-selector'
import { useRouter } from 'next/navigation'
import { useAddToCart } from '@/lib/cart/use-cart'

interface ProductDetailsProps {
  product: ProductType
  selectedVariant: ProductVariant | null
  onOptionSelect: (optionName: string, value: string) => void
}

export function ProductDetails({
  product,
  selectedVariant,
  onOptionSelect,
}: ProductDetailsProps) {
  const user = useAtomValue(userAtom)
  const addToCart = useAddToCart()
  const { toast } = useToast()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)

  const handleAdd = (goToCheckout = false) => {
    if (!selectedVariant) return

    if (!user) {
      toast({ title: 'Please sign in to add items to your cart.' })
      router.push(`/auth/login?redirect=/products/${product.product_id}`)
      return
    }

    addToCart.mutate(
      { variant_id: selectedVariant.variant_id, quantity },
      {
        onSuccess: () => {
          toast({ title: `${quantity} item(s) added to cart.` })
          if (goToCheckout) router.push('/checkout')
        },
        onError: () => {
          toast({ title: 'Could not add to cart. Please try again.' })
        },
      },
    )
  }

  const price =
    selectedVariant?.effective_price ?? selectedVariant?.base_price ?? null
  const disabled =
    !selectedVariant ||
    selectedVariant.quantity_available === 0 ||
    addToCart.isPending

  return (
    <div className="flex flex-col w-full h-full justify-center">
      <h2 className="text-2xl lg:text-3xl mb-6 text-left font-bold break-words">
        {product.title.replace(/\u00A0/, ' ')}
      </h2>
      <Price kobo={price} />
      {selectedVariant && (
        <p className="text-sm text-muted-foreground mb-1">
          SKU: {selectedVariant.sku}
        </p>
      )}
      <div className="text-md flex mb-4">
        <p>
          Items left:{'\u00A0'.repeat(4)}
          {selectedVariant?.quantity_available ?? 0}
        </p>
      </div>
      {product.variants && product.variants.length > 0 && (
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
          onClick={() => handleAdd(false)}
          disabled={disabled}
        >
          Add To Cart
          <span className="flex ml-2">
            <ShoppingCartIcon className="w-6" />
            <Plus className="w-6" />
          </span>
        </Button>
        <Button
          variant="outline"
          className="text-base h-12 font-bold w-full"
          onClick={() => handleAdd(true)}
          disabled={disabled}
        >
          Buy Now
          <Zap className="w-6 ml-2" />
        </Button>
      </div>
    </div>
  )
}
