import chai, { util } from 'chai'
import { StatusCodes } from 'http-status-codes'
import testRequest from '../../test-request/index.js'
import { TestRequest, RequestParams } from '../../test-request/types.js'
import {
  validateProductCreateReq,
  validateProductUpdateReq,
  validateProductDeleteReq,
  validateProductGetReq,
  validateProductGetAllReq,
  validateProductGETAllRes,
  validateProductGETRes,
  validateProductRes,
  validateProductVariantCreateReq,
  validateProductVariantUpdateRequest,
  validateProductVariantDeleteReq,
  validateProductVariantRes,
} from '../../helpers/test-validators/products.js'
import {
  ProductRequestData,
  ProductResponseData,
  ProductVariant,
  RequestVariant,
  UpdateRequestVariant,
} from '#src/types/products/index.js'
import * as JDP from 'jsondiffpatch'
import * as consoleFormatter from 'jsondiffpatch/formatters/console'

const jdp = JDP.create()

const { CREATED, OK, NOT_FOUND, UNAUTHORIZED, NO_CONTENT } = StatusCodes

const productsPathBase = '/v1/products'
const buildProductPath = (productId: number) =>
  `${productsPathBase}/${productId}`
const buildVariantPath = (productId: number, variantId: number) =>
  `${productsPathBase}/${productId}/variants/${variantId}`

// Helper function to recursively sort options within a variant
const sortVariantOptions = (variant: any) => {
  if (variant.options) {
    const sortedOptions = [...variant.options].sort((a, b) =>
      a.option_name.localeCompare(b.option_name),
    )
    return { ...variant, options: sortedOptions }
  }
  return variant
}

const compareProductData = (actual: any, expected: ProductResponseData) => {
  const actualProduct = actual as ProductResponseData

  let sortedActual: any = { ...actualProduct }
  let sortedExpected: any = { ...expected }

  if (expected.variants) {
    const sortedActualVariants = [...(actualProduct.variants ?? [])]
      .map(sortVariantOptions)
      .sort((a, b) => a.sku.localeCompare(b.sku))

    const sortedExpectedVariants = [...expected.variants]
      .map(sortVariantOptions)
      .sort((a, b) => a.sku.localeCompare(b.sku))

    sortedActual.variants = sortedActualVariants
    sortedExpected.variants = sortedExpectedVariants
  }
  try {
    actualProduct.title.should.equal(expected.title)
    actualProduct.description.should.deep.equal(expected.description)
    actualProduct.list_price.should.equal(expected.list_price)
    actualProduct.net_price.should.equal(expected.net_price)
    actualProduct.category_id.should.equal(expected.category_id)
    actualProduct.subcategory_id.should.equal(expected.subcategory_id)

    // Assert that server-generated fields exist and are of the correct type
    actualProduct.should.have.property('product_id').that.is.a('number')
    actualProduct.should.have.property('vendor_id').that.is.a('string')
    actualProduct.should.have.property('store_id').that.is.a('number')
    actualProduct.should.have.property('created_at').that.is.a('string')
    actualProduct.should.have.property('updated_at').that.is.a('string')

    // Check that timestamps are recent (within the last 5 seconds)
    const now = new Date()
    const createdAt = new Date(actualProduct.created_at!)
    const updatedAt = new Date(actualProduct.updated_at!)
    const oneSecond = 1000 // 1000 milliseconds

    chai.expect(now.getTime() - createdAt.getTime()).to.be.lessThan(oneSecond)
    chai.expect(now.getTime() - updatedAt.getTime()).to.be.lessThan(oneSecond)

    // Compare variants and options
    actualProduct.variants &&
      actualProduct.should.have.property('variants').that.is.an('array')
    if (expected.variants) {
      sortedActual.variants.length.should.equal(sortedExpected.variants.length)

      for (let i = 0; i < sortedExpected.variants.length; i++) {
        const actualVariant = sortedActual.variants[i]
        const expectedVariant = sortedExpected.variants[i]

        // Assertions on variant level
        actualVariant.sku.should.equal(expectedVariant.sku)
        const expectedListPrice =
          expectedVariant.list_price ?? expected.list_price
        const expectedNetPrice = expectedVariant.net_price ?? expected.net_price
        actualVariant.list_price.should.equal(expectedListPrice)
        actualVariant.net_price.should.equal(expectedNetPrice)
        actualVariant.quantity_available.should.equal(
          expectedVariant.quantity_available,
        )

        // Assertions on options level
        if (expectedVariant.options) {
          actualVariant.options.length.should.equal(
            expectedVariant.options.length,
          )
          for (let j = 0; j < expectedVariant.options.length; j++) {
            const actualOption = actualVariant.options[j]
            const expectedOption = expectedVariant.options[j]
            actualOption.option_name.should.equal(expectedOption.option_name)
            actualOption.value.should.equal(expectedOption.value)
          }
        }
      }
    }
  } catch (assertionError) {
    const delta = jdp.diff(sortedExpected, sortedActual)
    if (delta) {
      console.log('Product data comparison failed. Delta:')
      consoleFormatter.log(delta)
    }
    throw assertionError
  }

  return true
}

const compareVariantData = (
  actual: any,
  expected: RequestVariant | UpdateRequestVariant,
) => {
  const actualVariant = actual as ProductVariant

  const sortedActualVariant = sortVariantOptions(actualVariant)

  const sortedExpected = sortVariantOptions(expected)

  try {
    actualVariant.sku.should.equal(expected.sku)
    expected.list_price &&
      actualVariant.list_price.should.equal(expected.list_price)
    expected.net_price &&
      actualVariant.net_price.should.equal(expected.net_price)
    actualVariant.quantity_available.should.equal(expected.quantity_available)

    // Assert that server-generated fields exist and are of the correct type
    actualVariant.should.have.property('variant_id').that.is.a('number')
    actualVariant.should.have.property('options').that.is.an('array')

    if (expected.options) {
      sortedActualVariant.options.length.should.equal(expected.options.length)
      for (let j = 0; j < expected.options.length; j++) {
        const actualOption = sortedActualVariant.options[j]
        const expectedOption = sortedExpected.options[j]
        actualOption.option_name.should.equal(expectedOption.option_name)
        actualOption.value.should.equal(expectedOption.value)
      }
    }

    // Check that timestamps are recent (within the last 5 seconds)
    const now = new Date()
    const createdAt = new Date(actualVariant.created_at!)
    const updatedAt = new Date(actualVariant.updated_at!)
    const oneSecond = 1000 // 1000 milliseconds

    chai.expect(now.getTime() - createdAt.getTime()).to.be.lessThan(oneSecond)
    chai.expect(now.getTime() - updatedAt.getTime()).to.be.lessThan(oneSecond)

    return true
  } catch (assertionError) {
    const delta = jdp.diff(sortedExpected, sortedActualVariant)
    if (delta) {
      console.log('Product Variant data comparison failed. Delta:')
      consoleFormatter.log(delta)
    }
    throw assertionError
  }
}

export const testCreateProduct = (args: {
  token: string
  body: any
  query: { storeId: number }
  expectedData: ProductRequestData
}) => {
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
    query: args.query,
  }
  return (testRequest as TestRequest)({
    verb: 'post',
    statusCode: CREATED,
    path: productsPathBase,
    validateTestReqData: validateProductCreateReq,
    validateTestResData: validateProductRes,
    compareData: (actual, expected) =>
      compareProductData(actual, expected as ProductResponseData),
    expectedData: args.expectedData,
  })(requestParams)
}

export const testGetAllProducts = (args: {
  token: string
  query: { storeId: number }
}) => {
  const requestParams: RequestParams = {
    token: args.token,
    query: args.query,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path: productsPathBase,
    validateTestReqData: validateProductGetAllReq,
    validateTestResData: validateProductGETAllRes,
  })(requestParams)
}

export const testGetProduct = (args: {
  token: string
  params: { productId: number }
  query: { storeId: number }
  expectedData: ProductResponseData
}) => {
  const path = buildProductPath(args.params.productId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
    query: args.query,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'get',
    path,
    validateTestReqData: validateProductGetReq,
    validateTestResData: validateProductGETRes,
    compareData: (actual, expected) =>
      compareProductData(actual, expected as ProductResponseData),
    expectedData: args.expectedData,
  })(requestParams)
}

export const testUpdateProduct = (args: {
  token: string
  params: { productId: number }
  query: { storeId: number }
  body: any
  expectedData: ProductRequestData
}) => {
  const path = buildProductPath(args.params.productId)
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
    params: args.params,
    query: args.query,
  }
  return (testRequest as TestRequest)({
    statusCode: OK,
    verb: 'patch',
    path,
    validateTestReqData: validateProductUpdateReq,
    validateTestResData: validateProductRes,
    compareData: (actual, expected) =>
      compareProductData(actual, expected as ProductResponseData),
    expectedData: args.expectedData,
  })(requestParams)
}

export const testDeleteProduct = (args: {
  token: string
  params: { productId: number }
  query: { storeId: number }
}) => {
  const path = buildProductPath(args.params.productId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
    query: args.query,
  }
  return (testRequest as TestRequest)({
    statusCode: NO_CONTENT,
    verb: 'delete',
    path,
    validateTestReqData: validateProductDeleteReq,
    validateTestResData: null,
  })(requestParams)
}

export const testGetNonExistentProduct = (args: {
  token: string
  params: { productId: number }
  query: { storeId: number }
}) => {
  const path = buildProductPath(args.params.productId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
    query: args.query,
  }
  return (testRequest as TestRequest)({
    verb: 'get',
    statusCode: NOT_FOUND,
    path,
    validateTestReqData: validateProductGetReq,
    validateTestResData: null,
  })(requestParams)
}

export const testPostVariant = (args: {
  token: string
  params: { productId: number }
  query: { storeId: number }
  body: any
  expectedData: RequestVariant
}) => {
  const path = buildProductPath(args.params.productId) + '/variants'
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
    params: args.params,
    query: args.query,
  }
  return (testRequest as TestRequest)({
    verb: 'post',
    statusCode: CREATED,
    path,
    validateTestReqData: validateProductVariantCreateReq,
    validateTestResData: validateProductVariantRes,
    compareData: (actual, expected) =>
      compareVariantData(actual, expected as RequestVariant),
    expectedData: args.expectedData,
  })(requestParams)
}

export const testUpdateVariant = (args: {
  token: string
  params: { productId: number; variantId: number }
  query: { storeId: number }
  body: any
  expectedData: UpdateRequestVariant
}) => {
  const path = buildVariantPath(args.params.productId, args.params.variantId)
  const requestParams: RequestParams = {
    token: args.token,
    body: args.body,
    params: args.params,
    query: args.query,
  }
  return (testRequest as TestRequest)({
    verb: 'patch',
    statusCode: OK,
    path,
    validateTestReqData: validateProductVariantUpdateRequest,
    validateTestResData: validateProductVariantRes,
    compareData: (actual, expected) =>
      compareVariantData(actual, expected as UpdateRequestVariant),
    expectedData: args.expectedData,
  })(requestParams)
}

export const testDeleteVariant = (args: {
  token: string
  params: { productId: number; variantId: number }
  query: { storeId: number }
}) => {
  const path = buildVariantPath(args.params.productId, args.params.variantId)
  const requestParams: RequestParams = {
    token: args.token,
    params: args.params,
    query: args.query,
  }
  return (testRequest as TestRequest)({
    verb: 'delete',
    statusCode: NO_CONTENT,
    path,
    validateTestReqData: validateProductVariantDeleteReq,
    validateTestResData: null,
  })(requestParams)
}
