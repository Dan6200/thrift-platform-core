import { Knex } from 'knex'
import { knex } from './index.js'

/**
 * Available stock is the sum of every ledger entry for a variant across all
 * locations. The `product_variant_inventory` view is per-location, so callers
 * must not read it directly; use these helpers instead.
 */
export const stockByVariant = async (
  variantIds: number[],
  executor: Knex = knex,
): Promise<Map<number, number>> => {
  if (!variantIds.length) return new Map()
  const rows = await executor('inventory')
    .whereIn('variant_id', variantIds)
    .select('variant_id')
    .sum({ quantity_available: 'quantity_change' })
    .groupBy('variant_id')
  return new Map(
    rows.map((row) => [row.variant_id, Number(row.quantity_available)]),
  )
}

export const stockForVariant = async (
  variantId: number,
  executor: Knex = knex,
): Promise<number> =>
  (await stockByVariant([variantId], executor)).get(variantId) ?? 0
