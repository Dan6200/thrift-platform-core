import { knex } from '#src/db/index.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import NotFoundError from '#src/errors/not-found.js'
import { Request, Response, NextFunction } from 'express'
import StoreData from '../../types/store-data.js'

export const createStoreLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // Authentication and vendor check are handled by preceding middlewares
  // Store limit check is handled by preceding middleware

  const storeData: StoreData = req.validatedBody as StoreData

  const { store_address, pages, ...restOfStoreData } = storeData

  const trx = await knex.transaction()
  try {
    const [address] = await trx('address')
      .insert(store_address)
      .returning('address_id')

    const [store] = await trx('stores')
      .insert({
        vendor_id: req.userId,
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
    req.dbResult = [store]
    next()
  } catch (error) {
    await trx.rollback()
    throw error
  }
}