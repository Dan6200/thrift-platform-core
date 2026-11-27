// lib/api/cart.ts
import type { CartAddition } from '../cart/guest-cart'
import { axiosInstance } from '@/components/axios-instance'

export interface CartItem {
  item_id: number
  variant_id: number
  quantity: number
  created_at: string
  updated_at: string
  product_title: string
  price: number
  image_url: string | null
  store_id: number
  sku: string
  quantity_available?: number
}

export interface Cart {
  cart_id: number
  customer_id: string
  items: CartItem[]
  total_items: number
  total_price: number
  created_at: string
  updated_at: string
}

const authorized = (token?: string) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : undefined

export const getCart = async (token?: string): Promise<Cart> => {
  const response = await axiosInstance.get('/cart', authorized(token))
  return response.data
}

export const addCartItem = async (
  { variant_id, quantity }: CartAddition,
  token?: string,
): Promise<CartItem> => {
  const response = await axiosInstance.post(
    '/cart/items',
    {
      variant_id,
      quantity,
    },
    authorized(token),
  )
  return response.data
}

export const updateCartItem = async (
  itemId: number,
  quantity: number,
  token?: string,
): Promise<CartItem> => {
  const response = await axiosInstance.put(
    `/cart/items/${itemId}`,
    {
      quantity,
    },
    authorized(token),
  )
  return response.data
}

export const removeCartItem = async (
  itemId: number,
  token?: string,
): Promise<void> => {
  await axiosInstance.delete(`/cart/items/${itemId}`, authorized(token))
}
