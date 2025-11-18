const sizeOrderMap = {
  XXS: 0,
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  XXL: 6,
  // Handle numerical sizes by converting them to a high number
  OS: 100, // One Size
}

export type Sizes = keyof typeof sizeOrderMap

export const sortSize = (sizes: Sizes[]) =>
  sizes.sort((a: Sizes, b: Sizes) => {
    // Look up the numeric order value for size 'a' and size 'b'
    const orderA = sizeOrderMap[a]
    const orderB = sizeOrderMap[b]

    return orderA - orderB
  })
