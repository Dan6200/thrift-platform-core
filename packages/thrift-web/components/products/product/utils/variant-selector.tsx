'use client'
import { ProductVariant } from '@/types/products'
import { Button } from '@/components/ui/button'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { getColorClass } from './get-color-class'
import { Sizes, sortSize } from './sort-size-options'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariant: ProductVariant | null
  onOptionSelect: (optionName: string, value: string) => void
}

export function VariantSelector({
  variants,
  selectedVariant,
  onOptionSelect,
}: VariantSelectorProps) {
  // Create a map of options and their unique values (e.g., { Color: ['Red', 'Blue'], Size: ['S', 'M'] })
  const optionsMap = useMemo(() => {
    const map = new Map<string, Set<string>>()
    variants.forEach((variant) => {
      variant.options.forEach((option) => {
        if (!map.has(option.option_name)) {
          map.set(option.option_name, new Set())
        }
        map.get(option.option_name)!.add(option.value)
      })
    })
    return Object.fromEntries(map.entries())
  }, [variants])

  // Determine the currently selected options from the selectedVariant prop
  const selectedOptions = useMemo(() => {
    return selectedVariant
      ? Object.fromEntries(
          selectedVariant.options.map((opt) => [opt.option_name, opt.value]),
        )
      : {}
  }, [selectedVariant])

  if (!variants || variants.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 my-4">
      {Object.entries(optionsMap).map(([name, values]) => {
        let sizeValues
        if (name.toLowerCase() === 'size')
          // Sort size options
          sizeValues = sortSize(Array.from(values) as unknown as Sizes[])
        return (
          <div key={name}>
            <h4 className="font-semibold text-lg mb-2">{name}</h4>
            <div className="flex flex-wrap gap-2">
              {Array.from(sizeValues ?? values).map((value) => {
                const isSelected = selectedOptions[name] === value
                console.log(name, values)

                if (name.toLowerCase() === 'color') {
                  // Color Swatch
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onOptionSelect(name, value)}
                      className={cn(
                        'w-8 h-8 rounded-full border-4 transition-transform transform hover:scale-110',
                        isSelected ? 'border-primary' : 'border-white/20',
                      )}
                      title={value}
                    >
                      <div
                        className={cn(
                          'w-full h-full rounded-full',
                          getColorClass(value),
                        )}
                      />
                    </button>
                  )
                } else {
                  // Text Swatch (for Size, etc.)
                  return (
                    <Button
                      key={value}
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => onOptionSelect(name, value)}
                    >
                      {value}
                    </Button>
                  )
                }
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
