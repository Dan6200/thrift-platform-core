import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from '#src/request-validation.js'
import { validateDbResult } from '#src/db-result-validation.js'
import { sendResponse } from '#src/send-response.js'
import authenticateUser from '#src/authentication.js'
import {
  getCartLogic,
  addItemToCartLogic,
  updateCartItemLogic,
  removeCartItemLogic,
} from '#src/logic/cart/index.js'
import {
  GetCartRequestSchema,
  AddItemToCartRequestSchema,
  UpdateCartItemRequestSchema,
  RemoveCartItemRequestSchema,
  cartResponseSchema,
  cartItemResponseSchema,
} from '#src/app-schema/cart.js'
import { customerAuthorization } from '#src/authorization/customer-authorization.js'

const router = Router()
const { OK, CREATED, NO_CONTENT } = StatusCodes

router.get(
  '/',
  authenticateUser,
  customerAuthorization,
  validate(GetCartRequestSchema),
  getCartLogic,
  validateDbResult(cartResponseSchema),
  sendResponse(OK),
)

router.post(
  '/items',
  authenticateUser,
  customerAuthorization,
  validate(AddItemToCartRequestSchema),
  addItemToCartLogic,
  validateDbResult(cartItemResponseSchema),
  sendResponse(CREATED),
)

router.put(
  '/items/:itemId',
  authenticateUser,
  customerAuthorization,
  validate(UpdateCartItemRequestSchema),
  updateCartItemLogic,
  validateDbResult(cartItemResponseSchema),
  sendResponse(OK),
)

router.delete(
  '/items/:itemId',
  authenticateUser,
  customerAuthorization,
  validate(RemoveCartItemRequestSchema),
  removeCartItemLogic,
  sendResponse(NO_CONTENT),
)

export default router
