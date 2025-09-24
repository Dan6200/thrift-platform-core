import { knex } from '#src/db/index.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import NotFoundError from '#src/errors/not-found.js'
import BadRequestError from '#src/errors/bad-request.js'
import { Request, Response, NextFunction } from 'express'
import StoreData from '../../types/store-data.js'

export const updateStoreLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId) throw new UnauthenticatedError('Signin to modify store.')
  if (!req.validatedParams) throw new BadRequestError('No valid route parameters provided')
  const { storeId } = req.validatedParams
  if (!storeId) throw new BadRequestError('Need Store ID to update store')
  const storeData = req.validatedBody as StoreData

  // has_store_access check is handled by preceding middleware

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
    req.dbResult = returningStoreId
    next()
  } catch (error) {
    await trx.rollback()
    throw error
  }
}