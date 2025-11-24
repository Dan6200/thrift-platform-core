// api/reviews/products.ts
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER || '/api'

export const getProductReviewsByProductId = async (product_id: number) => {
  const response = await axios.get(
    `${API_BASE_URL}/reviews/products/product/${product_id}`,
  )
  return response.data
}

export const createProductReview = async (
  order_item_id: number,
  reviewData: { rating: number; customer_remark?: string },
) => {
  const response = await axios.post(
    `${API_BASE_URL}/reviews/products/${order_item_id}`,
    reviewData,
  )
  return response.data
}
