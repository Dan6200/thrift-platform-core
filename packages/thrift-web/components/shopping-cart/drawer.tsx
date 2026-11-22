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
  DrawerClose,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/lib/cart/use-cart'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
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
    <DrawerContent className="w-[90vw] max-w-md bg-background text-foreground">
      <DrawerClose asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close cart"
          className="absolute right-3 top-3 h-11 w-11 focus-visible:ring-foreground"
        >
          <X aria-hidden="true" />
        </Button>
      </DrawerClose>
      <DrawerHeader>
        <DrawerTitle className="pr-10">Your Shopping Cart</DrawerTitle>
        <DrawerDescription className="text-foreground/80">
          Review the items in your cart before proceeding to checkout.
        </DrawerDescription>
      </DrawerHeader>
      <ScrollArea className="h-full overflow-y-auto px-4">
        {!user ? (
          <div className="p-6 text-center">
            <p className="mb-4">Sign in to view your cart.</p>
            <Button
              asChild
              className="min-h-11 dark:text-background focus-visible:ring-foreground"
            >
              <Link href="/auth/login?redirect=/shopping-cart">Sign in</Link>
            </Button>
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
