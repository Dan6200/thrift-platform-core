import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { ProfileResponseSchema } from '../../app-schema/profiles.js'
import { getProfileLogic } from '../../logic/profile/get-profile.js'
import { validateDbResult } from '../../db-result-validation.js'
import { sendResponse } from '../../send-response.js'
import authenticateUser from '../../authentication.js'

const router = express.Router()

const { OK } = StatusCodes

router
  .route('/')
  .get(
    authenticateUser,
    getProfileLogic,
    validateDbResult(ProfileResponseSchema),
    sendResponse(OK),
  )

export default router
