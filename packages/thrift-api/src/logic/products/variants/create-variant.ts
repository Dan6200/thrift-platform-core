import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'
import NotFoundError from '#src/errors/not-found.js'

export const createVariantLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { productId } = req.validatedParams!
  const { storeId } = req.validatedQueryParams!
  const variantData = req.validatedBody!

  // Authorization for product access is handled by preceding middleware

  const product = await knex('products')
    .where({ product_id: productId, store_id: storeId })
    .first('list_price', 'net_price')
  if (!product) {
    throw new NotFoundError('Product not found in this store.')
  }

  const newVariant = await knex.transaction(async (trx) => {
    const valueMap = new Map<string, { value: string; value_id: number }>()

    for (const option of variantData.options) {
      let optionResult =
        (await trx('product_options')
          .where({ product_id: productId, option_name: option.option_name })
          .first(['option_id', 'option_name'])) || {}

      if (!optionResult.option_id) {
        ;[optionResult] = await trx('product_options')
          .insert({ product_id: productId, option_name: option.option_name })
          .returning(['option_id', 'option_name'])
      }

      let value =
        (await trx('product_option_values')
          .where({ option_id: optionResult.option_id, value: option.value })
          .first(['value_id', 'value'])) || {}

      if (!value.value_id) {
        ;[value] = await trx('product_option_values')
          .insert({ option_id: optionResult.option_id, value: option.value })
          .returning(['value_id', 'value'])
      }
      valueMap.set(option.value, { ...optionResult, ...value })
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
      value_id: valueMap.get(opt.value).value_id,
    }))
    await trx('variant_to_option_values').insert(links)

    const { quantity_available } = await trx('product_variant_inventory')
      .where({ variant_id: createdVariant.variant_id })
      .first('quantity_available')

    return {
      ...createdVariant,
      options: [...valueMap.values()],
      quantity_available,
    }
  })

  req.dbResult = newVariant
  next()
}
