import joi from 'joi'

const SeoDataSchema = joi.object({
  meta_description: joi.string().required(),
  canonical_url: joi.string().uri().required(),
  keywords: joi.array().items(joi.string()).required(),
  ogTitle: joi.string().optional(),
  ogDescription: joi.string().optional(),
  ogImage: joi.string().uri().optional(),
  ogUrl: joi.string().uri().optional(),
  ogType: joi.string().optional(),
  twitterCard: joi
    .string()
    .valid('summary', 'summary_large_image', 'app', 'player')
    .optional(),
  twitterSite: joi.string().optional(),
  twitterCreator: joi.string().optional(),
  twitterTitle: joi.string().optional(),
  twitterDescription: joi.string().optional(),
  twitterImage: joi.string().uri().optional(),
  schemaMarkup: joi
    .object({
      '@context': joi.string().required(),
      '@type': joi.string().required(),
      name: joi.string().required(),
      description: joi.string().required(),
      url: joi.string().uri().required(),
    })
    .optional(),
})

const ThemeSchema = joi.object({
  primary_color: joi.string().optional(),
  secondary_color: joi.string().optional(),
  background_color: joi.string().optional(),
  foreground_color: joi.string().optional(),
  muted_color: joi.string().optional(),
  muted_foreground_color: joi.string().optional(),
  popover_color: joi.string().optional(),
  popover_foreground_color: joi.string().optional(),
  card_color: joi.string().optional(),
  card_foreground_color: joi.string().optional(),
  border_color: joi.string().optional(),
  input_color: joi.string().optional(),
  primary_foreground_color: joi.string().optional(),
  secondary_foreground_color: joi.string().optional(),
  accent_color: joi.string().optional(),
  accent_foreground_color: joi.string().optional(),
  destructive_color: joi.string().optional(),
  destructive_foreground_color: joi.string().optional(),
  ring_color: joi.string().optional(),
  radius: joi.string().optional(),
  chart_color_1: joi.string().optional(),
  chart_color_2: joi.string().optional(),
  chart_color_3: joi.string().optional(),
  chart_color_4: joi.string().optional(),
  chart_color_5: joi.string().optional(),
  hero_primary_color: joi.string().optional(),
  hero_primary_foreground_color: joi.string().optional(),
  hero_secondary_color: joi.string().optional(),
  hero_secondary_foreground_color: joi.string().optional(),
  sidebar_background_color: joi.string().optional(),
  sidebar_foreground_color: joi.string().optional(),
  sidebar_primary_color: joi.string().optional(),
  sidebar_primary_foreground_color: joi.string().optional(),
  sidebar_accent_color: joi.string().optional(),
  sidebar_accent_foreground_color: joi.string().optional(),
  sidebar_border_color: joi.string().optional(),
  sidebar_ring_color: joi.string().optional(),
})

const StoreStylingSchema = joi
  .object({
    layout_template: joi
      .string()
      .valid('default', 'minimal', 'grid')
      .required(),
    font_family: joi.string().required(),
    light: ThemeSchema.optional(),
    dark: ThemeSchema.optional(),
  })
  .allow(null)

const PageSchemaRequest = joi.object({
  page_slug: joi.string().required(),
  page_title: joi.string().required(),
  page_type: joi
    .string()
    .valid('homepage', 'standard', 'product_list', 'custom')
    .required(),
  seo_data: SeoDataSchema.required(),
  sections: joi
    .array()
    .items(
      joi.object({
        section_title: joi.string().required(),
        section_type: joi.string().required(),
        section_data: joi.any().required(),
        styles: StoreStylingSchema.optional(),
        sort_order: joi.number().required(),
      }),
    )
    .required(),
})

const PageSchemaResponse = joi.object({
  page_id: joi.number().required(),
  page_slug: joi.string().required(),
  page_title: joi.string().required(),
  page_type: joi
    .string()
    .valid('homepage', 'standard', 'product_list', 'custom')
    .required(),
  seo_data: SeoDataSchema.required(),
  created_at: joi.date().required(),
  updated_at: joi.date().required(),
  sections: joi
    .array()
    .items(
      joi.object({
        section_id: joi.number().required(),
        section_title: joi.string().required(),
        section_type: joi.string().required(),
        section_data: joi.any().required(),
        styles: StoreStylingSchema.optional(),
        sort_order: joi.number().required(),
        created_at: joi.date().required(),
        updated_at: joi.date().required(),
      }),
    )
    .required(),
})

export const StoreDataRequestSchema = joi.object({
  store_name: joi.string().min(3).max(50).required(),
  custom_domain: joi.string().hostname().allow(null).required(),
  favicon: joi.string().uri().allow(null).required(),
  global_styles: StoreStylingSchema.required(),
  store_address: joi
    .object({
      address_line_1: joi.string().required(),
      address_line_2: joi.string().allow(null, '').optional(),
      city: joi.string().required(),
      state: joi.string().required(),
      zip_postal_code: joi.string().required(),
      country: joi.string().required(),
    })
    .required(),
  pages: joi.array().items(PageSchemaRequest).optional(),
})

export const StoreDataRequestPartialSchema = joi.object({
  store_name: joi.string().min(3).max(50).optional(),
  favicon: joi.string().uri().optional(),
  custom_domain: joi.string().hostname().optional(),
  global_styles: StoreStylingSchema.optional(),
  store_address: joi
    .object({
      address_line_1: joi.string().optional(),
      address_line_2: joi.string().allow(null, '').optional(),
      city: joi.string().optional(),
      state: joi.string().optional(),
      zip_postal_code: joi.string().optional(),
      country: joi.string().optional(),
    })
    .optional(),
  pages: joi.array().items(PageSchemaRequest).optional(),
})

// Schemas for request validation middleware
export const StoreCreateRequestSchema = joi.object({
  body: StoreDataRequestSchema.required(),
  query: joi.object().optional(),
  params: joi.object().optional(),
})

export const StoreGetAllRequestSchema = joi.object({
  query: joi
    .object({
      vendor_id: joi.string().uuid().optional(),
    })
    .optional(),
  body: joi.object().optional(),
  params: joi.object().optional(),
})

export const StoreGetRequestSchema = joi.object({
  params: joi
    .object({
      storeId: joi.number().integer().positive().required(),
    })
    .required(),
  query: joi
    .object({
      vendor_id: joi.string().uuid().optional(),
    })
    .optional(),
  body: joi.object().optional(),
})

export const StoreUpdateRequestSchema = joi.object({
  params: joi
    .object({
      storeId: joi.number().integer().positive().required(),
    })
    .required(),
  body: StoreDataRequestPartialSchema.required(),
  query: joi.object().optional(),
})

export const StoreDeleteRequestSchema = joi.object({
  params: joi
    .object({
      storeId: joi.number().integer().positive().required(),
    })
    .required(),
  query: joi.object().optional(),
  body: joi.object().optional(),
})

// Schemas for response validation middleware
export const StoreDataResponseSchema = joi
  .object({
    store_id: joi.number().required(),
    store_name: joi.string().min(3).max(50).required(),
    custom_domain: joi.string().hostname().allow(null).required(),
    vendor_id: joi.string().guid({ version: 'uuidv4' }).required(),
    favicon: joi.string().uri().allow(null).required(),
    global_styles: StoreStylingSchema.required(),
    store_address: joi
      .object({
        address_id: joi.number().required(),
        address_line_1: joi.string().required(),
        address_line_2: joi.string().allow(null, '').optional(),
        city: joi.string().required(),
        state: joi.string().required(),
        zip_postal_code: joi.string().required(),
        country: joi.string().required(),
        created_at: joi.date().required(),
        updated_at: joi.date().required(),
      })
      .required(),
    pages: joi.array().items(PageSchemaResponse).optional(),
    created_at: joi.date().required(),
    updated_at: joi.date().required(),
  })
  .required()

export const StoreDataResponseListSchema = joi
  .array()
  .items(StoreDataResponseSchema)
  .required()
