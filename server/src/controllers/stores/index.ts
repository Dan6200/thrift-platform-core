import { StatusCodes } from 'http-status-codes'
import {
  StoreDataRequestSchema,
  StoreDataResponseListSchema,
  StoreIDSchema,
  StoreDataResponseSchema,
} from '#src/app-schema/stores.js'
import BadRequestError from '../../errors/bad-request.js'
import UnauthorizedError from '../../errors/unauthorized.js'
import {
  ProcessRoute,
  ProcessRouteWithoutBody,
  QueryParams,
} from '../../types/process-routes.js'
import StoreData, {
  DBFriendlyStoreData,
  isValidStoreDataRequest,
} from '../../types/store-data.js'
import processRoute from '../process-routes.js'
import { validateReqData } from '../utils/request-validation.js'
import { validateResData } from '../utils/response-validation.js'
import { Knex } from 'knex'
import { knex } from '#src/db/index.js'
import ForbiddenError from '#src/errors/forbidden.js'

const createQuery = async ({
  body,
  userId,
}: QueryParams): Promise<Knex.QueryBuilder<string>> => {
  if (!userId) throw new UnauthorizedError('Sign-in to create store')
  const result = await knex('profiles')
    .where('id', userId)
    .select('is_vendor')
    .limit(1)
  if (!result[0]?.is_vendor)
    throw new ForbiddenError(
      'Vendor account disabled. Need to enable it to create a store',
    )
  const LIMIT = 5
  let { count } = (
    await knex('stores').where('vendor_id', userId).count('store_id')
  )[0]
  if (typeof count === 'string') count = parseInt(count)
  if (count > LIMIT)
    throw new ForbiddenError(`Cannot have more than ${LIMIT} stores`)

  if (!isValidStoreDataRequest(body))
    throw new BadRequestError('Invalid store data')
  const storeData: StoreData = body

  const { store_address, ...restOfStoreData } = storeData

  const trx = await knex.transaction()
  try {
    const [address] = await trx('address')
      .insert(store_address)
      .returning('address_id')

    const dBFriendlyStoreData: DBFriendlyStoreData = {
      ...restOfStoreData,
      pages: storeData.pages ? JSON.stringify(storeData.pages) : undefined,
      global_styles: storeData.global_styles
        ? JSON.stringify(storeData.global_styles)
        : undefined,
    }

    const store = await trx<DBFriendlyStoreData & { address_id: string }>(
      'stores',
    )
      .insert({
        vendor_id: userId,
        ...dBFriendlyStoreData,
        address_id: address.address_id,
      })
      .returning('store_id')

    await trx.commit()
    return store
  } catch (error) {
    await trx.rollback()
    throw error
  }
}

const getAllQuery = async ({
  query: { vendor_id },
}: QueryParams): Promise<Knex.QueryBuilder<StoreData[]>> => {
  const query = knex<StoreData>('stores')
    .join('address', 'stores.address_id', 'address.address_id')
    .select(
      'stores.store_id',
      'stores.store_name',
      'stores.custom_domain',
      'stores.vendor_id',
      'stores.favicon',
      'stores.global_styles',
      'stores.pages',
      'stores.created_at',
      'stores.updated_at',
      'address.address_line_1',
      'address.address_line_2',
      'address.city',
      'address.state',
      'address.zip_postal_code',
      'address.country',
    )

  if (vendor_id) {
    query.where('stores.vendor_id', vendor_id)
  }

  const stores = await query

  return stores.map((store: any) => {
    const {
      address_line_1,
      address_line_2,
      city,
      state,
      zip_postal_code,
      country,
      ...coreStoreData
    } = store
    return {
      ...coreStoreData,
      store_address: {
        address_line_1,
        address_line_2,
        city,
        state,
        zip_postal_code,
        country,
      },
      pages: store.pages ? store.pages : undefined,
      global_styles: store.global_styles ? store.global_styles : undefined,
    }
  })
}

const getQuery = async ({
  query: { vendor_id: vendorId },
  params,
}: QueryParams): Promise<Knex.QueryBuilder<StoreData[]>> => {
  if (params == null) throw new BadRequestError('No route parameters provided')
  const { storeId } = params
  if (!storeId) throw new BadRequestError('Need Store ID to retrieve store')

  const query = knex<StoreData>('stores')
    .join('address', 'stores.address_id', 'address.address_id')
    .where('stores.store_id', storeId)
    .select(
      'stores.store_id',
      'stores.store_name',
      'stores.custom_domain',
      'stores.vendor_id',
      'stores.favicon',
      'stores.global_styles',
      'stores.pages',
      'stores.created_at',
      'stores.updated_at',
      'address.address_line_1',
      'address.address_line_2',
      'address.city',
      'address.state',
      'address.zip_postal_code',
      'address.country',
    )
    .first()

  if (vendorId) query.where('stores.vendor_id', vendorId)

  const store = await query

  if (!store) return []

  const {
    address_line_1,
    address_line_2,
    city,
    state,
    zip_postal_code,
    country,
    ...coreStoreData
  } = store

  return [
    {
      ...coreStoreData,
      store_address: {
        address_line_1,
        address_line_2,
        city,
        state,
        zip_postal_code,
        country,
      },
      pages: coreStoreData.pages ? coreStoreData.pages : undefined,
      global_styles: coreStoreData.global_styles
        ? coreStoreData.global_styles
        : undefined,
    },
  ]
}

const updateQuery = async ({
  params,
  body,
  userId,
}: QueryParams): Promise<Knex.QueryBuilder<number>> => {
  if (!userId) throw new UnauthorizedError('Signin to modify store.')
  if (params == null)
    throw new BadRequestError('No valid route parameters provided')
  const { storeId } = params
  if (!storeId) throw new BadRequestError('Need Store ID to update store')
  if (!isValidStoreDataRequest(body))
    throw new BadRequestError('Invalid request data')
  const storeData = body
  const result = await knex('profiles')
    .where('id', userId)
    .select('is_vendor')
    .limit(1)
  if (!result[0]?.is_vendor)
    throw new ForbiddenError(
      'Vendor account disabled. Need to enable it to create a store',
    )

  const { store_address, ...restOfStoreData } = storeData

  const trx = await knex.transaction()
  try {
    const store = await trx('stores')
      .where('store_id', storeId)
      .where('vendor_id', userId)
      .select('address_id')
      .first()

    if (!store) {
      throw new BadRequestError('Store not found')
    }

    if (store_address) {
      await trx('address')
        .where('address_id', store.address_id)
        .update(store_address)
    }

    const dBFriendlyStoreData: DBFriendlyStoreData = {
      ...restOfStoreData,
      pages: storeData.pages ? JSON.stringify(storeData.pages) : undefined,
      global_styles: storeData.global_styles
        ? JSON.stringify(storeData.global_styles)
        : undefined,
    }

    const updatedStore = await trx<DBFriendlyStoreData>('stores')
      .where('store_id', storeId)
      .where('vendor_id', userId)
      .update(dBFriendlyStoreData)
      .returning('store_id')

    await trx.commit()
    return updatedStore
  } catch (error) {
    await trx.rollback()
    throw error
  }
}

const deleteQuery = async ({
  params,
  userId,
}: QueryParams): Promise<Knex.QueryBuilder<string>> => {
  if (!userId) throw new UnauthorizedError('Signin to delete store.')
  if (params == null)
    throw new BadRequestError('No valid route parameters provided')
  const { storeId } = params
  if (!storeId) throw new BadRequestError('Need store ID param to delete store')
  const result = await knex('profiles')
    .where('id', userId)
    .select('is_vendor')
    .limit(1)
  if (!result[0]?.is_vendor)
    throw new ForbiddenError(
      'Vendor account disabled. Need to enable it to create a store',
    )
  return knex<StoreData>('stores')
    .where('store_id', storeId)
    .where('vendor_id', userId)
    .del()
    .returning('store_id')
}

const { CREATED, OK } = StatusCodes

const processPostRoute = <ProcessRoute>processRoute
export const createStore = processPostRoute({
  Query: createQuery,
  status: CREATED,
  validateBody: validateReqData(StoreDataRequestSchema),
  validateResult: validateResData(StoreIDSchema),
})

const processGetAllRoute = <ProcessRouteWithoutBody>processRoute
export const getAllStores = processGetAllRoute({
  Query: getAllQuery,
  status: OK,
  validateResult: validateResData(StoreDataResponseListSchema),
})

const processGetRoute = <ProcessRouteWithoutBody>processRoute
export const getStore = processGetRoute({
  Query: getQuery,
  status: OK,
  validateResult: validateResData(StoreDataResponseSchema),
})

const processPutRoute = <ProcessRoute>processRoute
export const updateStore = processPutRoute({
  Query: updateQuery,
  status: OK,
  validateBody: validateReqData(StoreDataRequestSchema),
  validateResult: validateResData(StoreIDSchema),
})

const processDeleteRoute = <ProcessRouteWithoutBody>processRoute
export const deleteStore = processDeleteRoute({
  Query: deleteQuery,
  status: OK,
  validateResult: validateResData(StoreIDSchema),
})
