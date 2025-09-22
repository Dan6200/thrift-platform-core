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