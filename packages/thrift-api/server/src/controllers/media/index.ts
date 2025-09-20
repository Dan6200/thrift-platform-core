//cspell:ignore originalname
import { StatusCodes } from 'http-status-codes'
import BadRequestError from '../../errors/bad-request.js'
import { knex } from '../../db/index.js'

const uploadProductMedia = async (req: any, res: any) => {
  const { product_id } = req.query
  const uploader_id = req.user.id

  if (!product_id) {
    throw new BadRequestError('product_id is required');
  }

  if (!uploader_id) {
    throw new BadRequestError('User not found');
  }

  let { descriptions, is_display_image, is_thumbnail_image, filetype } = req.body

  if (descriptions) descriptions = JSON.parse(descriptions)
  if (is_display_image) is_display_image = JSON.parse(is_display_image)
  if (is_thumbnail_image) is_thumbnail_image = JSON.parse(is_thumbnail_image)
  if (filetype) filetype = JSON.parse(filetype)
  else throw new BadRequestError('No descriptions provided')

  const variant = await knex('product_variants').select('variant_id').where({ product_id }).first();
  if (!variant) {
    throw new BadRequestError(`No variants found for product_id ${product_id}`);
  }
  const { variant_id } = variant;

  let files = <any>await Promise.all(
    req.files.map(async (file: any) => {
      const { filename, originalname, path: filepath } = file
      
      const [media] = await knex('media')
        .insert({
          uploader_id,
          filename,
          filepath,
          description: descriptions[originalname],
          filetype: filetype[originalname],
        })
        .returning('*')

      await knex('product_media_links').insert({
        variant_id,
        media_id: media.media_id,
        is_display_image: is_display_image[originalname],
        is_thumbnail_image: is_thumbnail_image[originalname],
      })

      return media;
    }),
  )
  res.status(StatusCodes.CREATED).send(files)
}

export { uploadProductMedia }
