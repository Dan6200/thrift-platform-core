//cspell:ignore jsonb
import ForbiddenError from '#src/errors/forbidden.js'
import { knex } from '../../../db/index.js'
import BadRequestError from '../../../errors/bad-request.js'
import { QueryParams } from '../../../types/process-routes.js'
import {
  isValidProductRequestData,
  ProductID,
  ProductResponseData,
} from '../../../types/products/index.js'
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
}: QueryParams): Promise<ProductID[]> => {
  if (!userId) {
    throw new UnauthorizedError('Sign-in to create product.')
  }
  if (!storeId)
    throw new BadRequestError(
      'Need to provide Store ID as query param in order to create a product',
    )

  const hasAccess = await knex.raw('select has_store_access(?, ?, ?)', [userId, storeId, ['admin', 'editor']]);
  if (!hasAccess.rows[0].has_store_access) {
    throw new ForbiddenError('You do not have permission to create products for this store.');
  }

  if (!isValidProductRequestData(body)) {
    console.error('Invalid product data:', body);
    throw new BadRequestError('Invalid product data')
  }

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
      const [defaultVariant] = await trx('product_variants').insert({
        product_id: product.product_id,
        sku: `SKU-${product.product_id}`,
        net_price: product.net_price,
        list_price: product.list_price,
      }).returning('variant_id');

      await trx('inventory').insert({
        variant_id: defaultVariant.variant_id,
        quantity_change: 0,
        reason: 'initial_stock'
      });
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
          })
          .returning('variant_id');

        if (variant.quantity_available) {
            await trx('inventory').insert({
                variant_id: newVariant.variant_id,
                quantity_change: variant.quantity_available,
                reason: 'initial_stock'
            });
        }

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

  return [{ product_id: createdProduct.product_id }]
}