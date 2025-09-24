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
  StoreIDSchema,
} from '../../app-schema/stores.js'

const router = express.Router()
const { CREATED, OK, NO_CONTENT } = StatusCodes

router
  .route('/')
  .post(
    authenticateUser,
    vendorAuthorization,
    checkStoreLimit,
    validate(StoreCreateRequestSchema),
    createStoreLogic,
    validateDbResult(StoreIDSchema),
    sendResponse(CREATED),
  )
  .get(
    authenticateUser,
    vendorAuthorization,
    validate(StoreGetAllRequestSchema),
    getAllStoresLogic,
    validateDbResult(StoreDataResponseListSchema),
    sendResponse(OK),
  )

router
  .route('/:storeId')
  .get(
    authenticateUser,
    hasStoreAccess(['admin', 'editor', 'viewer']),
    validate(StoreGetRequestSchema),
    getStoreLogic,
    validateDbResult(StoreDataResponseSchema),
    sendResponse(OK),
  )
  .put(
    authenticateUser,
    hasStoreAccess(['admin', 'editor']),
    validate(StoreUpdateRequestSchema),
    updateStoreLogic,
    validateDbResult(StoreIDSchema),
    sendResponse(OK),
  )
  .delete(
    authenticateUser,
    hasStoreAccess(['admin']),
    validate(StoreDeleteRequestSchema),
    deleteStoreLogic,
    sendResponse(NO_CONTENT),
  )

export default router
