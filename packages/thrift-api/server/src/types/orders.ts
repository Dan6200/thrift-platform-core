export interface OrderItemRequestData {
  variant_id: number
  quantity: number
}

export interface OrderCreateRequestData {
  delivery_info_id?: number | null
  items: OrderItemRequestData[]
}

export interface OrderItemResponseData {
  order_item_id: number
  order_id: number
  variant_id: number
  quantity: number
  price_at_purchase: number
  created_at: Date
  updated_at: Date
}

export interface OrderResponseData {
  order_id: number
  customer_id: string
  store_id: number
  delivery_info_id: number | null
  order_date: Date
  total_amount: number
  status: string
  created_at: Date
  updated_at: Date
  items: OrderItemResponseData[]
}

export interface OrderId {
  order_id: number
}

export interface OrderQueryData {
  store_id: number
}
