import util from 'util'
import {
  StoreDataRequestSchema,
  StoreDataResponseListSchema,
  StoreDataResponseSchema,
  StoreIDSchema,
} from '../app-schema/stores.js'

interface SeoData {
  meta_description: string
  canonical_url: string
  keywords: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  ogType?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterSite?: string
  twitterCreator?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  schemaMarkup?: {
    '@context': string
    '@type': string
    name: string
    description: string
    url: string
  }
}

interface StoreStyling {
  layout_template: 'default' | 'minimal' | 'grid'
  font_family: string
  primary_color?: string
  secondary_color?: string
  background_color?: string
  foreground_color?: string
  muted_color?: string
  muted_foreground_color?: string
  popover_color?: string
  popover_foreground_color?: string
  card_color?: string
  card_foreground_color?: string
  border_color?: string
  input_color?: string
  primary_foreground_color?: string
  secondary_foreground_color?: string
  tertiary_color?: string
  tertiary_foreground_color?: string
  accent_color?: string
  accent_foreground_color?: string
  destructive_color?: string
  destructive_foreground_color?: string
  ring_color?: string
  radius_color?: string
  hero_primary_color?: string
  hero_primary_foreground_color?: string
  hero_secondary_color?: string
  hero_secondary_foreground_color?: string
  sidebar_background_color?: string
  sidebar_foreground_color?: string
  sidebar_primary_color?: string
  sidebar_primary_foreground_color?: string
  sidebar_accent_color?: string
  sidebar_accent_foreground_color?: string
  sidebar_border_color?: string
  sidebar_ring_color?: string
}

interface Page {
  store_id: string
  page_slug: string
  page_title: string
  page_type: 'homepage' | 'standard' | 'product_list' | 'custom'
  seo_data: SeoData
  sections: SectionData[]
}

interface SectionData {
  section_type: string
  section_data: any
  sort_order: number
  styles?: Partial<StoreStyling>
}

export default interface StoreData {
  store_id?: number
  store_name: string
  custom_domain: string | null
  favicon: string | null
  global_styles: StoreStyling
  store_address: {
    address_id?: number
    address_line_1: string
    address_line_2: string
    city: string
    state: string
    zip_postal_code: string
    country: string
  }
  pages?: Page[]
}

interface StoreDataId {
  store_info_id: number
}

export const isValidStoreDataId = (data: unknown): data is StoreDataId => {
  const { error } = StoreIDSchema.validate(data)
  error && console.error('Store Data Response Validation Error')
  error && console.error(error)
  return !error
}

export const isValidStoreDataRequest = (data: unknown): data is StoreData => {
  const { error } = StoreDataRequestSchema.validate(data)
  error && console.error('Store Data Request Validation Error')
  error && console.error(util.inspect(error, true, null, true))
  return !error
}

export const isValidStoreDataResponseList = (
  data: unknown,
): data is StoreData => {
  const { error } = StoreDataResponseListSchema.validate(data)
  error && console.error('Store Data List Response Validation Error')
  error && console.error(util.inspect(error, true, null, true))
  return !error
}

export const isValidStoreDataResponse = (data: unknown): data is StoreData => {
  const { error } = StoreDataResponseSchema.validate(data)
  error && console.error('Store Data Response Validation Error')
  error && console.error(util.inspect(error, true, null, true))
  return !error
}
