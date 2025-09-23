import { knex } from '../../../../db/index.js'
import { QueryParams } from '../../../../types/process-routes.js'
import { VariantIdResponse } from '../../../../types/products/variants.js'
import BadRequestError from '../../../../errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import ForbiddenError from '#src/errors/forbidden.js'
import NotFoundError from '#src/errors/not-found.js'

export default async ({
  params,
  body,
  userId,
}: QueryParams): Promise<VariantIdResponse[]> => {
  if (!userId) {
    throw new UnauthenticatedError('Sign-in to create a variant.')
  }
  if (!params?.productId) {
    throw new BadRequestError('Must provide a product id.')
  }

  const { productId } = params
  const variantData = body

  if (!userId) {
    throw new UnauthenticatedError('Sign-in to create a variant.')
  }
  if (!params?.productId) {
    throw new BadRequestError('Must provide a product id.')
  }
  const product = await knex('products')
    .where({ product_id: productId })
    .first('store_id')
  if (!product) {
    throw new NotFoundError('Product not found.')
  }
  const hasAccess = await knex.raw('select has_store_access(?, ?, ?)', [
    userId,
    product.store_id,
    ['admin', 'editor'],
  ])
  if (!hasAccess.rows[0].has_store_access) {
    throw new ForbiddenError(
      'You do not have permission to create variants for this product.',
    )
  }

  const newVariant = await knex.transaction(async (trx) => {
    const valueIds = new Map<string, number>()

    for (const option of variantData.options) {
      let { option_id } =
        (await trx('product_options')
          .where({ product_id: productId, option_name: option.option_name })
          .first('option_id')) || {}

      if (!option_id) {
        ;[{ option_id }] = await trx('product_options')
          .insert({ product_id: productId, option_name: option.option_name })
          .returning('option_id')
      }

      let { value_id } =
        (await trx('product_option_values')
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
      .returning('variant_id')

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

  return [newVariant]
}
