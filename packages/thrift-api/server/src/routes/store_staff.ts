import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from '../request-validation.js'
import { validateDbResult } from '../db-result-validation.js'
import { sendResponse } from '../send-response.js'
import authenticateUser from '../authentication.js'
import { hasStoreAccess } from '../authorization/has-store-access.js'
import {
  addStaffLogic,
  listStaffLogic,
  updateStaffLogic,
  removeStaffLogic,
} from '../logic/store_staff/index.js'
import {
  AddStoreStaffRequestSchema,
  ListStoreStaffRequestSchema,
  UpdateStoreStaffRequestSchema,
  RemoveStoreStaffRequestSchema,
  StoreStaffResponseSchema,
  StoreStaffListResponseSchema,
  RemoveStoreStaffResponseSchema as RemoveStaffResponse,
} from '../app-schema/store_staff.js'

const router = Router()
const { CREATED, OK, NO_CONTENT } = StatusCodes

router
  .route('/:storeId/staff')
  .post(
    authenticateUser,
    hasStoreAccess(['admin']),
    validate(AddStoreStaffRequestSchema),
    addStaffLogic,
    validateDbResult(StoreStaffResponseSchema),
    sendResponse(CREATED),
  )
  .get(
    authenticateUser,
    hasStoreAccess(['admin', 'editor', 'viewer']),
    validate(ListStoreStaffRequestSchema),
    listStaffLogic,
    validateDbResult(StoreStaffListResponseSchema),
    sendResponse(OK),
  )

router
  .route('/:storeId/staff/:staffId')
  .patch(
    authenticateUser,
    hasStoreAccess(['admin']),
    validate(UpdateStoreStaffRequestSchema),
    updateStaffLogic,
    validateDbResult(StoreStaffResponseSchema),
    sendResponse(OK),
  )
  .delete(
    authenticateUser,
    hasStoreAccess(['admin']),
    validate(RemoveStoreStaffRequestSchema),
    removeStaffLogic,
    validateDbResult(RemoveStaffResponse),
    sendResponse(NO_CONTENT),
  )

export default router