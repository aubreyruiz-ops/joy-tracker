import { NextResponse } from 'next/server'
import { AUTH_COOKIE, expectedAuthToken } from './lib/auth'

export const config = {
  matcher: ['/((?!api/login|_next/static|_next/image|favicon.ico).*)'],
}

export async function middleware(request) {
  const token = request.cookies.get(AUTH_COOKIE)?.value
  const expected = await expectedAuthToken()

  if (expected && token === expected) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }

  const loginUrl = new URL('/login', request.url)
  return NextResponse.redirect(loginUrl)
}
