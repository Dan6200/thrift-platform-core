import {
  testGetCart,
  testAddItemToCart,
  testUpdateCartItem,
  testRemoveCartItem,
} from './definitions/index.js'
import { ProfileRequestData } from '#src/types/profile/index.js'
import { itemsToAdd } from '../data/users/customers/user-aisha/cart.js'
import { getProductsForTesting } from '../helpers/get-product.js'
import { createProductsForTesting } from '../helpers/create-product.js'
import { createStoreForTesting } from '../helpers/create-store.js'
import { userInfo as aliyuInfo } from '../data/users/vendors/user-aliyu/index.js'
import { deleteUserForTesting } from '../helpers/delete-user.js'
import { createUserForTesting } from '../helpers/create-user.js'
import { signInForTesting } from '../helpers/signin-user.js'

export default function (customer: { userInfo: ProfileRequestData }) {
  const server = process.env.SERVER!
  let token: string
  let userId: string
  let aliyuUserId: string
  let variantId: number
  let cartItemId: number

  before(async () => {
    // Create and sign in customer
    userId = await createUserForTesting(customer.userInfo)
    token = await signInForTesting(customer.userInfo)

    // Create and sign in vendor (Aliyu)
    aliyuUserId = await createUserForTesting(aliyuInfo)
    const aliyuToken = await signInForTesting(aliyuInfo)

    // Create a store for Aliyu
    const storeRes = await createStoreForTesting(aliyuToken)
    const storeId = storeRes.body[0].store_id

    // Create a product in that store
    const productRes = await createProductsForTesting(aliyuToken, storeId)
    const productId = productRes.body[0].product_id // Get the product_id

    // Get the product details to extract variant_id
    const fullProductRes = await getProductsForTesting(
      aliyuToken,
      productId,
      storeId,
    )
    variantId = fullProductRes.body[0].variants[0].variant_id // Assuming at least one variant
  })

  after(async () => {
    await deleteUserForTesting(userId)
    await deleteUserForTesting(aliyuUserId)
  })

  it('should get an empty cart for a new user', async () => {
    await testGetCart({
      server,
      path: '/v1/cart',
      token,
    })
  })

  it('should add an item to the cart', async () => {
    ;[{ item_id: cartItemId }] = await testAddItemToCart({
      server,
      path: '/v1/cart/items',
      token,
      requestBody: { variant_id: variantId, quantity: itemsToAdd[0].quantity },
    })
  })

  it('should update the quantity of a specific item in the cart', async () => {
    await testUpdateCartItem({
      server,
      path: `/v1/cart/items/${cartItemId}`,
      token,
      requestBody: { quantity: 5 },
    })
  })

  it('should remove an item from the cart', async () => {
    await testRemoveCartItem({
      server,
      path: `/v1/cart/items/${cartItemId}`,
      token,
    })
  })
}
