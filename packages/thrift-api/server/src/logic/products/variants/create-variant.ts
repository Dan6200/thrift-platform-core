import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'
import BadRequestError from '#src/errors/bad-request.js'
import NotFoundError from '#src/errors/not-found.js'

export const createVariantLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { productId } = req.validatedParams!
  const { store_id: storeId } = req.validatedQueryParams!
  const variantData = req.validatedBody!

  // Authorization for product access is handled by preceding middleware

  const product = await knex('products')
    .where({ product_id: productId, store_id: storeId })
    .first('list_price', 'net_price')
  if (!product) {
    throw new NotFoundError('Product not found in this store.')
  }

  const newVariant = await knex.transaction(async (trx) => {
    const valueIds = new Map<string, number>()

    for (const option of variantData.options) {
      let { option_id } = (await trx('product_options')
        .where({ product_id: productId, option_name: option.option_name })
        .first('option_id')) || {}

      if (!option_id) {
        ;[{ option_id }] = await trx('product_options')
          .insert({ product_id: productId, option_name: option.option_name })
          .returning('option_id')
      }

      let { value_id } = (await trx('product_option_values')
        .where({ option_id: option_id, value: option.value })
        .first('value_id')) || {}

      if (!value_id) {
        ;[{ value_id }] = await trx('product_option_values')
          .insert({ option_id: option_id, value: option.value })
          .returning('value_id')
      }
      valueIds.set(option.value, value_id)
    }

    const [createdVariant] = await trx('product_variants')
      .insert({
        product_id: productId,
        sku: variantData.sku,
        list_price: variantData.list_price || product.list_price,
        net_price: variantData.net_price || product.net_price,
      })
      .returning('*')

    if (variantData.quantity_available) {
      await trx('inventory').insert({
        variant_id: createdVariant.variant_id,
        quantity_change: variantData.quantity_available,
        reason: 'initial_stock',
      })
    }

    const links = variantData.options.map((opt: any) => ({
      variant_id: createdVariant.variant_id,
      value_id: valueIds.get(opt.value),
    }))
    await trx('variant_to_option_values').insert(links)

    return createdVariant
  })

  req.dbResult = newVariant
  next()
}
