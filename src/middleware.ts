import { NextRequest, NextResponse } from 'next/server';

// Middleware runs in Edge Runtime — no firebase-admin allowed here.
// Token verification (via firebase-admin) happens in each Route Handler
// using getAuthenticatedUserId(request). This middleware handles:
//   1. Stripping any client-supplied x-user-id headers (spoof prevention)
//   2. Early 401 for API routes with no Authorization header at all
//   3. Redirecting unauthenticated page navigations to /login

const PUBLIC_PAGE_ROUTES = ['/'];
const PUBLIC_API_ROUTES = ['/api/v1/health', '/api/v1/auth/verify', '/api/v1/auth/session'];

function isPublic(pathname: string) {
  if (PUBLIC_API_ROUTES.includes(pathname)) return true;
  return PUBLIC_PAGE_ROUTES.some(
    (p) => pathname === p || (p !== '/' && pathname.startsWith(p + '/'))
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always strip any client-supplied x-user-id to prevent spoofing
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-user-id');

  if (isPublic(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const isApiRoute = pathname.startsWith('/api/');
  const hasHeaderAuth = !!request.headers.get('authorization');
  const hasCookieAuth = !!request.cookies.get('session')?.value;

  if (!hasHeaderAuth && !hasCookieAuth) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Page route — redirect to landing with ?auth=login so modal opens
    return NextResponse.redirect(new URL('/?auth=login', request.url));
  }

  // Pass through; route handlers re-verify the bearer token.
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
