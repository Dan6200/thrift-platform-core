'use client'
import { useState, useEffect } from 'react'
import { AnalyticsNav } from '@/components/nav/analytics'
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters'
import { KPICard } from '@/components/analytics/KPICard'
import { RevenueChart } from '@/components/analytics/RevenueChart'
import { SalesBreakdown } from '@/components/analytics/SalesBreakdown'
import { OrdersTable } from '@/components/analytics/OrdersTable'
import { CustomerInsights } from '@/components/analytics/CustomerInsights'
import { ProductPerformance } from '@/components/analytics/ProductPerformance'
import { getKPIs, getRevenueData } from '@/lib/api/analytics'
import { InventoryAlerts } from '@/components/analytics/InventoryAlerts'
import type {
  AnalyticsKPIs,
  RevenueTrend,
  SalesData,
  RecentOrder,
  CustomerData,
  ProductPerformance as ProductPerformanceType,
  LowStockProducts,
} from '@/types/analytics'
import { ShoppingCart, Users, TrendingUp, UserPlus, Repeat } from 'lucide-react'

interface AnalyticsClientProps {
  storeId: string
  initialKpiData: AnalyticsKPIs | null
  initialRevenueData: RevenueTrend[]
  initialSalesData: SalesData | null
  initialOrders: RecentOrder[]
  initialCustomerData: CustomerData | null
  initialProducts: ProductPerformanceType[]
  initialLowStockProducts: LowStockProducts[]
}

export default function AnalyticsClient({
  storeId,
  initialKpiData,
  initialRevenueData,
  initialSalesData,
  initialOrders,
  initialCustomerData,
  initialProducts,
  initialLowStockProducts,
}: AnalyticsClientProps) {
  const [activeSection, setActiveSection] = useState('overview')
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  })
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedChannel, setSelectedChannel] = useState('all')

  // Data states
  const [kpiData, setKpiData] = useState<AnalyticsKPIs | null>(initialKpiData)
  const [revenueData, setRevenueData] =
    useState<RevenueTrend[]>(initialRevenueData)
  const [salesData, setSalesData] = useState<SalesData | null>(initialSalesData)
  const [orders, setOrders] = useState<RecentOrder[]>(initialOrders)
  const [customerData, setCustomerData] = useState<CustomerData | null>(
    initialCustomerData,
  )
  const [products, setProducts] =
    useState<ProductPerformanceType[]>(initialProducts)
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProducts[]>(
    initialLowStockProducts,
  )

  // Loading states
  const [isLoadingKPIs, setIsLoadingKPIs] = useState(false)
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false)
  const [isLoadingSales, setIsLoadingSales] = useState(false)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isLoadingLowStock, setIsLoadingLowStock] = useState(false)

  // Load data on date range change
  useEffect(() => {
    const loadData = async () => {
      if (!storeId) return
      const startDate = dateRange.from.toISOString().split('T')[0]
      const endDate = dateRange.to.toISOString().split('T')[0]

      try {
        setIsLoadingKPIs(true)
        const kpis = await getKPIs(storeId, startDate, endDate)
        setKpiData(kpis)
        setIsLoadingKPIs(false)

        setIsLoadingRevenue(true)
        const revenue = await getRevenueData(storeId, startDate, endDate)
        setRevenueData(revenue)
        setIsLoadingRevenue(false)

        // Other data can be re-fetched here as well if they depend on the date range
      } catch (error) {
        console.error('Error loading analytics data:', error)
      }
    }

    loadData()
  }, [dateRange, storeId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Revenue"
          value={kpiData ? formatCurrency(kpiData.totalRevenue) : 'Loading...'}
          description="Total revenue for selected period"
          trend={{ value: 12.5, isPositive: true }}
          {
            ...{
              /*icon={<DollarSign className="h-4 w-4" />*/
            }
          }
        />
        <KPICard
          title="Total Orders"
          value={kpiData?.totalOrders || 'Loading...'}
          description="Number of orders placed"
          trend={{ value: 8.2, isPositive: true }}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <KPICard
          title="Average Order Value"
          value={
            kpiData ? formatCurrency(kpiData.averageOrderValue) : 'Loading...'
          }
          description="Average value per order"
          trend={{ value: 3.1, isPositive: true }}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KPICard
          title="Conversion Rate"
          value={kpiData ? `${kpiData.conversionRate}%` : 'Loading...'}
          description="Visitor to customer conversion"
          trend={{ value: 1.4, isPositive: true }}
          icon={<Users className="h-4 w-4" />}
        />
        <KPICard
          title="New Customers"
          value={kpiData?.newCustomers || 'Loading...'}
          description="First-time customers"
          trend={{ value: 15.7, isPositive: true }}
          icon={<UserPlus className="h-4 w-4" />}
        />
        <KPICard
          title="Returning Customers"
          value={kpiData?.returningCustomers || 'Loading...'}
          description="Repeat customers"
          trend={{ value: 6.3, isPositive: true }}
          icon={<Repeat className="h-4 w-4" />}
        />
      </div>
      <RevenueChart data={revenueData} isLoading={isLoadingRevenue} />
      {salesData && (
        <SalesBreakdown data={salesData} isLoading={isLoadingSales} />
      )}
    </div>
  )

  const renderSales = () => (
    <div className="space-y-6">
      {salesData && (
        <SalesBreakdown data={salesData} isLoading={isLoadingSales} />
      )}
      <RevenueChart data={revenueData} isLoading={isLoadingRevenue} />
    </div>
  )

  const renderOrders = () => (
    <div className="space-y-6">
      <OrdersTable orders={orders} isLoading={isLoadingOrders} />
    </div>
  )

  const renderCustomers = () => (
    <div className="space-y-6">
      {customerData && (
        <CustomerInsights data={customerData} isLoading={isLoadingCustomers} />
      )}
    </div>
  )

  const renderProducts = () => (
    <div className="space-y-6">
      <ProductPerformance products={products} isLoading={isLoadingProducts} />
      <InventoryAlerts
        products={lowStockProducts}
        isLoading={isLoadingLowStock}
      />
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'sales':
        return renderSales()
      case 'orders':
        return renderOrders()
      case 'customers':
        return renderCustomers()
      case 'products':
        return renderProducts()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AnalyticsNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <AnalyticsFilters
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedChannel={selectedChannel}
              onChannelChange={setSelectedChannel}
            />
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
