// server/src/logic/payments/handle-callback.ts
import { NextFunction, Request, Response } from 'express'
import BadRequestError from '#src/errors/bad-request.js'
import NotFoundError from '#src/errors/not-found.js'
import InternalServerError from '#src/errors/internal-server.js'
import logger from '#src/utils/logger.js'
import { knex } from '#src/db/index.js'
import { paystack } from '#src/lib/paystack.js'

export const handlePaystackCallbackLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { reference } = req.query

  if (!reference || typeof reference !== 'string') {
    throw new BadRequestError('Missing or invalid payment reference.')
  }

  // 1. PRE-FILTER: Local DB Check (0 Paystack API calls if already resolved or invalid)
  const order = await knex('orders')
    .where({ payment_reference: reference })
    .first()

  if (!order) {
    throw new NotFoundError('No order found matching this payment reference.')
  }

  // Fast-path: Order was already updated (e.g. by Webhook or previous check)
  if (order.status !== 'pending') {
    logger.info(
      `Callback: Order ${order.order_id} already marked as ${order.status}.`,
    )
    req.dbResult = {
      order_id: order.order_id,
      status: order.status,
      already_processed: true,
    }
    return next()
  }

  try {
    // 2. VERIFY TRANSACTION WITH PAYSTACK API
    const verification = await paystack.transaction.verify({ reference })

    if (!verification.status || verification.data.status !== 'success') {
      logger.warn(`Paystack verification failed for reference ${reference}`)

      await knex('orders')
        .where({ order_id: order.order_id, status: 'pending' })
        .update({ status: 'failed', updated_at: knex.fn.now() })

      req.dbResult = {
        order_id: order.order_id,
        status: 'failed',
        message: 'Payment verification failed.',
      }
      return next()
    }

    // 3. ATOMIC FULFILLMENT
    const updatedCount = await knex('orders')
      .where({ order_id: order.order_id, status: 'pending' })
      .update({
        status: 'processing',
        updated_at: knex.fn.now(),
      })

    req.dbResult = {
      order_id: order.order_id,
      status: 'processing',
      already_processed: updatedCount === 0,
    }

    next()
  } catch (error: any) {
    logger.error('Error verifying Paystack callback:', error.message)
    throw new InternalServerError(
      `Callback verification failed: ${error.message}`,
    )
  }
}
