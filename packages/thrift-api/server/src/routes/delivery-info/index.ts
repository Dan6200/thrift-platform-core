import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from '../../middleware/request-validation.js'
import { validateDbResult } from '../../middleware/db-result-validation.js'
import { sendResponse } from '../../middleware/send-response.js'
import authenticateUser from '../../middleware/authentication.js'
import { customerAuthorization } from '../../middleware/customer-authorization.js'
import {
  createDeliveryLogic,
  getAllDeliveriesLogic,
  getDeliveryLogic,
  updateDeliveryLogic,
  deleteDeliveryLogic,
} from '../../logic/delivery-info/index.js' // Assuming an index.js will export all logic
import {
  DeliveryInfoCreateRequestSchema,
  DeliveryInfoGetRequestSchema,
  DeliveryInfoUpdateRequestSchema,
  DeliveryInfoDeleteRequestSchema,
  DeliveryInfoResponseListSchema,
  DeliveryInfoResponseSchema,
  DeliveryInfoSchemaID,
} from '../../app-schema/delivery-info.js'
import { checkDeliveryLimitLogic } from '../../logic/delivery-info/check-delivery-limit.js'

const router = express.Router()
const { CREATED, OK, NO_CONTENT } = StatusCodes

router
  .route('/')
  .post(
    authenticateUser,
    customerAuthorization,
    checkDeliveryLimitLogic,
    validate(DeliveryInfoCreateRequestSchema),
    createDeliveryLogic,
    validateDbResult(DeliveryInfoSchemaID),
    sendResponse(CREATED),
  )
  .get(
    authenticateUser,
    customerAuthorization,
    getAllDeliveriesLogic,
    validateDbResult(DeliveryInfoResponseListSchema),
    sendResponse(OK),
  )

router
  .route('/:deliveryInfoId')
  .get(
    authenticateUser,
    customerAuthorization,
    validate(DeliveryInfoGetRequestSchema),
    getDeliveryLogic,
    validateDbResult(DeliveryInfoResponseSchema),
    sendResponse(OK),
  )
  .patch(
    authenticateUser,
    customerAuthorization,
    validate(DeliveryInfoUpdateRequestSchema),
    updateDeliveryLogic,
    validateDbResult(DeliveryInfoSchemaID),
    sendResponse(OK),
  )
  .delete(
    authenticateUser,
    customerAuthorization,
    validate(DeliveryInfoDeleteRequestSchema),
    deleteDeliveryLogic,
    sendResponse(NO_CONTENT),
  )

export default router
