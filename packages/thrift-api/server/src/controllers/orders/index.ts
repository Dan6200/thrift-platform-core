import { StatusCodes } from 'http-status-codes'
import {
  OrderCreateRequestSchema,
  OrderResponseSchema,
  OrderQuerySchema,
  OrderGETResponseSchema,
  OrderGETAllResponseSchema,
} from '#src/app-schema/orders/index.js'
import processRoute from '#src/controllers/process-routes.js'
import { validateReqData } from '#src/controllers/utils/request-validation.js'
import { validateResData } from '#src/controllers/utils/response-validation.js'
import {
  createOrderQuery,
  getAllOrdersQuery,
  getOrderQuery,
} from '../orders/definitions.js'

const { CREATED, OK } = StatusCodes

export const createOrder = processRoute({
  Query: createOrderQuery,
  status: CREATED,
  validateQuery: validateReqData(OrderQuerySchema),
  validateBody: validateReqData(OrderCreateRequestSchema),
  validateResult: validateResData(OrderResponseSchema),
})

export const getAllOrders = processRoute({
  Query: getAllOrdersQuery,
  status: OK,
  validateQuery: validateReqData(OrderQuerySchema),
  validateResult: validateResData(OrderGETAllResponseSchema),
})

export const getOrder = processRoute({
  Query: getOrderQuery,
  status: OK,
  validateQuery: validateReqData(OrderQuerySchema),
  validateResult: validateResData(OrderGETResponseSchema),
})
