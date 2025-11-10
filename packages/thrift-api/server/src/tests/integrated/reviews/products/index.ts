import chai from 'chai'
import chaiHttp from 'chai-http'
import { ProfileRequestData } from '#src/types/profile/index.js'
import { ProductReviewRequestData } from '#src/types/reviews.js'
import {
  testCreateProductReview,
  testGetProductReview,
  testUpdateProductReview,
  testDeleteProductReview,
  testGetNonExistentProductReview,
  testDeleteProductReviewUnauthorized,
  testUpdateProductReviewUnauthorized,
  testCreateProductReviewUnauthorized,
} from './definitions/index.js'
import { createUserForTesting } from '../../helpers/create-user.js'
import { deleteUserForTesting } from '../../helpers/delete-user.js'
import { signInForTesting } from '../../helpers/signin-user.js'
import { createStoreForTesting } from '../../helpers/create-store.js'
import { createProductsForTesting } from '../../helpers/create-product.js'
import { userInfo as vendorInfo } from '../../data/users/vendors/user-aliyu/index.js'

chai.use(chaiHttp).should()

export default function (customer: { userInfo: ProfileRequestData }) {
  let customerToken: string
  let customerId: string
  let vendorToken: string
  let vendorId: string
  let storeId: number
  let orderItemId: number
  let nonPurchasingCustomerId: string
  let nonPurchasingCustomerToken: string

  before(async () => {
    // Create and sign in customer
    customerId = await createUserForTesting(customer.userInfo)
    customerToken = await signInForTesting(customer.userInfo)

    // Create and sign in vendor
    vendorId = await createUserForTesting(vendorInfo)
    vendorToken = await signInForTesting(vendorInfo)

    // Create a store for the vendor
    const storeRes = await createStoreForTesting(vendorToken)
    storeId = storeRes.body.store_id

    // Create a product in that store
    const productCreationPromises = []
    for await (const promise of createProductsForTesting(
      vendorToken,
      storeId,
      3,
    )) {
      productCreationPromises.push(promise)
    }
    const productResponses = await Promise.all(productCreationPromises)
    const productRes = productResponses[0]
    const variantId = productRes.body.variants[0].variant_id

    // Create an order for the customer with the product variant
    const orderRes = await chai
      .request(process.env.SERVER!)
      .post('/v1/orders')
      .auth(customerToken, { type: 'bearer' })
      .query({ store_id: storeId })
      .send({
        items: [{ variant_id: variantId, quantity: 1 }],
      })
    orderRes.should.have.status(201)
    orderItemId = orderRes.body.items[0].order_item_id

    // Create and sign in a non-purchasing customer
    const nonPurchasingUserInfo = {
      ...customer.userInfo,
      email: `nonpurchasing-${customer.userInfo.email}`,
      username: `nonpurchasing-${customer.userInfo.username}`,
      phone: `+1${Math.floor(Math.random() * 10000000000)}`, // Generate a random phone number
    }
    nonPurchasingCustomerId = await createUserForTesting(nonPurchasingUserInfo)
    nonPurchasingCustomerToken = await signInForTesting(nonPurchasingUserInfo)
  })

  after(async () => {
    await deleteUserForTesting(customerId)
    await deleteUserForTesting(vendorId)
    await deleteUserForTesting(nonPurchasingCustomerId)
  })

  it('should allow a customer to create a product review', async () => {
    const reviewData: ProductReviewRequestData = {
      order_item_id: orderItemId,
      rating: 4.5,
      customer_remark: 'Great product, very satisfied!',
    }
    await testCreateProductReview({
      token: customerToken,
      body: reviewData,
    })
  })

  it('should prevent a non-purchasing customer from creating a product review', async () => {
    const reviewData: ProductReviewRequestData = {
      order_item_id: orderItemId,
      rating: 1.0,
      customer_remark: 'I did not buy this product.',
    }
    await testCreateProductReviewUnauthorized({
      token: nonPurchasingCustomerToken,
      body: reviewData,
    })
  })

  it('should allow a customer to get their product review', async () => {
    await testGetProductReview({
      token: customerToken,
      params: { orderItemId },
    })
  })

  it('should allow a non-purchasing customer to view a product review', async () => {
    await testGetProductReview({
      token: nonPurchasingCustomerToken,
      params: { orderItemId },
    })
  })

  it('should allow a customer to update their product review', async () => {
    const updatedReviewData: ProductReviewRequestData = {
      order_item_id: orderItemId,
      rating: 5.0,
      customer_remark: 'Absolutely love it! Highly recommend.',
    }
    await testUpdateProductReview({
      token: customerToken,
      params: { orderItemId },
      body: updatedReviewData,
    })
  })

  it('should prevent a non-purchasing customer from updating a product review', async () => {
    const updatedReviewData: ProductReviewRequestData = {
      order_item_id: orderItemId,
      rating: 1.0,
      customer_remark: 'Attempted to update review as non-purchasing customer.',
    }
    await testUpdateProductReviewUnauthorized({
      token: nonPurchasingCustomerToken,
      params: { orderItemId },
      body: updatedReviewData,
    })
  })

  it('should allow a customer to delete their product review', async () => {
    await testDeleteProductReview({
      token: customerToken,
      params: { orderItemId },
    })
  })

  it('should prevent a non-purchasing customer from deleting a product review', async () => {
    await testDeleteProductReviewUnauthorized({
      token: nonPurchasingCustomerToken,
      params: { orderItemId },
    })
  })

  it('should fail to get a deleted product review', async () => {
    await testGetNonExistentProductReview({
      token: customerToken,
      params: { orderItemId },
    })
  })
}
