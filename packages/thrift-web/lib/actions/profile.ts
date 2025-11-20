'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export const createVendorAccount = async () => {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for admin actions, or anon key for user-specific
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated.')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ is_vendor: true })
    .eq('id', user.id)

  if (error) {
    console.error('Error setting user as vendor:', error)
    throw new Error('Failed to create vendor account.')
  }

  revalidatePath('/create-store') // Revalidate the path to reflect the change
  return { success: true }
}
