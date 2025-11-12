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
import { createProductsForTesting } from '../helpers/create-product.js'
import { createOrderForTesting } from '../helpers/create-order.js'

chai.use(chaiHttp).should()

export default function ({ userInfo }: { userInfo: ProfileRequestData }) {
  describe('Analytics', () => {
    let token: string
    let userId: string
    let storeId: number

    before(async function () {
      userId = await createUserForTesting(userInfo)
      token = await signInForTesting(userInfo)
      const storeResponse = await createStoreForTesting(token)
      storeId = storeResponse.body.store_id

      // Create a product in that store
      const productCreationPromises = []
      for await (const promise of createProductsForTesting(token, storeId, 3)) {
        productCreationPromises.push(promise)
      }
      const productResponses = await Promise.all(productCreationPromises)
      const productRes = productResponses[0]
      const variantId = productRes.body.variants[0].variant_id

      // Create an order for the customer with the product variant
      const orderRes = await createOrderForTesting(
        token,
        { store_id: storeId },
        {
          items: [{ variant_id: variantId, quantity: 1 }],
        },
      )
      orderRes.should.have.status(201)
    })

    it('should get KPIs', async () => {
      await testGetKPIs({
        token,
        query: { storeId, startDate: '2024-01-01', endDate: '2024-12-31' },
      })
    })

    it('should get revenue trends', async () => {
      await testGetRevenueTrends({
        token,
        query: {
          storeId,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          interval: 'month',
        },
      })
    })

    it('should get sales analytics', async () => {
      await testGetSalesAnalytics({
        token,
        query: {
          storeId,
          type: 'by-product',
          offset: 2,
          limit: 10,
          sortBy: 'unitsSold',
          sortOrder: 'desc',
        },
      })
    })

    it('should get sales analytics by category', async () => {
      await testGetSalesAnalytics({
        token,
        query: { storeId, type: 'by-category' },
      })
    })

    it('should get sales analytics for recent orders', async () => {
      await testGetSalesAnalytics({
        token,
        query: {
          storeId,
          type: 'recent-orders',
          offset: 1,
          limit: 10,
          status: 'completed',
        },
      })
    })

    it('should get customer acquisition trends', async () => {
      await testGetCustomerAcquisitionTrends({
        token,
        query: {
          storeId,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          interval: 'month',
        },
      })
    })

    it('should get customers by location', async () => {
      await testGetCustomersByLocation({
        token,
        query: { storeId, locationType: 'country' },
      })
    })

    it('should get customer lifetime value', async () => {
      await testGetCustomerLifetimeValue({
        token,
        query: { storeId, limit: 10, sortBy: 'clv', sortOrder: 'desc' },
      })
    })

    it('should get top selling products', async () => {
      await testGetTopSellingProducts({
        token,
        query: {
          storeId,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          limit: 10,
        },
      })
    })

    it('should get low stock products', async () => {
      await testGetLowStockProducts({
        token,
        query: { storeId, threshold: 5, limit: 10 },
      })
    })

    it('should get product performance', async () => {
      await testGetProductPerformance({
        token,
        query: { storeId, startDate: '2024-01-01', endDate: '2024-12-31' },
      })
    })

    after(async () => await deleteUserForTesting(userId))
  })
}
