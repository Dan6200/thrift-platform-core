//cspell:ignore cloudinary
import { ProfileRequestData } from '#src/types/profile/index.js'
import { ProductMediaUpload } from '#src/types/products/index.js'
import { testCreateProductMedia, testGetProductMedia, testUpdateProductMedia, testDeleteProductMedia } from './definitions.js'
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
  let media_id: string

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

  it("it should upload a single product's media", async () => {
    for (const media of productMedia) {
      const response = await testCreateProductMedia(
        server,
        productMediaRoute,
        media[0],
        userInfo,
        {
          product_id,
        },
      )
      media_id = response[0].media_id
    }
  })

  it("it should get the product's media", async () => {
    await testGetProductMedia(server, `${productMediaRoute}/${media_id}`, token)
  })

  it("it should update the product's media", async () => {
    for (const media of productMedia) {
      await testUpdateProductMedia(
        server,
        `${productMediaRoute}/${media_id}`,
        media[0],
        token,
      )
    }
  })

  it("it should delete the product's media", async () => {
    await testDeleteProductMedia(server, `${productMediaRoute}/${media_id}`, token)
  })

  it("it should bulk upload the product's media", async () => {
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