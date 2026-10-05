import { NextRequest, NextResponse } from 'next/server';
import { localeOf } from '@/lib/i18n';
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set('x-neverstop-locale', localeOf(request.nextUrl.pathname.split('/')[1]));
  const response=NextResponse.next({ request: { headers } });
  if(/^\/(admin|q|payment|order)(\/|$)/.test(request.nextUrl.pathname)){
    response.headers.set('Cache-Control','no-store');
    response.headers.set('Referrer-Policy','no-referrer');
    response.headers.set('X-Robots-Tag','noindex, nofollow');
  }
  return response;
}
export const config = { matcher: ['/((?!api|_next|favicon.ico|robots.txt|sitemap.xml).*)'] };
