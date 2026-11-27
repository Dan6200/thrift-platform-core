'use client'
import { ShoppingCart } from '.'
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/lib/cart/use-cart'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
export function CartContent() {
  const { data, isLoading, isError, refetch } = useCart()
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()
  if (isLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    )
  if (isError)
    return (
      <div role="alert" className="p-8 text-center">
        <h2>Could not load your cart</h2>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  return (
    <>
      <div role="alert">
        {(update.isError || remove.isError) &&
          'Could not update your cart. Please try again.'}
      </div>
      <ShoppingCart
        items={data?.items ?? []}
        total={data?.total_price ?? 0}
        busy={update.isPending || remove.isPending}
        onIncrease={(item) =>
          update.mutate({ itemId: item.item_id, quantity: item.quantity + 1 })
        }
        onDecrease={(item) =>
          update.mutate({ itemId: item.item_id, quantity: item.quantity - 1 })
        }
        onRemove={(item) => remove.mutate(item.item_id)}
      />
    </>
  )
}
