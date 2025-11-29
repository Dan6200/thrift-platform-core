// components/ui/quantity-selector.tsx
'use client'

import { Button } from './button'
import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
  maxQuantity?: number
  minQuantity?: number
}

export function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
  maxQuantity,
  minQuantity = 1,
}: QuantitySelectorProps) {
  return (
    <div className="flex h-10 items-center border border-border bg-transparent w-32 justify-between p-0 rounded-md overflow-clip">
      <Button
        onClick={onDecrease}
        variant={'outline'}
        className="p-2 border-r border-y-0 border-l-0 bg-transparent h-full rounded-none m-0"
        disabled={quantity <= minQuantity}
      >
        <Minus className="w-4" />
      </Button>
      <p className="mx-auto p-1 font-semibold">{quantity}</p>
      <Button
        onClick={onIncrease}
        variant={'outline'}
        className="p-2 border-l border-y-0 border-r-0 bg-transparent h-full rounded-none m-0"
        disabled={maxQuantity !== undefined && quantity >= maxQuantity}
      >
        <Plus className="w-4" />
      </Button>
    </div>
  )
}
