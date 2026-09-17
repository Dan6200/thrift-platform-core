import { StatusCodes } from 'http-status-codes'
import { Request, Response, NextFunction } from 'express'
import { knex } from '#src/db/index.js'
import BadRequestError from '#src/errors/bad-request.js'

const { CREATED, OK, NO_CONTENT } = StatusCodes

export const createProductMediaLogic = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId, body, files } = req
  const {
    product_id,
    descriptions,
    is_display_image,
    is_thumbnail_image,
    filetypes,
  } = body
  const uploader_id = userId

  if (!product_id) {
    throw new BadRequestError('product_id is required')
  }

  if (!uploader_id) {
    throw new BadRequestError('User not found')
  }

  let parsedDescriptions = descriptions
  let parsedIsDisplayImage = is_display_image
  let parsedIsThumbnailImage = is_thumbnail_image
  let parsedFiletypes = filetypes

  if (descriptions && typeof descriptions === 'string') {
    parsedDescriptions = JSON.parse(descriptions)
  }
  if (is_display_image && typeof is_display_image === 'string') {
    parsedIsDisplayImage = JSON.parse(is_display_image)
  }
  if (is_thumbnail_image && typeof is_thumbnail_image === 'string') {
    parsedIsThumbnailImage = JSON.parse(is_thumbnail_image)
  }
  if (filetypes && typeof filetypes === 'string') {
    parsedFiletypes = JSON.parse(filetypes)
  }

  const filesArray = Array.isArray(files) ? files : [files]

  if (!filesArray || filesArray.length === 0) {
    throw new BadRequestError('No files uploaded')
  }

  const variant = await knex('product_variants')
    .select('variant_id')
    .where({ product_id })
    .first()
  if (!variant) {
    throw new BadRequestError(`No variants found for product_id ${product_id}`)
  }
  const { variant_id } = variant

  const mediaDBResponse = await Promise.all(
    filesArray.map(async (file: any) => {
      const { filename, originalname, path: filepath } = file

      const [media] = await knex('media')
        .insert({
          uploader_id,
          filename,
          filepath,
          description: parsedDescriptions[originalname],
          filetype: parsedFiletypes[originalname],
        })
        .returning('*')

      await knex('product_media_links').insert({
        variant_id,
        media_id: media.media_id,
        is_display_image: parsedIsDisplayImage[originalname],
        is_thumbnail_image: parsedIsThumbnailImage[originalname],
      })

      return { variant_id, ...media }
    }),
  )
  req.dbResult = mediaDBResponse
  next()
}

export const getProductMediaLogic = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { mediaId: media_id } = req.params
  const media = await knex('media as m')
    .join('product_media_links as pml', 'pml.media_id', 'm.media_id')
    .where('m.media_id', media_id)
    .select()
  req.dbResult = media
  next()
}

export const updateProductMediaLogic = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { params, body, file } = req
  const { mediaId: media_id } = params
  const { description, filetype } = body
  const { filename, path: filepath } = file || {}

  const [updatedMedia] = await knex('media')
    .where({ media_id })
    .update({ description, filename, filepath, filetype })
    .returning('*')

  const { variant_id } = await knex('product_media_links')
    .where({ media_id })
    .select('variant_id')
    .first()

  req.dbResult = { variant_id, ...updatedMedia }
  next()
}

export const deleteProductMediaLogic = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { mediaId: media_id } = req.params
  await knex('product_media_links').where({ media_id }).del()
  await knex('media').where({ media_id }).del()
  next()
}
