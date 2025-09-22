export interface CartItemRequestData {
  variant_id: number
  quantity: number
}

export interface CartItem {
  item_id: number
  variant_id: number
  quantity: number
  product_title: string
  price: number
  image_url?: string | null
}

export interface CartResponseData {
  cart_id: number
  customer_id: string
  items: CartItem[]
  total_items: number
  total_price: number
}