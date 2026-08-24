import { NextResponse } from 'next/server'
import { AUTH_COOKIE, expectedAuthToken } from '../../../lib/auth'

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}))
  const sitePassword = process.env.SITE_PASSWORD

  if (!sitePassword || !process.env.AUTH_SECRET) {
    return NextResponse.json({ error: 'Site password is not configured.' }, { status: 500 })
  }
  if (password !== sitePassword) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
  }

  const token = await expectedAuthToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
