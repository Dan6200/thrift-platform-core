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
]

// Define paths that MUST be protected
// Update these paths as needed for your application
const PROTECTED_PATHS = ['/admin', '/profile', '/settings', '/dashboard']

/**
 * Middleware to check for the presence of the Supabase session
 * and protect routes.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Create a Supabase client for the middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
        },
      },
    },
  )

  // Refresh session if expired - this will update the cookies
  // and redirect if necessary
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let sessionVerified = !!user // True if user object exists

  // Check Redis deny-list if user is found, for proactive invalidation
  if (sessionVerified && user?.id) {
    try {
      const isStale = await redis.get(user.id) // Use user ID for deny-list check
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

  const isPublicPath = PUBLIC_PATHS.includes(pathname)
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  )

  // Redirect root path for authenticated/unauthenticated users
  if (pathname === '/create-store') {
    const url = request.nextUrl.clone()
    url.pathname = sessionVerified ? '/create-store' : '/auth/login'
    return NextResponse.redirect(url)
  }

  // 1. User is trying to access a protected path (e.g., /admin)
  if (isProtectedPath) {
    if (!sessionVerified) {
      // Not authenticated -> Redirect to sign-in
      const url = request.nextUrl.clone()
      url.pathname = '/sign-in'
      url.searchParams.set('redirect', pathname) // Add redirect param
      return NextResponse.redirect(url)
    }
    // Authenticated -> Allow access
    return NextResponse.next()
  }

  // 2. User is authenticated and trying to access a public auth path (e.g., /sign-in)
  if (isPublicPath) {
    if (sessionVerified) {
      // Authenticated -> Redirect to dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
    // Not authenticated -> Allow access to public path (e.g., sign-in page)
    return NextResponse.next()
  }

  // Allow the request to proceed if no specific logic applies
  return NextResponse.next()
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
