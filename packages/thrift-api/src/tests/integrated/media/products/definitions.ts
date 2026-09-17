import chai from 'chai'
import { ProductMediaUpload } from '#src/types/products/index.js'
import { readFile } from 'node:fs/promises'
import { ProfileRequestData } from '#src/types/profile/index.js'
import { signInForTesting } from '../../helpers/signin-user.js'
import { ProductMediaResponseSchema } from '#src/app-schema/media/products.js'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'

const { CREATED, OK, NO_CONTENT } = StatusCodes

export const testCreateProductMedia = async function (
  server: string,
  urlPath: string,
  media: ProductMediaUpload | ProductMediaUpload[],
  userInfo: ProfileRequestData,
  queryParams: { [k: string]: any },
): Promise<any> {
  const token = await signInForTesting(userInfo)
  const fieldName = 'product-media'
  const request = chai
    .request(server)
    .post(urlPath)
    .auth(token, { type: 'bearer' })
    .query({ store_id: queryParams.store_id }) // Added: store_id in query

  const mediaArray = Array.isArray(media) ? media : [media]
  await Promise.all(
    mediaArray.map(async (file) => {
      const data = await readFile(file.path)
      request.attach(fieldName, data, file.name)
    }),
  )

  const fileType = mediaArray.reduce((acc: { [k: string]: any }, file) => {
    acc[file.name] = file.filetype
    return acc
  }, {})

  const descriptions = mediaArray.reduce((acc: { [k: string]: any }, file) => {
    acc[file.name] = file.description
    return acc
  }, {})

  const isDisplayImage = mediaArray.reduce(
    (acc: { [k: string]: any }, file) => {
      acc[file.name] = file.is_display_image
      return acc
    },
    {},
  )

  const isThumbnailImage = mediaArray.reduce(
    (acc: { [k: string]: any }, file) => {
      acc[file.name] = file.is_thumbnail_image
      return acc
    },
    {},
  )

  request.field('product_id', queryParams.product_id) // Added: product_id in body
  request.field('descriptions', JSON.stringify(descriptions))
  request.field('is_display_image', JSON.stringify(isDisplayImage))
  request.field('is_thumbnail_image', JSON.stringify(isThumbnailImage))
  request.field('filetypes', JSON.stringify(fileType))

  const response = await request
  response.should.have.status(CREATED)
  // Check the data in the body if accurate
  if (checkMedia(response.body)) return response.body
  throw new Error('Invalid Database Result')
}

export const testGetProductMedia = async function (
  server: string,
  urlPath: string,
  token: string,
): Promise<any> {
  const response = await chai
    .request(server)
    .get(urlPath)
    .auth(token, { type: 'bearer' })
  response.should.have.status(OK)
  return response.body
}

export const testUpdateProductMedia = async function (
  server: string,
  urlPath: string,
  media: ProductMediaUpload,
  token: string,
  storeId: number,
): Promise<any> {
  const fieldName = 'product-media'
  const data = await readFile(media.path)
  const response = await chai
    .request(server)
    .patch(urlPath)
    .auth(token, { type: 'bearer' })
    .query({ store_id: storeId })
    .attach(fieldName, data, media.name)
    .field('description', media.description)
    .field('filetype', media.filetype)
  response.should.have.status(OK)
  return response.body
}

export const testDeleteProductMedia = async function (
  server: string,
  urlPath: string,
  token: string,
  storeId: number,
): Promise<any> {
  const response = await chai
    .request(server)
    .delete(urlPath)
    .auth(token, { type: 'bearer' })
    .query({ store_id: storeId })
  response.should.have.status(NO_CONTENT)
  return response
}

async function checkMedia(body: any) {
  const { error } = Joi.array().items(ProductMediaResponseSchema).validate(body)
  error && console.error(error)
  return !error
}
