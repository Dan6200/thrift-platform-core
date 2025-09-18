import { knex } from '../../db/index.js'
import { QueryParams } from '../../types/process-routes.js'

export async function getCartQuery({ userId }: QueryParams): Promise<any[]> {
  if (!userId) {
    throw new Error('User not authenticated')
  }

  let cart = await knex('shopping_cart').where({ customer_id: userId }).first()

  if (!cart) {
    ;[cart] = await knex('shopping_cart')
      .insert({ customer_id: userId })
      .returning('*')
  }

  const cartItems = await knex('shopping_cart_item as sci')
    .join('product_variants as pv', 'sci.variant_id', 'pv.variant_id')
    .join('products as p', 'pv.product_id', 'p.product_id')
    .leftJoin('product_media as pm', function () {
      this.on('p.product_id', '=', 'pm.product_id').andOn(
        'pm.is_display_image',
        '=',
        knex.raw('true'),
      )
    })
    .where('sci.cart_id', cart.cart_id)
    .select(
      'sci.item_id',
      'sci.variant_id',
      'sci.quantity',
      'p.title as product_title',
      'pv.net_price as price',
      'pm.filepath as image_url',
    )

  const total_items = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const total_price = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  const response = {
    cart_id: cart.cart_id,
    customer_id: cart.customer_id,
    items: cartItems,
    total_items,
    total_price,
  }

  return [response]
}

export async function addItemToCartQuery({ userId, body }: QueryParams): Promise<any[]> {
  if (!userId || !body) {
    throw new Error('User not authenticated or request body is missing')
  }

  const { variant_id, quantity } = body;

  return knex.transaction(async (trx) => {
    let cart = await trx('shopping_cart').where({ customer_id: userId }).first();

    if (!cart) {
      [cart] = await trx('shopping_cart').insert({ customer_id: userId }).returning('*');
    }

    // Check inventory
    const inventory = await trx('product_variant_inventory')
      .where({ variant_id })
      .first();

    if (!inventory || inventory.quantity_available < quantity) {
      throw new Error('Not enough stock');
    }

    const query = `
      INSERT INTO shopping_cart_item (cart_id, variant_id, quantity)
      VALUES (?, ?, ?)
      ON CONFLICT (cart_id, variant_id)
      DO UPDATE SET quantity = shopping_cart_item.quantity + EXCLUDED.quantity
      RETURNING *;
    `;
    const params = [cart.cart_id, variant_id, quantity];

    const { rows: updatedItem } = await trx.raw(query, params);

    return updatedItem;
  });
}

export async function updateCartItemQuery({ userId, params, body }: QueryParams): Promise<any[]> {
  if (!userId || !body || !params) {
    throw new Error('User not authenticated or request body/params is missing')
  }

  const { item_id } = params;
  const { quantity } = body;

  return knex.transaction(async (trx) => {
    const cart = await trx('shopping_cart').where({ customer_id: userId }).first();

    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = await trx('shopping_cart_item').where({ item_id, cart_id: cart.cart_id }).first();

    if (!item) {
      throw new Error('Item not found in cart or you do not have permission to update it');
    }

    // Check inventory
    const inventory = await trx('product_variant_inventory')
      .where({ variant_id: item.variant_id })
      .first();

    if (!inventory || inventory.quantity_available < quantity) {
      throw new Error('Not enough stock');
    }

    const updatedItem = await trx('shopping_cart_item')
      .where({ item_id, cart_id: cart.cart_id })
      .update({ quantity })
      .returning('*');

    return updatedItem;
  });
}

export async function removeCartItemQuery({
  userId,
  params,
}: QueryParams): Promise<void> {
  if (!userId || !params) {
    throw new Error('User not authenticated or params is missing')
  }

  const { item_id } = params

  const cart = await knex('shopping_cart')
    .where({ customer_id: userId })
    .first()

  if (!cart) {
    throw new Error('Cart not found')
  }

  const deletedCount = await knex('shopping_cart_item')
    .where({ item_id, cart_id: cart.cart_id })
    .del()

  if (deletedCount === 0) {
    throw new Error(
      'Item not found in cart or you do not have permission to delete it',
    )
  }
}
