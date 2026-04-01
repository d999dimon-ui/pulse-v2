import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin routes that require authentication
const ADMIN_ROUTES = ['/admin-pulse-master'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if accessing admin routes
  const isAdminRoute = ADMIN_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  if (isAdminRoute) {
    // Get admin token from cookies
    const adminToken = request.cookies.get('admin_token')?.value;
    
    // If no token, redirect to login
    if (!adminToken) {
      const loginUrl = new URL('/admin-pulse-master/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Verify token format (basic check)
    if (!adminToken.match(/^[a-f0-9]{64}$/)) {
      const loginUrl = new URL('/admin-pulse-master/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Block access to login page if already authenticated
  if (pathname === '/admin-pulse-master/login') {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin-pulse-master', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin-pulse-master/:path*',
  ],
};
