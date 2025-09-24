import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from '../../request-validation.js'
import { validateDbResult } from '../../db-result-validation.js'
import { sendResponse } from '../../send-response.js'
import authenticateUser from '../../authentication.js'
import { vendorAuthorization } from '../../authorization/vendor-authorization.js'
import { checkStoreLimit } from '../../authorization/check-store-limit.js'
import { hasStoreAccess } from '../../authorization/has-store-access.js'
import {
  createStoreLogic,
  getAllStoresLogic,
  getStoreLogic,
  updateStoreLogic,
  deleteStoreLogic,
} from '../../logic/stores/index.js'
import {
  StoreCreateRequestSchema,
  StoreGetAllRequestSchema,
  StoreGetRequestSchema,
  StoreUpdateRequestSchema,
  StoreDeleteRequestSchema,
  StoreDataResponseListSchema,
  StoreDataResponseSchema,
} from '../../app-schema/stores.js'

const router = express.Router()
const { CREATED, OK, NO_CONTENT } = StatusCodes

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
  .get(
    authenticateUser,
    validate(StoreGetAllRequestSchema),
    vendorAuthorization,
    getAllStoresLogic,
    validateDbResult(StoreDataResponseListSchema),
    sendResponse(OK),
  )

router
  .route('/:storeId')
  .get(
    authenticateUser,
    validate(StoreGetRequestSchema),
    hasStoreAccess(['admin', 'editor', 'viewer']),
    getStoreLogic,
    validateDbResult(StoreDataResponseSchema),
    sendResponse(OK),
  )
  .patch(
    authenticateUser,
    validate(StoreUpdateRequestSchema),
    hasStoreAccess(['admin', 'editor']),
    updateStoreLogic,
    validateDbResult(StoreDataResponseSchema),
    sendResponse(OK),
  )
  .delete(
    authenticateUser,
    validate(StoreDeleteRequestSchema),
    hasStoreAccess(['admin']),
    deleteStoreLogic,
    sendResponse(NO_CONTENT),
  )

export default router
