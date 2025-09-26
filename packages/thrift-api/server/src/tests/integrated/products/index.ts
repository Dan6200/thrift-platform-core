import chai from 'chai'
import chaiHttp from 'chai-http'
import {
  ProductRequestData,
  ProductResponseData,
  UpdateProductRequestData,
} from '../../../types/products/index.js'
import {
  testCreateProduct,
  testGetAllProducts,
  testGetProduct,
  testUpdateProduct,
  testDeleteProduct,
  testGetNonExistentProduct,
} from './definitions/index.js'
import { ProfileRequestData } from '../../../types/profile/index.js'
import assert from 'assert'
import { createUserForTesting } from '../helpers/create-user.js'
import { deleteUserForTesting } from '../helpers/delete-user.js'
import { signInForTesting } from '../helpers/signin-user.js'
import { createStoreForTesting } from '../helpers/create-store.js'

// globals
chai.use(chaiHttp).should()

export default function ({
  userInfo,
  products,
  productPartialUpdate,
}: {
  userInfo?: ProfileRequestData
  products?: ProductRequestData[]
  productPartialUpdate?: UpdateProductRequestData[]
}) {
  let token: string
  let storeId: number
  let userId: string
  const productIds: number[] = []

  before(async () => {
    userId = await createUserForTesting(userInfo)
    token = await signInForTesting(userInfo)
    const response = await createStoreForTesting(token)
    ;({ store_id: storeId } = response.body)
  })

  it('it should Add a couple products to each store', async () => {
    for (const product of products) {
      const { product_id } = await testCreateProduct({
        body: product,
        query: { storeId },
        token,
        expectedData: product,
      })
      productIds.push(product_id)
    }
  })

  it('it should retrieve all the products and their variants', async () => {
    await testGetAllProducts({
      token,
      query: { storeId },
    })
  })

  it('it should retrieve a specific product and its variants', async () => {
    assert(!!productIds.length)
    for (const [i, productId] of productIds.entries()) {
      await testGetProduct({
        token,
        params: { productId },
        query: { storeId },
        expectedData: products[i] as unknown as ProductResponseData, // intentional typecast
      })
    }
  })

  it('it should update all the products a vendor has for sale', async () => {
    assert(
      !!productIds.length && productIds?.length === productPartialUpdate.length,
    )
    for (const [idx, productId] of productIds.entries()) {
      const { variants, ...expectedData } = {
        ...products[idx],
        ...productPartialUpdate[idx],
      }
      await testUpdateProduct({
        token,
        params: { productId },
        body: productPartialUpdate[idx],
        query: { storeId },
        expectedData,
      })
    }
  })

  it('it should delete all the product a vendor has for sale', async () => {
    assert(!!productIds.length)
    for (const productId of productIds)
      await testDeleteProduct({
        token,
        params: { productId },
        query: { storeId },
      })
  })

  it('it should fail to retrieve any of the deleted products', async () => {
    assert(!!productIds.length)
    for (const productId of productIds)
      await testGetNonExistentProduct({
        query: { storeId },
        token,
        params: { productId },
      })
  })

  after(async () => deleteUserForTesting(userId))
}
