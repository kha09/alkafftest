import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Role-based access control for authenticated users
    if (token) {
      const userRole = token.role as string

      // Admin routes - only admins can access
      if (pathname.startsWith('/dashboard') && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Agent routes - only agents can access
      if (pathname.startsWith('/agentdash') && userRole !== 'agent') {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Student routes - only students can access
      if (pathname.startsWith('/student') && userRole !== 'student') {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Redirect authenticated users away from login page
      if (pathname === '/login') {
        switch (userRole) {
          case 'admin':
            return NextResponse.redirect(new URL('/dashboard', req.url))
          case 'agent':
            return NextResponse.redirect(new URL('/agentdash', req.url))
          case 'student':
            return NextResponse.redirect(new URL('/student', req.url))
          default:
            return NextResponse.redirect(new URL('/', req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to public routes
        if (
          pathname === '/' ||
          pathname.startsWith('/universities') ||
          pathname.startsWith('/programs') ||
          pathname.startsWith('/api/universities') ||
          pathname.startsWith('/api/programs') ||
          pathname.startsWith('/api/departments') ||
          pathname.startsWith('/api/homepage') ||
          pathname.startsWith('/api/content') ||
          pathname.startsWith('/api/form-submissions') ||
          pathname.startsWith('/api/whatsapp-settings') ||
          pathname.startsWith('/api/auth') ||
          pathname === '/login' ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon') ||
          pathname.startsWith('/images') ||
          pathname.startsWith('/placeholder')
        ) {
          return true
        }

        // For protected routes, require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images|placeholder).*)',
  ],
}
