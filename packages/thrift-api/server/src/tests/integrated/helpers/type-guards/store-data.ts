import util from 'util'
import {
  StoreCreateRequestSchema,
  StoreGetAllRequestSchema,
  StoreGetRequestSchema,
  StoreUpdateRequestSchema,
  StoreDeleteRequestSchema,
  StoreDataResponseListSchema,
  StoreDataResponseSchema,
  StoreIDSchema,
} from '#src/app-schema/stores.js'
import StoreData, {
  StoreDataId,
  StoreCreateRequest,
  StoreGetAllRequest,
  StoreGetRequest,
  StoreUpdateRequest,
  StoreDeleteRequest,
} from '#src/types/store-data.js'

export const isValidStoreDataId = (data: unknown): data is StoreDataId => {
  const { error } = StoreIDSchema.validate(data)
  error && console.error('Store Data ID Validation Error')
  error && console.error(error)
  return !error
}

export const isValidStoreCreateRequest = (
  data: unknown,
): data is StoreCreateRequest => {
  const { error } = StoreCreateRequestSchema.validate(data)
  error && console.error('Store Create Request Validation Error')
  error && console.error(util.inspect(error, true, null, true))
  return !error
}

export const isValidStoreGetAllRequest = (
  data: unknown,
): data is StoreGetAllRequest => {
  const { error } = StoreGetAllRequestSchema.validate(data)
  error && console.error('Store Get All Request Validation Error')
  error && console.error(util.inspect(error, true, null, true))
  return !error
}

export const isValidStoreGetRequest = (
  data: unknown,
): data is StoreGetRequest => {
  const { error } = StoreGetRequestSchema.validate(data)
  error && console.error('Store Get Request Validation Error')
  error && console.error(util.inspect(error, true, null, true))
  return !error
}

export const isValidStoreUpdateRequest = (
  data: unknown,
): data is StoreUpdateRequest => {
  const { error } = StoreUpdateRequestSchema.validate(data)
  error && console.error('Store Update Request Validation Error')
  error && console.error(util.inspect(error, true, null, true))
  return !error
}

export const isValidStoreDeleteRequest = (
  data: unknown,
): data is StoreDeleteRequest => {
  const { error } = StoreDeleteRequestSchema.validate(data)
  error && console.error('Store Delete Request Validation Error')
  error && console.error(util.inspect(error, true, null, true))
  return !error
}

export const isValidStoreDataResponseList = (
  data: unknown,
): data is StoreData[] => {
  const { error } = StoreDataResponseListSchema.validate(data)
  error && console.error('Store Data List Response Validation Error')
  error && console.error(util.inspect(error, true, null, true))
  return !error
}

export const isValidStoreDataResponse = (data: unknown): data is StoreData => {
  const { error } = StoreDataResponseSchema.validate(data)
  error && console.error('Store Data Response Validation Error')
  error && console.error(util.inspect(error, true, null, true))
  return !error
}