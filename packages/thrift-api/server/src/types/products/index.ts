export type VariantOption = {
  option_id: number
  option_name: string
  value_id: number
  value: string
}

export type ProductVariant = {
  variant_id: number
  sku: string
  list_price: number
  net_price: number
  quantity_available: number
  options: VariantOption[]
}

export type ProductResponseData = {
  product_id: number
  vendor_id: string
  title: string
  category_id: number
  subcategory_id: number
  description: string[]
  list_price: number
  net_price: number
  variants?: ProductVariant[]
  media?: ProductMedia[]
  updated_at?: Date
}

export type RequestVariantOption = {
  option_name: string
  value: string
}

export type RequestVariant = {
  sku: string
  list_price?: number
  net_price?: number
  quantity_available: number
  options: RequestVariantOption[]
}

export type ProductRequestData = {
  title: string
  category_id: number
  subcategory_id: number
  description: string[]
  list_price: number
  net_price: number
  variants?: RequestVariant[]
}

export type ProductRequestPartial = Partial<ProductRequestData>

import { MediaType } from '../media.js'

export type ProductMediaUpload = {
  name: string
  path: string
  description: string
  is_display_image: boolean
  is_thumbnail_image: boolean
  filetype:
    | 'image/jpeg'
    | 'image/jpg'
    | 'image/png'
    | 'video/mp4'
    | 'video/webp'
    | 'image/webp'
    | 'video/mkv'
}

export type ProductMedia = MediaType & {
  is_display_image: boolean
  is_thumbnail_image: boolean
}

export interface ProductID {
  product_id: number
}