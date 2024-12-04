import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for auth cookie/token
    const session = request.cookies.get('session');
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify admin status if needed
    // You'll need to implement your own admin verification logic
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/test/:path*'],
};