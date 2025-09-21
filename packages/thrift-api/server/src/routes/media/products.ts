import express from 'express'
import multer from 'multer'
import { cloudinaryStorage } from '../../controllers/utils/media-storage.js'
import { createProductMedia, getProductMedia, updateProductMedia, deleteProductMedia } from '../../controllers/media/products.js'

const router = express.Router()
const upload = multer({ storage: cloudinaryStorage })
const uploadLimit = 12
router
  .route('/')
  .post(upload.array('product-media', uploadLimit), createProductMedia)

router
  .route('/:media_id')
  .get(getProductMedia)
  .patch(upload.single('product-media'), updateProductMedia)
  .delete(deleteProductMedia)

export default router
