// cspell:disable
import StoreData from '#src/types/store-data.js'

export const listOfStores: StoreData[] = [
  {
    store_name: 'Inspire Denims',
    favicon: 'https://inspiredenims.com/favicon.ico',
    custom_domain: null,
    store_address: {
      address_line_1: '123, Herbert Macaulay Way',
      address_line_2: 'Yaba',
      city: 'Lagos',
      state: 'Lagos',
      zip_postal_code: '101212',
      country: 'Nigeria',
    },
    global_styles: {
      layout_template: 'default',
      font_family: 'Roboto',
      light: {
        primary_color: '#336699',
        secondary_color: '#FF9900',
      },
    },
    pages: [
      {
        page_slug: 'home',
        page_title: 'Inspire Denims Home',
        page_type: 'homepage',
        seo_data: {
          meta_description:
            'Shop the latest denim collection from Inspire Denims.',
          canonical_url: 'https://inspiredenims.com/',
          keywords: ['denim', 'jeans', 'jackets', 'fashion', 'online store'],
          schemaMarkup: {
            '@context': 'http://schema.org',
            '@type': 'WebPage',
            name: 'Inspire Denims Home',
            description:
              'Shop the latest denim collection from Inspire Denims.',
            url: 'https://inspiredenims.com/',
          },
          ogTitle: 'Inspire Denims - Your Go-To for Quality Denim',
          ogDescription:
            'Discover the perfect pair of jeans and stylish denim jackets.',
          ogImage: 'https://inspiredenims.com/og_image.jpg',
          ogUrl: 'https://inspiredenims.com/',
          ogType: 'website',
          twitterCard: 'summary_large_image',
          twitterSite: '@InspireDenims',
          twitterCreator: '@InspireDenims',
          twitterTitle: 'Inspire Denims',
          twitterDescription: 'Shop the latest denim collection.',
          twitterImage: 'https://inspiredenims.com/twitter_image.jpg',
        },
        sections: [
          {
            section_type: 'hero',
            sort_order: 0,
            section_title: 'Discover Your Perfect Pair',
            section_data: {
              subtitle: 'Premium denim for every style.',
              image_url: 'https://inspiredenims.com/hero.jpg',
              cta_text: 'Shop Now',
              cta_link: 'https://inspiredenims.com/shop',
            },
          },
          {
            section_type: 'product_grid',
            sort_order: 1,
            section_title: 'Featured Products',
            section_data: [
              {
                product_id: 1,
                vendor_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
                title: 'Slim Fit Jeans',
                category_id: 1,
                subcategory_id: 101,
                description: ['Comfortable and stylish slim fit jeans.'],
                list_price: 59.99,
                net_price: 59.99,
                variants: [
                  {
                    variant_id: 101,
                    sku: 'SFJ-BL-32',
                    list_price: 59.99,
                    net_price: 59.99,
                    quantity_available: 50,
                    options: [
                      {
                        option_id: 1,
                        option_name: 'Color',
                        value_id: 11,
                        value: 'Blue',
                      },
                      {
                        option_id: 2,
                        option_name: 'Size',
                        value_id: 21,
                        value: '32',
                      },
                    ],
                  },
                  {
                    variant_id: 102,
                    sku: 'SFJ-BL-34',
                    list_price: 59.99,
                    net_price: 59.99,
                    quantity_available: 40,
                    options: [
                      {
                        option_id: 1,
                        option_name: 'Color',
                        value_id: 11,
                        value: 'Blue',
                      },
                      {
                        option_id: 2,
                        option_name: 'Size',
                        value_id: 22,
                        value: '34',
                      },
                    ],
                  },
                ],
                media: [
                  {
                    name: 'slim-fit-jeans-front',
                    path: '/images/slim-fit-jeans-front.jpg',
                    description: 'Front view of the slim fit jeans',
                    is_display_image: true,
                    is_landing_image: false,
                    filetype: 'image',
                  },
                  {
                    name: 'slim-fit-jeans-back',
                    path: '/images/slim-fit-jeans-back.jpg',
                    description: 'Back view of the slim fit jeans',
                    is_display_image: false,
                    is_landing_image: false,
                    filetype: 'image',
                  },
                ],
              },
              {
                product_id: 2,
                vendor_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
                title: 'Denim Jacket Classic',
                category_id: 1,
                subcategory_id: 102,
                description: ['A timeless classic denim jacket.'],
                list_price: 99.99,
                net_price: 79.99,
                variants: [
                  {
                    variant_id: 201,
                    sku: 'DJC-M',
                    list_price: 99.99,
                    net_price: 79.99,
                    quantity_available: 30,
                    options: [
                      {
                        option_id: 2,
                        option_name: 'Size',
                        value_id: 23,
                        value: 'M',
                      },
                    ],
                  },
                  {
                    variant_id: 202,
                    sku: 'DJC-L',
                    list_price: 99.99,
                    net_price: 79.99,
                    quantity_available: 25,
                    options: [
                      {
                        option_id: 2,
                        option_name: 'Size',
                        value_id: 24,
                        value: 'L',
                      },
                    ],
                  },
                ],
                media: [
                  {
                    name: 'denim-jacket-front',
                    path: '/images/denim-jacket-front.jpg',
                    description: 'Front view of the denim jacket',
                    is_display_image: true,
                    is_landing_image: true,
                    filetype: 'image',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        page_slug: 'about',
        page_title: 'About Us',
        page_type: 'standard',
        seo_data: {
          meta_description: 'Learn more about Inspire Denims.',
          canonical_url: 'https://inspiredenims.com/about',
          keywords: ['about us', 'story'],
        },
        sections: [],
      },
    ],
  },
  // Store 2: Store with no pages
  {
    store_name: 'Minimalist Wears',
    favicon: null,
    custom_domain: 'minimalist.com',
    store_address: {
      address_line_1: '789 Side St',
      address_line_2: '',
      city: 'Ibadan',
      state: 'Oyo',
      zip_postal_code: '200284',
      country: 'Nigeria',
    },
    global_styles: {
      layout_template: 'minimal',
      font_family: 'Inter',
    },
    pages: [],
  },
  // Store 3: Store with a page but no sections
  {
    store_name: 'Sectionless Styles',
    favicon: null,
    custom_domain: null,
    store_address: {
      address_line_1: '101 Blank Canvas',
      address_line_2: '',
      city: 'Kano',
      state: 'Kano',
      zip_postal_code: '700231',
      country: 'Nigeria',
    },
    global_styles: {
      layout_template: 'grid',
      font_family: 'Lato',
    },
    pages: [
      {
        page_slug: 'about',
        page_title: 'About Us',
        page_type: 'standard',
        seo_data: {
          meta_description: 'Learn more about Sectionless Styles.',
          canonical_url: 'https://sectionless.com/about',
          keywords: ['about us', 'story'],
        },
        sections: [],
      },
    ],
  },
]

export const updatedStores: Partial<StoreData>[] = [
  {
    store_name: 'Inspire Denims',
    favicon: 'https://inspiredenims.com/favicon.ico',
    custom_domain: 'inspiredenims.com',
    store_address: {
      address_line_1: '456, New Street',
      address_line_2: '100 Carpark',
      city: 'Lagos',
      state: 'Lagos',
      zip_postal_code: '100001',
      country: 'Nigeria',
    },
    global_styles: {
      layout_template: 'default',
      font_family: 'Roboto',
      light: {
        primary_color: '#336699',
        secondary_color: '#FF9900',
      },
    },
    pages: [
      {
        page_slug: 'home',
        page_title: 'Inspire Denims Home - Updated',
        page_type: 'homepage',
        seo_data: {
          meta_description:
            'Shop the latest denim collection from Inspire Denims.',
          canonical_url: 'https://inspiredenims.com/',
          keywords: ['denim', 'jeans', 'jackets', 'fashion', 'online store'],
          schemaMarkup: {
            '@context': 'http://schema.org',
            '@type': 'WebPage',
            name: 'Inspire Denims Home',
            description:
              'Shop the latest denim collection from Inspire Denims.',
            url: 'https://inspiredenims.com/',
          },
        },
        sections: [
          {
            section_type: 'hero',
            sort_order: 0,
            section_title: 'Discover Your Perfect Pair',
            section_data: {
              subtitle: 'Premium denim for every style.',
              image_url: 'https://inspiredenims.com/hero.jpg',
              cta_text: 'Shop Now',
              cta_link: 'https://inspiredenims.com/shop',
            },
          },
        ],
      },
    ],
  },
  // Update for Store 2
  {
    store_name: 'Maximalist Wears',
    custom_domain: 'maximalist.com',
    store_address: {
      address_line_1: '789 Main St',
      address_line_2: 'Suite 100',
      city: 'Ibadan',
      state: 'Oyo',
      zip_postal_code: '200285',
      country: 'Nigeria',
    },
    global_styles: {
      layout_template: 'default',
      font_family: 'Roboto',
    },
    // Adding a page to test update
    pages: [
      {
        page_slug: 'contact',
        page_title: 'Contact Us',
        page_type: 'standard',
        seo_data: {
          meta_description: 'Get in touch with Maximalist Wears.',
          canonical_url: 'https://maximalist.com/contact',
          keywords: ['contact', 'support'],
        },
        sections: [
          {
            section_type: 'text_block',
            sort_order: 0,
            section_title: 'Our Location',
            section_data: {
              content: 'Find us at 789 Main St, Ibadan.',
            },
          },
        ],
      },
    ],
  },
  // Update for Store 3
  {
    store_name: 'Section-Full Styles',
    store_address: {
      address_line_1: '101 Blank Canvas',
      address_line_2: '',
      city: 'Kano',
      state: 'Kano',
      zip_postal_code: '700231',
      country: 'Nigeria',
    },
    global_styles: {
      layout_template: 'grid',
      font_family: 'Lato',
    },
    pages: [
      {
        page_slug: 'about',
        page_title: 'About Our Company',
        page_type: 'standard',
        seo_data: {
          meta_description: 'Learn more about Section-Full Styles.',
          canonical_url: 'https://sectionfull.com/about',
          keywords: ['about us', 'company'],
        },
        // Adding a section to test update
        sections: [
          {
            section_type: 'hero',
            sort_order: 0,
            section_title: 'Our Story',
            section_data: {
              subtitle: 'From humble beginnings.',
            },
          },
        ],
      },
    ],
  },
]

