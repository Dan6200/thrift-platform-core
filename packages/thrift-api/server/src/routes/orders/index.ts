import express from 'express'
import { createOrder, getOrder } from '../../controllers/orders/index.js'

const router = express.Router()

router.route('/').post(createOrder)
router.route('/:order_id').get(getOrder)

export default router
