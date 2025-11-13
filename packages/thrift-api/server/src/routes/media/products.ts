import express from 'express'
import multer from 'multer'
import { cloudinaryStorageProducts } from '../../controllers/utils/media-storage.js'
import {
  createProductMedia,
  getProductMedia,
  updateProductMedia,
  deleteProductMedia,
} from '../../controllers/media/products.js'
import authentication from '#src/authentication.js'

const router = express.Router()
const upload = multer({ storage: cloudinaryStorageProducts })
const uploadLimit = 12

router.use(authentication)
router
  .route('/')
  .post(upload.array('product-media', uploadLimit), createProductMedia)

router
  .route('/:mediaId')
  .get(getProductMedia)
  .patch(upload.single('product-media'), updateProductMedia)
  .delete(deleteProductMedia)

export default router
