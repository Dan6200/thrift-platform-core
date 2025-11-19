import { supabase } from '@/auth/client/config'
import { atom } from 'jotai'
import { userAtom } from '.'

type AuthInitArg = unknown[]

type CleanupFn = () => void

export const authEffectAtom = atom<null, AuthInitArg, CleanupFn>(
  null,
  (_get, set, _arg) => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_ev, session) => {
      set(userAtom, session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  },
)
