import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from '#src/request-validation.js'
import { validateDbResult } from '#src/db-result-validation.js'
import { sendResponse } from '#src/send-response.js'
import authenticateUser from '#src/authentication.js'
import { vendorAuthorization } from '#src/authorization/vendor-authorization.js'
import { checkStoreLimit } from '#src/authorization/check-store-limit.js'
import { createStoreLogic } from '#src/logic/stores/index.js'
import {
  StoreCreateRequestSchema,
  StoreDataResponseSchema,
  StoreUpdateRequestSchema,
} from '#src/app-schema/stores.js'

const router = express.Router()
const { CREATED, OK } = StatusCodes

router
  .route('/')
  .post(
    authenticateUser,
    validate(StoreCreateRequestSchema),
    vendorAuthorization,
    checkStoreLimit,
    createStoreLogic,
    validateDbResult(StoreDataResponseSchema),
    sendResponse(CREATED),
  )

router
  .route('/:storeId')
  .patch(
    authenticateUser,
    validate(StoreUpdateRequestSchema),
    hasStoreAccess(['admin', 'editor']),
    updateStoreLogic,
    validateDbResult(StoreDataResponseSchema),
    sendResponse(OK),
  )

export default router
