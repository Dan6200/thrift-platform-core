import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from '#src/request-validation.js'
import { sendResponse } from '#src/send-response.js'
import {
  RegisterRequestSchema,
  LoginRequestSchema,
} from '#src/app-schema/auth.js'
import { registerLogic, loginLogic } from '#src/logic/auth.js'

const router = express.Router()
const { CREATED, OK } = StatusCodes

router.post(
  '/register',
  validate(RegisterRequestSchema),
  registerLogic,
  sendResponse(CREATED),
)

router.post(
  '/login',
  validate(LoginRequestSchema),
  loginLogic,
  sendResponse(OK),
)

export default router
