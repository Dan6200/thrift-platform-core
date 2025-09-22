import { knex } from '../../../../db/index.js'
import { QueryParams } from '../../../../types/process-routes.js'
import { VariantResponseData } from '../../../../types/products/variants.js'
import BadRequestError from '../../../../errors/bad-request.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import ForbiddenError from '#src/errors/forbidden.js'
import NotFoundError from '#src/errors/not-found.js'

export default async ({
  params,
  body,
  userId,
}: QueryParams): Promise<VariantResponseData[]> => {
  if (!userId) {
    throw new UnauthorizedError('Sign-in to update a variant.')
  }
  if (!params?.variantId) {
    throw new BadRequestError('Must provide a variant id.')
  }

  const { variantId } = params
  const variantData = body

  const variant = await knex('product_variants as pv')
    .join('products as p', 'pv.product_id', 'p.product_id')
    .where({ 'pv.variant_id': variantId })
    .first('p.store_id')

  if (!variant) {
    throw new NotFoundError('Variant not found.')
  }

  const hasAccess = await knex.raw('select has_store_access(?, ?, ?)', [
    userId,
    variant.store_id,
    ['admin', 'editor'],
  ])
  if (!hasAccess.rows[0].has_store_access) {
    throw new ForbiddenError(
      'You do not have permission to update this variant.',
    )
  }

  const { quantity_available, ...restOfVariantData } = variantData

  const [updatedVariant] = await knex('product_variants')
    .where({ variant_id: variantId })
    .update(restOfVariantData)
    .returning('*')

  if (quantity_available) {
    const currentInventory = await knex('product_variant_inventory')
      .where({ variant_id: variantId })
      .first('quantity_available')

    const currentQuantity = currentInventory
      ? currentInventory.quantity_available
      : 0
    const quantityChange = quantity_available - currentQuantity

    if (quantityChange !== 0) {
      await knex('inventory').insert({
        variant_id: variantId,
        quantity_change: quantityChange,
        reason: 'manual_update',
      })
    }
  }

  // Fetch the full variant details for the response
  const options = await knex('variant_to_option_values as vtov')
    .join('product_option_values as pov', 'vtov.value_id', 'pov.value_id')
    .join('product_options as po', 'pov.option_id', 'po.option_id')
    .where('vtov.variant_id', updatedVariant.variant_id)
    .select('po.option_id', 'po.option_name', 'pov.value_id', 'pov.value')

  const inventory = await knex('product_variant_inventory')
    .where({ variant_id: variantId })
    .first('quantity_available')

  return [
    {
      ...updatedVariant,
      options,
      quantity_available: inventory ? inventory.quantity_available : 0,
    },
  ]
}
