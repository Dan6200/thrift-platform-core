import chai from 'chai'
import { products } from '../data/users/vendors/user-aliyu/products/index.js'

export async function* createProductsForTesting(
  token: string,
  storeId: number,
  count = 0,
) {
  for (const [i, product] of products.entries()) {
    if (i >= count) return
    yield chai
      .request(process.env.SERVER!)
      .post('/v1/products')
      .auth(token, { type: 'bearer' })
      .query({ storeId })
      .send(product)
  }
}
