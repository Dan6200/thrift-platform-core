import { ProductMediaUpload } from '#src/types/products/index.js'
import { readFile } from 'node:fs/promises'
import { ProfileRequestData } from '#src/types/profile/index.js'
import { signInForTesting } from '../../helpers/signin-user.js'
import { ProductMediaResponseSchema } from '#src/app-schema/media.js'

export const testCreateProductMedia = async function (
  server: string,
  urlPath: string,
  media: ProductMediaUpload[],
  userInfo: ProfileRequestData,
  queryParams: { [k: string]: any },
): Promise<any> {
  const token = await signInForTesting(userInfo)
  const fieldName = 'product-media'
  const request = chai
    .request(server)
    .post(urlPath)
    .auth(token, { type: 'bearer' })
    .query(queryParams)
  await Promise.all(
    media.map(async (file) => {
      const data = await readFile(file.path)
      request.attach(fieldName, data, file.name)
      console.log(`	${file.name} uploaded...`)
    }),
  )

  const descriptions = media.reduce((acc: { [k: string]: any }, file) => {
    acc[file.name] = file.description
    return acc
  }, {})

  const isDisplayImage = media.reduce((acc: { [k: string]: any }, file) => {
    acc[file.name] = file.is_display_image
    return acc
  }, {})

  const isThumbnailImage = media.reduce((acc: { [k: string]: any }, file) => {
    acc[file.name] = file.is_thumbnail_image
    return acc
  }, {})

  const filetype = media.reduce((acc: { [k: string]: any }, file) => {
    acc[file.name] = file.filetype
    return acc
  }, {})

  request.field('descriptions', JSON.stringify(descriptions))
  request.field('is_display_image', JSON.stringify(isDisplayImage))
  request.field('is_thumbnail_image', JSON.stringify(isThumbnailImage))
  request.field('filetype', JSON.stringify(filetype))

  const response = await request
  response.should.have.status(CREATED)
  // Check the data in the body if accurate
  if (checkMedia(response.body)) return response.body
  throw new Error('Invalid Database Result')
}

async function checkMedia(body: any) {
  const { error } = ProductMediaResponseSchema.validate(body)
  error && console.error(error)
  return !error
}
