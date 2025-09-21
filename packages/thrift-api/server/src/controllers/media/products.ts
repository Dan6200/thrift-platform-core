import { StatusCodes } from 'http-status-codes'
import {
  ProductMediaQuerySchema,
  ProductMediaRequestSchema,
  ProductMediaResponseSchema,
} from '#src/app-schema/media/products.js'
import { ProcessRoute } from '../../types/process-routes.js'
import processRoute from '../process-routes.js'
import { validateReqData } from '../utils/request-validation.js'
import { createProductMediaQuery, getProductMediaQuery, updateProductMediaQuery, deleteProductMediaQuery } from './definitions.js'
import { validateResData } from '../utils/response-validation.js'

const { CREATED, OK, NO_CONTENT } = StatusCodes

const processPostRoute = <ProcessRoute>processRoute
export const createProductMedia = processPostRoute({
  Query: createProductMediaQuery,
  status: CREATED,
  validateBody: validateReqData(ProductMediaRequestSchema),
  validateQuery: validateReqData(ProductMediaQuerySchema),
  validateResult: validateResData(ProductMediaResponseSchema),
})

export const getProductMedia = processPostRoute({
  Query: getProductMediaQuery,
  status: OK,
  validateResult: validateResData(ProductMediaResponseSchema),
})

export const updateProductMedia = processPostRoute({
  Query: updateProductMediaQuery,
  status: OK,
  validateBody: validateReqData(ProductMediaRequestSchema),
  validateResult: validateResData(ProductMediaResponseSchema),
})

export const deleteProductMedia = processPostRoute({
  Query: deleteProductMediaQuery,
  status: NO_CONTENT,
})