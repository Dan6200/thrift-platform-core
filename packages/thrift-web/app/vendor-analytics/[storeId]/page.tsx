import {
  getKPIs,
  getRevenueData,
  getSalesData,
  getRecentOrders,
  getCustomerData,
  getProductPerformance,
  getLowStockProducts,
} from '@/lib/api/analytics'
import AnalyticsClient from './client-page'

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params
  const today = new Date()
  const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30))

  const startDate = thirtyDaysAgo.toISOString().split('T')[0]
  const endDate = today.toISOString().split('T')[0]

  // Fetch initial data on the server
  const [
    initialKpiData,
    initialRevenueData,
    initialSalesData,
    initialOrders,
    initialCustomerData,
    initialProducts,
    initialLowStockProducts,
  ] = await Promise.all([
    getKPIs(storeId, startDate, endDate),
    getRevenueData(storeId, startDate, endDate),
    getSalesData(storeId),
    getRecentOrders(storeId),
    getCustomerData(storeId),
    getProductPerformance(storeId),
    getLowStockProducts(storeId),
  ])

  return (
    <AnalyticsClient
      storeId={storeId}
      initialKpiData={initialKpiData}
      initialRevenueData={initialRevenueData}
      initialSalesData={initialSalesData}
      initialOrders={initialOrders}
      initialCustomerData={initialCustomerData}
      initialProducts={initialProducts}
      initialLowStockProducts={initialLowStockProducts}
    />
  )
}
