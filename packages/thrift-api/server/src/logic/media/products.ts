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
  const { userId, query, body, files } = req
  const { product_id } = query
  const uploader_id = userId

  if (!product_id) {
    throw new BadRequestError('product_id is required')
  }

  if (!uploader_id) {
    throw new BadRequestError('User not found')
  }

  let { descriptions, is_display_image, is_thumbnail_image, filetypes } = body

  if (descriptions) descriptions = JSON.parse(descriptions)
  else throw new BadRequestError('No descriptions provided')

  if (is_display_image) is_display_image = JSON.parse(is_display_image)
  if (is_thumbnail_image) is_thumbnail_image = JSON.parse(is_thumbnail_image)
  if (filetypes) filetypes = JSON.parse(filetypes)

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
          description: descriptions[originalname],
          filetype: filetypes[originalname],
        })
        .returning('*')

      await knex('product_media_links').insert({
        variant_id,
        media_id: media.media_id,
        is_display_image: is_display_image[originalname],
        is_thumbnail_image: is_thumbnail_image[originalname],
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
