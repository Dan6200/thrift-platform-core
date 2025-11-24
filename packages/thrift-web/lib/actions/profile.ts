'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/auth/server/definitions'

export const createVendorAccount = async () => {
  const supabase = await createSupabaseServerClient()
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
