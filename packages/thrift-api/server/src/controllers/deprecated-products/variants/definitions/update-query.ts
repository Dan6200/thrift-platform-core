import { knex } from '../../../../db/index.js'
import { QueryParams } from '../../../../types/process-routes.js'
import { VariantResponseData } from '../../../../types/products/variants.js'
import BadRequestError from '../../../../errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import NotFoundError from '#src/errors/not-found.js'

export default async ({
  params,
  body,
  userId,
}: QueryParams): Promise<VariantResponseData[]> => {
  if (!userId) {
    throw new UnauthenticatedError('Sign-in to update a variant.')
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
    throw new UnauthorizedError(
      'You do not have permission to update this variant.',
    )
  }

  // Assistant compare logic...
  // let updatedVariants = [],
  //   updatedVariantOptions = []
  // if (variants) {
  //   for (const variant of variants) {
  //     let { options } = variant
  //     let updatedOption = null,
  //       updatedOptionVal = null
  //     for (const option of options) {
  //       // get or create option
  //       let { option_id } = await knex('product_options')
  //         .where({ option_name: option.option_name, product_id: productId })
  //         .first('option_id')
  //       ;[updatedOption] = await knex('product_options')
  //         .insert({
  //           option_id: option_id,
  //           option_name: option.option_name,
  //           product_id: productId,
  //         })
  //         .onConflict('option_id')
  //         .merge()
  //         .where({ 'product_options.product_id': productId })
  //         .returning('*')
  //       ;[updatedOptionVal] = await knex('product_option_values')
  //         .insert({ value: option.value, option_id: option_id })
  //         .onConflict(['option_id', 'value'])
  //         .merge()
  //         .returning('*')
  //       updatedVariantOptions.push({
  //         ...updatedOption,
  //         value: updatedOptionVal,
  //       })
  //     }
  //
  //     let newVariantData = null,
  //       quantity_available = null,
  //       inventory_change_reason = null,
  //       inventory_change_notes = null,
  //       updatedVariant
  //     ;({
  //       options,
  //       quantity_available,
  //       inventory_change_reason,
  //       inventory_change_notes,
  //       ...newVariantData
  //     } = variant as UpdateRequestVariant)
  //
  //     const [updateVariantResult] = await knex('product_variants')
  //       .insert({ product_id: productId, ...newVariantData })
  //       .where({ 'product_variants.product_id': productId })
  //       .onConflict('sku')
  //       .merge()
  //       .returning('*')
  //     if (quantity_available) {
  //       if (!inventory_change_reason)
  //         throw new BadRequestError(
  //           'Must provide reason for change when updating inventory',
  //         )
  //       const trx = await knex.transaction()
  //       const quantity_change =
  //         quantity_available -
  //         (
  //           await trx('product_variant_inventory')
  //             .first('quantity_available')
  //             .where({ variant_id: updateVariantResult.variant_id })
  //         ).quantity_available
  //       await trx('inventory')
  //         .insert({
  //           quantity_change,
  //           reason: inventory_change_reason,
  //           notes: inventory_change_notes,
  //         })
  //         .where({ variant_id: updateVariantResult.variant_id })
  //       const { quantity_available: newQuantity } = await trx(
  //         'product_variant_inventory',
  //       ).first('quantity_available')
  //       updatedVariant = {
  //         ...updateVariantResult,
  //         quantity_available: newQuantity,
  //       }
  //     } else updatedVariant = { ...updateVariantResult }
  //     updatedVariants.push({
  //       ...updatedVariant,
  //       options: updatedVariantOptions,
  //     })
  //   }
  // } //else return variants

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
