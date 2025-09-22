import { knex } from '#src/db/index.js'
import { QueryParamsMedia } from '#src/types/process-routes.js'
import BadRequestError from '#src/errors/bad-request.js'

/* Handles bulk and singular uploads */
export const createProductMediaQuery = async ({
  userId,
  query,
  body,
  files,
}: QueryParamsMedia) => {
  const { product_id } = query
  const uploader_id = userId

  if (!product_id) {
    throw new BadRequestError('product_id is required')
  }

  if (!uploader_id) {
    throw new BadRequestError('User not found')
  }

  let { descriptions, is_display_image, is_thumbnail_image, filetypes } = body

  // filetype is sent from the client because multer does not reliably provide the correct mimetype for array uploads.
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

  let mediaDBResponse = <any>await Promise.all(
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

      return media
    }),
  )
  return mediaDBResponse
}

export const getProductMediaQuery = async ({ params }: QueryParamsMedia) => {
  const { mediaId: media_id } = params
  const media = await knex('media').where({ media_id }).select()
  return media
}

export const updateProductMediaQuery = async ({
  params,
  body,
  file,
}: QueryParamsMedia) => {
  const { mediaId: media_id } = params
  const { description, filetype } = body
  const { filename, path: filepath } = file || {}

  const updatedMedia = await knex('media')
    .where({ media_id })
    .update({ description, filename, filepath, filetype })
    .returning('*')

  return updatedMedia
}

export const deleteProductMediaQuery = async ({ params }: QueryParamsMedia) => {
  const { mediaId: media_id } = params
  await knex('product_media_links').where({ media_id }).del()
  await knex('media').where({ media_id }).del()
}

export const createAvatarQuery = async ({
  userId,
  body,
  file,
}: QueryParamsMedia) => {
  let uploader_id = userId

  if (!uploader_id) {
    throw new BadRequestError('User not found')
  }

  if (!file) {
    throw new BadRequestError('No file uploaded')
  }

  const { filename, path: filepath, mimetype: filetype } = file

  const [media] = await knex('media')
    .insert({
      uploader_id,
      filename,
      filepath,
      filetype,
      description: body.description,
    })
    .returning('*')

  await knex('profile_media')
    .insert({
      profile_id: uploader_id,
      media_id: media.media_id,
    })
    .onConflict('profile_id')
    .merge()

  let mediaResponse
  ;({ uploader_id, ...mediaResponse } = media)
  return { ...mediaResponse, profile_id: uploader_id }
}

export const getAvatarQuery = async ({ userId }: QueryParamsMedia) => {
  const profile_id = userId
  const media = await knex('profile_media')
    .join('media', 'profile_media.media_id', 'media.media_id')
    .where({ profile_id })
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
  return media
}

export const updateAvatarQuery = async ({
  userId,
  body,
  file,
}: QueryParamsMedia) => {
  const profile_id = userId
  const { description } = body
  const { filename, path: filepath, mimetype: filetype } = file || {}

  const { media_id } = await knex('profile_media').where({ profile_id }).first()

  let [updatedMedia] = await knex('media')
    .where({ media_id })
    .update({ description, filename, filepath, filetype })
    .returning('*')

  const { uploader_id, ...updatedMediaResponse } = updatedMedia
  return { ...updatedMediaResponse, profile_id: uploader_id }
}

export const deleteAvatarQuery = async ({ userId }: QueryParamsMedia) => {
  const profile_id = userId
  const { media_id } = await knex('profile_media').where({ profile_id }).first()
  await knex('profile_media').where({ profile_id }).del()
  await knex('media').where({ media_id }).del()
}
