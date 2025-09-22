import util from 'util'
import {
  StoreDataRequestSchema,
  StoreDataResponseListSchema,
  StoreDataResponseSchema,
  StoreIDSchema,
} from '../../../app-schema/stores.js'
import StoreData from '../../../../types/store-data.js'

interface StoreDataId {
  store_info_id: number
}

export const isValidStoreDataId = (data: unknown): data is StoreDataId => {
  const { error } = StoreIDSchema.validate(data)
  error && console.error('Store Data Response Validation Error')
  error && console.error(error)
  return !error
}

export const isValidStoreDataRequest = (data: unknown): data is StoreData => {
  const { error } = StoreDataRequestSchema.validate(data)
  error && console.error('Store Data Request Validation Error')
  error && console.error(util.inspect(error, true, null, true))
  return !error
}

export const isValidStoreDataResponseList = (
  data: unknown,
): data is StoreData => {
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
