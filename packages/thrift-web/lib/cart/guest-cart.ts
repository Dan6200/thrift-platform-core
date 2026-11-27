import type { Cart, CartItem } from '../api/cart'

export type CartPreview = Pick<
  CartItem,
  'product_title' | 'price' | 'image_url' | 'store_id' | 'sku'
> & { quantity_available: number }
export type CartAddition = {
  variant_id: number
  quantity: number
  preview?: CartPreview
}
export type GuestItem = CartItem & { quantity_available: number }
type TransferTarget = {
  variant_id: number
  quantity: number
  source_quantity: number
}
export type GuestCartState = {
  items: GuestItem[]
  transfer?: { userId: string; targets: TransferTarget[] }
}
export const cartKey = (userId?: string) => ['cart', userId ?? 'guest'] as const
const positiveInteger = (value: unknown): value is number =>
  Number.isSafeInteger(value) && Number(value) > 0

export function normalizeGuestState(value: unknown): GuestCartState {
  if (
    !value ||
    typeof value !== 'object' ||
    !Array.isArray((value as GuestCartState).items)
  )
    return { items: [] }
  const raw = value as GuestCartState
  const items = raw.items.filter(
    (item) =>
      item &&
      positiveInteger(item.variant_id) &&
      item.item_id === -item.variant_id &&
      positiveInteger(item.quantity) &&
      positiveInteger(item.quantity_available) &&
      item.quantity <= item.quantity_available &&
      Number.isSafeInteger(item.price) &&
      item.price >= 0 &&
      typeof item.product_title === 'string' &&
      typeof item.sku === 'string' &&
      positiveInteger(item.store_id),
  )
  const transfer =
    raw.transfer &&
    typeof raw.transfer.userId === 'string' &&
    Array.isArray(raw.transfer.targets)
      ? {
          userId: raw.transfer.userId,
          targets: raw.transfer.targets.filter(
            (target) =>
              target &&
              positiveInteger(target.variant_id) &&
              positiveInteger(target.quantity) &&
              positiveInteger(target.source_quantity),
          ),
        }
      : undefined
  return { items, ...(transfer ? { transfer } : {}) }
}

export function guestCart(value: GuestCartState): Cart {
  const { items } = normalizeGuestState(value)
  const date = items[0]?.created_at ?? new Date().toISOString()
  return {
    cart_id: 0,
    customer_id: 'guest',
    items,
    total_items: items.reduce((sum, item) => sum + item.quantity, 0),
    total_price: items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    ),
    created_at: date,
    updated_at: date,
  }
}

export function addGuestItem(
  value: GuestCartState,
  addition: CartAddition,
): GuestCartState {
  const state = normalizeGuestState(value)
  const preview = addition.preview
  if (
    !preview ||
    !positiveInteger(addition.variant_id) ||
    !positiveInteger(addition.quantity) ||
    !Number.isSafeInteger(preview.price) ||
    preview.price < 0
  )
    throw new Error('Invalid cart item or quantity')
  const existing = state.items.find(
    (item) => item.variant_id === addition.variant_id,
  )
  const quantity = (existing?.quantity ?? 0) + addition.quantity
  if (
    !positiveInteger(preview.quantity_available) ||
    quantity > preview.quantity_available
  )
    throw new Error('Requested quantity exceeds available stock')
  const now = new Date().toISOString()
  const item: GuestItem = {
    ...preview,
    item_id: -addition.variant_id,
    variant_id: addition.variant_id,
    quantity,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  }
  return {
    ...state,
    items: [
      ...state.items.filter((row) => row.variant_id !== item.variant_id),
      item,
    ],
  }
}

export function changeGuestQuantity(
  value: GuestCartState,
  itemId: number,
  quantity: number,
): GuestCartState {
  const state = normalizeGuestState(value),
    item = state.items.find((row) => row.item_id === itemId)
  if (!item || !positiveInteger(quantity) || quantity > item.quantity_available)
    throw new Error('Invalid cart quantity or insufficient stock')
  return {
    items: state.items.map((row) =>
      row.item_id === itemId
        ? { ...row, quantity, updated_at: new Date().toISOString() }
        : row,
    ),
  }
}

export function removeGuestItem(
  value: GuestCartState,
  itemId: number,
): GuestCartState {
  const state = normalizeGuestState(value)
  return {
    ...state,
    items: state.items.filter((item) => item.item_id !== itemId),
  }
}

// Store an absolute target before any server write. Retrying a timed-out write
// can then SET the same quantity rather than incrementing it a second time.
export function planGuestTransfer(
  value: GuestCartState,
  server: Cart,
  userId: string,
): GuestCartState {
  const state = normalizeGuestState(value)
  const targets = state.items.map((item) => {
    const pending =
      state.transfer?.userId === userId
        ? state.transfer.targets.find(
            (target) => target.variant_id === item.variant_id,
          )
        : undefined
    return (
      pending ?? {
        variant_id: item.variant_id,
        quantity:
          (server.items.find((row) => row.variant_id === item.variant_id)
            ?.quantity ?? 0) + item.quantity,
        source_quantity: item.quantity,
      }
    )
  })
  return { ...state, transfer: { userId, targets } }
}

export function completeGuestTransfer(
  value: GuestCartState,
  userId: string,
  variantId: number,
): GuestCartState {
  const state = normalizeGuestState(value)
  if (state.transfer?.userId !== userId) return value
  const target = state.transfer.targets.find(
    (row) => row.variant_id === variantId,
  )
  if (!target) return state
  const items = state.items.flatMap((item) => {
    if (item.variant_id !== variantId) return [item]
    const quantity = item.quantity - target.source_quantity
    return quantity > 0 ? [{ ...item, quantity }] : []
  })
  const targets = state.transfer.targets.filter(
    (row) => row.variant_id !== variantId,
  )
  return { items, ...(targets.length ? { transfer: { userId, targets } } : {}) }
}
