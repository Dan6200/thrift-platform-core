import { StatusCodes } from 'http-status-codes'
import {
  AvatarResponseSchema,
} from '#src/app-schema/media.js'
import { ProcessRoute } from '../../types/process-routes.js'
import processRoute from '../process-routes.js'
import { createAvatarQuery } from './definitions.js'
import { validateResData } from '../utils/response-validation.js'

const { CREATED } = StatusCodes

const processPostRoute = <ProcessRoute>processRoute
export const createAvatar = processPostRoute({
  Query: createAvatarQuery,
  status: CREATED,
  validateResult: validateResData(AvatarResponseSchema),
})
