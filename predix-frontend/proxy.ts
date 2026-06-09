import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const USER_PROTECTED = [
  '/home', '/rooms', '/matches', '/predictions',
  '/leaderboard', '/rewards', '/profile', '/chat',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('predix_token')?.value;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const isUserProtected = USER_PROTECTED.some(p => pathname.startsWith(p));
  if (isUserProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    '/rooms/:path*',
    '/matches/:path*',
    '/predictions/:path*',
    '/leaderboard/:path*',
    '/rewards/:path*',
    '/profile/:path*',
    '/chat/:path*',
    '/admin',
    '/admin/:path*',
  ],
};
