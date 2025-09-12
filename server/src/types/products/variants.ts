import { VariantRequestSchema, VariantUpdateRequestSchema, VariantResponseSchema, VariantIdSchema, VariantIdResponseSchema } from '../../app-schema/products/variants.js';

export type VariantId = {
  variantId: number;
}

export type VariantRequestData = {
  sku: string;
  list_price?: number;
  net_price?: number;
  quantity_available: number;
  options: {
    option_name: string;
    value: string;
  }[];
};

export type VariantUpdateRequestData = Partial<Omit<VariantRequestData, 'options'>>;

export type VariantResponseData = {
    variant_id: number;
    product_id: number;
    sku: string;
    list_price?: number;
    net_price?: number;
    quantity_available: number;
    options: {
        option_id: number;
        option_name: string;
        value_id: number;
        value: string;
    }[];
    created_at: Date;
    updated_at: Date;
};

export type VariantIdResponse = {
  variant_id: number;
}

export function isValidVariantId(data: unknown): data is VariantId {
    const { error } = VariantIdSchema.validate(data);
    if (error) {
        console.error(error);
        return false;
    }
    return true;
}

export function isValidVariantRequestData(data: unknown): data is VariantRequestData {
    const { error } = VariantRequestSchema.validate(data);
    if (error) {
        console.error(error);
        return false;
    }
    return true;
}

export function isValidVariantUpdateRequestData(data: unknown): data is VariantUpdateRequestData {
    const { error } = VariantUpdateRequestSchema.validate(data);
    if (error) {
        console.error(error);
        return false;
    }
    return true;
}

export function isValidVariantResponseData(data: unknown): data is VariantResponseData {
    const { error } = VariantResponseSchema.validate(data);
    if (error) {
        console.error(error);
        return false;
    }
    return true;
}

export function isValidVariantIdResponseData(data: unknown): data is VariantIdResponse {
    const { error } = VariantIdResponseSchema.validate(data);
    if (error) {
        console.error(error);
        return false;
    }
    return true;
}