import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER || ''

const apiService = {
  async getKPIs(storeId: string, startDate: string, endDate: string) {
    const response = await axios.get(
      `${API_BASE_URL}/v1/analytics/${storeId}/kpis`,
      {
        params: { startDate, endDate },
      },
    )
    return response.data
  },
  async getRevenueData(storeId: string, startDate: string, endDate: string) {
    const response = await axios.get(
      `${API_BASE_URL}/v1/analytics/${storeId}/revenue-trends`,
      {
        params: { startDate, endDate },
      },
    )
    return response.data
  },
  async getSalesData(storeId: string) {
    const response = await axios.get(
      `${API_BASE_URL}/v1/analytics/${storeId}/sales-analytics`,
    )
    return response.data
  },
  async getRecentOrders(storeId: string) {
    const response = await axios.get(
      `${API_BASE_URL}/v1/analytics/${storeId}/sales-analytics`,
      {
        params: { type: 'recent-orders' },
      },
    )
    return response.data
  },
  async getCustomerData(storeId: string) {
    const response = await axios.get(
      `${API_BASE_URL}/v1/analytics/${storeId}/customer-acquisition-trends`,
    )
    return response.data
  },
  async getProductPerformance(storeId: string) {
    const response = await axios.get(
      `${API_BASE_URL}/v1/analytics/${storeId}/product-performance`,
    )
    return response.data
  },
  async getLowStockProducts(storeId: string) {
    const response = await axios.get(
      `${API_BASE_URL}/v1/analytics/${storeId}/low-stock-products`,
    )
    return response.data
  },
}

export default apiService
