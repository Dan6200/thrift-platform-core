import chai from 'chai'
import chaiHttp from 'chai-http'
import { ProfileRequestData } from '#src/types/profile/index.js'
import { deleteUserForTesting } from '../helpers/delete-user.js'
import { createUserForTesting } from '../helpers/create-user.js'
import { signInForTesting } from '../helpers/signin-user.js'
import {
  testGetKPIs,
  testGetRevenueTrends,
  testGetSalesAnalytics,
  testGetCustomerAcquisitionTrends,
  testGetCustomersByLocation,
  testGetCustomerLifetimeValue,
  testGetTopSellingProducts,
  testGetLowStockProducts,
  testGetProductPerformance,
} from './definitions/index.js'
import { createStoreForTesting } from '../helpers/create-store.js'

chai.use(chaiHttp).should()

export default function ({ userInfo }: { userInfo: ProfileRequestData }) {
  describe('Dashboard Analytics', () => {
    const server = process.env.SERVER!
    let token: string
    let userId: string
    let storeId: string
    let path: string

    before(async function () {
      userId = await createUserForTesting(userInfo)
      token = await signInForTesting(userInfo)
      const storeResponse = await createStoreForTesting(token)
      const [{ store_id }] = storeResponse.body
      storeId = store_id
      path = `/v1/dashboard/${storeId}`
    })

    it('should get KPIs', async () => {
      await testGetKPIs({
        server,
        path: `${path}/kpis`,
        token,
        query: { startDate: '2024-01-01', endDate: '2024-12-31' },
      })
    })

    it('should get revenue trends', async () => {
      await testGetRevenueTrends({
        server,
        path: `${path}/revenue-trends`,
        token,
        query: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          interval: 'month',
        },
      })
    })

    it('should get sales analytics', async () => {
      await testGetSalesAnalytics({
        server,
        path: `${path}/sales-analytics`,
        token,
        query: {
          type: 'by-product',
          limit: 10,
          sortBy: 'unitsSold',
          sortOrder: 'desc',
        },
      })
    })

    it('should get sales analytics by category', async () => {
      await testGetSalesAnalytics({
        server,
        path: `${path}/sales-analytics`,
        token,
        query: { type: 'by-category' },
      })
    })

    it('should get sales analytics for recent orders', async () => {
      await testGetSalesAnalytics({
        server,
        path: `${path}/sales-analytics`,
        token,
        query: { type: 'recent-orders', limit: 10, status: 'completed' },
      })
    })

    it('should get customer acquisition trends', async () => {
      await testGetCustomerAcquisitionTrends({
        server,
        path: `${path}/customer-acquisition-trends`,
        token,
        query: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          interval: 'month',
        },
      })
    })

    it('should get customers by location', async () => {
      await testGetCustomersByLocation({
        server,
        path: `${path}/customers-by-location`,
        token,
        query: { locationType: 'country' },
      })
    })

    it('should get customer lifetime value', async () => {
      await testGetCustomerLifetimeValue({
        server,
        path: `${path}/customer-lifetime-value`,
        token,
        query: { limit: 10, sortBy: 'clv', sortOrder: 'desc' },
      })
    })

    it('should get top selling products', async () => {
      await testGetTopSellingProducts({
        server,
        path: `${path}/top-selling-products`,
        token,
        query: { startDate: '2024-01-01', endDate: '2024-12-31', limit: 10 },
      })
    })

    it('should get low stock products', async () => {
      await testGetLowStockProducts({
        server,
        path: `${path}/low-stock-products`,
        token,
        query: { threshold: 5, limit: 10 },
      })
    })

    it('should get product performance', async () => {
      await testGetProductPerformance({
        server,
        path: `${path}/product-performance`,
        token,
        query: { startDate: '2024-01-01', endDate: '2024-12-31' },
      })
    })

    after(async () => await deleteUserForTesting(userId))
  })
}
