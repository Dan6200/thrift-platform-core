import { knex } from '#src/db/index.js'
import { QueryParams } from '#src/types/process-routes.js'
import BadRequestError from '#src/errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import NotFoundError from '#src/errors/not-found.js'
import InternalServerError from '#src/errors/internal-server.js'
import ForbiddenError from '#src/errors/forbidden.js'

export const createOrderQuery = async ({
  userId,
  body,
  query,
}: QueryParams) => {
  if (!userId) {
    throw new UnauthenticatedError('Authentication required')
  }

  const { store_id, delivery_info_id } = query
  const { items } = body

  if (!store_id || !items || items.length === 0) {
    throw new BadRequestError('Store ID and at least one item are required')
  }

  const trx = await knex.transaction()

  try {
    // Verify store exists and belongs to a vendor (optional, but good practice)
    const store = await trx('stores').where({ store_id }).first()
    if (!store) {
      throw new NotFoundError('Store not found')
    }

    // Verify delivery info belongs to the user (if provided)
    if (delivery_info_id) {
      const deliveryInfo = await trx('delivery_info')
        .where({ delivery_info_id, customer_id: userId })
        .first()
      if (!deliveryInfo) {
        throw new BadRequestError('Invalid delivery information')
      }
    }

    let total_amount = 0
    const orderItemsToInsert = []

    for (const item of items) {
      const variant = await trx('product_variants')
        .where({ variant_id: item.variant_id })
        .first()

      if (!variant) {
        throw new BadRequestError(
          `Variant with ID ${item.variant_id} not found`,
        )
      }

      // Get current stock from inventory view
      const inventory = await trx('product_variant_inventory')
        .where({ variant_id: item.variant_id })
        .first()

      const availableQuantity = inventory ? inventory.quantity_available : 0

      if (availableQuantity < item.quantity) {
        throw new BadRequestError(
          `Not enough stock for variant ${item.variant_id}. Available: ${availableQuantity}, Requested: ${item.quantity}`,
        )
      }

      const price_at_purchase = variant.net_price || variant.list_price
      total_amount += price_at_purchase * item.quantity

      orderItemsToInsert.push({
        variant_id: item.variant_id,
        quantity: item.quantity,
        price_at_purchase,
      })
    }

    const [order] = await trx('orders')
      .insert({
        customer_id: userId,
        store_id,
        delivery_info_id,
        total_amount,
        status: 'pending',
      })
      .returning('*')

    for (const orderItem of orderItemsToInsert) {
      await trx('order_items').insert({
        order_id: order.order_id,
        ...orderItem,
      })

      // Deduct from inventory
      await trx('inventory').insert({
        variant_id: orderItem.variant_id,
        quantity_change: -orderItem.quantity,
        reason: 'sale',
        notes: `Order ${order.order_id}`,
      })
    }

    await trx.commit()

    // Fetch the created order with its items for the response
    const createdOrder = await knex('orders')
      .where({ order_id: order.order_id })
      .first()

    const fetchedOrderItems = await knex('order_items')
      .where({ order_id: order.order_id })
      .select('order_item_id', 'variant_id', 'quantity', 'price_at_purchase')

    return { ...createdOrder, items: fetchedOrderItems }
  } catch (error) {
    await trx.rollback()
    throw new InternalServerError(error.toString())
  }
}

export const getOrderQuery = async ({ userId, params, query }: QueryParams) => {
  if (!userId) {
    throw new UnauthenticatedError('Authentication required')
  }

  const { order_id } = params
  const { store_id } = query

  if (!order_id && !store_id) {
    throw new BadRequestError('Order ID or Store ID is required')
  }

  // Determine if the user is a vendor/staff or a customer
  const profile = await knex('profiles').where({ id: userId }).first()
  if (!profile) {
    throw new NotFoundError('User profile not found')
  }

  let ordersQuery = knex('orders')

  if (store_id) {
    // If store_id is provided, check vendor/staff access first
    const isVendor = await knex('stores')
      .where({ store_id, vendor_id: userId })
      .first()

    if (!isVendor) {
      const isStaff = await knex('store_staff')
        .where({ store_id, staff_id: userId })
        .first()
      if (!isStaff) {
        throw new ForbiddenError("Access denied to this store's orders")
      }
    }
    // If vendor or staff, limit by store_id
    ordersQuery = ordersQuery.where({ store_id })
    if (order_id) {
      ordersQuery = ordersQuery.andWhere({ order_id }).first()
    }
  } else {
    // If no store_id, assume customer context or general user
    // Limit by customer_id
    ordersQuery = ordersQuery.where({ customer_id: userId })
    if (order_id) {
      ordersQuery = ordersQuery.andWhere({ order_id }).first()
    }
  }

  const order = await ordersQuery

  if (!order) {
    throw new NotFoundError('Order not found')
  }

  const orderItems = await knex('order_items')
    .where({ order_id: order.order_id })
    .select('order_item_id', 'variant_id', 'quantity', 'price_at_purchase')

  return { ...order, items: orderItems }
}
