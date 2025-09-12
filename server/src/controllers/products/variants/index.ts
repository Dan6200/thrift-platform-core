import { StatusCodes } from 'http-status-codes'
import createRouteProcessor from '../../process-routes.js'
import {
  VariantRequestSchema,
  VariantUpdateRequestSchema,
  VariantResponseSchema,
  VariantIdResponseSchema,
} from '../../../app-schema/products/variants.js'
import {
  ProcessRoute,
  ProcessRouteWithoutBodyAndDBResult,
} from '../../../types/process-routes.js'
import { validateReqData } from '../../utils/request-validation.js'
import { validateResData } from '../../utils/response-validation.js'
import createVariantQuery from './definitions/create-query.js'
import updateVariantQuery from './definitions/update-query.js'
import deleteVariantQuery from './definitions/delete-query.js'

const { CREATED, OK, NO_CONTENT } = StatusCodes

const processPostRoute = <ProcessRoute>createRouteProcessor
const processPatchRoute = <ProcessRoute>createRouteProcessor
const processDeleteRoute = <ProcessRouteWithoutBodyAndDBResult>(
  createRouteProcessor
)

export const createVariant = processPostRoute({
  Query: createVariantQuery,
  status: CREATED,
  validateBody: validateReqData(VariantRequestSchema),
  validateResult: validateResData(VariantIdResponseSchema),
})

export const updateVariant = processPatchRoute({
  Query: updateVariantQuery,
  status: OK,
  validateBody: validateReqData(VariantUpdateRequestSchema),
  validateResult: validateResData(VariantResponseSchema),
})

export const deleteVariant = processDeleteRoute({
  Query: deleteVariantQuery,
  status: NO_CONTENT,
})
