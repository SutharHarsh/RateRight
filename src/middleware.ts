import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/api/stripe/(.*)',
  '/api/trpc/(.*)',
]);

const clerkEnabled =
  typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'string' &&
  typeof process.env.CLERK_SECRET_KEY === 'string' &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_key_here') &&
  !process.env.CLERK_SECRET_KEY.includes('your_key_here');

const clerkProtectedMiddleware = clerkMiddleware((auth, req) => {
  try {
    if (isProtectedRoute(req)) {
      auth().protect();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    const isAuthTokenIssue =
      message.includes('token-iat-in-the-future') ||
      message.includes('clock skew') ||
      message.includes('infinite redirect loop');

    if (isAuthTokenIssue) {
      if (req.nextUrl.pathname.startsWith('/api')) {
        const res = NextResponse.json(
          { error: 'Authentication session invalid. Please sign in again.' },
          { status: 401 }
        );
        res.cookies.delete('__session');
        res.cookies.delete('__client_uat');
        return res;
      }

      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('reauth', '1');
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('__session');
      res.cookies.delete('__client_uat');
      return res;
    }

    throw error;
  }

  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { status: 200 });
  }

  const response = NextResponse.next();
  const allowedOrigins = [
    'https://rateright.com',
    'https://www.rateright.com',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
  ].filter(Boolean);

  const origin = req.headers.get('origin');
  if (origin && allowedOrigins.includes(origin) && req.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
});

export default clerkEnabled
  ? clerkProtectedMiddleware
  : function middleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
