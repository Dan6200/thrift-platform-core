import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import NotFoundError from '#src/errors/not-found.js'
import BadRequestError from '#src/errors/bad-request.js'

export const getOrderLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId || !req.validatedParams || !req.validatedQueryParams) {
    throw new UnauthenticatedError('Authentication required')
  }

  const { order_id } = req.validatedParams
  const { store_id } = req.validatedQueryParams

  if (!order_id) {
    throw new BadRequestError('Order ID is required')
  }

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

    ordersQuery = ordersQuery.andWhere({ order_id }).first()
  } else {
    ordersQuery = ordersQuery
      .where({ customer_id: req.userId, order_id })
      .first()
  }

  const order = (await ordersQuery) as any

  if (!order) {
    throw new NotFoundError('Order not found')
  }

  const orderItems = await knex('order_items')
    .where('order_id', order.order_id)
    .select('order_item_id', 'variant_id', 'quantity', 'price_at_purchase')

  req.dbResult = { ...order, items: orderItems }
  next()
}
