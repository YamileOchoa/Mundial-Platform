import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/home', '/rooms', '/predictions', '/leaderboard', '/rewards', '/profile', '/chat'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const token = request.cookies.get('predix_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home/:path*', '/rooms/:path*', '/predictions/:path*', '/leaderboard/:path*', '/rewards/:path*', '/profile/:path*', '/chat/:path*'],
};
