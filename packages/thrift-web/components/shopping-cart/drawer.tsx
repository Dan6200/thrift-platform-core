'use client'
import Link from 'next/link'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/atoms'
import { ShoppingCart } from '.'
import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/lib/cart/use-cart'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

/**
 * Renders the contents of the shopping cart drawer from the server cart.
 */
export function ShoppingCartDrawerContent() {
  const user = useAtomValue(userAtom)
  const { data, isLoading } = useCart()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()

  return (
    <DrawerContent className="thick-glass-effect">
      <DrawerHeader>
        <DrawerTitle>Your Shopping Cart</DrawerTitle>
        <DrawerDescription>
          Review the items in your cart before proceeding to checkout.
        </DrawerDescription>
      </DrawerHeader>
      <ScrollArea className="h-full overflow-y-auto px-4">
        {!user ? (
          <div className="p-6 text-center">
            <p className="mb-4">Sign in to view your cart.</p>
            <Link href="/auth/login?redirect=/shopping-cart">
              <Button>Sign in</Button>
            </Link>
          </div>
        ) : isLoading ? (
          <div className="p-6 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <ShoppingCart
            items={data?.items ?? []}
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
        )}
      </ScrollArea>
    </DrawerContent>
  )
}
