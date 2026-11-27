import assert from 'node:assert/strict'
import test from 'node:test'
import {
  addGuestItem,
  changeGuestQuantity,
  removeGuestItem,
  guestCart,
  normalizeGuestState,
  planGuestTransfer,
  completeGuestTransfer,
  cartKey,
} from '../lib/cart/guest-cart'

const preview = {
  product_title: 'Dress',
  price: 450000,
  image_url: null,
  store_id: 1,
  sku: 'THR-TEST',
  quantity_available: 8,
}
const addition = { variant_id: 7, quantity: 2, preview }
const initial = () => addGuestItem({ items: [] }, addition)

test('guest cart combines variants and computes totals in kobo', () => {
  const state = addGuestItem(initial(), { ...addition, quantity: 1 })
  const cart = guestCart(state)
  assert.equal(cart.items.length, 1)
  assert.equal(cart.total_items, 3)
  assert.equal(cart.total_price, 1350000)
})
test('guest quantity changes and removal are persistent plain-data operations', () => {
  const state = changeGuestQuantity(initial(), -7, 3)
  assert.equal(
    guestCart(normalizeGuestState(JSON.parse(JSON.stringify(state))))
      .total_items,
    3,
  )
  assert.deepEqual(removeGuestItem(state, -7).items, [])
})
test('guest quantities cannot be negative, fractional or exceed stock', () => {
  for (const quantity of [0, -1, 1.5, 9, NaN])
    assert.throws(() => addGuestItem({ items: [] }, { ...addition, quantity }))
  assert.throws(() => addGuestItem(initial(), { ...addition, quantity: 7 }))
  assert.throws(() => changeGuestQuantity(initial(), -7, 0))
})
test('invalid local storage cannot inject malformed cart rows', () => {
  assert.deepEqual(
    normalizeGuestState({ items: [null, { variant_id: 7, quantity: -2 }] })
      .items,
    [],
  )
  assert.deepEqual(normalizeGuestState(null).items, [])
})
test('guest/account and different account query caches are separate', () => {
  assert.notDeepEqual(cartKey(), cartKey('account-a'))
  assert.notDeepEqual(cartKey('account-a'), cartKey('account-b'))
})
test('login transfer adds guest quantities to existing account quantities', () => {
  const server = {
    ...guestCart(initial()),
    items: [{ ...initial().items[0], item_id: 42, quantity: 3 }],
  }
  const planned = planGuestTransfer(initial(), server, 'account-a')
  assert.deepEqual(planned.transfer?.targets, [
    { variant_id: 7, quantity: 5, source_quantity: 2 },
  ])
  assert.deepEqual(completeGuestTransfer(planned, 'account-a', 7).items, [])
})
test('retrying after an uncertain server write retains the original target', () => {
  const planned = planGuestTransfer(
    initial(),
    guestCart({ items: [] }),
    'account-a',
  )
  const server = {
    ...guestCart(initial()),
    items: [{ ...initial().items[0], item_id: 42 }],
  }
  assert.equal(
    planGuestTransfer(planned, server, 'account-a').transfer?.targets[0]
      .quantity,
    2,
  )
})
test('a transfer never reuses another account target or clears new guest additions', () => {
  const planned = planGuestTransfer(
    initial(),
    guestCart({ items: [] }),
    'account-a',
  )
  assert.deepEqual(completeGuestTransfer(planned, 'account-b', 7), planned)
  const more = addGuestItem(planned, { ...addition, quantity: 1 })
  assert.equal(completeGuestTransfer(more, 'account-a', 7).items[0].quantity, 1)
  const server = {
    ...guestCart(initial()),
    items: [{ ...initial().items[0], item_id: 42, quantity: 4 }],
  }
  assert.equal(
    planGuestTransfer(planned, server, 'account-b').transfer?.targets[0]
      .quantity,
    6,
  )
})
