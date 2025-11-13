import express from 'express'
import multer from 'multer'
import { cloudinaryStorageProducts } from '#src/utils/media-storage.js'
import {
  createProductMediaLogic,
  getProductMediaLogic,
  updateProductMediaLogic,
  deleteProductMediaLogic,
} from '#src/logic/media/index.js'
import authenticateUser from '#src/authentication.js'
import { validate } from '#src/request-validation.js'
import { validateDbResult } from '#src/db-result-validation.js'
import { sendResponse } from '#src/send-response.js'
import {
  ProductMediaQuerySchema,
  ProductMediaRequestSchema,
  ProductMediaResponseSchema,
  UpdateProductMediaRequestSchema,
} from '#src/app-schema/media/products.js'
import { StatusCodes } from 'http-status-codes'
import { hasStoreAccess } from '#src/authorization/has-store-access.js'
import Joi from 'joi'

const router = express.Router()
const upload = multer({ storage: cloudinaryStorageProducts })
const uploadLimit = 12
const { CREATED, OK, NO_CONTENT } = StatusCodes

router.use(authenticateUser)

router
  .route('/')
  .post(
    upload.array('product-media', uploadLimit),
    validate(ProductMediaRequestSchema),
    hasStoreAccess(['admin', 'editor']),
    createProductMediaLogic,
    validateDbResult(Joi.array().items(ProductMediaResponseSchema)),
    sendResponse(CREATED),
  )

router
  .route('/:mediaId')
  .get(
    getProductMediaLogic,
    validateDbResult(Joi.array().items(ProductMediaResponseSchema)),
    sendResponse(OK),
  )
  .patch(
    upload.single('product-media'),
    validate(UpdateProductMediaRequestSchema),
    hasStoreAccess(['admin', 'editor']),
    updateProductMediaLogic,
    validateDbResult(ProductMediaResponseSchema),
    sendResponse(OK),
  )
  .delete(
    hasStoreAccess(['admin']),
    deleteProductMediaLogic,
    sendResponse(NO_CONTENT),
  )

export default router
