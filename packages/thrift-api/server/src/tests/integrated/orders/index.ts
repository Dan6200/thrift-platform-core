import chai from 'chai'
import chaiHttp from 'chai-http'
import assert from 'assert'
import { ProfileRequestData } from '#src/types/profile/index.js'
import { OrderCreateRequestData } from '#src/types/orders.js'
import {
  testCreateOrder,
  testGetAllOrders,
  testGetOrder,
  testUpdateOrder,
  testDeleteOrder,
  testGetNonExistentOrder,
} from './definitions/index.js'
import { createUserForTesting } from '#src/tests/integrated/helpers/create-user.js'
import { deleteUserForTesting } from '#src/tests/integrated/helpers/delete-user.js'
import { signInForTesting } from '#src/tests/integrated/helpers/signin-user.js'
import { createStoreForTesting } from '#src/tests/integrated/helpers/create-store.js'
import { createProductsForTesting } from '#src/tests/integrated/helpers/create-product.js'
import { getProductsForTesting } from '#src/tests/integrated/helpers/get-product.js'
import { userInfo as aliyuInfo } from '#src/tests/integrated/data/users/vendors/user-aliyu/index.js'

chai.use(chaiHttp).should()

export default function (customer: { userInfo: ProfileRequestData }) {
  const server = process.env.SERVER!
  let customerToken: string
  let customerId: string
  let vendorToken: string
  let vendorId: string
  let storeId: number
  let productId: number
  let variantId: number
  let orderId: number

  before(async () => {
    // Create and sign in customer
    customerId = await createUserForTesting(customer.userInfo)
    customerToken = await signInForTesting(customer.userInfo)

    // Create and sign in vendor
    vendorId = await createUserForTesting(aliyuInfo)
    vendorToken = await signInForTesting(aliyuInfo)

    // Create a store for the vendor
    const storeRes = await createStoreForTesting(vendorToken)
    storeId = storeRes.body[0].store_id

    // Create a product in that store
    const productRes = await createProductsForTesting(vendorToken, storeId)
    productId = productRes.body[0].product_id

    // Get the product details to extract variant_id
    const fullProductRes = await getProductsForTesting(
      vendorToken,
      productId,
      storeId,
    )
    variantId = fullProductRes.body[0].variants[0].variant_id // Assuming at least one variant
  })

  after(async () => {
    await deleteUserForTesting(customerId)
    await deleteUserForTesting(vendorId)
  })

  const ordersPath = '/v1/orders'

  it('should allow a customer to create an order', async () => {
    const orderData: OrderCreateRequestData = {
      store_id: storeId,
      items: [
        {
          variant_id: variantId,
          quantity: 1,
        },
      ],
    }
    const [{ order_id }] = await testCreateOrder({
      server,
      path: ordersPath,
      token: customerToken,
      requestBody: orderData,
    })
    orderId = order_id
  })

  it('should allow a customer to get all their orders', async () => {
    await testGetAllOrders({
      server,
      path: ordersPath,
      token: customerToken,
      query: { store_id: storeId },
    })
  })

  it('should allow a customer to get a specific order', async () => {
    await testGetOrder({
      server,
      path: `${ordersPath}/${orderId}`,
      token: customerToken,
    })
  })

  it('should allow a customer to update an order', async () => {
    const updatedOrderData: OrderCreateRequestData = {
      store_id: storeId,
      items: [
        {
          variant_id: variantId,
          quantity: 2,
        },
      ],
    }
    await testUpdateOrder({
      server,
      path: `${ordersPath}/${orderId}`,
      token: customerToken,
      requestBody: updatedOrderData,
    })
  })

  it('should allow a customer to delete an order', async () => {
    await testDeleteOrder({
      server,
      path: `${ordersPath}/${orderId}`,
      token: customerToken,
    })
  })

  it('should fail to get a deleted order', async () => {
    await testGetNonExistentOrder({
      server,
      path: `${ordersPath}/${orderId}`,
      token: customerToken,
    })
  })
}
