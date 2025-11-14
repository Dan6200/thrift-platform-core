import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from '../request-validation.js'
import { validateDbResult } from '../db-result-validation.js'
import { sendResponse } from '../send-response.js'
import authenticateUser from '../authentication.js'
import { hasStoreAccess } from '../authorization/has-store-access.js'
import {
  getKPIsLogic,
  getRevenueTrendsLogic,
  getSalesAnalyticsLogic,
  getCustomerAcquisitionTrendsLogic,
  getCustomersByLocationLogic,
  getCustomerLifetimeValueLogic,
  getTopSellingProductsLogic,
  getLowStockProductsLogic,
  getProductPerformanceLogic,
} from '../logic/analytics/index.js'
import {
  DashboardKPIsResponseSchema,
  RevenueTrendResponseSchema,
  SalesAnalyticsQuerySchema,
  SalesAnalyticsByProductResponseSchema,
  CustomerAcquisitionTrendResponseSchema,
  CustomersByLocationResponseSchema,
  CustomerCLVResponseSchema,
  TopSellingProductsResponseSchema,
  LowStockProductsResponseSchema,
  ProductPerformanceResponseSchema,
  DashboardKPIsQuerySchema,
  RevenueTrendQuerySchema,
  CustomerAcquisitionTrendQuerySchema,
  CustomersByLocationQuerySchema,
  CustomerCLVQuerySchema,
  TopSellingProductsQuerySchema,
  LowStockProductsQuerySchema,
  ProductPerformanceQuerySchema,
  AnalyticsRequestSchema, // Import the new schema
} from '../app-schema/analytics.js'

const router = Router()
const { OK } = StatusCodes

router.use(authenticateUser)

router.get(
  '/stores/:storeId/kpis',
  validate(AnalyticsRequestSchema(DashboardKPIsQuerySchema)),
  hasStoreAccess(['admin', 'editor', 'viewer']),
  getKPIsLogic,
  validateDbResult(DashboardKPIsResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/revenue-trends',
  validate(AnalyticsRequestSchema(RevenueTrendQuerySchema)),
  hasStoreAccess(['admin', 'editor', 'viewer']),
  getRevenueTrendsLogic,
  validateDbResult(RevenueTrendResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/sales-analytics',
  validate(AnalyticsRequestSchema(SalesAnalyticsQuerySchema)),
  hasStoreAccess(['admin', 'editor', 'viewer']),
  getSalesAnalyticsLogic,
  validateDbResult(SalesAnalyticsByProductResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/customer-acquisition-trends',
  validate(AnalyticsRequestSchema(CustomerAcquisitionTrendQuerySchema)),
  hasStoreAccess(['admin', 'editor', 'viewer']),
  getCustomerAcquisitionTrendsLogic,
  validateDbResult(CustomerAcquisitionTrendResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/customers-by-location',
  validate(AnalyticsRequestSchema(CustomersByLocationQuerySchema)),
  hasStoreAccess(['admin', 'editor', 'viewer']),
  getCustomersByLocationLogic,
  validateDbResult(CustomersByLocationResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/customer-lifetime-value',
  validate(AnalyticsRequestSchema(CustomerCLVQuerySchema)),
  hasStoreAccess(['admin', 'editor', 'viewer']),
  getCustomerLifetimeValueLogic,
  validateDbResult(CustomerCLVResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/top-selling-products',
  validate(AnalyticsRequestSchema(TopSellingProductsQuerySchema)),
  hasStoreAccess(['admin', 'editor', 'viewer']),
  getTopSellingProductsLogic,
  validateDbResult(TopSellingProductsResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/low-stock-products',
  validate(AnalyticsRequestSchema(LowStockProductsQuerySchema)),
  hasStoreAccess(['admin', 'editor', 'viewer']),
  getLowStockProductsLogic,
  validateDbResult(LowStockProductsResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/product-performance',
  validate(AnalyticsRequestSchema(ProductPerformanceQuerySchema)),
  hasStoreAccess(['admin', 'editor', 'viewer']),
  getProductPerformanceLogic,
  validateDbResult(ProductPerformanceResponseSchema),
  sendResponse(OK),
)

export default router
