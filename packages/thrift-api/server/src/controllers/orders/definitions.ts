import { knex } from '#src/db/index.js'
import { QueryParams } from '#src/types/process-routes.js'
import BadRequestError from '#src/errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import NotFoundError from '#src/errors/not-found.js'
import InternalServerError from '#src/errors/internal-server.js'
import UnauthorizedError from '#src/errors/unauthorized.js'

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
    // Verify store exists and belongs to a vendor
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

    const variantIds = items.map((item) => item.variant_id)

    const variants = await trx('product_variants')
      .whereIn('variant_id', variantIds)
      .select('variant_id', 'net_price', 'list_price')

    const inventory = await trx('product_variant_inventory')
      .whereIn('variant_id', variantIds)
      .select('variant_id', 'quantity_available')

    const variantsById = variants.reduce(
      (acc, v) => {
        acc[v.variant_id] = v
        return acc
      },
      {} as Record<
        number,
        { variant_id: number; net_price: number; list_price: number }
      >,
    )

    const inventoryById = inventory.reduce(
      (acc, i) => {
        acc[i.variant_id] = i
        return acc
      },
      {} as Record<number, { variant_id: number; quantity_available: number }>,
    )

    let total_amount = 0
    const orderItemsToInsert = []

    for (const item of items) {
      const variant = variantsById[item.variant_id]

      if (!variant) {
        throw new BadRequestError(
          `Variant with ID ${item.variant_id} not found`,
        )
      }

      const availableQuantity =
        inventoryById[item.variant_id]?.quantity_available || 0

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
      .returning('order_id')

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

  if (!order_id) {
    throw new BadRequestError('Order ID is required')
  }

  if (!store_id) {
    throw new BadRequestError('Store ID is required')
  }

  // Determine if the user is a vendor/staff or a customer
  const profile = await knex('profiles').where({ id: userId }).first()
  if (!profile) {
    throw new NotFoundError('User profile not found')
  }

  let ordersQuery = knex('orders')

  if (store_id) {
    // If store_id is provided, check if the user is a customer or vendor/staff
    if (profile.is_vendor) {
      const {
        rows: [{ has_store_access }],
      } = await knex.raw('select has_store_access(?, ?, ?)', [
        userId,
        store_id,
        ['admin', 'editor'],
      ])

      if (!has_store_access) {
        throw new UnauthorizedError("Access denied to this store's orders")
      }
      // If vendor or staff, limit by store_id
      ordersQuery = ordersQuery.where({ store_id })
    } else {
      // If customer, limit by customer_id and store_id
      ordersQuery = ordersQuery.where({ customer_id: userId, store_id })
    }

    ordersQuery = ordersQuery.andWhere({ order_id }).first()
  } else {
    ordersQuery = ordersQuery.where({ customer_id: userId, order_id }).first()
  }

  const order = await ordersQuery

  if (!order) {
    throw new NotFoundError('Order not found')
  }

  const orderItems = await knex('order_items')
    .where('order_id', order.order_id)
    .select('order_item_id', 'variant_id', 'quantity', 'price_at_purchase')

  return { ...order, items: orderItems }
}

export const getAllOrdersQuery = async ({ userId, query }: QueryParams) => {
  if (!userId) {
    throw new UnauthenticatedError('Authentication required')
  }

  const { store_id } = query

  if (!store_id) {
    throw new BadRequestError('Store ID is required')
  }

  // Determine if the user is a vendor/staff or a customer
  const profile = await knex('profiles').where({ id: userId }).first()
  if (!profile) {
    throw new NotFoundError('User profile not found')
  }

  let ordersQuery = knex('orders')

  if (store_id) {
    // If store_id is provided, check if the user is a customer or vendor/staff
    if (profile.is_vendor) {
      const {
        rows: [{ has_store_access }],
      } = await knex.raw('select has_store_access(?, ?, ?)', [
        userId,
        store_id,
        ['admin', 'editor'],
      ])

      if (!has_store_access) {
        throw new UnauthorizedError("Access denied to this store's orders")
      }
      // If vendor or staff, limit by store_id
      ordersQuery = ordersQuery.where({ store_id })
    } else {
      // If customer, limit by customer_id and store_id
      ordersQuery = ordersQuery.where({ customer_id: userId, store_id })
    }
  } else {
    ordersQuery = ordersQuery.where({ customer_id: userId })
  }

  const orders = await ordersQuery

  if (!orders.length) {
    throw new NotFoundError('Order not found')
  }

  const orderItems = await knex('order_items')
    .whereIn(
      'order_id',
      orders.map((o) => o.order_id),
    )
    .select(
      'order_id',
      'order_item_id',
      'variant_id',
      'quantity',
      'price_at_purchase',
    )

  const itemsByOrderId = orderItems.reduce(
    (acc, items) => {
      const id = items.order_id
      acc[id] = acc[id] ?? []
      acc[id].push(items)
      return acc
    },
    {} as Record<
      number,
      {
        order_id: number
        variant_id: number
        quantity: number
        price_at_purchase: number
        order_item_id: number
      }[]
    >,
  )

  const fullOrderResponse = orders.map((order) => ({
    ...order,
    items: itemsByOrderId[order.order_id] ?? [],
  }))

  /* TODO: Refactor to a more efficient query...
	 * const fullOrderResponse = await knex('orders')
  // Ensure you only select the orders you care about
  .whereIn('orders.order_id', orders.map((o) => o.order_id)) 
  
  // Start the join to pull in the order_items
  .leftJoin('order_items', 'orders.order_id', 'order_items.order_id')
  
  // Group the results by the columns of the main 'orders' table
  .groupBy('orders.order_id') 
  
  // Select all order columns
  .select('orders.*') 
  
  // Use json_agg() to group the item columns into a JSON array called 'items'
  // row_to_json() converts the selected columns into a JSON object for each row
  .select(
    knex.raw(`
      json_agg(
        json_build_object(
          'order_item_id', order_items.order_item_id,
          'variant_id', order_items.variant_id,
          'quantity', order_items.quantity,
          'price_at_purchase', order_items.price_at_purchase
        )
      ) as items
    `)
  );
	*/

  return fullOrderResponse
}
