'use client'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  decreaseItemCountAtom,
  getItemsAtom,
  getTotalAtom,
  increaseItemCountAtom,
  removeItemAtom,
  shippingInfoAtom,
} from '@/atoms'
import { ShoppingCart } from '.'
import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'

/**
 * This component renders the content that appears inside the shopping cart drawer.
 * It is responsible for fetching cart data and passing it to the ShoppingCart component.
 */
export function ShoppingCartDrawerContent() {
  const items = useAtomValue(getItemsAtom)
  const increaseItemCount = useSetAtom(increaseItemCountAtom)
  const decreaseItemCount = useSetAtom(decreaseItemCountAtom)
  const total = useAtomValue(getTotalAtom)
  const shippingInfo = useAtomValue(shippingInfoAtom)
  const removeItem = useSetAtom(removeItemAtom)

  return (
    <DrawerContent className="bg-background text-background glass-effect dark:text-foreground">
      <DrawerHeader>
        <DrawerTitle>Your Shopping Cart</DrawerTitle>
        <DrawerDescription>
          Review the items in your cart before proceeding to checkout.
        </DrawerDescription>
      </DrawerHeader>
      <ScrollArea className="h-full overflow-y-auto px-4">
        <ShoppingCart
          items={items}
          increaseItemCount={increaseItemCount}
          decreaseItemCount={decreaseItemCount}
          total={total}
          shippingInfo={shippingInfo}
          removeItem={removeItem}
        />
      </ScrollArea>
    </DrawerContent>
  )
}
