import chai from 'chai'
import chaiHttp from 'chai-http'
import { StatusCodes } from 'http-status-codes'
import { readFile } from 'node:fs/promises'
import {
  isValidProductCreateRequestData,
  isValidProductUpdateRequestData,
  isValidProductResponseData,
  isValidProductGETAllResponseData,
  isValidProductGETResponseData,
  isValidProductId,
  ProductMediaUpload,
} from '../../../../types/products/index.js'
import {
  isValidVariantRequestData,
  isValidVariantIdResponseData,
  isValidVariantUpdateRequestData,
  isValidVariantResponseData,
} from '../../../../types/products/variants.js'
import {
  TestRequestWithQParams,
  TestRequestWithQParamsAndBody,
} from '../../test-request/types.js'
import testRoutes from '../../test-request/index.js'
import { ProfileRequestData } from '#src/types/profile/index.js'
import { signInForTesting } from '../../helpers/signin-user.js'
import { ProductMediaResponseSchema } from '#src/app-schema/media.js'

chai.use(chaiHttp).should()

const { CREATED, OK, NOT_FOUND, NO_CONTENT } = StatusCodes

export const testPostProduct = (<TestRequestWithQParamsAndBody>testRoutes)({
  statusCode: CREATED,
  verb: 'post',
  validateTestReqData: isValidProductCreateRequestData,
  validateTestResData: isValidProductId,
})

export const testGetAllProducts = (<TestRequestWithQParams>testRoutes)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: isValidProductGETAllResponseData,
})

export const testGetProduct = (<TestRequestWithQParams>testRoutes)({
  statusCode: OK,
  verb: 'get',
  validateTestResData: isValidProductGETResponseData,
})

export const testUpdateProduct = (<TestRequestWithQParamsAndBody>testRoutes)({
  statusCode: OK,
  verb: 'patch',
  validateTestReqData: isValidProductUpdateRequestData,
  validateTestResData: isValidProductResponseData,
})

export const testDeleteProduct = (<TestRequestWithQParams>testRoutes)({
  statusCode: NO_CONTENT,
  verb: 'delete',
  validateTestResData: null,
})

export const testGetNonExistentProduct = (<TestRequestWithQParams>testRoutes)({
  verb: 'get',
  statusCode: NOT_FOUND,
  validateTestResData: null,
})

export const testPostVariant = (<TestRequestWithQParamsAndBody>testRoutes)({
  statusCode: CREATED,
  verb: 'post',
  validateTestReqData: isValidVariantRequestData,
  validateTestResData: isValidVariantIdResponseData,
})

export const testUpdateVariant = (<TestRequestWithQParamsAndBody>testRoutes)({
  statusCode: OK,
  verb: 'patch',
  validateTestReqData: isValidVariantUpdateRequestData,
  validateTestResData: isValidVariantResponseData,
})

export const testDeleteVariant = (<TestRequestWithQParams>testRoutes)({
  statusCode: NO_CONTENT,
  verb: 'delete',
  validateTestResData: null,
})

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
