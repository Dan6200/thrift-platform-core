'use client'
import Link from 'next/link'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/atoms'
import { ShoppingCart } from '@/components/shopping-cart'
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/lib/cart/use-cart'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function ShoppingCartPage() {
  const user = useAtomValue(userAtom)
  const { data, isLoading, isError } = useCart()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()

  if (!user) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in to view your cart</h1>
        <p className="text-muted-foreground mb-6">
          Your cart is saved to your account.
        </p>
        <Link href="/auth/login?redirect=/shopping-cart">
          <Button>Sign in</Button>
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Could not load your cart</h1>
        <p className="text-muted-foreground">Please try again.</p>
      </div>
    )
  }

  const items = data?.items ?? []

  return (
    <ShoppingCart
      items={items}
      total={data?.total_price ?? 0}
      onIncrease={(item) =>
        updateItem.mutate({
          itemId: item.item_id,
          quantity: item.quantity + 1,
        })
      }
      onDecrease={(item) =>
        updateItem.mutate({
          itemId: item.item_id,
          quantity: item.quantity - 1,
        })
      }
      onRemove={(item) => removeItem.mutate(item.item_id)}
    />
  )
}
