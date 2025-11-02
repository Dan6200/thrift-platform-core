import { StatusCodes } from 'http-status-codes'
import testRequest from '../../test-request/index.js'
import { TestRequest, RequestParams } from '../../test-request/types.js'
import {
  DashboardKPIsResponseSchema,
  RevenueTrendResponseSchema,
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

const buildDashboardPath = (storeId: string, endpoint: string) =>
  `/v1/dashboard/${storeId}/${endpoint}`

export const testGetKPIs = (args: {
  token: string
  query: { storeId: string; startDate: string; endDate: string }
}) => {
  const { storeId, ...query } = args.query
  const path = buildDashboardPath(storeId, 'kpis')
  const requestParams: RequestParams = {
    token: args.token,
    query,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path,
    validateTestResData: (data: unknown) => {
      const { error } = DashboardKPIsResponseSchema.validate(data)
      return !error
    },
  })(requestParams)
}

export const testGetRevenueTrends = (args: {
  token: string
  query: {
    storeId: string
    startDate: string
    endDate: string
    interval: string
  }
}) => {
  const { storeId, ...query } = args.query
  const path = buildDashboardPath(storeId, 'revenue-trends')
  const requestParams: RequestParams = {
    token: args.token,
    query,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path,
    validateTestResData: (data: unknown) => {
      const { error } = RevenueTrendResponseSchema.validate(data)
      return !error
    },
  })(requestParams)
}

export const testGetSalesAnalytics = (args: {
  token: string
  query: {
    storeId: string
    type: string
    offset?: number
    limit?: number
    sortBy?: string
    sortOrder?: string
    status?: string
  }
}) => {
  const { storeId, ...query } = args.query
  const path = buildDashboardPath(storeId, 'sales-analytics')
  const requestParams: RequestParams = {
    token: args.token,
    query,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path,
    validateTestResData: (data, query) => {
      if (query && query.type === 'by-product') {
        const { error } = SalesAnalyticsByProductResponseSchema.validate(data)
        return !error
      } else if (query && query.type === 'by-category') {
        const { error } = SalesAnalyticsByCategoryResponseSchema.validate(data)
        return !error
      } else if (query && query.type === 'recent-orders') {
        const { error } =
          SalesAnalyticsRecentOrdersResponseSchema.validate(data)
        return !error
      }
      return true
    },
  })(requestParams)
}

export const testGetCustomerAcquisitionTrends = (args: {
  token: string
  query: {
    storeId: string
    startDate: string
    endDate: string
    interval: string
  }
}) => {
  const { storeId, ...query } = args.query
  const path = buildDashboardPath(storeId, 'customer-acquisition-trends')
  const requestParams: RequestParams = {
    token: args.token,
    query,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path,
    validateTestResData: (data: unknown) => {
      const { error } = CustomerAcquisitionTrendResponseSchema.validate(data)
      return !error
    },
  })(requestParams)
}

export const testGetCustomersByLocation = (args: {
  token: string
  query: { storeId: string; locationType: string }
}) => {
  const { storeId, ...query } = args.query
  const path = buildDashboardPath(storeId, 'customers-by-location')
  const requestParams: RequestParams = {
    token: args.token,
    query,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path,
    validateTestResData: (data: unknown) => {
      const { error } = CustomersByLocationResponseSchema.validate(data)
      return !error
    },
  })(requestParams)
}

export const testGetCustomerLifetimeValue = (args: {
  token: string
  query: { storeId: string; limit: number; sortBy: string; sortOrder: string }
}) => {
  const { storeId, ...query } = args.query
  const path = buildDashboardPath(storeId, 'customer-lifetime-value')
  const requestParams: RequestParams = {
    token: args.token,
    query,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path,
    validateTestResData: (data: unknown) => {
      const { error } = CustomerCLVResponseSchema.validate(data)
      return !error
    },
  })(requestParams)
}

export const testGetTopSellingProducts = (args: {
  token: string
  query: { storeId: string; startDate: string; endDate: string; limit: number }
}) => {
  const { storeId, ...query } = args.query
  const path = buildDashboardPath(storeId, 'top-selling-products')
  const requestParams: RequestParams = {
    token: args.token,
    query,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path,
    validateTestResData: (data: unknown) => {
      const { error } = TopSellingProductsResponseSchema.validate(data)
      return !error
    },
  })(requestParams)
}

export const testGetLowStockProducts = (args: {
  token: string
  query: { storeId: string; threshold: number; limit: number }
}) => {
  const { storeId, ...query } = args.query
  const path = buildDashboardPath(storeId, 'low-stock-products')
  const requestParams: RequestParams = {
    token: args.token,
    query,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path,
    validateTestResData: (data: unknown) => {
      const { error } = LowStockProductsResponseSchema.validate(data)
      return !error
    },
  })(requestParams)
}

export const testGetProductPerformance = (args: {
  token: string
  query: { storeId: string; startDate: string; endDate: string }
}) => {
  const { storeId, ...query } = args.query
  const path = buildDashboardPath(storeId, 'product-performance')
  const requestParams: RequestParams = {
    token: args.token,
    query,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path,
    validateTestResData: (data: unknown) => {
      const { error } = ProductPerformanceResponseSchema.validate(data)
      return !error
    },
  })(requestParams)
}
