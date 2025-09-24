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

interface Theme {
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
  accent_color?: string
  accent_foreground_color?: string
  destructive_color?: string
  destructive_foreground_color?: string
  ring_color?: string
  radius?: string
  chart_color_1?: string
  chart_color_2?: string
  chart_color_3?: string
  chart_color_4?: string
  chart_color_5?: string
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

interface StoreStyling {
  layout_template: 'default' | 'minimal' | 'grid'
  font_family: string
  light?: Theme
  dark?: Theme
}

interface Page {
  store_id: string
  page_slug: string
  page_title: string
  page_type: 'homepage' | 'standard' | 'product_list' | 'custom'
  seo_data: SeoData
  sections: (ProductGrid | HeroSection | TextBlockSection)[]
}

interface SectionData {
  section_title: string
  section_type: string
  section_data: any
  sort_order: number
  styles?: Partial<StoreStyling>
}

interface ProductGrid extends SectionData {
  section_title: string
  section_type: 'product_grid'
  section_data: any[]
}

interface HeroSection extends SectionData {
  section_title: string
  section_type: 'hero'
  section_data: {
    subtitle?: string
    cta_text?: string
    cta_link?: string
    image_url?: string
  }
}

interface TextBlockSection extends SectionData {
  section_title: string
  section_type: 'text_block'
  section_data: {
    content: string
  }
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
    created_at?: Date
    updated_at?: Date
  }
  pages?: Page[]
}

export interface StoreDataId {
  store_info_id: number
}

export interface StoreCreateRequest {
  body: StoreData;
}

export interface StoreGetAllRequest {
  query?: { vendor_id?: string };
}

export interface StoreGetRequest {
  params: { storeId: number };
  query?: { vendor_id?: string };
}

export interface StoreUpdateRequest {
  params: { storeId: number };
  body: StoreData;
}

export interface StoreDeleteRequest {
  params: { storeId: number };
}
