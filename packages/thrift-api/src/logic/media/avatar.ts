import { StatusCodes } from 'http-status-codes'
import { Request, Response, NextFunction } from 'express'
import { knex } from '#src/db/index.js'
import BadRequestError from '#src/errors/bad-request.js'

const { CREATED, OK, NO_CONTENT } = StatusCodes

export const createAvatarLogic = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId, body, file } = req

  if (!userId) {
    throw new BadRequestError('User not found')
  }

  if (!file) {
    throw new BadRequestError('No file uploaded')
  }

  const { filename, path: filepath, mimetype: filetype } = file

  const [media] = await knex('media')
    .insert({
      uploader_id: userId,
      filename,
      filepath,
      filetype,
      description: body.description,
    })
    .returning('*')

  await knex('profile_media')
    .insert({
      profile_id: userId,
      media_id: media.media_id,
    })
    .onConflict('profile_id')
    .merge()

  const { uploader_id, ...mediaResponse } = media
  req.dbResult = { ...mediaResponse, profile_id: uploader_id }
  next()
}

export const getAvatarLogic = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req
  const media = await knex('profile_media')
    .join('media', 'profile_media.media_id', 'media.media_id')
    .where({ profile_id: userId })
    .first(
      'profile_media.media_id',
      'filename',
      'filetype',
      'filepath',
      'description',
      'created_at',
      'updated_at',
      'profile_id',
    )
  req.dbResult = media
  next()
}

export const updateAvatarLogic = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId, body, file } = req
  const { description } = body
  const { filename, path: filepath, mimetype: filetype } = file || {}

  const { media_id } = await knex('profile_media')
    .where({ profile_id: userId })
    .first()

  const [updatedMedia] = await knex('media')
    .where({ media_id })
    .update({ description, filename, filepath, filetype })
    .returning('*')

  const { uploader_id, ...updatedMediaResponse } = updatedMedia
  req.dbResult = { ...updatedMediaResponse, profile_id: uploader_id }
  next()
}

export const deleteAvatarLogic = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req
  const { media_id } = await knex('profile_media')
    .where({ profile_id: userId })
    .first()
  await knex('profile_media').where({ profile_id: userId }).del()
  await knex('media').where({ media_id }).del()
  next()
}
