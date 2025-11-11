import { Router } from 'express'
import {
  getKPIs,
  getRevenueTrends,
  getSalesAnalytics,
  getCustomerAcquisitionTrends,
  getCustomersByLocation,
  getCustomerLifetimeValue,
  getTopSellingProducts,
  getLowStockProducts,
  getProductPerformance,
} from '#src/controllers/dashboard/index.js'

const router = Router()

router.route('/:storeId/kpis').get(getKPIs)
router.route('/:storeId/revenue-trends').get(getRevenueTrends)
router.route('/:storeId/sales-analytics').get(getSalesAnalytics)
router
  .route('/:storeId/customer-acquisition-trends')
  .get(getCustomerAcquisitionTrends)
router.route('/:storeId/customers-by-location').get(getCustomersByLocation)
router.route('/:storeId/customer-lifetime-value').get(getCustomerLifetimeValue)
router.route('/:storeId/top-selling-products').get(getTopSellingProducts)
router.route('/:storeId/low-stock-products').get(getLowStockProducts)
router.route('/:storeId/product-performance').get(getProductPerformance)

export default router
