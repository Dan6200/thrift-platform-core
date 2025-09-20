import express from 'express'
import multer from 'multer'
import { cloudinaryStorage } from '../../controllers/utils/media-storage.js'
import { createAvatar } from '../../controllers/media/avatar.js'

const router = express.Router()
const upload = multer({ storage: cloudinaryStorage })

router
  .route('/')
  .post(upload.single('avatar'), createAvatar)

export default router
