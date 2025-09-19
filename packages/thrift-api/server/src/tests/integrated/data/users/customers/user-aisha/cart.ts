import { CartItemRequestData } from '#src/types/cart.js'

export const itemsToAdd: CartItemRequestData[] = [
  {
    variant_id: 1, // Assuming this is a valid variant_id from a seeded product
    quantity: 2,
  },
  {
    variant_id: 2, // Assuming this is another valid variant_id
    quantity: 1,
  },
];
