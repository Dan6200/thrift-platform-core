import { StatusCodes } from 'http-status-codes'
import createRouteProcessor from '../process-routes.js' // Adjust path as needed
import { ProcessRouteWithoutBody } from '../../types/process-routes.js' // Adjust path as needed
import { validateReqData } from '../utils/request-validation.js' // Adjust path as needed
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
  SalesAnalyticsRequestSchema,
  SalesAnalyticsByProductResponseSchema,
  SalesAnalyticsByCategoryResponseSchema,
  SalesAnalyticsRecentOrdersResponseSchema,
  CustomerAcquisitionTrendResponseSchema,
  CustomersByLocationResponseSchema,
  CustomerCLVResponseSchema,
  TopSellingProductsResponseSchema,
  LowStockProductsResponseSchema,
  ProductPerformanceResponseSchema,
} from '../../app-schema/dashboard.js' // Adjust path as needed

const { OK } = StatusCodes

const processGetRoute = <ProcessRouteWithoutBody>createRouteProcessor

// --- High-Level Overview ---

const getKPIs = processGetRoute({
  Query: getKPIsQuery,
  status: OK,
  // validateQuery: validateReqData(DashboardKPIsRequestSchema), // if you have query params to validate
  validateResult: validateResData(DashboardKPIsResponseSchema),
})

const getRevenueTrends = processGetRoute({
  Query: getRevenueTrendsQuery,
  status: OK,
  // validateQuery: validateReqData(RevenueTrendRequestSchema),
  validateResult: validateResData(RevenueTrendResponseSchema.array()), // Response is an array
})

// --- Detailed Analytics Sections - Sales Performance ---

const getSalesAnalytics = processGetRoute({
  Query: getSalesAnalyticsQuery,
  status: OK,
  validateQuery: validateReqData(SalesAnalyticsRequestSchema), // This schema will handle the 'type' parameter
  // Result validation will be dynamic based on 'type' in the query definition.
  // For simplicity, we'll let the query definition handle the specific schema for now,
  // or you could create a union type schema for the response.
  // validateResult: validateResData(SalesAnalyticsResponseUnionSchema),
})

// --- Detailed Analytics Sections - Customer Insights ---

const getCustomerAcquisitionTrends = processGetRoute({
  Query: getCustomerAcquisitionTrendsQuery,
  status: OK,
  // validateQuery: validateReqData(CustomerAcquisitionTrendRequestSchema),
  validateResult: validateResData(
    CustomerAcquisitionTrendResponseSchema.array(),
  ),
})

const getCustomersByLocation = processGetRoute({
  Query: getCustomersByLocationQuery,
  status: OK,
  // validateQuery: validateReqData(CustomersByLocationRequestSchema),
  validateResult: validateResData(CustomersByLocationResponseSchema.array()),
})

const getCustomerLifetimeValue = processGetRoute({
  Query: getCustomerLifetimeValueQuery,
  status: OK,
  // validateQuery: validateReqData(CustomerCLVRequestSchema),
  validateResult: validateResData(CustomerCLVResponseSchema.array()),
})

// --- Detailed Analytics Sections - Product Performance ---

const getTopSellingProducts = processGetRoute({
  Query: getTopSellingProductsQuery,
  status: OK,
  // validateQuery: validateReqData(TopSellingProductsRequestSchema),
  validateResult: validateResData(TopSellingProductsResponseSchema.array()),
})

const getLowStockProducts = processGetRoute({
  Query: getLowStockProductsQuery,
  status: OK,
  // validateQuery: validateReqData(LowStockProductsRequestSchema),
  validateResult: validateResData(LowStockProductsResponseSchema.array()),
})

const getProductPerformance = processGetRoute({
  Query: getProductPerformanceQuery,
  status: OK,
  // validateQuery: validateReqData(ProductPerformanceRequestSchema),
  validateResult: validateResData(ProductPerformanceResponseSchema.array()),
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
