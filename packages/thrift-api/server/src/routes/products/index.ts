import express from 'express'
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../../controllers/products/index.js'
import {
  createVariant,
  updateVariant,
  deleteVariant,
} from '../../controllers/products/variants/index.js'

const router = express.Router({ mergeParams: true })

router.route('/').post(createProduct).get(getAllProducts)
router
  .route('/:productId')
  .get(getProduct)
  .patch(updateProduct)
  .delete(deleteProduct)

router.route('/:productId/variants').post(createVariant)
router
    .route('/:productId/variants/:variantId')
    .patch(updateVariant)
    .delete(deleteVariant)

export default router
