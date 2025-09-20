import express from 'express'
import multer from 'multer'
import { cloudinaryStorage } from '../../controllers/utils/media-storage.js'
import { createProductMedia } from '../../controllers/media/products.js'

const router = express.Router()
const upload = multer({ storage: cloudinaryStorage })
const uploadLimit = 12
router
  .route('/')
  .post(upload.array('product-media', uploadLimit), createProductMedia)

export default router
