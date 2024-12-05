import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Force HTTPS on Heroku (Check if the protocol is HTTP)
  if (request.headers.get('x-forwarded-proto') !== 'https') {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = 'https';
    return NextResponse.redirect(httpsUrl);
  }

  // Authentication logic for /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for auth cookie/token
    const session = request.cookies.get('session');

    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Add optional admin verification logic here
  }

  return NextResponse.next();
}

// Configure the matcher for paths
export const config = {
  matcher: ['/admin/:path*', '/test/:path*'],
};
