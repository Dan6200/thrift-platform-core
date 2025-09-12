//cspell:ignore jsonb
import ForbiddenError from '#src/errors/forbidden.js'
import { knex } from '../../../db/index.js'
import BadRequestError from '../../../errors/bad-request.js'
import { QueryParams } from '../../../types/process-routes.js'
import {
  isValidProductRequestData,
  ProductResponseData,
} from '../../../types/products.js'
import UnauthorizedError from '#src/errors/unauthorized.js'

/**
 * @param {QueryParams} {body, query, userId}
 * @returns {Promise<ProductResponseData[]>} - The database response
 * @description Create a new product
 */
export default async ({
  body,
  userId,
  query: { store_id: storeId },
}: QueryParams): Promise<ProductResponseData[]> => {
  if (!userId) {
    throw new UnauthorizedError('Sign-in to list product.')
  }

  // check if vendor account is enabled
  const result = await knex('profiles').where('id', userId).first('is_vendor')
  if (!result?.is_vendor)
    throw new ForbiddenError(
      'Vendor account disabled. Need to enable it to create a store',
    )
  if (!storeId)
    throw new BadRequestError(
      'Need to provide Store ID as query param in order to list a product',
    )
  const response = await knex('stores')
    .where('vendor_id', userId)
    .where('store_id', storeId)
    .first('vendor_id')

  if (!response?.vendor_id)
    throw new ForbiddenError('Must create a store to be able to list products')

  if (!isValidProductRequestData(body))
    throw new BadRequestError('Invalid product data')

  const productData = body

  const createdProduct = await knex.transaction(async (trx) => {
    const { variants, ...productDetails } = productData

    // 1. Insert the base product
    const [product] = await trx('products')
      .insert({
        ...productDetails,
        description: knex.raw('ARRAY[?]::text[]', [productDetails.description]),
        vendor_id: userId,
        store_id: storeId as string,
      })
      .returning('*')

    if (!variants || variants.length === 0) {
      // If no variants are provided, create a default one
      await trx('product_variants').insert({
        product_id: product.product_id,
        sku: `SKU-${product.product_id}`,
        net_price: product.net_price,
        list_price: product.list_price,
        quantity_available: 0,
      })
    } else {
      // 2. Process variants
      for (const variant of variants) {
        const valueIds = new Map<string, number>()

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
        }

        // 4. Insert the product_variant
        const [newVariant] = await trx('product_variants')
          .insert({
            product_id: product.product_id,
            sku: variant.sku,
            list_price: variant.list_price || product.list_price,
            net_price: variant.net_price || product.net_price,
            quantity_available: variant.quantity_available,
          })
          .returning('variant_id')

        // 5. Link variant to option values
        const links = variant.options.map((opt) => ({
          variant_id: newVariant.variant_id,
          value_id: valueIds.get(opt.value),
        }))
        await trx('variant_to_option_values').insert(links)
      }
    }

    return product
  })

  return [createdProduct]
}

