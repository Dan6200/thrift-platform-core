import express from 'express'
import storesRouter from './stores.js'
import productsRouter from './products.js' // To be added later

const router = express.Router()

router.use('/stores', storesRouter)
router.use('/stores/:storeId/products', productsRouter)

export default router
