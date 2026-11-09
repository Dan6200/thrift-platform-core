import { knex } from '#src/db/index.js'
import { stockByVariant } from '#src/db/inventory.js'
import { Knex } from 'knex'
import {
  OrderRepository,
  OrderFilter,
  OrderByIdFilter,
  PersistedOrder,
} from '../ports/order-repository.js'

class InsufficientStockError extends Error {
  constructor(readonly variantId: number) {
    super(`Not enough stock for variant ${variantId}.`)
  }
}

const sortedUnique = (ids: number[]): number[] =>
  [...new Set(ids)].sort((a, b) => a - b)

/**
 * Serialise concurrent orders that touch the same variants by locking the
 * variant rows in a deterministic order. The lock is taken before stock is
 * re-read, so a racing transaction waits and then observes the committed sale.
 */
const lockVariants = async (
  trx: Knex.Transaction,
  variantIds: number[],
): Promise<void> => {
  if (!variantIds.length) return
  await trx('product_variants')
    .whereIn('variant_id', variantIds)
    .orderBy('variant_id')
    .forUpdate()
    .select('variant_id')
}

const assembleOrderItems = async (orderIds: number[]) => {
  if (!orderIds.length) return new Map<number, unknown[]>()
  const rows = await knex('order_items')
    .whereIn('order_id', orderIds)
    .select(
      'order_id',
      'order_item_id',
      'variant_id',
      'quantity',
      'price_at_purchase',
    )
  const byOrderId = new Map<number, unknown[]>()
  for (const row of rows) {
    const items = byOrderId.get(row.order_id) ?? []
    items.push(row)
    byOrderId.set(row.order_id, items)
  }
  return byOrderId
}

export const knexOrderRepository: OrderRepository = {
  async storeExists(storeId) {
    const store = await knex('stores').where({ store_id: storeId }).first()
    return !!store
  },

  async deliveryInfoBelongsTo(deliveryInfoId, customerId) {
    const info = await knex('delivery_info')
      .where({ delivery_info_id: deliveryInfoId, customer_id: customerId })
      .first()
    return !!info
  },

  async getVariantPrices(variantIds) {
    const rows = await knex('product_variant_effective_price')
      .whereIn('variant_id', variantIds)
      .select('variant_id', 'effective_price')
    return new Map(
      rows.map((row) => [row.variant_id, Number(row.effective_price)]),
    )
  },

  async getAvailableStock(variantIds) {
    return stockByVariant(variantIds)
  },

  async getVariantStoreIds(variantIds) {
    const rows = await knex('product_variants as pv')
      .join('products as p', 'pv.product_id', 'p.product_id')
      .whereIn('pv.variant_id', variantIds)
      .select('pv.variant_id', 'p.store_id')
    return new Map(rows.map((row) => [row.variant_id, row.store_id]))
  },

  async create({ order }) {
    try {
      const created = await knex.transaction(async (trx) => {
        const variantIds = sortedUnique(
          order.items.map((item) => item.variantId),
        )
        await lockVariants(trx, variantIds)

        const stock = await stockByVariant(variantIds, trx)
        for (const item of order.items) {
          if ((stock.get(item.variantId) ?? 0) < item.quantity) {
            throw new InsufficientStockError(item.variantId)
          }
        }

        const [orderRow] = await trx('orders')
          .insert({
            customer_id: order.customerId,
            store_id: order.storeId,
            delivery_info_id: order.deliveryInfoId ?? null,
            total_amount: order.totalAmount,
            status: order.status,
          })
          .returning('*')

        const persistedItems = []
        for (const item of order.items) {
          const [orderItem] = await trx('order_items')
            .insert({
              order_id: orderRow.order_id,
              variant_id: item.variantId,
              quantity: item.quantity,
              price_at_purchase: item.priceAtPurchase,
            })
            .returning('*')

          persistedItems.push({
            order_item_id: orderItem.order_item_id,
            variant_id: orderItem.variant_id,
            quantity: orderItem.quantity,
            price_at_purchase: orderItem.price_at_purchase,
          })

          await trx('inventory').insert({
            variant_id: item.variantId,
            quantity_change: -item.quantity,
            reason: 'sale',
            notes: `Order ${orderRow.order_id}`,
          })
        }

        return { ...orderRow, items: persistedItems }
      })

      return { kind: 'created' as const, order: created as PersistedOrder }
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        return {
          kind: 'insufficient_stock' as const,
          variantId: error.variantId,
        }
      }
      throw error
    }
  },

  async getProfile(userId) {
    const profile = await knex('profiles').where({ id: userId }).first()
    return profile ?? null
  },

  async hasStoreAccess(userId, storeId, roles) {
    const {
      rows: [{ has_store_access }],
    } = await knex.raw('select has_store_access(?, ?, ?)', [
      userId,
      storeId,
      roles,
    ])
    return !!has_store_access
  },

  async getAllOrders(filter: OrderFilter) {
    const orders = await knex('orders').where(filter)
    if (!orders.length) return []
    const itemsByOrderId = await assembleOrderItems(
      orders.map((order) => order.order_id),
    )
    return orders.map((order) => ({
      ...order,
      items: itemsByOrderId.get(order.order_id) ?? [],
    }))
  },

  async getOrderById(filter: OrderByIdFilter) {
    const order = await knex('orders').where(filter).first()
    if (!order) return null
    const itemsByOrderId = await assembleOrderItems([order.order_id])
    return { ...order, items: itemsByOrderId.get(order.order_id) ?? [] }
  },

  async findReviewableItem(customerId, productId) {
    const item = await knex('order_items as oi')
      .join('orders as o', 'oi.order_id', 'o.order_id')
      .join('product_variants as pv', 'oi.variant_id', 'pv.variant_id')
      .join('products as p', 'pv.product_id', 'p.product_id')
      .leftJoin('product_reviews as pr', 'oi.order_item_id', 'pr.order_item_id')
      .where('o.customer_id', customerId)
      .where('p.product_id', productId)
      .whereNotIn('o.status', ['cancelled', 'failed', 'refunded'])
      .whereNull('pr.order_item_id')
      .select('oi.order_item_id')
      .first()
    return item ?? null
  },

  async getOrderForMutation(orderId, customerId) {
    const order = await knex('orders')
      .where({ order_id: orderId, customer_id: customerId })
      .first('order_id', 'status', 'store_id')

    if (!order) return null

    const items = await knex('order_items')
      .where({ order_id: orderId })
      .select('order_item_id', 'variant_id', 'quantity', 'price_at_purchase')

    return { ...order, items }
  },

  async amendOrder({ orderId, items, totalAmount }) {
    try {
      const amended = await knex.transaction(async (trx) => {
        const [orderRow] = await trx('orders')
          .where({ order_id: orderId, status: 'pending' })
          .update({ total_amount: totalAmount, updated_at: knex.fn.now() })
          .returning('*')

        if (!orderRow) return null

        const oldItems = await trx('order_items')
          .where({ order_id: orderId })
          .select('variant_id', 'quantity')

        const held = new Map<number, number>()
        for (const item of oldItems) {
          held.set(
            item.variant_id,
            (held.get(item.variant_id) ?? 0) + item.quantity,
          )
        }

        await lockVariants(
          trx,
          sortedUnique([
            ...oldItems.map((item) => item.variant_id),
            ...items.map((item) => item.variantId),
          ]),
        )

        const newVariantIds = sortedUnique(items.map((item) => item.variantId))
        const stock = await stockByVariant(newVariantIds, trx)
        for (const item of items) {
          const effective =
            (stock.get(item.variantId) ?? 0) + (held.get(item.variantId) ?? 0)
          if (effective < item.quantity) {
            throw new InsufficientStockError(item.variantId)
          }
        }

        for (const item of oldItems) {
          await trx('inventory').insert({
            variant_id: item.variant_id,
            quantity_change: item.quantity,
            reason: 'order_amended',
            notes: `Order ${orderId}`,
          })
        }

        await trx('order_items').where({ order_id: orderId }).del()

        const newItems = []
        for (const item of items) {
          const [row] = await trx('order_items')
            .insert({
              order_id: orderId,
              variant_id: item.variantId,
              quantity: item.quantity,
              price_at_purchase: item.priceAtPurchase,
            })
            .returning('*')

          newItems.push({
            order_item_id: row.order_item_id,
            variant_id: row.variant_id,
            quantity: row.quantity,
            price_at_purchase: row.price_at_purchase,
          })

          await trx('inventory').insert({
            variant_id: item.variantId,
            quantity_change: -item.quantity,
            reason: 'sale',
            notes: `Order ${orderId} (amended)`,
          })
        }

        return { ...orderRow, items: newItems }
      })

      if (!amended) return null
      return { kind: 'amended' as const, order: amended as PersistedOrder }
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        return {
          kind: 'insufficient_stock' as const,
          variantId: error.variantId,
        }
      }
      throw error
    }
  },

  async cancelOrder(orderId) {
    return knex.transaction(async (trx) => {
      const [orderRow] = await trx('orders')
        .where({ order_id: orderId, status: 'pending' })
        .update({ status: 'cancelled', updated_at: knex.fn.now() })
        .returning('*')

      if (!orderRow) return null

      const items = await trx('order_items')
        .where({ order_id: orderId })
        .select('order_item_id', 'variant_id', 'quantity', 'price_at_purchase')

      for (const item of items) {
        await trx('inventory').insert({
          variant_id: item.variant_id,
          quantity_change: item.quantity,
          reason: 'order_cancelled',
          notes: `Order ${orderId}`,
        })
      }

      return { ...orderRow, items }
    })
  },
}
