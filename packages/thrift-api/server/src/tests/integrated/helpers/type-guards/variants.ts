import {
  VariantIdResponseSchema,
  VariantIdSchema,
  VariantRequestSchema,
  VariantResponseSchema,
  VariantUpdateRequestSchema,
} from '#src/app-schema/products/variants.js'
import {
  VariantId,
  VariantIdResponse,
  VariantRequestData,
  VariantResponseData,
  VariantUpdateRequestData,
} from '#src/types/products/variants.js'

export function isValidVariantId(data: unknown): data is VariantId {
  const { error } = VariantIdSchema.validate(data)
  if (error) {
    console.error(error)
    return false
  }
  return true
}

export function isValidVariantRequestData(
  data: unknown,
): data is VariantRequestData {
  const { error } = VariantRequestSchema.validate(data)
  if (error) {
    console.error(error)
    return false
  }
  return true
}

export function isValidVariantUpdateRequestData(
  data: unknown,
): data is VariantUpdateRequestData {
  const { error } = VariantUpdateRequestSchema.validate(data)
  if (error) {
    console.error(error)
    return false
  }
  return true
}

export function isValidVariantResponseData(
  data: unknown,
): data is VariantResponseData {
  const { error } = VariantResponseSchema.validate(data)
  if (error) {
    console.error(error)
    return false
  }
  return true
}

export function isValidVariantIdResponseData(
  data: unknown,
): data is VariantIdResponse {
  const { error } = VariantIdResponseSchema.validate(data)
  if (error) {
    console.error(error)
    return false
  }
  return true
}
