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
import { getProductsForTesting } from '../../helpers/get-product.js'
import { userInfo as vendorInfo } from '../../data/users/vendors/user-aliyu/index.js'

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
    productId = productRes.body.product_id

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
        total_amount: 100.0, // Dummy total amount
        order_items: [
          {
            variant_id: variantId,
            quantity: 1,
            price_at_purchase: 100.0,
          },
        ],
      })
    orderRes.should.have.status(201)
    orderId = orderRes.body[0].order_id
    orderItemId = orderRes.body[0].order_items[0].order_item_id

    // Create and sign in a non-purchasing customer
    nonPurchasingCustomerId = await createUserForTesting(customer.userInfo)
    nonPurchasingCustomerToken = await signInForTesting(customer.userInfo)
  })

  after(async () => {
    await deleteUserForTesting(customerId)
    await deleteUserForTesting(vendorId)
    await deleteUserForTesting(nonPurchasingCustomerId)
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

  it('should prevent a non-purchasing customer from creating a product review', async () => {
    const reviewData: ProductReviewRequestData = {
      order_item_id: orderItemId,
      rating: 1.0,
      customer_remark: 'I did not buy this product.',
    }
    await testCreateProductReviewUnauthorized({
      server,
      path: productReviewPath,
      token: nonPurchasingCustomerToken,
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

  it('should allow a non-purchasing customer to view a product review', async () => {
    await testGetProductReview({
      server,
      path: `${productReviewPath}/${orderItemId}`,
      token: nonPurchasingCustomerToken,
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

  it('should prevent a non-purchasing customer from updating a product review', async () => {
    const updatedReviewData: ProductReviewRequestData = {
      order_item_id: orderItemId,
      rating: 1.0,
      customer_remark: 'Attempted to update review as non-purchasing customer.',
    }
    await testUpdateProductReviewUnauthorized({
      server,
      path: `${productReviewPath}/${orderItemId}`,
      token: nonPurchasingCustomerToken,
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

  it('should prevent a non-purchasing customer from deleting a product review', async () => {
    await testDeleteProductReviewUnauthorized({
      server,
      path: `${productReviewPath}/${orderItemId}`,
      token: nonPurchasingCustomerToken,
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
