import { StatusCodes } from 'http-status-codes'
import {
  AvatarResponseSchema,
  AvatarRequestSchema,
} from '#src/app-schema/media/avatar.js'
import {
  ProcessRoute,
  ProcessRouteWithoutBody,
  ProcessRouteWithoutBodyAndDBResult,
} from '../../types/process-routes.js'
import routeProcessor from '../process-routes.js'
import {
  createAvatarQuery,
  getAvatarQuery,
  updateAvatarQuery,
  deleteAvatarQuery,
} from './definitions.js'
import { validateResData } from '../utils/response-validation.js'
import { validateReqData } from '../utils/request-validation.js'

const { CREATED, OK, NO_CONTENT } = StatusCodes

const processRoute = <ProcessRoute>routeProcessor
export const createAvatar = processRoute({
  Query: createAvatarQuery,
  status: CREATED,
  validateBody: validateReqData(AvatarRequestSchema),
  validateResult: validateResData(AvatarResponseSchema),
})

const processRouteWithoutBody = <ProcessRouteWithoutBody>routeProcessor
export const getAvatar = processRouteWithoutBody({
  Query: getAvatarQuery,
  status: OK,
  validateResult: validateResData(AvatarResponseSchema),
})

export const updateAvatar = processRoute({
  Query: updateAvatarQuery,
  status: OK,
  validateBody: validateReqData(AvatarRequestSchema),
  validateResult: validateResData(AvatarResponseSchema),
})

const processRouteWithoutBodyOrResponse = <ProcessRouteWithoutBodyAndDBResult>(
  routeProcessor
)
export const deleteAvatar = processRouteWithoutBodyOrResponse({
  Query: deleteAvatarQuery,
  status: NO_CONTENT,
})
