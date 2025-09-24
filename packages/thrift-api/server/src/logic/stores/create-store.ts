import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'
import StoreData from '../../types/store-data.js'

export const createStoreLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const storeData: StoreData = req.validatedBody as StoreData

  const { store_address, pages, ...restOfStoreData } = storeData

  const trx = await knex.transaction()
  try {
    const [address] = await trx('address').insert(store_address).returning('*')

    const [store] = await trx('stores')
      .insert({
        vendor_id: req.userId,
        ...restOfStoreData,
        address_id: address.address_id,
      })
      .returning('*')

    let pagesWithSections = []

    if (pages) {
      for (const page of pages) {
        let currentSections = []
        const { sections, ...restOfPage } = page
        const [pageResult] = await trx('pages')
          .insert({
            ...restOfPage,
            store_id: store.store_id,
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
            currentSections.push(sectionResult)
          }
        }
        pagesWithSections.push({ ...pageResult, sections: currentSections })
      }
    }

    await trx.commit()
    const { address_id, ...coreStore } = store
    req.dbResult = {
      ...coreStore,
      store_address: address,
      pages: pagesWithSections.map((pageWithSections: any) => {
        const { store_id, ...corePageResult } = pageWithSections
        return {
          ...corePageResult,
          sections: corePageResult.sections.map((section: any) => {
            const { page_id, ...coreSection } = section
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