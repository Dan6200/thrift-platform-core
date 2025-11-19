import apiService from '@/app/vendor-analytics/services/api'
import AnalyticsClient from './AnalyticsClient'

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
    apiService.getKPIs(storeId, startDate, endDate),
    apiService.getRevenueData(storeId, startDate, endDate),
    apiService.getSalesData(storeId),
    apiService.getRecentOrders(storeId),
    apiService.getCustomerData(storeId),
    apiService.getProductPerformance(storeId),
    apiService.getLowStockProducts(storeId),
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
