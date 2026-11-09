import { knex } from '#src/db/index.js'
import { stockForVariant } from '#src/db/inventory.js'
import { cloudinaryMediaUrl } from '#src/context/media/infra/cloudinary-url.js'
import { CartRepository } from '../ports/cart-repository.js'

export const knexCartRepository: CartRepository = {
  async getCart(customerId) {
    let cart = await knex('shopping_cart')
      .where({ customer_id: customerId })
      .first()

    if (!cart) {
      ;[cart] = await knex('shopping_cart')
        .insert({ customer_id: customerId })
        .returning('*')
    }

    const cartItems = await knex('shopping_cart_item as sci')
      .join('product_variants as pv', 'sci.variant_id', 'pv.variant_id')
      .join('products as p', 'pv.product_id', 'p.product_id')
      .leftJoin('product_media_links as pml', function () {
        this.on('pv.variant_id', '=', 'pml.variant_id').andOn(
          'pml.is_display_image',
          '=',
          knex.raw('true'),
        )
      })
      .leftJoin('media as m', 'pml.media_id', 'm.media_id')
      .leftJoin(
        'product_variant_effective_price as epe',
        'pv.variant_id',
        'epe.variant_id',
      )
      .where('sci.cart_id', cart.cart_id)
      .select(
        'sci.item_id',
        'sci.variant_id',
        'sci.quantity',
        'sci.created_at',
        'sci.updated_at',
        'p.title as product_title',
        'p.store_id',
        'pv.sku',
        'epe.effective_price as price',
        'm.filename as image_filename',
        'm.filetype as image_filetype',
      )

    const items = cartItems.map(
      ({ image_filename, image_filetype, ...item }) => ({
        ...item,
        image_url: image_filename
          ? cloudinaryMediaUrl.url(image_filename, image_filetype)
          : null,
      }),
    )

    const total_items = items.reduce((sum, item) => sum + item.quantity, 0)
    const total_price = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )

    return {
      cart_id: cart.cart_id,
      customer_id: cart.customer_id,
      items,
      created_at: cart.created_at,
      updated_at: cart.updated_at,
      total_items,
      total_price,
    }
  },

  async getStock(variantId) {
    return stockForVariant(variantId)
  },

  async getCartId(customerId) {
    const cart = await knex('shopping_cart')
      .where({ customer_id: customerId })
      .first()
    return cart?.cart_id ?? null
  },

  async getCartItem(cartId, itemId) {
    const item = await knex('shopping_cart_item')
      .where({ item_id: itemId, cart_id: cartId })
      .first()
    return item ? { variant_id: item.variant_id } : null
  },

  async addItem(customerId, variantId, quantity) {
    return knex.transaction(async (trx) => {
      let cart = await trx('shopping_cart')
        .where({ customer_id: customerId })
        .first()

      if (!cart) {
        ;[cart] = await trx('shopping_cart')
          .insert({ customer_id: customerId })
          .returning('*')
      }

      const [updatedItem] = await trx('shopping_cart_item')
        .insert({ cart_id: cart.cart_id, variant_id: variantId, quantity })
        .onConflict(['cart_id', 'variant_id'])
        .merge({
          quantity: knex.raw('shopping_cart_item.quantity + ?', [quantity]),
        })
        .returning('*')

      const { cart_id, ...item } = updatedItem
      return item
    })
  },

  async updateItem(cartId, itemId, quantity) {
    const [updatedItem] = await knex('shopping_cart_item')
      .where({ item_id: itemId, cart_id: cartId })
      .update({ quantity })
      .returning('*')

    const { cart_id, ...item } = updatedItem
    return item
  },

  async removeItem(cartId, itemId) {
    return knex('shopping_cart_item')
      .where({ item_id: itemId, cart_id: cartId })
      .del()
  },
}
