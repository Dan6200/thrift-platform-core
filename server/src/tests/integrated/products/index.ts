import chai from 'chai'
import chaiHttp from 'chai-http'
import { ProductRequestData } from '../../../types/products/index.js'
import {
  testPostProduct,
  testGetAllProducts,
  testGetProduct,
  testUpdateProduct,
  testDeleteProduct,
  testGetNonExistentProduct,
  testPostVariant,
  testUpdateVariant,
  testDeleteVariant,
} from './definitions/index.js'
import {
  variantsToCreate,
  variantUpdates,
} from '../data/users/vendors/user-aliyu/products/index.js'
import { ProfileRequestData } from '../../../types/profile/index.js'
import assert from 'assert'
import { createUserForTesting } from '../helpers/create-user.js'
import { deleteUserForTesting } from '../helpers/delete-user.js'
import { signInForTesting } from '../helpers/signin-user.js'
import { createStoreForTesting } from '../helpers/create-store.js'

// globals
chai.use(chaiHttp).should()
// Set server url
const server = process.env.SERVER!

export default function ({
  userInfo,
  products,
  productReplaced,
}: {
  userInfo?: ProfileRequestData
  products?: ProductRequestData[]
  productReplaced?: ProductRequestData[]
}) {
  let token: string
  let store_id: string
  let userId: string
  const productIds: number[] = []
  const variantIds: number[] = []

  before(async () => {
    userId = await createUserForTesting(userInfo)
    token = await signInForTesting(userInfo)
    const response = await createStoreForTesting(token)
    ;({ store_id } = response.body)
  })

  const getProductsRoute = () => `/v1/products/`

  it('it should Add a couple products to each store', async () => {
    const productsRoute = getProductsRoute()

    for (const product of products) {
      const { product_id } = await testPostProduct({
        server,
        path: `${productsRoute}`,
        requestBody: product,
        query: { store_id },
        token,
      })
      productIds.push(product_id)
    }
  })

  it('it should create new variants for the first product', async () => {
    const productsRoute = getProductsRoute()
    const productId = productIds[0]
    for (const variant of variantsToCreate) {
      const { variant_id } = await testPostVariant({
        server,
        path: `${productsRoute}${productId}/variants`,
        query: { store_id },
        requestBody: variant,
        token,
      })
      variantIds.push(variant_id)
    }
  })

  it('it should update the newly created variants', async () => {
    const productsRoute = getProductsRoute()
    const productId = productIds[0]
    for (const [i, variantId] of variantIds.entries()) {
      await testUpdateVariant({
        server,
        path: `${productsRoute}${productId}/variants/${variantId}`,
        query: { store_id },
        requestBody: variantUpdates[i],
        token,
      })
    }
  })

  it('it should retrieve all the products and their variants', async () => {
    const productsRoute = getProductsRoute()
    await testGetAllProducts({
      server,
      path: productsRoute,
      token,
      query: { store_id },
    })
  })

  it('it should retrieve a specific product and its variants', async () => {
    assert(!!productIds.length)
    const productsRoute = getProductsRoute()
    for (const productId of productIds) {
      await testGetProduct({
        token,
        server,
        path: `${productsRoute}/${productId}`,
        query: { store_id },
      })
    }
  })

  it('it should update all the products a vendor has for sale', async () => {
    const productsRoute = getProductsRoute()
    assert(!!productIds.length && productIds?.length === productReplaced.length)
    for (const [idx, productId] of productIds.entries())
      await testUpdateProduct({
        server,
        path: `${productsRoute}/${productId}`,
        token,
        requestBody: productReplaced[idx],
        query: { store_id },
      })
  })

  it('it should delete the newly created variants', async () => {
    const productsRoute = getProductsRoute()
    const productId = productIds[0]
    for (const variantId of variantIds) {
      await testDeleteVariant({
        server,
        query: { store_id },
        path: `${productsRoute}${productId}/variants/${variantId}`,
        token,
      })
    }
  })

  it('it should delete all the product a vendor has for sale', async () => {
    assert(!!productIds.length)
    const productsRoute = getProductsRoute()
    for (const productId of productIds)
      await testDeleteProduct({
        token,
        server,
        path: `${productsRoute}/${productId}`,
        query: { store_id },
      })
  })

  it('it should fail to retrieve any of the deleted products', async () => {
    assert(!!productIds.length)
    const productsRoute = getProductsRoute()
    for (const productId of productIds)
      await testGetNonExistentProduct({
        query: { store_id },
        token,
        server,
        path: `${productsRoute}/${productId}`,
      })
  })

  after(async () => deleteUserForTesting(userId))
}

