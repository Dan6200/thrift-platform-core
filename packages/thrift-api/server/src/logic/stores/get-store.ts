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
    throw new BadRequestError('No valid route parameters provided')
  const { storeId } = req.validatedParams

  const { vendor_id } = req.validatedQueryParams || {}

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

  if (vendor_id) query.where('stores.vendor_id', vendor_id)

  const store = await query

  if (!store) {
    req.dbResult = []
    return next()
  }

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

  req.dbResult = {
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
  next()
}
