import express from 'express'
import storesRouter from './stores.js'
import productsRouter from './products.js'

const router = express.Router()

router.use('/stores', storesRouter)
router.use('/products', productsRouter)

export default router
