//cspell:ignore cloudinary
import { ProfileRequestData } from '#src/types/profile/index.js'
import {
  ProductRequestData,
  ProductMediaUpload,
} from '#src/types/products/index.js'
import { testCreateProductMedia } from '../products/definitions/index.js'
import { testCreateAvatar } from '../profiles/definitions/index.js' // Import testCreateAvatar from new location
import { bulkDeleteImages } from '../utils/bulk-delete.js'
import { deleteUserForTesting } from '../helpers/delete-user.js'
import { createUserForTesting } from '../helpers/create-user.js'
import { signInForTesting } from '../helpers/signin-user.js'
import { createStoreForTesting } from '../helpers/create-store.js'
import { createProductsForTesting } from '../helpers/create-product.js'
import { userInfo as aliyuInfo } from '../data/users/vendors/user-aliyu/index.js' // Import aliyuInfo for avatar test

// globals
const productMediaRoute = '/v1/media/products' // Renamed
const avatarMediaRoute = '/v1/media/avatar' // New route
const server: string = process.env.SERVER!

export default function ({
  userInfo,
  productMedia,
}: {
  userInfo: ProfileRequestData
  productMedia?: ProductMediaUpload[][]
}) {
  let token: string
  let product_id: string
  let userId: string

  before(async () => {
    // Delete all users from Supabase auth
    // Create user after...
    userId = await createUserForTesting(userInfo)
    token = await signInForTesting(userInfo)

    if (productMedia) {
      const {
        body: [{ store_id }],
      } = await createStoreForTesting(token) // Create store for Aliyu
      const productCreationResponse = await createProductsForTesting(
        token,
        store_id,
      )
      product_id = productCreationResponse.body[0].product_id
      // Bulk delete media from cloudinary
      await bulkDeleteImages('products')
    }
    await bulkDeleteImages('avatars')
  })

  // Create a product for the store
  it("it should add the product's media to an existing product", async () => {
    for (const media of productMedia) {
      await testCreateProductMedia(server, productMediaRoute, media, userInfo, {
        // Use productMediaRoute
        product_id,
      })
    }
  })

  it('it should upload an avatar for the user', async () => {
    const avatarMedia = {
      // Define a sample avatar media object
      filename: 'avatar.jpg',
      path: './server/src/tests/integrated/data/users/vendors/user-aliyu/profile/avatar.jpg', // Assuming an avatar image exists here
      description: 'User avatar',
      filetype: 'image/jpeg',
    }
    await testCreateAvatar(server, avatarMediaRoute, avatarMedia, token) // Use avatarMediaRoute and Aliyu's info
  })

  after(async () => {
    await deleteUserForTesting(userId)
    await bulkDeleteImages('products')
    await bulkDeleteImages('avatars')
  })
}
