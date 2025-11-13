import express from 'express'
import multer from 'multer'
import { cloudinaryStorageAvatars } from '../../controllers/utils/media-storage.js'
import {
  createAvatar,
  getAvatar,
  updateAvatar,
  deleteAvatar,
} from '../../controllers/media/avatar.js'
import authentication from '#src/authentication.js'

const router = express.Router()
const upload = multer({ storage: cloudinaryStorageAvatars })

router.use(authentication)

router
  .route('/')
  .post(upload.single('avatar'), createAvatar)
  .get(getAvatar)
  .patch(upload.single('avatar'), updateAvatar)
  .delete(deleteAvatar)

export default router
