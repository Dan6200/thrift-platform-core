import chai from 'chai'
import chaiHttp from 'chai-http'
import assert from 'assert'
import { ProfileRequestData } from '#src/types/profile/index.js'
import { ProductReviewRequestData } from '#src/types/reviews.js'
import {
  testCreateProductReview,
  testGetProductReview,
  testUpdateProductReview,
  testDeleteProductReview,
  testGetNonExistentProductReview,
} from './definitions/index.js'
import { createUserForTesting } from '../../helpers/create-user.js'
import { deleteUserForTesting } from '../../helpers/delete-user.js'
import { signInForTesting } from '../../helpers/signin-user.js'
import { createStoreForTesting } from '../../helpers/create-store.js'
import { createProductsForTesting } from '../../helpers/create-product.js'
import { getProductsForTesting } from '../../helpers/get-product.js'
import { userInfo as aliyuInfo } from '../../data/users/vendors/user-aliyu/index.js'

chai.use(chaiHttp).should()

export default function (customer: { userInfo: ProfileRequestData }) {
  const server = process.env.SERVER!
  let customerToken: string
  let customerId: string
  let vendorToken: string
  let vendorId: string
  let storeId: string
  let productId: number
  let variantId: number
  let orderId: number
  let orderItemId: number

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

    // Create an order for the customer with the product variant
    const orderRes = await chai
      .request(server)
      .post('/v1/orders')
      .auth(customerToken, { type: 'bearer' })
      .send({
        store_id: storeId,
        total_amount: 100.00, // Dummy total amount
        order_items: [{
          variant_id: variantId,
          quantity: 1,
          price_at_purchase: 100.00,
        }],
      })
    orderRes.should.have.status(201)
    orderId = orderRes.body[0].order_id
    orderItemId = orderRes.body[0].order_items[0].order_item_id
  })

  after(async () => {
    await deleteUserForTesting(customerId)
    await deleteUserForTesting(vendorId)
  })

  const productReviewPath = '/v1/reviews/products'

  it('should allow a customer to create a product review', async () => {
    const reviewData: ProductReviewRequestData = {
      order_item_id: orderItemId,
      rating: 4.5,
      customer_remark: 'Great product, very satisfied!',
    }
    await testCreateProductReview({
      server,
      path: productReviewPath,
      token: customerToken,
      requestBody: reviewData,
    })
  })

  it('should allow a customer to get their product review', async () => {
    await testGetProductReview({
      server,
      path: `${productReviewPath}/${orderItemId}`,
      token: customerToken,
    })
  })

  it('should allow a customer to update their product review', async () => {
    const updatedReviewData: ProductReviewRequestData = {
      order_item_id: orderItemId,
      rating: 5.0,
      customer_remark: 'Absolutely love it! Highly recommend.',
    }
    await testUpdateProductReview({
      server,
      path: `${productReviewPath}/${orderItemId}`,
      token: customerToken,
      requestBody: updatedReviewData,
    })
  })

  it('should allow a customer to delete their product review', async () => {
    await testDeleteProductReview({
      server,
      path: `${productReviewPath}/${orderItemId}`,
      token: customerToken,
    })
  })

  it('should fail to get a deleted product review', async () => {
    await testGetNonExistentProductReview({
      server,
      path: `${productReviewPath}/${orderItemId}`,
      token: customerToken,
    })
  })
}
