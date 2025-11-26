// lib/api/analytics.ts
import { axiosInstance } from '@/components/axios-instance'

export const getKPIs = async (
  storeId: string,
  startDate: string,
  endDate: string,
) => {
  const response = await axiosInstance.get(`/analytics/${storeId}/kpis`, {
    params: { startDate, endDate },
  })
  return response.data
}

export const getRevenueData = async (
  storeId: string,
  startDate: string,
  endDate: string,
) => {
  const response = await axiosInstance.get(
    `/analytics/${storeId}/revenue-trends`,
    {
      params: { startDate, endDate },
    },
  )
  return response.data
}

export const getSalesData = async (storeId: string) => {
  const response = await axiosInstance.get(
    `/analytics/${storeId}/sales-analytics`,
  )
  return response.data
}

export const getRecentOrders = async (storeId: string) => {
  const response = await axiosInstance.get(
    `/analytics/${storeId}/sales-analytics`,
    {
      params: { type: 'recent-orders' },
    },
  )
  return response.data
}

export const getCustomerData = async (storeId: string) => {
  const response = await axiosInstance.get(
    `/analytics/${storeId}/customer-acquisition-trends`,
  )
  return response.data
}

export const getProductPerformance = async (storeId: string) => {
  const response = await axiosInstance.get(
    `/analytics/${storeId}/product-performance`,
  )
  return response.data
}

export const getLowStockProducts = async (storeId: string) => {
  const response = await axiosInstance.get(
    `/analytics/${storeId}/low-stock-products`,
  )
  return response.data
}
