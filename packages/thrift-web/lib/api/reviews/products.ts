// api/reviews/products.ts
import { axiosInstance } from '@/components/axios-instance'

export const getProductReviewsByProductId = async (product_id: number) => {
  const response = await axiosInstance.get(
    `/reviews/products/product/${product_id}`,
  )
  return response.data
}

export const createProductReview = async (
  order_item_id: number,
  reviewData: { rating: number; customer_remark?: string },
) => {
  const response = await axiosInstance.post(
    `/reviews/products/${order_item_id}`,
    reviewData,
  )
  return response.data
}
