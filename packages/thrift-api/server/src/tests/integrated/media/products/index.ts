//cspell:ignore cloudinary
import { ProfileRequestData } from '#src/types/profile/index.js'
import { ProductMediaUpload } from '#src/types/products/index.js'
import { testCreateProductMedia } from './definitions.js'
import { bulkDeleteImages } from '../../utils/bulk-delete.js'
import { deleteUserForTesting } from '../../helpers/delete-user.js'
import { createUserForTesting } from '../../helpers/create-user.js'
import { signInForTesting } from '../../helpers/signin-user.js'
import { createStoreForTesting } from '../../helpers/create-store.js'
import { createProductsForTesting } from '../../helpers/create-product.js'

// globals
const productMediaRoute = '/v1/media/products'
const server: string = process.env.SERVER!

export default function ({
  userInfo,
  productMedia,
}: {
  userInfo: ProfileRequestData
  productMedia: ProductMediaUpload[][]
}) {
  let token: string
  let product_id: string
  let userId: string

  before(async () => {
    userId = await createUserForTesting(userInfo)
    token = await signInForTesting(userInfo)

    const {
      body: [{ store_id }],
    } = await createStoreForTesting(token)
    const productCreationResponse = await createProductsForTesting(
      token,
      store_id,
    )
    product_id = productCreationResponse.body[0].product_id
    await bulkDeleteImages('products')
  })

  it("it should add the product's media to an existing product", async () => {
    for (const media of productMedia) {
      await testCreateProductMedia(server, productMediaRoute, media, userInfo, {
        product_id,
      })
    }
  })

  after(async () => {
    await deleteUserForTesting(userId)
    await bulkDeleteImages('products')
  })
}
