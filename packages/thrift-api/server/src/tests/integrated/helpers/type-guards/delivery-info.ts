import {
  DeliveryInfoRequestSchema,
  DeliveryInfoResponseListSchema,
  DeliveryInfoResponseSchema,
  DeliveryInfoSchemaID,
} from '#src/app-schema/delivery-info.js'
import { DeliveryInfo, DeliveryInfoId } from '#src/types/delivery-info.js'

export const isValidDeliveryInfoId = (
  data: unknown,
): data is DeliveryInfoId => {
  const { error } = DeliveryInfoSchemaID.validate(data)
  error && console.error(error)
  return !error
}

export const isValidDeliveryInfoRequest = (
  data: unknown,
): data is DeliveryInfo => {
  const { error } = DeliveryInfoRequestSchema.validate(data)
  error && console.error(error)
  return !error
}

export const isValidDeliveryInfoResponseList = (
  data: unknown,
): data is DeliveryInfo => {
  const { error } = DeliveryInfoResponseListSchema.validate(data)
  error && console.error(error)
  return !error
}

export const isValidDeliveryInfoResponse = (
  data: unknown,
): data is DeliveryInfo => {
  const { error } = DeliveryInfoResponseSchema.validate(data)
  error && console.error(error)
  return !error
}
