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
} from '../app-schema/store_staff.js'

const router = Router()
const { CREATED, OK, NO_CONTENT } = StatusCodes

router
  .route('/:storeId/staff')
  .post(
    authenticateUser,
    validate(AddStoreStaffRequestSchema),
    hasStoreAccess(['admin']),
    addStaffLogic,
    validateDbResult(StoreStaffResponseSchema),
    sendResponse(CREATED),
  )
  .get(
    authenticateUser,
    validate(ListStoreStaffRequestSchema),
    hasStoreAccess(['admin', 'editor', 'viewer']),
    listStaffLogic,
    validateDbResult(StoreStaffListResponseSchema),
    sendResponse(OK),
  )

router
  .route('/:storeId/staff/:staffId')
  .patch(
    authenticateUser,
    validate(UpdateStoreStaffRequestSchema),
    hasStoreAccess(['admin']),
    updateStaffLogic,
    validateDbResult(StoreStaffResponseSchema),
    sendResponse(OK),
  )
  .delete(
    authenticateUser,
    validate(RemoveStoreStaffRequestSchema),
    hasStoreAccess(['admin']),
    removeStaffLogic,
    sendResponse(NO_CONTENT),
  )

export default router
