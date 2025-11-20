'use server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import redis from '@/lib/redis' // Upstash Redis client

const STALE_COOKIE_TTL = 60 * 5 // 5 minutes

// Helper to create a Supabase server client
const createSupabaseServerClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for admin actions, or anon key for user-specific
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, ...options }) =>
            cookieStore.set({ name, value, ...options }),
          )
        },
      },
    },
  )
}

/**
 * Verifies the user's session using Supabase.
 * Checks a Redis cache for known-stale sessions for performance.
 * @returns The Supabase user object for the authenticated user.
 */
export async function verifySession() {
  const supabase = await createSupabaseServerClient()

  // Get session from Supabase, which automatically reads from cookies
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('No active session found. User is not authenticated.')
  }

  // Check Redis deny-list for explicitly stale sessions (e.g., after logout)
  try {
    const isStale = await redis.get(session.jti || session.user.id) // Using session JWT ID or user ID
    if (isStale) {
      throw new Error('Stale session found in cache. Please log in again.')
    }
  } catch (error) {
    console.warn(
      'Redis check failed, proceeding with Supabase session. Error:',
      error,
    )
    // Continue even if Redis fails, relying on Supabase for primary session validity.
  }

  return session.user
}

/**
 * Deletes the user's session by signing out from Supabase
 * and proactively adding the session ID to the Redis stale-session cache.
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    // Add current session to Redis deny-list for immediate invalidation
    await redis.set(
      session.jti || session.user.id,
      'stale',
      'EX',
      STALE_COOKIE_TTL,
    )
  }

  await supabase.auth.signOut()

  cookieStore.delete('sb-access-token')
  cookieStore.delete('sb-refresh-token')
}
