import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from '../request-validation.js'
import { validateDbResult } from '../db-result-validation.js'
import { sendResponse } from '../send-response.js'
import authenticateUser from '../authentication.js'
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
  getKPIsLogic,
  validateDbResult(DashboardKPIsResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/revenue-trends',
  validate(AnalyticsRequestSchema(RevenueTrendQuerySchema)),
  getRevenueTrendsLogic,
  validateDbResult(RevenueTrendResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/sales-analytics',
  validate(AnalyticsRequestSchema(SalesAnalyticsQuerySchema)),
  getSalesAnalyticsLogic,
  validateDbResult(SalesAnalyticsByProductResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/customer-acquisition-trends',
  validate(AnalyticsRequestSchema(CustomerAcquisitionTrendQuerySchema)),
  getCustomerAcquisitionTrendsLogic,
  validateDbResult(CustomerAcquisitionTrendResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/customers-by-location',
  validate(AnalyticsRequestSchema(CustomersByLocationQuerySchema)),
  getCustomersByLocationLogic,
  validateDbResult(CustomersByLocationResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/customer-lifetime-value',
  validate(AnalyticsRequestSchema(CustomerCLVQuerySchema)),
  getCustomerLifetimeValueLogic,
  validateDbResult(CustomerCLVResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/top-selling-products',
  validate(AnalyticsRequestSchema(TopSellingProductsQuerySchema)),
  getTopSellingProductsLogic,
  validateDbResult(TopSellingProductsResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/low-stock-products',
  validate(AnalyticsRequestSchema(LowStockProductsQuerySchema)),
  getLowStockProductsLogic,
  validateDbResult(LowStockProductsResponseSchema),
  sendResponse(OK),
)

router.get(
  '/stores/:storeId/product-performance',
  validate(AnalyticsRequestSchema(ProductPerformanceQuerySchema)),
  getProductPerformanceLogic,
  validateDbResult(ProductPerformanceResponseSchema),
  sendResponse(OK),
)

export default router
