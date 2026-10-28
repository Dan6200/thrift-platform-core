'use client'
import { ProductImage } from '../products/image'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { CartItem } from '@/lib/api/cart'
import { formatNaira } from '@/lib/money'
import { useRouter } from 'next/navigation'

export function ShoppingCart({
  items,
  total,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  items: CartItem[]
  total: number
  onIncrease: (item: CartItem) => void
  onDecrease: (item: CartItem) => void
  onRemove: (item: CartItem) => void
}) {
  const router = useRouter()

  return (
    <div className="flex flex-col justify-between container p-4">
      <h2 className="text-center p8 font-semibold text-2xl w-full my-8">
        Items in Cart
      </h2>
      <div className="space-y-4">
        {items.length ? (
          items.map((item: CartItem) => (
            <Card
              key={item.item_id}
              className="flex bg-transparent items-center w-full"
            >
              <CardContent className="rounded-md w-full border-b border-border p-4 flex flex-col sm:flex-row items-center justify-between h-44 sm:h-24">
                <ProductImage
                  className="py-1 object-contain w-32 mx-auto rounded-sm bg-white max-h-24 sm:max-h-20 object-center border dark:border-none"
                  src={item.image_url}
                  alt={item.product_title}
                  width={128}
                  height={128}
                />
                <div className="w-full flex sm:px-8 justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="font-semibold break-words">
                      {item.product_title}
                    </p>
                    {item.sku && (
                      <p className="text-xs text-muted-foreground">
                        {item.sku}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex h-fit mr-2 items-center border border-border bg-transparent w-28 justify-between p-0 rounded-md overflow-clip">
                      <Button
                        onClick={() => {
                          if (item.quantity > 1) onDecrease(item)
                        }}
                        variant={'outline'}
                        className="p-2 border-r border-y-0 border-l-0 bg-transparent h-7 rounded-none m-0"
                      >
                        <Minus className="w-4" />
                      </Button>
                      <p className="mx-auto p-1">{item.quantity}</p>
                      <Button
                        onClick={() => onIncrease(item)}
                        variant={'outline'}
                        className="p-2 border-l border-y-0 border-r-0 bg-transparent h-7 rounded-none m-0"
                      >
                        <Plus className="w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="bg-transparent"
                      onClick={() => onRemove(item)}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                  <p className="p-1">
                    {formatNaira(item.price * item.quantity)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="w-full text-center">
            <h2 className="p8 text-semibold text-lg w-full my-8">
              No Items in the Cart yet
            </h2>
            <p>Click on the &apos;Add to cart button&apos; on the page</p>
          </div>
        )}
      </div>
      {!!items.length && (
        <>
          <div className="my-8 flex w-full items-center justify-between text-center text-lg">
            <h2>Total:</h2>
            <p className="text-xl font-bold text-green-700 dark:text-green-400">
              {formatNaira(total)}
            </p>
          </div>
          <Button
            className="my-16 flex mx-auto font-semibold bg-green-600 w-full md:w-64 h-10 text-lg text-tertiary hover:bg-green-500"
            onClick={() => router.push('/checkout')}
          >
            Checkout
          </Button>
        </>
      )}
    </div>
  )
}
