'use server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import redis from '@/lib/redis' // Upstash Redis client
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const STALE_COOKIE_TTL = 60 * 5 // 5 minutes

// Helper to create a Supabase server client
const createSupabaseServerClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
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
    const isStale = await redis.get(session.user.id) // Using session JWT ID or user ID
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
export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    // Add current session to Redis deny-list for immediate invalidation
    await redis.set(session.user.id, 'stale', { ex: STALE_COOKIE_TTL })
  }

  await supabase.auth.signOut()

  cookieStore.delete('sb-access-token')
  cookieStore.delete('sb-refresh-token')
}

const SignUpSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  dob: z.string(),
  country: z.string().min(1),
  is_vendor: z.boolean(),
})

export async function signup(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const validatedFields = SignUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    dob: formData.get('dob'),
    country: formData.get('country'),
    is_vendor: formData.get('is_vendor') === 'true',
  })

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields!',
      data: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { is_vendor, ...rest } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email: rest.email,
    password: rest.password,
    options: {
      data: {
        ...rest,
        is_vendor: is_vendor || false,
        is_customer: !is_vendor,
      },
    },
  })

  if (error) {
    return {
      error: 'Could not sign up user.',
      data: null,
    }
  }

  return {
    error: null,
    data: { message: 'Confirmation link sent.' },
  }
}

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required.'),
})

export async function login(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields!',
      data: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: 'Could not authenticate user.',
      data: null,
    }
  }

  return {
    error: null,
    data: { message: 'Logged in successfully.' },
  }
}

export async function updateSession(
  request: NextRequest,
  PUBLIC_PATHS: string[],
  PROTECTED_PATHS: string[],
) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: Don't remove getClaims()
  const { data } = await supabase.auth.getUser() // Personal Note: I believe getUser can be used in place of getClaims.

  let sessionVerified = !!data.user

  // Redundant (data.user check) but quells the compiler
  if (sessionVerified && data.user) {
    try {
      const isStale = await redis.get(data.user.id) // Use user ID for deny-list check
      if (isStale) {
        sessionVerified = false // Mark session as stale if found in Redis
        await supabase.auth.signOut() // Force sign out from Supabase
      }
    } catch (error) {
      console.warn(
        'Redis check failed in middleware, proceeding with Supabase user state. Error:',
        error,
      )
      // Continue, as Redis might be down, but Supabase session might still be valid.
    }
  }

  const pathname = request.nextUrl.pathname

  const isPublicPath = PUBLIC_PATHS.includes(pathname)
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  )

  // 1. User is trying to access a protected path (e.g., /admin)
  if (isProtectedPath) {
    if (!sessionVerified) {
      // Not authenticated -> Redirect to sign-in
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', pathname) // Add redirect param
      return NextResponse.redirect(url)
    }
    // Authenticated -> Allow access
    return NextResponse.next()
  }

  if (isPublicPath) {
    return NextResponse.next()
  }

  return supabaseResponse
}
