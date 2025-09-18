import { Router } from 'express'
import { getCart, addItemToCart, updateCartItem, removeCartItem } from '../../controllers/cart/index.js'

const router = Router()

router.get('/', getCart)
router.post('/items', addItemToCart)
router.put('/items/:item_id', updateCartItem)
router.delete('/items/:item_id', removeCartItem)

export default router
