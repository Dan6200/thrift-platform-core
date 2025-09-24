import { knex } from '#src/db/index.js'
import BadRequestError from '#src/errors/bad-request.js'
import { NextFunction, Request, Response } from 'express'
import util from 'util'
import StoreData from '../../types/store-data.js'

export const getAllStoresLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.validatedQueryParams)
    throw new BadRequestError('No valid query parameters provided')
  const { vendor_id } = req.validatedQueryParams || {}

  const baseQuery = knex<StoreData>('stores')
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

  if (vendor_id) {
    baseQuery.where('stores.vendor_id', vendor_id)
  }

  const stores = await baseQuery

  const storeIds = stores.map((store) => store.store_id)

  // Fetch all pages for all stores in one go
  const allPages = await knex('pages').whereIn('store_id', storeIds).select()

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

  // Map pages to stores and sections to pages
  const pagesByStoreId = allPages.reduce(
    (acc, page) => {
      if (!acc[page.store_id]) {
        acc[page.store_id] = []
      }
      const { store_id, ...corePage } = page
      acc[page.store_id].push({
        ...corePage,
        sections: sectionsByPageId[page.page_id] || [],
      })
      return acc
    },
    {} as Record<number, any[]>,
  )

  req.dbResult = stores.map((store: any) => {
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
    return {
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
      pages: pagesByStoreId[store.store_id] || [],
    }
  })
  next()
}

