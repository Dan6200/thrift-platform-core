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
  cartItemsSchema,
} from '#src/app-schema/cart.js'

const router = Router()
const { OK, CREATED, NO_CONTENT } = StatusCodes

router.get(
  '/',
  authenticateUser,
  validate(GetCartRequestSchema),
  getCartLogic,
  validateDbResult(cartResponseSchema),
  sendResponse(OK),
)

router.post(
  '/items',
  authenticateUser,
  validate(AddItemToCartRequestSchema),
  addItemToCartLogic,
  validateDbResult(cartItemsSchema),
  sendResponse(CREATED),
)

router.put(
  '/items/:item_id',
  authenticateUser,
  validate(UpdateCartItemRequestSchema),
  updateCartItemLogic,
  validateDbResult(cartItemsSchema),
  sendResponse(OK),
)

router.delete(
  '/items/:item_id',
  authenticateUser,
  validate(RemoveCartItemRequestSchema),
  removeCartItemLogic,
  sendResponse(NO_CONTENT),
)

export default router
