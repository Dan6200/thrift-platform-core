// types/orders.ts

export interface OrderItem {
  order_item_id: number
  variant_id: number
  quantity: number
  price_at_purchase: string
  // You can join product details here if needed in the API
  product_title?: string
  product_image_url?: string
}

export interface Order {
  order_id: number
  customer_id: string
  store_id: number
  delivery_info_id: number | null
  order_date: string
  total_amount: string
  status: string
  created_at: string
  updated_at: string
  order_items: OrderItem[] // Assuming order items are nested in the response
}
