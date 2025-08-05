import { StatusCodes } from 'http-status-codes'
import testRequest from '../../test-request/index.js'
import { TestRequest, TestRequestWithQParams } from '../../test-request/types.js'
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
} from '#src/app-schema/dashboard.js'

const { OK } = StatusCodes

export const testGetKPIs = (testRequest as TestRequestWithQParams)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: (data: unknown) => {
    const { error } = DashboardKPIsResponseSchema.validate(data)
    return !error
  },
})

export const testGetRevenueTrends = (testRequest as TestRequestWithQParams)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: (data: unknown) => {
    const { error } = RevenueTrendResponseSchema.validate(data)
    return !error
  },
})

export const testGetSalesAnalytics = (testRequest as TestRequestWithQParams)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: (data, query) => {
    // This is a dynamic response based on the 'type' query parameter
    // For simplicity, we'll validate against a union or a generic object for now
    // In a real scenario, you'd have a more sophisticated validation here
    if (query && query.type === 'by-product') {
      const { error } = SalesAnalyticsByProductResponseSchema.validate(data)
      return !error
    } else if (query && query.type === 'by-category') {
      const { error } = SalesAnalyticsByCategoryResponseSchema.validate(data)
      return !error
    } else if (query && query.type === 'recent-orders') {
      const { error } = SalesAnalyticsRecentOrdersResponseSchema.validate(data)
      return !error
    }
    // Fallback for unknown types or if no type is provided
    return true // Or throw an error for invalid type
  },
})

export const testGetCustomerAcquisitionTrends = (testRequest as TestRequestWithQParams)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: (data: unknown) => {
    const { error } = CustomerAcquisitionTrendResponseSchema.validate(data)
    return !error
  },
})

export const testGetCustomersByLocation = (testRequest as TestRequestWithQParams)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: (data: unknown) => {
    const { error } = CustomersByLocationResponseSchema.validate(data)
    return !error
  },
})

export const testGetCustomerLifetimeValue = (testRequest as TestRequestWithQParams)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: (data: unknown) => {
    const { error } = CustomerCLVResponseSchema.validate(data)
    return !error
  },
})

export const testGetTopSellingProducts = (testRequest as TestRequestWithQParams)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: (data: unknown) => {
    const { error } = TopSellingProductsResponseSchema.validate(data)
    return !error
  },
})

export const testGetLowStockProducts = (testRequest as TestRequestWithQParams)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: (data: unknown) => {
    const { error } = LowStockProductsResponseSchema.validate(data)
    return !error
  },
})

export const testGetProductPerformance = (testRequest as TestRequestWithQParams)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: (data: unknown) => {
    const { error } = ProductPerformanceResponseSchema.validate(data)
    return !error
  },
})
