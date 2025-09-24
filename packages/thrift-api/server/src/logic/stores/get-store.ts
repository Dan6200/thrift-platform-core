import { knex } from '#src/db/index.js'
import BadRequestError from '#src/errors/bad-request.js'
import { Request, Response, NextFunction } from 'express'
import StoreData from '../../types/store-data.js'

export const getStoreLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.validatedParams)
    throw new BadRequestError('No route parameters provided')
  if (!req.validatedQueryParams)
    throw new BadRequestError('No query parameters provided')

  const { storeId } = req.validatedParams
  const { vendor_id } = req.validatedQueryParams || {}

  const baseQuery = knex<StoreData>('stores')
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
      'address.address_id',
      'address.address_line_1',
      'address.address_line_2',
      'address.city',
      'address.state',
      'address.zip_postal_code',
      'address.country',
      'address.created_at as address_created_at',
      'address.updated_at as address_updated_at',
    )
    .first()

  if (vendor_id) baseQuery.where('stores.vendor_id', vendor_id)

  const store = await baseQuery

  if (!store) {
    req.dbResult = []
    return next()
  }

  // Fetch all pages for this store
  const allPages = await knex('pages')
    .where('store_id', store.store_id)
    .select()

  const pageIds = allPages.map((page) => page.page_id)

  // Fetch all sections for all pages in one go
  const allSections = await knex('page_sections')
    .whereIn('page_id', pageIds)
    .select(
      'section_id',
      'page_id',
      'section_title',
      'section_type',
      'section_data',
      'sort_order',
      'styles',
      'created_at',
      'updated_at',
    )

  // Map sections to pages
  const sectionsByPageId = allSections.reduce(
    (acc, section) => {
      if (!acc[section.page_id]) {
        acc[section.page_id] = []
      }
      const { page_id, ...coreSection } = section
      acc[section.page_id].push(coreSection)
      return acc
    },
    {} as Record<number, any[]>,
  )

  // Map pages to store and sections to pages
  const pagesForStore = allPages.map((page) => {
    const { store_id, ...corePage } = page
    return {
      ...corePage,
      sections: sectionsByPageId[page.page_id] || [],
    }
  })

  const {
    address_id,
    address_line_1,
    address_line_2,
    city,
    state,
    zip_postal_code,
    country,
    address_created_at,
    address_updated_at,
    ...coreStoreData
  } = store

  req.dbResult = {
    ...coreStoreData,
    store_address: {
      address_id,
      address_line_1,
      address_line_2,
      city,
      state,
      zip_postal_code,
      country,
      created_at: address_created_at,
      updated_at: address_updated_at,
    },
    pages: pagesForStore,
  }
  next()
}
