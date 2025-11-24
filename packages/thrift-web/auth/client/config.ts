import { createBrowserClient } from '@supabase/ssr'

// Supabase client-side initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableDefaultKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabasePublishableDefaultKey) {
  throw new Error(
    'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) are not set.',
  )
}

export const supabase = createBrowserClient(
  supabaseUrl,
  supabasePublishableDefaultKey,
)
