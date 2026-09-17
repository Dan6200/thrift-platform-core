import { knex } from '#src/db/index.js'
import NotFoundError from '#src/errors/not-found.js'
import BadRequestError from '#src/errors/bad-request.js'
import { Request, Response, NextFunction } from 'express'
import StoreData from '../../types/store-data.js'

export const updateStoreLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.validatedParams)
    throw new BadRequestError('No valid route parameters provided')
  const { storeId } = req.validatedParams
  const storeData = req.validatedBody as StoreData

  const { store_address, pages, ...restOfStoreData } = storeData

  const trx = await knex.transaction()
  try {
    // Get the address_id of the store to update the associated address
    const store = await trx('stores')
      .where('store_id', storeId)
      .select('address_id')
      .first()

    if (!store) {
      throw new NotFoundError('Store not found')
    }

    let updatedStoreAddress = null
    if (store_address) {
      ;[updatedStoreAddress] = await trx('address')
        .where('address_id', store.address_id)
        .update(store_address)
        .returning('*')
    } else {
      // If store_address was not provided in the update, fetch the existing one
      updatedStoreAddress = await trx('address')
        .where('address_id', store.address_id)
        .first()
    }

    const [updatedStore] = await trx('stores')
      .where('store_id', storeId)
      .update(restOfStoreData)
      .returning('*')

    // Delete existing pages and sections
    const pageIds = await trx('pages')
      .where('store_id', storeId)
      .select('page_id')
    const pageIdList = pageIds.map((p) => p.page_id)
    await trx('page_sections').whereIn('page_id', pageIdList).del()
    await trx('pages').where('store_id', storeId).del()

    // Insert new pages and sections
    let updatedPages = []
    if (pages) {
      for (const page of pages) {
        let updatedPageSections = []
        const { sections, ...restOfPage } = page
        const [pageResult] = await trx('pages')
          .insert({
            ...restOfPage,
            store_id: storeId,
          })
          .returning('*')

        if (sections) {
          for (const section of sections) {
            const { section_data, styles, ...restOfSection } = section
            const [sectionResult] = await trx('page_sections')
              .insert({
                ...restOfSection,
                page_id: pageResult.page_id,
                section_data: section_data
                  ? JSON.stringify(section_data)
                  : null,
                styles: styles ? JSON.stringify(styles) : null,
              })
              .returning('*')
            updatedPageSections.push(sectionResult)
          }
        }
        updatedPages.push({ ...pageResult, sections: updatedPageSections })
      }
    }

    await trx.commit()
    const { address_id, ...coreUpdatedStore } = updatedStore
    req.dbResult = {
      ...coreUpdatedStore,
      store_address: updatedStoreAddress,
      pages: updatedPages.map((updatedPage: any) => {
        const { store_id, ...corePage } = updatedPage
        return {
          ...corePage,
          sections: corePage.sections.map((updatedSection: any) => {
            const { page_id, ...coreSection } = updatedSection
            return coreSection
          }),
        }
      }),
    }
    next()
  } catch (error) {
    await trx.rollback()
    throw error
  }
}
