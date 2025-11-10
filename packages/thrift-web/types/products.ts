import { z } from 'zod'

// 1. ImgData Schema
export const ImgDataSchema = z.object({
  filename: z.string(),
  filepath: z.string(),
  filetype: z.string(),
  description: z.string(),
  uploader_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  is_display_image: z.boolean(),
  is_thumbnail_image: z.boolean(),
  variant_id: z.number(),
})

export type ImgData = z.infer<typeof ImgDataSchema>

// Corresponds to Joi's VariantOptionSchema
export const VariantOptionSchema = z.object({
  option_name: z.string(),
  value: z.string(),
})

export type VariantOption = z.infer<typeof VariantOptionSchema>

// Corresponds to Joi's ProductVariantResponseSchema
export const ProductVariantSchema = z.object({
  variant_id: z.number(),
  sku: z.string(),
  list_price: z.number().nullable(),
  net_price: z.number().nullable(),
  quantity_available: z.number(),
  options: z.array(VariantOptionSchema),
  created_at: z.string(),
  updated_at: z.string(),
})

export type ProductVariant = z.infer<typeof ProductVariantSchema>

// 2. Product Schema
export const ProductSchema = z.object({
  product_id: z.number().int(),
  title: z.string().min(1, 'Product title cannot be empty'),
  category_id: z.number().int(),
  category_name: z.string(),
  subcategory_id: z.number().int(),
  subcategory_name: z.string(),
  // Assuming description is an array of strings, as per your type definition
  description: z.array(z.string()),
  list_price: z.number().positive(),
  net_price: z.number().positive(),
  // Use z.string().datetime() for ISO 8601 strings if they represent dates/times
  created_at: z.string(),
  updated_at: z.string(),
  vendor_id: z.string(),
  // null or number
  average_rating: z.number().nullable(),
  review_count: z.number().int().nullable(),
  // An array of ImgData objects
  media: z
    .array(ImgDataSchema)
    .min(1, 'Product must have at least one media item'),
  variants: z.array(ProductVariantSchema).nullable(),
})

export type Product = z.infer<typeof ProductSchema>

// 3. ProductData Schema
export const ProductDataSchema = z.object({
  // An array of Product objects
  products: z.array(ProductSchema),
  total_count: z.number().int().min(0),
})

export type ProductData = z.infer<typeof ProductDataSchema>

// The custom validation functions are now replaced by:
// ProductDataSchema.parse(data)
// ProductSchema.safeParse(data)
// etc.
