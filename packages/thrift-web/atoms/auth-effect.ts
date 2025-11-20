import { supabase } from '@/auth/client/config'
import { atom } from 'jotai'
import { userAtom } from '.'
import { Profile } from '@/types/profile' // Import the Profile type

type AuthInitArg = unknown[]

type CleanupFn = () => void

export const authEffectAtom = atom<null, AuthInitArg, CleanupFn>(
  null,
  (_get, set, _arg) => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_ev, session) => {
      if (session?.user) {
        // Fetch profile data from the 'profiles' table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Error fetching profile in authEffectAtom:', error)
          set(userAtom, null)
        } else if (profile) {
          // Combine Supabase user data and profile data
          const fullProfile: Profile = {
            ...profile,
            email: session.user.email || null, // Ensure email from auth.users is included
          }
          set(userAtom, fullProfile)
        }
      } else {
        // Clear profile data on logout
        set(userAtom, null)
      }
    })

    return () => subscription.unsubscribe()
  },
)
