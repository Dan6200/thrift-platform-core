import {
  DeliveryInfoCreateRequestSchema,
  DeliveryInfoGetRequestSchema,
  DeliveryInfoUpdateRequestSchema,
  DeliveryInfoDeleteRequestSchema,
  DeliveryInfoResponseListSchema,
  DeliveryInfoResponseSchema,
  DeliveryInfoSchemaID,
} from '#src/app-schema/delivery-info.js'
import {
  DeliveryInfo,
  DeliveryInfoId,
  DeliveryInfoCreateRequest,
  DeliveryInfoGetRequest,
  DeliveryInfoUpdateRequest,
  DeliveryInfoDeleteRequest,
} from '#src/types/delivery-info.js'
import logger from '#src/utils/logger.js'

export const isValidDeliveryInfoId = (
  data: unknown,
): data is DeliveryInfoId => {
  const { error } = DeliveryInfoSchemaID.validate(data)
  error && logger.error(error)
  return !error
}

export const isValidDeliveryInfoCreateRequest = (
  data: unknown,
): data is DeliveryInfoCreateRequest => {
  const { error } = DeliveryInfoCreateRequestSchema.validate(data)
  error && logger.error(error)
  return !error
}

export const isValidDeliveryInfoGetRequest = (
  data: unknown,
): data is DeliveryInfoGetRequest => {
  const { error } = DeliveryInfoGetRequestSchema.validate(data)
  error && logger.error(error)
  return !error
}

export const isValidDeliveryInfoUpdateRequest = (
  data: unknown,
): data is DeliveryInfoUpdateRequest => {
  const { error } = DeliveryInfoUpdateRequestSchema.validate(data)
  error && logger.error(error)
  return !error
}

export const isValidDeliveryInfoDeleteRequest = (
  data: unknown,
): data is DeliveryInfoDeleteRequest => {
  const { error } = DeliveryInfoDeleteRequestSchema.validate(data)
  error && logger.error(error)
  return !error
}

export const isValidDeliveryInfoResponseList = (
  data: unknown,
): data is DeliveryInfo[] => {
  const { error } = DeliveryInfoResponseListSchema.validate(data)
  error && logger.error(error)
  return !error
}

export const isValidDeliveryInfoResponse = (
  data: unknown,
): data is DeliveryInfo => {
  const { error } = DeliveryInfoResponseSchema.validate(data)
  error && logger.error(error)
  return !error
}

