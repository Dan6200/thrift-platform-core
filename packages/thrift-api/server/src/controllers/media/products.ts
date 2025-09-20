import { StatusCodes } from 'http-status-codes'
import {
  ProductMediaQuerySchema,
  ProductMediaRequestSchema,
  ProductMediaResponseSchema,
} from '#src/app-schema/media.js'
import { ProcessRoute } from '../../types/process-routes.js'
import processRoute from '../process-routes.js'
import { validateReqData } from '../utils/request-validation.js'
import { createProductMediaQuery } from './definitions.js'
import { validateResData } from '../utils/response-validation.js'

const { CREATED } = StatusCodes

const processPostRoute = <ProcessRoute>processRoute
export const createProductMedia = processPostRoute({
  Query: createProductMediaQuery,
  status: CREATED,
  validateBody: validateReqData(ProductMediaRequestSchema),
  validateQuery: validateReqData(ProductMediaQuerySchema),
  validateResult: validateResData(ProductMediaResponseSchema),
})
