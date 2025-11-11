import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import NotFoundError from '#src/errors/not-found.js'
import BadRequestError from '#src/errors/bad-request.js'

export const getAllOrdersLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId || !req.validatedQueryParams) {
    throw new UnauthenticatedError('Authentication required')
  }

  const { store_id } = req.validatedQueryParams

  if (!store_id) {
    throw new BadRequestError('Store ID is required')
  }

  // Determine if the user is a vendor/staff or a customer
  const profile = await knex('profiles').where({ id: req.userId }).first()
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
        req.userId,
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
      ordersQuery = ordersQuery.where({ customer_id: req.userId, store_id })
    }
  } else {
    ordersQuery = ordersQuery.where({ customer_id: req.userId })
  }

  const orders = await ordersQuery

  if (!orders.length) {
    req.dbResult = []
    return next()
  }

  const orderItems = await knex('order_items')
    .whereIn(
      'order_id',
      orders.map((o: any) => o.order_id),
    )
    .select(
      'order_id',
      'order_item_id',
      'variant_id',
      'quantity',
      'price_at_purchase',
    )

  const itemsByOrderId = orderItems.reduce(
    (acc: any, items: any) => {
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

  const fullOrderResponse = orders.map((order: any) => ({
    ...order,
    items: itemsByOrderId[order.order_id] ?? [],
  }))

  req.dbResult = fullOrderResponse
  next()
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
}
