import {
  OrderCreateRequestSchema,
  OrderResponseSchema,
  OrderIdSchema,
  OrderGETAllResponseSchema,
  OrderQuerySchema,
} from '#src/app-schema/orders/index.js'
import {
  OrderCreateRequestData,
  OrderResponseData,
  OrderId,
  OrderQueryData,
} from '#src/types/orders.js'

export const isValidOrderCreateRequest = (
  data: unknown,
): data is OrderCreateRequestData => {
  const { error } = OrderCreateRequestSchema.validate(data)
  error && console.error(error)
  return !error
}

export const isValidOrderResponse = (
  data: unknown,
): data is OrderResponseData => {
  const { error } = OrderResponseSchema.validate(data)
  error && console.error(error)
  return !error
}

export const isValidOrderId = (data: unknown): data is OrderId => {
  const { error } = OrderIdSchema.validate(data)
  error && console.error(error)
  return !error
}

export const isValidOrderGETAllResponse = (
  data: unknown,
): data is OrderResponseData[] => {
  const { error } = OrderGETAllResponseSchema.validate(data)
  error && console.error(error)
  return !error
}

export const isValidOrderQuery = (data: unknown): data is OrderQueryData => {
  const { error } = OrderQuerySchema.validate(data)
  error && console.error(error)
  return !error
}
