import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from '../request-validation.js'
import { validateDbResult } from '../db-result-validation.js'
import { sendResponse } from '../send-response.js'
import authenticateUser from '../authentication.js'
import { customerAuthorization } from '../authorization/customer-authorization.js'
import {
  createDeliveryLogic,
  getAllDeliveriesLogic,
  getDeliveryLogic,
  updateDeliveryLogic,
  deleteDeliveryLogic,
} from '../logic/delivery-info/index.js'
import {
  DeliveryInfoCreateRequestSchema,
  DeliveryInfoGetRequestSchema,
  DeliveryInfoUpdateRequestSchema,
  DeliveryInfoDeleteRequestSchema,
  DeliveryInfoResponseListSchema,
  DeliveryInfoResponseSchema,
} from '../app-schema/delivery-info.js'
import { checkDeliveryLimitLogic } from '../authorization/check-delivery-limit.js'

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
    validateDbResult(DeliveryInfoResponseSchema),
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
    validateDbResult(DeliveryInfoResponseSchema),
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
