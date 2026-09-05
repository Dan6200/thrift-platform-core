// packages/thrift-api/server/src/logic/payments/handle-webhook.ts
import { NextFunction, Request, Response } from 'express'
import BadRequestError from '#src/errors/bad-request.js'
import InternalServerError from '#src/errors/internal-server.js'
import logger from '#src/utils/logger.js'
import { knex } from '#src/db/index.js'
import { verifyPaystackSignature } from '#src/lib/paystack.js'

export const handlePaystackWebhookLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // 1. Verify Paystack Webhook Signature using raw body buffer/string
  const signature = req.headers['x-paystack-signature'] as string
  const rawBody = (req as any).rawBody || JSON.stringify(req.body)

  if (!signature || !verifyPaystackSignature(rawBody, signature)) {
    throw new BadRequestError('Invalid Paystack webhook signature.')
  }

  // 2. Process Webhook Event
  const event = req.body
  const eventId = event.id // Paystack's unique event identifier

  if (!eventId) {
    logger.error('Paystack webhook missing event id.')
    throw new BadRequestError('Webhook missing event identifier.')
  }

  // 2.1 Replay Protection: Atomic check via processed_webhooks audit table
  try {
    await knex('processed_webhooks').insert({
      event_id: eventId,
      provider: 'paystack',
      payload: event,
    })
  } catch (error: any) {
    if (error.code === '23505') {
      // Postgres unique constraint violation
      logger.info(`Webhook: Event ${eventId} already processed. Skipping.`)
      req.dbResult = { message: 'Event already processed.' }
      return next()
    }
    logger.error(`Failed to record webhook event ${eventId}:`, error.message)
    throw new InternalServerError('Failed to process webhook identity.')
  }

  if (event.event === 'charge.success') {
    const paystackReference = event.data.reference
    const orderId = event.data.metadata?.order_id

    if (!orderId) {
      logger.warn(
        'Paystack webhook received with missing order_id metadata.',
        event,
      )
      req.dbResult = {
        message: 'Webhook processed (order_id missing/ignored).',
      }
      return next()
    }

    try {
      // 3. Atomic State Transition (Prevents race conditions with Callback)
      const updatedCount = await knex('orders')
        .where({ order_id: orderId, status: 'pending' })
        .update({
          status: 'processing',
          payment_reference: paystackReference,
          updated_at: knex.fn.now(),
        })

      if (updatedCount === 0) {
        logger.info(
          `Order ${orderId} already settled or not pending. Skipping fulfillment.`,
        )
        req.dbResult = { message: 'Order already processed.' }
        return next()
      }

      // 4. Set Event Payload for downstream processing/publishing
      req.eventPayload = event.data

      logger.info(`Webhook: Payment success confirmed for order ${orderId}.`)
      req.dbResult = {
        message: 'Payment success received and processing initiated.',
      }
    } catch (error: any) {
      logger.error('Error updating order state from webhook:', error.message)
      throw new InternalServerError(
        `Webhook processing failed: ${error.message}`,
      )
    }
  } else {
    logger.info(
      `Received Paystack event: ${event.event}. Unhandled event type.`,
    )
    req.dbResult = { message: `Event ${event.event} not handled.` }
  }

  next()
}
