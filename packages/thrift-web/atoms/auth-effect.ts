import { supabase } from '@/auth/client/config'
import { atom } from 'jotai'
import { userAtom } from '.'

type AuthInitArg = unknown[]

type CleanupFn = () => void

export const authEffectAtom = atom<null, AuthInitArg, CleanupFn>(
  null,
  (_get, set, _arg) => {
    const setUser = async () => {
      const { data: userData } = await supabase.auth.getUser()
      set(userAtom, userData.user)
    }
    setUser()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser()
      } else {
        // Clear profile data on logout
        set(userAtom, null)
      }
    })

    return () => subscription.unsubscribe()
  },
)
