import {
  ProductIdSchema,
  ProductGETAllResponseSchema,
  ProductCreateRequestSchema,
  ProductUpdateRequestSchema,
  ProductResponseSchema,
  ProductGETResponseSchema,
} from "#src/app-schema/products/index.js";
import {
  ProductRequestData,
  ProductResponseData,
  ProductID,
} from "#src/types/products/index.js";

export function isValidProductUpdateRequestData(
  productData: unknown,
): productData is ProductRequestData {
  const { error } = ProductUpdateRequestSchema.validate(productData);
  error && console.error(error);
  return !error;
}

export function isValidProductCreateRequestData(
  productData: unknown,
): productData is ProductRequestData {
  const { error } = ProductCreateRequestSchema.validate(productData);
  error && console.error(error);
  return !error;
}

export function isValidProductGETResponseData(
  data: unknown,
): data is ProductResponseData {
  const { error } = ProductGETResponseSchema.validate(data);
  error && console.error(error);
  return !error;
}

export function isValidProductResponseData(
  data: unknown,
): data is ProductResponseData {
  const { error } = ProductResponseSchema.validate(data);
  error && console.error(error);
  return !error;
}

export function isValidProductId(data: unknown): data is ProductID {
  const { error } = ProductIdSchema.validate(data);
  error && console.error(error);
  return !error;
}

export function isValidProductGETAllResponseData(
  data: unknown,
): data is ProductResponseData[] {
  const { error } = ProductGETAllResponseSchema.validate(data);
  error && console.error(error);
  return !error;
}
