import express from 'express'
import multer from 'multer'
import { cloudinaryStorage } from '../../controllers/utils/media-storage.js'
import { createAvatar, getAvatar, updateAvatar, deleteAvatar } from '../../controllers/media/avatar.js'

const router = express.Router()
const upload = multer({ storage: cloudinaryStorage })

router
  .route('/')
  .post(upload.single('avatar'), createAvatar)
  .get(getAvatar)
  .patch(upload.single('avatar'), updateAvatar)
  .delete(deleteAvatar)

export default router
