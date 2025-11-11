export interface ProductReviewRequestData {
  rating: number
  customer_remark?: string | null
}

export interface ProductReviewResponseData {
  order_item_id: number
  rating: number
  customer_id: string
  customer_remark?: string | null
  created_at: Date
  updated_at: Date
}

export interface ProductReviewId {
  order_item_id: number
}
