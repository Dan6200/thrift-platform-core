import express from 'express'
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
} from '../../controllers/dashboard/index.js' // Adjust path as needed

const router = express.Router({ mergeParams: true }) // mergeParams allows access to :storeId from parent route if any

// High-Level Overview
router.route('/:storeId/kpis').get(getKPIs)
router.route('/:storeId/revenue-trends').get(getRevenueTrends)

// Detailed Analytics Sections - Sales Performance
router.route('/:storeId/sales-analytics').get(getSalesAnalytics)

// Detailed Analytics Sections - Customer Insights
router
  .route('/:storeId/customers/acquisition-trends')
  .get(getCustomerAcquisitionTrends)
router.route('/:storeId/customers/by-location').get(getCustomersByLocation)
router.route('/:storeId/customers/clv').get(getCustomerLifetimeValue)

// Detailed Analytics Sections - Product Performance
router.route('/:storeId/products/top-selling').get(getTopSellingProducts)
router.route('/:storeId/products/low-stock').get(getLowStockProducts)
router.route('/:storeId/products/performance').get(getProductPerformance)

export default router
