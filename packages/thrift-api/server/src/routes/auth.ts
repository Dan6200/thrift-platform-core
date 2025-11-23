import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from '#src/request-validation.js'
import { sendResponse } from '#src/send-response.js'
import { RegisterRequestSchema } from '#src/app-schema/auth.js'
import { registerLogic } from '#src/logic/auth.js'

const router = express.Router()
const { CREATED } = StatusCodes

router.post(
  '/register',
  validate(RegisterRequestSchema),
  registerLogic,
  sendResponse(CREATED),
)

export default router
