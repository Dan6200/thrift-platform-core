import chai from 'chai'
import {
  RequestVariant,
  UpdateRequestVariant,
} from '#src/types/products/index.js'

export async function createVariantForTesting(
  token: string,
  productId: number,
  storeId: number,
  variantData: RequestVariant,
) {
  return chai
    .request(process.env.SERVER!)
    .post(`/v1/products/${productId}/variants`)
    .auth(token, { type: 'bearer' })
    .query({ storeId })
    .send(variantData)
}

export async function updateVariantForTesting(
  token: string,
  productId: number,
  variantId: number,
  storeId: number,
  variantData: UpdateRequestVariant,
) {
  return chai
    .request(process.env.SERVER!)
    .patch(`/v1/products/${productId}/variants/${variantId}`)
    .auth(token, { type: 'bearer' })
    .query({ storeId })
    .send(variantData)
}

export async function deleteVariantForTesting(
  token: string,
  productId: number,
  variantId: number,
  storeId: number,
) {
  return chai
    .request(process.env.SERVER!)
    .delete(`/v1/products/${productId}/variants/${variantId}`)
    .auth(token, { type: 'bearer' })
    .query({ storeId })
}
