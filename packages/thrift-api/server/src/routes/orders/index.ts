import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from '../../request-validation.js'
import { validateDbResult } from '../../db-result-validation.js'
import { sendResponse } from '../../send-response.js'
import authenticateUser from '../../authentication.js'
import {
  createOrderLogic,
  getAllOrdersLogic,
  getOrderLogic,
} from '../../logic/orders/index.js'
import {
  CreateOrderRequestSchema,
  GetAllOrdersRequestSchema,
  GetOrderRequestSchema,
  OrderResponseSchema,
  OrderGETAllResponseSchema,
} from '../../app-schema/orders/index.js'

const router = express.Router()
const { CREATED, OK } = StatusCodes

router
  .route('/')
  .post(
    authenticateUser,
    validate(CreateOrderRequestSchema),
    createOrderLogic,
    validateDbResult(OrderResponseSchema),
    sendResponse(CREATED),
  )
  .get(
    authenticateUser,
    validate(GetAllOrdersRequestSchema),
    getAllOrdersLogic,
    validateDbResult(OrderGETAllResponseSchema),
    sendResponse(OK),
  )

router
  .route('/:order_id')
  .get(
    authenticateUser,
    validate(GetOrderRequestSchema),
    getOrderLogic,
    validateDbResult(OrderResponseSchema),
    sendResponse(OK),
  )

export default router
