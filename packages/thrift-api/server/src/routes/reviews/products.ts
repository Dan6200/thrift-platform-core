import express from 'express'
import {
  createProductReview,
  getProductReview,
  updateProductReview,
  deleteProductReview,
} from '../../controllers/reviews/products.js'

const router = express.Router()

router.route('/').post(createProductReview)
router
  .route('/:order_item_id')
  .get(getProductReview)
  .patch(updateProductReview)
  .delete(deleteProductReview)

export default router
