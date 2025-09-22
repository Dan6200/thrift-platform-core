import { knex } from '#src/db/index.js'
import { QueryParamsMedia } from '#src/types/process-routes.js'
import BadRequestError from '#src/errors/bad-request.js'

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
