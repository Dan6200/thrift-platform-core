import { StatusCodes } from 'http-status-codes'
import createRouteProcessor from '../process-routes.js' // Adjust path as needed
import { ProcessRouteWithoutBody } from '../../types/process-routes.js' // Adjust path as needed
import { validateQuerySchema } from '../utils/request-validation.js' // Adjust path as needed
import { validateResData } from '../utils/response-validation.js' // Adjust path as needed

// Import query definitions
import getKPIsQuery from './definitions/get-kpis.js'
import getRevenueTrendsQuery from './definitions/get-revenue-trends.js'
import getSalesAnalyticsQuery from './definitions/get-sales-analytics.js'
import getCustomerAcquisitionTrendsQuery from './definitions/get-customer-acquisition-trends.js'
import getCustomersByLocationQuery from './definitions/get-customers-by-location.js'
import getCustomerLifetimeValueQuery from './definitions/get-customer-lifetime-value.js'
import getTopSellingProductsQuery from './definitions/get-top-selling-products.js'
import getLowStockProductsQuery from './definitions/get-low-stock-products.js'
import getProductPerformanceQuery from './definitions/get-product-performance.js'

// Import dashboard-specific schemas (you'll need to define these in app-schema/dashboard.ts)
// For example:
import {
  DashboardKPIsResponseSchema,
  RevenueTrendResponseSchema,
  SalesAnalyticsQuerySchema,
  SalesAnalyticsByProductResponseSchema,
  SalesAnalyticsByCategoryResponseSchema,
  SalesAnalyticsRecentOrdersResponseSchema,
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
} from '../../app-schema/dashboard.js' // Adjust path as needed
import { validateQuerySchema } from '../utils/query-validation.js'

const { OK } = StatusCodes

const processGetRoute = <ProcessRouteWithoutBody>createRouteProcessor

// --- High-Level Overview ---

const getKPIs = processGetRoute({
  Query: getKPIsQuery,
  status: OK,
  validateQuery: validateQuerySchema(DashboardKPIsQuerySchema),
  validateResult: validateResData(DashboardKPIsResponseSchema, {
    allowEmpty: true,
  }),
})

const getRevenueTrends = processGetRoute({
  Query: getRevenueTrendsQuery,
  status: OK,
  validateQuery: validateQuerySchema(RevenueTrendQuerySchema),
  validateResult: validateResData(RevenueTrendResponseSchema, {
    allowEmpty: true,
  }), // Allow an empty response
})

// --- Detailed Analytics Sections - Sales Performance ---

const getSalesAnalytics = processGetRoute({
  Query: getSalesAnalyticsQuery,
  status: OK,
  validateQuery: validateQuerySchema(SalesAnalyticsQuerySchema),
  validateResult: validateResData(SalesAnalyticsByProductResponseSchema, {
    allowEmpty: true,
  }), // Assuming by-product is the default or most common
})

// --- Detailed Analytics Sections - Customer Insights ---

const getCustomerAcquisitionTrends = processGetRoute({
  Query: getCustomerAcquisitionTrendsQuery,
  status: OK,
  validateQuery: validateQuerySchema(CustomerAcquisitionTrendQuerySchema),
  validateResult: validateResData(CustomerAcquisitionTrendResponseSchema),
})

const getCustomersByLocation = processGetRoute({
  Query: getCustomersByLocationQuery,
  status: OK,
  validateQuery: validateQuerySchema(CustomersByLocationQuerySchema),
  validateResult: validateResData(CustomersByLocationResponseSchema),
})

const getCustomerLifetimeValue = processGetRoute({
  Query: getCustomerLifetimeValueQuery,
  status: OK,
  validateQuery: validateQuerySchema(CustomerCLVQuerySchema),
  validateResult: validateResData(CustomerCLVResponseSchema),
})

// --- Detailed Analytics Sections - Product Performance ---

const getTopSellingProducts = processGetRoute({
  Query: getTopSellingProductsQuery,
  status: OK,
  validateQuery: validateQuerySchema(TopSellingProductsQuerySchema),
  validateResult: validateResData(TopSellingProductsResponseSchema),
})

const getLowStockProducts = processGetRoute({
  Query: getLowStockProductsQuery,
  status: OK,
  validateQuery: validateQuerySchema(LowStockProductsQuerySchema),
  validateResult: validateResData(LowStockProductsResponseSchema),
})

const getProductPerformance = processGetRoute({
  Query: getProductPerformanceQuery,
  status: OK,
  validateQuery: validateQuerySchema(ProductPerformanceQuerySchema),
  validateResult: validateResData(ProductPerformanceResponseSchema),
})

export {
  getKPIs,
  getRevenueTrends,
  getSalesAnalytics,
  getCustomerAcquisitionTrends,
  getCustomersByLocation,
  getCustomerLifetimeValue,
  getTopSellingProducts,
  getLowStockProducts,
  getProductPerformance,
}
