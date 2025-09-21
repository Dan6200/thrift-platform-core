import { StatusCodes } from 'http-status-codes'
import { AvatarResponseSchema, AvatarRequestSchema } from '#src/app-schema/media/avatar.js'
import { ProcessRouteWithoutBody } from '../../types/process-routes.js'
import processRoute from '../process-routes.js'
import { createAvatarQuery, getAvatarQuery, updateAvatarQuery, deleteAvatarQuery } from './definitions.js'
import { validateResData } from '../utils/response-validation.js'
import { validateReqData } from '../utils/request-validation.js'

const { CREATED, OK, NO_CONTENT } = StatusCodes

const processPostRoute = <ProcessRouteWithoutBody>processRoute
export const createAvatar = processPostRoute({
  Query: createAvatarQuery,
  status: CREATED,
  validateBody: validateReqData(AvatarRequestSchema),
  validateResult: validateResData(AvatarResponseSchema),
})

export const getAvatar = processPostRoute({
  Query: getAvatarQuery,
  status: OK,
  validateResult: validateResData(AvatarResponseSchema),
})

export const updateAvatar = processPostRoute({
  Query: updateAvatarQuery,
  status: OK,
  validateBody: validateReqData(AvatarRequestSchema),
  validateResult: validateResData(AvatarResponseSchema),
})

export const deleteAvatar = processPostRoute({
  Query: deleteAvatarQuery,
  status: NO_CONTENT,
})
