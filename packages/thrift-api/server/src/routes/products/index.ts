import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { validate } from '#src/request-validation.js'
import { validateDbResult } from '#src/db-result-validation.js'
import { sendResponse } from '#src/send-response.js'
import authenticateUser from '#src/authentication.js'
import { hasStoreAccess } from '#src/authorization/has-store-access.js'
import {
  createProductLogic,
  getAllProductsLogic,
  getProductLogic,
  updateProductLogic,
  deleteProductLogic,
} from '#src/logic/products/index.js'
import {
  ProductCreateRequestSchema,
  ProductGetAllRequestSchema,
  ProductGetRequestSchema,
  ProductUpdateRequestSchema,
  ProductDeleteRequestSchema,
  ProductGETAllResponseSchema,
  ProductGETResponseSchema,
  ProductResponseSchema,
} from '#src/app-schema/products/index.js'

const router = express.Router({ mergeParams: true })
const { CREATED, OK, NO_CONTENT } = StatusCodes

router
  .route('/')
  .post(
    authenticateUser,
    validate(ProductCreateRequestSchema),
    hasStoreAccess(['admin', 'editor']),
    createProductLogic,
    validateDbResult(ProductResponseSchema),
    sendResponse(CREATED),
  )
  .get(
    validate(ProductGetAllRequestSchema),
    getAllProductsLogic,
    validateDbResult(ProductGETAllResponseSchema),
    sendResponse(OK),
  )

router
  .route('/:productId')
  .get(
    validate(ProductGetRequestSchema),
    getProductLogic,
    validateDbResult(ProductGETResponseSchema),
    sendResponse(OK),
  )
  .patch(
    authenticateUser,
    validate(ProductUpdateRequestSchema),
    hasStoreAccess(['admin', 'editor']),
    updateProductLogic,
    validateDbResult(ProductResponseSchema),
    sendResponse(OK),
  )
  .delete(
    authenticateUser,
    validate(ProductDeleteRequestSchema),
    hasStoreAccess(['admin']),
    deleteProductLogic,
    sendResponse(NO_CONTENT),
  )

// Variant routes will be handled separately

export default router

