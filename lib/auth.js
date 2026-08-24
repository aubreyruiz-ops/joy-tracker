export const AUTH_COOKIE = 'joy_auth'

export async function expectedAuthToken() {
  const password = process.env.SITE_PASSWORD
  const secret = process.env.AUTH_SECRET
  if (!password || !secret) return null
  const data = new TextEncoder().encode(`${password}:${secret}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}
