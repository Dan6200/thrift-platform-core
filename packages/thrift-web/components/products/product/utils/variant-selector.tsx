'use client'
import { ProductVariant } from '@/types/products'
import { Button } from '@/components/ui/button'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariant: ProductVariant | null
  onSelectVariant: (variant: ProductVariant) => void
}

export function VariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
}: VariantSelectorProps) {
  if (!variants || variants.length === 0) {
    return null
  }

  // Get unique option names (e.g., "Color", "Size")
  const optionNames = variants[0]?.options.map((o) => o.option_name) || []

  return (
    <div className="space-y-4 my-4">
      {optionNames.map((name) => (
        <div key={name}>
          <h4 className="font-semibold text-lg mb-2">{name}</h4>
          <div className="flex flex-wrap gap-2">
            {/* Get unique values for this option */}
            {[
              ...new Set(
                variants.flatMap(
                  (v) => v.options.find((o) => o.option_name === name)?.value,
                ),
              ),
            ].map((value) => {
              if (!value) return null
              const isSelected =
                selectedVariant?.options.find((o) => o.option_name === name)
                  ?.value === value

              // A simple approach: find the first variant that matches this option value
              // This might not work for multi-option products, but is a good start.
              const variantToSelect = variants.find((v) =>
                v.options.find(
                  (o) => o.option_name === name && o.value === value,
                ),
              )

              return (
                <Button
                  key={value}
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() =>
                    variantToSelect && onSelectVariant(variantToSelect)
                  }
                >
                  {value}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
