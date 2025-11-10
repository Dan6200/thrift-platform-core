import { knex } from '#src/db/index.js'
import { QueryParams } from '#src/types/process-routes.js'
import BadRequestError from '#src/errors/bad-request.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import UnauthorizedError from '#src/errors/unauthorized.js'

export const createProductReviewQuery = async ({
  userId,
  body,
}: QueryParams) => {
  if (!userId) {
    throw new UnauthenticatedError('Authentication required')
  }

  const { order_item_id, rating, customer_remark } = body

  if (!order_item_id || rating === undefined) {
    throw new BadRequestError('Order item ID and rating are required')
  }

  // Check if the order item exists and belongs to the user
  const orderItem = await knex('order_items')
    .where({ order_item_id })
    .join('orders', 'order_items.order_id', 'orders.order_id')
    .select('orders.customer_id')
    .first()

  if (!orderItem) {
    throw new BadRequestError('Order item not found')
  }

  if (orderItem.customer_id !== userId) {
    throw new UnauthorizedError('You can only review your own order items')
  }

  const [review] = await knex('product_reviews')
    .insert({
      order_item_id,
      rating,
      customer_id: userId,
      customer_remark,
    })
    .returning('*')

  return review
}

export const getProductReviewQuery = async ({ params }: QueryParams) => {
  const { order_item_id } = params

  if (!order_item_id) {
    throw new BadRequestError('Order item ID is required')
  }

  const review = await knex('product_reviews').where({ order_item_id }).first()

  return review
}

export const updateProductReviewQuery = async ({
  userId,
  params,
  body,
}: QueryParams) => {
  if (!userId) {
    throw new UnauthenticatedError('Authentication required')
  }

  const { order_item_id } = params
  const { rating, customer_remark } = body

  if (!order_item_id || rating === undefined) {
    throw new BadRequestError('Order item ID and rating are required')
  }

  const existingReview = await knex('product_reviews')
    .where({ order_item_id })
    .first()

  if (!existingReview) {
    throw new BadRequestError('Review not found')
  }

  if (existingReview.customer_id !== userId) {
    throw new UnauthorizedError('You can only update your own reviews')
  }

  const [updatedReview] = await knex('product_reviews')
    .where({ order_item_id })
    .andWhere({ customer_id: userId })
    .update({
      rating,
      customer_remark,
    })
    .returning('*')

  return updatedReview
}

export const deleteProductReviewQuery = async ({
  userId,
  params,
}: QueryParams) => {
  if (!userId) {
    throw new UnauthenticatedError('Authentication required')
  }

  const { order_item_id } = params

  if (!order_item_id) {
    throw new BadRequestError('Order item ID is required')
  }

  const existingReview = await knex('product_reviews')
    .where({ order_item_id })
    .first()

  if (!existingReview) {
    throw new BadRequestError('Review not found')
  }

  if (existingReview.customer_id !== userId) {
    throw new UnauthorizedError('You can only delete your own reviews')
  }

  await knex('product_reviews')
    .where({ order_item_id })
    .andWhere({ customer_id: userId })
    .del()
}
