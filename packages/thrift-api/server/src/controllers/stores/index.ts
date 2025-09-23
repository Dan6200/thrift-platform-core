import { StatusCodes } from 'http-status-codes'
import {
  StoreDataRequestSchema,
  StoreDataResponseListSchema,
  StoreIDSchema,
  StoreDataResponseSchema,
} from '#src/app-schema/stores.js'
import BadRequestError from '../../errors/bad-request.js'
import UnauthenticatedError from '../../errors/unauthenticated.js'
import {
  ProcessRoute,
  ProcessRouteWithoutBody,
  QueryParams,
} from '../../types/process-routes.js'
import StoreData from '../../types/store-data.js'
import processRoute from '../process-routes.js'
import { validateReqData } from '../utils/request-validation.js'
import { validateResData } from '../utils/response-validation.js'
import { Knex } from 'knex'
import { knex } from '#src/db/index.js'
import ForbiddenError from '#src/errors/forbidden.js'
import NotFoundError from '#src/errors/not-found.js'

const createQuery = async ({
  body,
  userId,
}: QueryParams): Promise<Knex.QueryBuilder<string>> => {
  if (!userId) throw new UnauthenticatedError('Sign-in to create store')
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

  const storeData: StoreData = body as any // body is already validated by requestValidator

  const { store_address, pages, ...restOfStoreData } = storeData

  const trx = await knex.transaction()
  try {
    const [address] = await trx('address')
      .insert(store_address)
      .returning('address_id')

    const [store] = await trx('stores')
      .insert({
        vendor_id: userId,
        ...restOfStoreData,
        address_id: address.address_id,
      })
      .returning('store_id')

    if (pages) {
      for (const page of pages) {
        const { sections, ...restOfPage } = page
        const [pageResult] = await trx('pages')
          .insert({
            ...restOfPage,
            store_id: store.store_id,
          })
          .returning('page_id')

        if (sections) {
          for (const section of sections) {
            const { section_data, styles, ...restOfSection } = section
            await trx('page_sections').insert({
              ...restOfSection,
              page_id: pageResult.page_id,
              section_data: section_data ? JSON.stringify(section_data) : null,
              styles: styles ? JSON.stringify(styles) : null,
            })
          }
        }
      }
    }

    await trx.commit()
    return [store]
  } catch (error) {
    await trx.rollback()
    throw error
  }
}

const getAllQuery = async ({
  query: { vendor_id },
}: QueryParams): Promise<StoreData[]> => {
  const query = knex<StoreData>('stores')
    .join('address', 'stores.address_id', 'address.address_id')
    .select(
      'stores.store_id',
      'stores.store_name',
      'stores.custom_domain',
      'stores.vendor_id',
      'stores.favicon',
      'stores.global_styles',
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

  for (const store of stores) {
    const pages = await knex('pages').where('store_id', store.store_id).select()

    for (const page of pages) {
      const sections = await knex('page_sections')
        .where('page_id', page.page_id)
        .select(
          'section_id',
          'section_type',
          'section_data',
          'sort_order',
          'styles',
          'created_at',
          'updated_at',
        )
      page.sections = sections
    }
    store.pages = pages
  }

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
    }
  })
}

const getQuery = async ({
  query: { vendor_id: vendorId },
  params,
}: QueryParams): Promise<StoreData[]> => {
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

  const pages = await knex('pages').where('store_id', store.store_id).select()

  for (const page of pages) {
    const sections = await knex('page_sections')
      .where('page_id', page.page_id)
      .select(
        'section_id',
        'section_type',
        'section_data',
        'sort_order',
        'styles',
        'created_at',
        'updated_at',
      )
    page.sections = sections
  }
  store.pages = pages

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
    },
  ]
}

const updateQuery = async ({
  params,
  body,
  userId,
}: QueryParams): Promise<Knex.QueryBuilder<number>> => {
  if (!userId) throw new UnauthenticatedError('Signin to modify store.')
  if (params == null)
    throw new BadRequestError('No valid route parameters provided')
  const { storeId } = params
  if (!storeId) throw new BadRequestError('Need Store ID to update store')
  const storeData = body // already validated by requestValidator

  const hasAccess = await knex.raw('select has_store_access(?, ?, ?)', [
    userId,
    storeId,
    ['admin', 'editor'], // Allow admins and editors to update
  ])
  if (!hasAccess.rows[0].has_store_access) {
    throw new ForbiddenError('You do not have permission to update this store.')
  }

  const { store_address, pages, ...restOfStoreData } = storeData

  const trx = await knex.transaction()
  try {
    const store = await trx('stores')
      .where('store_id', storeId)
      .select('address_id')
      .first()

    if (!store) {
      throw new NotFoundError('Store not found')
    }

    if (store_address) {
      await trx('address')
        .where('address_id', store.address_id)
        .update(store_address)
    }

    const returningStoreId = await trx('stores')
      .where('store_id', storeId)
      .update(restOfStoreData)
      .returning('store_id')

    // Delete existing pages and sections
    const pageIds = await trx('pages')
      .where('store_id', storeId)
      .select('page_id')
    const pageIdList = pageIds.map((p) => p.page_id)
    await trx('page_sections').whereIn('page_id', pageIdList).del()
    await trx('pages').where('store_id', storeId).del()

    // Insert new pages and sections
    if (pages) {
      for (const page of pages) {
        const { sections, ...restOfPage } = page
        const [pageResult] = await trx('pages')
          .insert({
            ...restOfPage,
            store_id: storeId,
          })
          .returning('page_id')

        if (sections) {
          for (const section of sections) {
            const { section_data, styles, ...restOfSection } = section
            await trx('page_sections').insert({
              ...restOfSection,
              page_id: pageResult.page_id,
              section_data: section_data ? JSON.stringify(section_data) : null,
              styles: styles ? JSON.stringify(styles) : null,
            })
          }
        }
      }
    }

    await trx.commit()
    return returningStoreId
  } catch (error) {
    await trx.rollback()
    throw error
  }
}

const deleteQuery = async ({
  params,
  userId,
}: QueryParams): Promise<Knex.QueryBuilder<string>> => {
  if (!userId) throw new UnauthenticatedError('Signin to delete store.')
  if (params == null)
    throw new BadRequestError('No valid route parameters provided')
  const { storeId } = params
  if (!storeId) throw new BadRequestError('Need store ID param to delete store')

  const hasAccess = await knex.raw('select has_store_access(?, ?, ?)', [
    userId,
    storeId,
    ['admin'],
  ])
  if (!hasAccess.rows[0].has_store_access) {
    throw new ForbiddenError('You do not have permission to delete this store.')
  }
  return knex<StoreData>('stores')
    .where('store_id', storeId)
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
