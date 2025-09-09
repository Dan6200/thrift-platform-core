// cspell:disable
import StoreData from '#src/types/store-data.js'

export const listOfStores: StoreData[] = [
  {
    store_name: 'Inspire Denims',
    favicon: 'https://inspiredenims.com/favicon.ico',
    custom_domain: null,
    vendor_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
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
      primary_color: '#336699',
      secondary_color: '#FF9900',
    },
    pages: [
      {
        store_id: '1',
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
            section_data: {
              title: 'Discover Your Perfect Pair',
              subtitle: 'Premium denim for every style.',
              imageUrl: 'https://inspiredenims.com/hero.jpg',
              altText: 'Models wearing denim jeans',
              callToAction: {
                text: 'Shop Now',
                url: 'https://inspiredenims.com/shop',
              },
            },
          },
          {
            section_type: 'product_grid',
            sort_order: 1,
            section_data: {
              title: 'Featured Products',
              products: [
                {
                  id: 'prod1',
                  name: 'Slim Fit Jeans',
                  sku: 'SFJ001',
                  imageUrl: 'https://inspiredenims.com/slimfit.jpg',
                  altText: 'Slim fit jeans',
                  price: { amount: 59.99, currency: 'USD' },
                  rating: 4.7,
                  numReviews: 120,
                  productUrl: 'https://inspiredenims.com/prod1',
                  shortDescription: 'Comfortable and stylish slim fit jeans.',
                  isInStock: true,
                },
                {
                  id: 'prod2',
                  name: 'Denim Jacket Classic',
                  sku: 'DJC001',
                  imageUrl: 'https://inspiredenims.com/denimjacket.jpg',
                  altText: 'Classic denim jacket',
                  price: { amount: 79.99, currency: 'USD' },
                  originalPrice: { amount: 99.99, currency: 'USD' },
                  rating: 4.9,
                  numReviews: 85,
                  productUrl: 'https://inspiredenims.com/prod2',
                  shortDescription: 'A timeless classic denim jacket.',
                  isInStock: true,
                },
              ],
            },
          },
        ],
      },
    ],
  },
]

export const updatedStores: StoreData[] = [
  {
    store_name: 'Inspire Denims',
    favicon: 'https://inspiredenims.com/favicon.ico',
    custom_domain: 'inspiredenims.com',
    vendor_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    store_address: {
      address_line_1: '456, New Street',
      address_line_2: 'Ikeja',
      city: 'Lagos',
      state: 'Lagos',
      zip_postal_code: '100001',
      country: 'Nigeria',
    },
    global_styles: {
      layout_template: 'default',
      font_family: 'Roboto',
      primary_color: '#336699',
      secondary_color: '#FF9900',
    },
    pages: [
      {
        store_id: '1',
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
            section_data: {
              title: 'Discover Your Perfect Pair',
              subtitle: 'Premium denim for every style.',
              imageUrl: 'https://inspiredenims.com/hero.jpg',
              altText: 'Models wearing denim jeans',
              callToAction: {
                text: 'Shop Now',
                url: 'https://inspiredenims.com/shop',
              },
            },
          },
        ],
      },
    ],
  },
]

