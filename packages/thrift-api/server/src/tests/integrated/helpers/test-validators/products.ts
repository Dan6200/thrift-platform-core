import {
  ProductCreateRequestSchema,
  ProductUpdateRequestSchema,
  ProductDeleteRequestSchema,
  ProductGetRequestSchema,
  ProductGetAllRequestSchema,
  ProductGETAllResponseSchema,
  ProductGETResponseSchema,
  ProductResponseSchema,
} from '#src/app-schema/products/index.js'
import { validateTestData } from '../test-validators.js'

export const validateProductCreateReq = (data: unknown) =>
  validateTestData(
    ProductCreateRequestSchema,
    data,
    'Product Create Request Validation Error',
  )

export const validateProductUpdateReq = (data: unknown) =>
  validateTestData(
    ProductUpdateRequestSchema,
    data,
    'Product Update Request Validation Error',
  )

export const validateProductDeleteReq = (data: unknown) =>
  validateTestData(
    ProductDeleteRequestSchema,
    data,
    'Product Delete Request Validation Error',
  )

export const validateProductGetReq = (data: unknown) =>
  validateTestData(
    ProductGetRequestSchema,
    data,
    'Product Get Request Validation Error',
  )

export const validateProductGetAllReq = (data: unknown) =>
  validateTestData(
    ProductGetAllRequestSchema,
    data,
    'Product Get All Request Validation Error',
  )

export const validateProductGETAllRes = (data: unknown) =>
  validateTestData(
    ProductGETAllResponseSchema,
    data,
    'Product GET All Response Validation Error',
  )

export const validateProductGETRes = (data: unknown) =>
  validateTestData(
    ProductGETResponseSchema,
    data,
    'Product GET Response Validation Error',
  )

export const validateProductRes = (data: unknown) =>
  validateTestData(
    ProductResponseSchema,
    data,
    'Product Response Validation Error',
  )
