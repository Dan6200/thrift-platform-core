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

router.route('/kpis').get(getKPIs)
router.route('/revenue-trends').get(getRevenueTrends)
router.route('/sales-analytics').get(getSalesAnalytics)
router.route('/customer-acquisition-trends').get(getCustomerAcquisitionTrends)
router.route('/customers-by-location').get(getCustomersByLocation)
router.route('/customer-lifetime-value').get(getCustomerLifetimeValue)
router.route('/top-selling-products').get(getTopSellingProducts)
router.route('/low-stock-products').get(getLowStockProducts)
router.route('/product-performance').get(getProductPerformance)

export default router