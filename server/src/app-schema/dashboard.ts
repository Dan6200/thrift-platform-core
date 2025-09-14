import joi from 'joi' // Using lowercase joi as seen in your products schema

// --- Common Schemas ---
const DateSchema = joi.string().isoDate()
const LimitOffsetSchema = joi.number().integer().min(1)
const SortOrderSchema = joi.string().valid('asc', 'desc')

// --- Query Schemas (Query Parameters) ---

export const DashboardKPIsQuerySchema = joi.array().items(joi.object({
  startDate: DateSchema.optional(),
  endDate: DateSchema.optional(),
})).length(1)

export const RevenueTrendQuerySchema = joi.array().items(joi.object({
  startDate: DateSchema.required(),
  endDate: DateSchema.required(),
  interval: joi
    .string()
    .valid('day', 'week', 'month', 'year')
    .default('day')
    .optional(),
})).length(1)

export const SalesAnalyticsQuerySchema = joi.array().items(joi.object({
  type: joi
    .string()
    .valid('by-product', 'by-category', 'recent-orders')
    .required(),
  startDate: DateSchema.optional(),
  endDate: DateSchema.optional(),
  limit: LimitOffsetSchema.optional().when('type', {
    is: joi.string().valid('by-product', 'recent-orders'),
    then: joi.required(), // limit is applicable to these types
    otherwise: joi.optional(),
  }),
  offset: LimitOffsetSchema.optional().when('type', {
    is: joi.string().valid('by-product', 'recent-orders'),
    then: joi.required(),
    otherwise: joi.optional(),
  }),
  sortBy: joi
    .string()
    .optional()
    .when('type', {
      is: 'by-product',
      then: joi
        .string()
        .valid('unitsSold', 'totalRevenue')
        .default('unitsSold'),
      otherwise: joi.forbidden(), // sortBy not applicable to other types
    }),
  sortOrder: SortOrderSchema.optional().when('type', {
    is: 'by-product',
    then: joi.required(),
    otherwise: joi.forbidden(),
  }),
  status: joi
    .string()
    .optional()
    .when('type', {
      is: 'recent-orders',
      then: joi.string().valid('pending', 'completed', 'cancelled'),
      otherwise: joi.forbidden(),
    }),
})).length(1)

export const CustomerAcquisitionTrendQuerySchema = joi.array().items(joi.object({
  startDate: DateSchema.required(),
  endDate: DateSchema.required(),
  interval: joi
    .string()
    .valid('day', 'week', 'month', 'year')
    .default('month')
    .optional(),
})).length(1)

export const CustomersByLocationQuerySchema = joi.array().items(joi.object({
  locationType: joi
    .string()
    .valid('country', 'city')
    .default('country')
    .optional(),
})).length(1)

export const CustomerCLVQuerySchema = joi.array().items(joi.object({
  limit: LimitOffsetSchema.optional(),
  offset: LimitOffsetSchema.optional(),
  sortBy: joi.string().valid('clv', 'customerName').default('clv').optional(),
  sortOrder: SortOrderSchema.default('desc').optional(),
})).length(1)

export const TopSellingProductsQuerySchema = joi.array().items(joi.object({
  startDate: DateSchema.optional(),
  endDate: DateSchema.optional(),
  sortBy: joi.string().valid('units', 'revenue').default('units').optional(),
  limit: LimitOffsetSchema.default(10).optional(),
})).length(1)

export const LowStockProductsQuerySchema = joi.array().items(joi.object({
  threshold: joi.number().integer().min(0).default(20).optional(),
  limit: LimitOffsetSchema.optional(),
  offset: LimitOffsetSchema.optional(),
})).length(1)

export const ProductPerformanceQuerySchema = joi.object({
  startDate: DateSchema.optional(),
  endDate: DateSchema.optional(),
  limit: LimitOffsetSchema.optional(),
  offset: LimitOffsetSchema.optional(),
})

// --- Response Schemas ---

export const DashboardKPIsResponseSchema = joi.object({
  totalRevenue: joi.number().precision(2).required(),
  totalOrders: joi.number().integer().min(0).required(),
  averageOrderValue: joi.number().precision(2).required(),
  newCustomers: joi.number().integer().min(0).required(),
  returningCustomers: joi.number().integer().min(0).required(),
  conversionRate: joi.number().precision(2).allow(null).optional(), // Can be null as per spec
})

export const RevenueTrendResponseSchema = joi.object({
  date: joi.string().isoDate().required(),
  revenue: joi.number().precision(2).required(),
})

// Sales Analytics Response Schemas (can be unioned or handled dynamically in controller)
export const SalesAnalyticsByProductResponseSchema = joi.object({
  productId: joi.number().integer().required(),
  productTitle: joi.string().required(),
  unitsSold: joi.number().integer().min(0).required(),
  totalRevenue: joi.number().precision(2).required(),
})

export const SalesAnalyticsByCategoryResponseSchema = joi.object({
  categoryId: joi.number().integer().required(),
  categoryName: joi.string().required(),
  totalRevenue: joi.number().precision(2).required(),
})

export const SalesAnalyticsRecentOrdersResponseSchema = joi.object({
  orderId: joi.number().integer().required(),
  customerName: joi.string().required(),
  totalAmount: joi.number().precision(2).required(),
  status: joi.string().required(),
  orderDate: joi.string().isoDate().required(),
})

// Example of a union schema if you prefer to validate all types in one go at the controller level
// export const SalesAnalyticsResponseUnionSchema = joi.alternatives().try(
//   joi.array().items(SalesAnalyticsByProductResponseSchema),
//   joi.array().items(SalesAnalyticsByCategoryResponseSchema),
//   joi.array().items(SalesAnalyticsRecentOrdersResponseSchema)
// );

export const CustomerAcquisitionTrendResponseSchema = joi.object({
  date: joi.string().isoDate().required(),
  newCustomers: joi.number().integer().min(0).required(),
})

export const CustomersByLocationResponseSchema = joi.object({
  location: joi.string().required(),
  customerCount: joi.number().integer().min(0).required(),
})

export const CustomerCLVResponseSchema = joi.object({
  customerId: joi.string().guid({ version: 'uuidv4' }).required(),
  customerName: joi.string().required(),
  clv: joi.number().precision(2).required(),
})

export const TopSellingProductsResponseSchema = joi.object({
  productId: joi.number().integer().required(),
  productTitle: joi.string().required(),
  unitsSold: joi.number().integer().min(0).required(),
  totalRevenue: joi.number().precision(2).required(),
})

export const LowStockProductsResponseSchema = joi.object({
  productId: joi.number().integer().required(),
  productTitle: joi.string().required(),
  quantityAvailable: joi.number().integer().min(0).required(),
})

export const ProductPerformanceResponseSchema = joi.object({
  productId: joi.number().integer().required(),
  productTitle: joi.string().required(),
  purchases: joi.number().integer().min(0).required(),
  views: joi.number().integer().min(0).allow(null).required(), // Explicitly allow null for views
})
