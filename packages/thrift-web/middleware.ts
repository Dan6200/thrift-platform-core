import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import redis from '@/lib/redis'

// Changed to support Supabase client context

// Define the public paths that require no authentication
// Update these paths as needed for your application
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
  '/',
  '/products',
  '/stores',
  '/shopping-cart',
]

// Define paths that MUST be protected
// Update these paths as needed for your application
const PROTECTED_PATHS = [
  '/vendor/dashboard',
  '/vendor/admin/dashboard',
  '/profile',
  '/settings',
  '/dashboard',
  '/create-store',
  '/vendor-analytics',
  '/orders',
]

/**
 * Middleware to check for the presence of the Supabase session
 * and protect routes.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
          cookiesToSet.forEach(({ name, value }) =>
            supabaseResponse.cookies.set(name, value),
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

  let sessionVerified = !!data?.user

  if (sessionVerified) {
    try {
      const isStale = await redis.get(data?.user?.id) // Use user ID for deny-list check
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

/**
 * Configuration to define which paths the middleware should run on.
 * It's generally best to exclude static assets, API routes, and Next.js internal files.
 */
export const config = {
  // Update matcher to include all paths that might need auth checks,
  // excluding static files and API routes that don't need middleware.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
