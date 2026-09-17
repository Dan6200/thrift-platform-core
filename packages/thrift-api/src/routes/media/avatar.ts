import express from 'express'
import multer from 'multer'
import { cloudinaryStorageAvatars } from '#src/utils/media-storage.js'
import {
  createAvatarLogic,
  getAvatarLogic,
  updateAvatarLogic,
  deleteAvatarLogic,
} from '#src/logic/media/index.js'
import authenticateUser from '#src/authentication.js'
import { validate } from '#src/request-validation.js'
import { validateDbResult } from '#src/db-result-validation.js'
import { sendResponse } from '#src/send-response.js'
import {
  AvatarRequestSchema,
  AvatarResponseSchema,
} from '#src/app-schema/media/avatar.js'
import { StatusCodes } from 'http-status-codes'

const router = express.Router()
const upload = multer({ storage: cloudinaryStorageAvatars })
const { CREATED, OK, NO_CONTENT } = StatusCodes

router.use(authenticateUser)

router
  .route('/')
  .post(
    upload.single('avatar'),
    validate(AvatarRequestSchema),
    createAvatarLogic,
    validateDbResult(AvatarResponseSchema),
    sendResponse(CREATED),
  )
  .get(getAvatarLogic, validateDbResult(AvatarResponseSchema), sendResponse(OK))
  .patch(
    upload.single('avatar'),
    validate(AvatarRequestSchema),
    updateAvatarLogic,
    validateDbResult(AvatarResponseSchema),
    sendResponse(OK),
  )
  .delete(deleteAvatarLogic, sendResponse(NO_CONTENT))

export default router
