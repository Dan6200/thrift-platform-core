import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { Product } from '@/types/products'
import ShippingInfo from '@/types/shipping-info'
import { CardInfo } from '@/types/card-info'
import { Profile } from '@/types/profile' // Import the Profile type
export * from './shopping-cart'
export * from './store'

export const pageAtom = atom(0)
export const productsAtom = atom<Product[]>([])
export const productAtom = atom<Product | null>(null)
export const isSmallScreenAtom = atomWithStorage('screen-width', true)
export const pageNumAtom = atom(1)
export const cardInfo = atom<CardInfo | null>(null)
// Update userAtom to hold the Profile type
export const userAtom = atom<Profile | null>(null)
export const shippingInfoAtom = atomWithStorage<ShippingInfo | null>(
  'shipping-info',
  null,
)
