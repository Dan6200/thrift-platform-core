// packages/thrift-api/server/src/routes/payments.ts
import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import authenticateUser from '#src/authentication.js'
import { validate } from '#src/request-validation.js'
import { sendResponse } from '#src/send-response.js'
import { initializePaymentLogic } from '#src/logic/payments/index.js' // Logic will be implemented next
import {
  InitializePaymentRequestSchema, // Schema will be implemented next
} from '#src/app-schema/payments.js' // Schema will be implemented next

const router = Router()
const { OK } = StatusCodes

router.use(authenticateUser) // Payments usually require authentication

// Route to initialize a payment
router.post(
  '/initialize',
  validate(InitializePaymentRequestSchema),
  initializePaymentLogic,
  sendResponse(OK),
)

export default router
