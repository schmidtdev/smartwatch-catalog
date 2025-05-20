export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/admin/:path*'], // Match all paths under /admin/
}; 