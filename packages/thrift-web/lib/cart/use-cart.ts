'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue, useStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { userAtom } from '@/atoms'
import { supabase } from '@/auth/client/config'
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
  type Cart,
} from '@/lib/api/cart'
import {
  addGuestItem,
  changeGuestQuantity,
  removeGuestItem,
  guestCart,
  normalizeGuestState,
  planGuestTransfer,
  completeGuestTransfer,
  cartKey,
  type GuestCartState,
  type CartAddition,
} from './guest-cart'

export const cartQueryKey = ['cart'] as const
const guestCartAtom = atomWithStorage<GuestCartState>('thrift:guest-cart:v1', {
  items: [],
})
const transfers = new Map<string, Promise<Cart>>()
type Store = ReturnType<typeof useStore>

async function sessionToken(userId: string) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  if (error) throw error
  if (!session || session.user.id !== userId)
    throw new Error('Your session changed. Please sign in again.')
  return session.access_token
}

function loadAccountCart(userId: string, store: Store): Promise<Cart> {
  const pending = transfers.get(userId)
  if (pending) return pending
  const work = (async () => {
    const token = await sessionToken(userId)
    const server = await getCart(token)
    const local = normalizeGuestState(store.get(guestCartAtom))
    if (!local.items.length) return server
    const planned = planGuestTransfer(local, server, userId)
    store.set(guestCartAtom, planned)
    for (const target of planned.transfer!.targets) {
      const existing = server.items.find(
        (item) => item.variant_id === target.variant_id,
      )
      if (existing)
        await updateCartItem(existing.item_id, target.quantity, token)
      else
        await addCartItem(
          { variant_id: target.variant_id, quantity: target.quantity },
          token,
        )
      // Keep items until the server confirms the write, including across retries.
      store.set(guestCartAtom, (current) =>
        completeGuestTransfer(current, userId, target.variant_id),
      )
    }
    return getCart(token)
  })()
  transfers.set(userId, work)
  const clear = () => {
    if (transfers.get(userId) === work) transfers.delete(userId)
  }
  work.then(clear, clear)
  return work
}

export function useCart() {
  const account = useAtomValue(userAtom)
  const user = account && 'id' in account ? account : null
  const store = useStore()
  const local = normalizeGuestState(useAtomValue(guestCartAtom))
  // The signature also triggers transfer when storage hydrates after auth.
  const signature = local.items
    .map((item) => `${item.variant_id}:${item.quantity}`)
    .join(',')
  const query = useQuery({
    queryKey: [...cartKey(user?.id), user ? signature : ''],
    queryFn: () => loadAccountCart(user!.id, store),
    enabled: Boolean(user),
    retry: 1,
  })
  return {
    ...query,
    data: user ? query.data : guestCart(local),
    isLoading: user ? query.isLoading : false,
    isError: user ? query.isError : false,
  }
}

export function useAddToCart() {
  const account = useAtomValue(userAtom)
  const user = account && 'id' in account ? account : null
  const store = useStore(),
    client = useQueryClient()
  return useMutation({
    mutationFn: async (addition: CartAddition) => {
      if (user) {
        await loadAccountCart(user.id, store)
        return addCartItem(addition, await sessionToken(user.id))
      }
      const next = addGuestItem(store.get(guestCartAtom), addition)
      store.set(guestCartAtom, next)
      return next.items.find((item) => item.variant_id === addition.variant_id)!
    },
    onSuccess: () => client.invalidateQueries({ queryKey: cartKey(user?.id) }),
  })
}

export function useUpdateCartItem() {
  const account = useAtomValue(userAtom)
  const user = account && 'id' in account ? account : null
  const store = useStore(),
    client = useQueryClient()
  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: number
      quantity: number
    }) => {
      if (user)
        return updateCartItem(itemId, quantity, await sessionToken(user.id))
      const next = changeGuestQuantity(
        store.get(guestCartAtom),
        itemId,
        quantity,
      )
      store.set(guestCartAtom, next)
      return next.items.find((item) => item.item_id === itemId)!
    },
    onSuccess: () => client.invalidateQueries({ queryKey: cartKey(user?.id) }),
  })
}

export function useRemoveCartItem() {
  const account = useAtomValue(userAtom)
  const user = account && 'id' in account ? account : null
  const store = useStore(),
    client = useQueryClient()
  return useMutation({
    mutationFn: async (itemId: number) => {
      if (user) return removeCartItem(itemId, await sessionToken(user.id))
      store.set(guestCartAtom, (current) => removeGuestItem(current, itemId))
    },
    onSuccess: () => client.invalidateQueries({ queryKey: cartKey(user?.id) }),
  })
}
