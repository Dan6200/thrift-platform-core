import chai from 'chai'

export function getProductsForTesting(
  token: string,
  product_id: number,
  store_id?: number,
) {
  return chai
    .request(process.env.SERVER!)
    .get(`/v1/products/${product_id}`)
    .auth(token, { type: 'bearer' })
    .query({ store_id })
}
