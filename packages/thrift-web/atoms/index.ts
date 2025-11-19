import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { Product } from '@/types/products'
import ShippingInfo from '@/types/shipping-info'
import { User } from '@supabase/supabase-js'
import { CardInfo } from '@/types/card-info'
export * from './shopping-cart'
export * from './store'

export const pageAtom = atom(0)
export const productsAtom = atom<Product[]>([])
export const productAtom = atom<Product | null>(null)
export const isSmallScreenAtom = atom(true)
export const pageNumAtom = atom(1)
export const cardInfo = atom<CardInfo | null>(null)
export const userAtom = atom<User | null | undefined>(undefined)
export const shippingInfoAtom = atomWithStorage<ShippingInfo | null>(
  'shipping-info',
  null,
)
