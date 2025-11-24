// lib/api/orders.ts
import { axiosInstance } from '@/components/axios-instance' // Assuming you have a configured axios instance
import { Order } from '@/types/orders' // Assuming you have an Order type

export const getAllOrders = async (): Promise<Order[]> => {
  const response = await axiosInstance.get('/orders')
  return response.data
}

export const getOrderById = async (order_id: number): Promise<Order> => {
  const response = await axiosInstance.get(`/orders/${order_id}`)
  return response.data
}

export const findReviewableItem = async (
  productId: number,
): Promise<{ order_item_id: number }> => {
  const response = await axiosInstance.get('/orders/reviewable-item', {
    params: { product_id: productId },
  })
  return response.data
}
