import { StatusCodes } from 'http-status-codes'
import {
  addItemToCartSchema,
  updateCartItemSchema,
  cartResponseSchema,
  cartItemSchema,
} from '../../app-schema/cart.js'
import {
  ProcessRoute,
  ProcessRouteWithoutBody,
  ProcessRouteWithoutBodyAndDBResult,
} from '../../types/process-routes.js'
import processRoute from '../process-routes.js'
import { validateReqData } from '../utils/request-validation.js'
import { validateResData } from '../utils/response-validation.js'
import {
  getCartQuery,
  addItemToCartQuery,
  updateCartItemQuery,
  removeCartItemQuery,
} from './definitions.js'

const { CREATED, OK, NO_CONTENT } = StatusCodes

const processPostRoute = <ProcessRoute>processRoute
export const addItemToCart = processPostRoute({
  Query: addItemToCartQuery,
  status: CREATED,
  validateBody: validateReqData(addItemToCartSchema),
  validateResult: validateResData(cartItemSchema),
})

const processGetRoute = <ProcessRouteWithoutBody>processRoute
export const getCart = processGetRoute({
  Query: getCartQuery,
  status: OK,
  validateResult: validateResData(cartResponseSchema),
})

const processPutRoute = <ProcessRoute>processRoute
export const updateCartItem = processPutRoute({
  Query: updateCartItemQuery,
  status: OK,
  validateBody: validateReqData(updateCartItemSchema),
  validateResult: validateResData(cartItemSchema),
})

const processDeleteRoute = <ProcessRouteWithoutBodyAndDBResult>processRoute
export const removeCartItem = processDeleteRoute({
  Query: removeCartItemQuery,
  status: NO_CONTENT,
})

