'use client'
import { CartContent } from './content'
import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

/**
 * Renders the contents of the shopping cart drawer from the server cart.
 */
export function ShoppingCartDrawerContent() {
  return (
    <DrawerContent className="w-[90vw] max-w-md bg-background/80 backdrop-blur-xl text-foreground">
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
        <CartContent />
      </ScrollArea>
    </DrawerContent>
  )
}
