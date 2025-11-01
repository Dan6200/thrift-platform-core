import { StatusCodes } from 'http-status-codes'
import {
  ProductMediaQuerySchema,
  ProductMediaRequestSchema,
  ProductMediaResponseSchema,
  UpdateProductMediaRequestSchema,
} from '#src/app-schema/media/products.js'
import {
  ProcessRoute,
  ProcessRouteWithoutBody,
  ProcessRouteWithoutBodyAndDBResult,
} from '../../types/process-routes.js'
import routeProcessor from '../process-routes.js'
import { validateReqData } from '../utils/request-validation.js'
import {
  createProductMediaQuery,
  getProductMediaQuery,
  updateProductMediaQuery,
  deleteProductMediaQuery,
} from './products/definitions.js'
import { validateResData } from '../utils/response-validation.js'

const { CREATED, OK, NO_CONTENT } = StatusCodes

const processRoute = <ProcessRoute>routeProcessor
const processRouteWithoutBody = <ProcessRouteWithoutBody>routeProcessor
const processRouteWithoutBodyOrResponse = <ProcessRouteWithoutBodyAndDBResult>(
  routeProcessor
)
export const createProductMedia = processRoute({
  Query: createProductMediaQuery,
  status: CREATED,
  validateBody: validateReqData(ProductMediaRequestSchema),
  validateQuery: validateReqData(ProductMediaQuerySchema),
  validateResult: validateResData(ProductMediaResponseSchema),
})

export const getProductMedia = processRouteWithoutBody({
  Query: getProductMediaQuery,
  status: OK,
  validateResult: validateResData(ProductMediaResponseSchema),
})

export const updateProductMedia = processRoute({
  Query: updateProductMediaQuery,
  status: OK,
  validateBody: validateReqData(UpdateProductMediaRequestSchema),
  validateResult: validateResData(ProductMediaResponseSchema),
})

export const deleteProductMedia = processRouteWithoutBodyOrResponse({
  Query: deleteProductMediaQuery,
  status: NO_CONTENT,
})
