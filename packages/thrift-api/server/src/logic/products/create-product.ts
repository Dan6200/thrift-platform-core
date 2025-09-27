import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'
import BadRequestError from '#src/errors/bad-request.js'

export const createProductLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { storeId } = req.validatedQueryParams!
  const productData = req.validatedBody!

  const createdProduct = await knex.transaction(async (trx) => {
    const { variants, ...productDetails } = productData

    // 1. Insert the base product
    const [product] = await trx('products')
      .insert({
        ...productDetails,
        description: productDetails.description,
        vendor_id: req.userId,
        store_id: storeId as string,
      })
      .returning('*')

    if (!variants || variants.length === 0) {
      throw new BadRequestError('A product must have at least one variant.')
    }

    const createdVariants = []
    for (const variant of variants) {
      const valueIds = new Map<string, number>()
      const createdOptions = []

      // 3. Process options for this variant
      for (const option of variant.options) {
        // Get or create product_option
        let { option_id } =
          (await trx('product_options')
            .where({
              product_id: product.product_id,
              option_name: option.option_name,
            })
            .first('option_id')) || {}

        if (!option_id) {
          ;[{ option_id }] = await trx('product_options')
            .insert({
              product_id: product.product_id,
              option_name: option.option_name.toUpperCase(),
            })
            .returning('option_id')
        }

        // Get or create product_option_value
        let { value_id } =
          (await trx('product_option_values')
            .where({ option_id: option_id, value: option.value })
            .first('value_id')) || {}

        if (!value_id) {
          ;[{ value_id }] = await trx('product_option_values')
            .insert({
              option_id: option_id,
              value: option.value.toUpperCase(),
            })
            .returning('value_id')
        }
        valueIds.set(option.value, value_id)
        createdOptions.push({ option_id, value_id, ...option })
      }

      // 4. Insert the product_variant
      const [newVariant] = await trx('product_variants')
        .insert({
          product_id: product.product_id,
          sku: variant.sku,
          list_price: variant.list_price || product.list_price,
          net_price: variant.net_price || product.net_price,
        })
        .returning([
          'variant_id',
          'sku',
          'list_price',
          'net_price',
          'created_at',
          'updated_at',
        ])

      if (variant.quantity_available) {
        await trx('inventory').insert({
          variant_id: newVariant.variant_id,
          quantity_change: variant.quantity_available,
          reason: 'initial_stock',
        })
      }

      // 5. Link variant to option values
      const links = Array.from(valueIds.values()).map((value_id) => ({
        variant_id: newVariant.variant_id,
        value_id,
      }))
      await trx('variant_to_option_values').insert(links)

      createdVariants.push({
        ...newVariant,
        options: createdOptions,
        quantity_available: variant.quantity_available,
      })
    }

    return { ...product, variants: createdVariants }
  })

  req.dbResult = createdProduct
  next()
}
