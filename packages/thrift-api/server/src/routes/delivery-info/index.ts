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
  DeliveryInfoRequestSchema,
  DeliveryInfoResponseListSchema,
  DeliveryInfoResponseSchema,
  DeliveryInfoSchemaID,
} from '../../app-schema/delivery-info.js'
import { checkDeliveryLimitLogic } from '../../logic/delivery-info/check-delivery-limit.js'
import Joi from 'joi'

const router = express.Router()
const { CREATED, OK, NO_CONTENT } = StatusCodes

// Joi schema for delivery info ID in params
const DeliveryInfoIdParamSchema = Joi.object({
  deliveryInfoId: Joi.number().integer().positive().required(),
})

router
  .route('/')
  .post(
    authenticateUser,
    customerAuthorization,
    checkDeliveryLimitLogic,
    validate(Joi.object({ body: DeliveryInfoRequestSchema }), 'body'),
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
    validate(Joi.object({ params: DeliveryInfoIdParamSchema }), 'params'),
    getDeliveryLogic,
    validateDbResult(DeliveryInfoResponseSchema),
    sendResponse(OK),
  )
  .put(
    authenticateUser,
    customerAuthorization,
    validate(Joi.object({ params: DeliveryInfoIdParamSchema, body: DeliveryInfoRequestSchema }), 'params'),
    updateDeliveryLogic,
    validateDbResult(DeliveryInfoSchemaID),
    sendResponse(OK),
  )
  .delete(
    authenticateUser,
    customerAuthorization,
    validate(Joi.object({ params: DeliveryInfoIdParamSchema }), 'params'),
    deleteDeliveryLogic,
    sendResponse(NO_CONTENT),
  )

export default router