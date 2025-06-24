import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role

    // Admin only routes
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    // Agent only routes
    if (pathname.startsWith('/agent') && role !== 'AGENT') {
      return new Response('Unauthorized', { status: 401 })
    }

    // User dashboard (accessible by all authenticated users)
    if (pathname.startsWith('/dashboard') && !role) {
      return new Response('Unauthorized', { status: 401 })
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/agent/:path*']
}
