'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/atoms'
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from '@/lib/api/cart'

export const cartQueryKey = ['cart'] as const

/**
 * Server-backed cart. Only enabled when the user is authenticated because
 * `/v1/cart` requires a Supabase session.
 */
export function useCart() {
  const user = useAtomValue(userAtom)

  return useQuery({
    queryKey: cartQueryKey,
    queryFn: getCart,
    enabled: Boolean(user),
  })
}

export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  })
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  })
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: number) => removeCartItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  })
}
