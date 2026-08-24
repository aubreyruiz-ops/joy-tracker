'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      window.location.href = '/'
      return
    }
    const data = await res.json().catch(() => ({}))
    setError(data.error || 'Something went wrong.')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F9FB', fontFamily: '-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif' }}>
      <form onSubmit={submit} style={{ background: '#fff', padding: 40, borderRadius: 22, width: 360, maxWidth: '90vw', boxShadow: '0 32px 80px rgba(0,0,0,0.12)' }}>
        <h1 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24, color: '#111118', letterSpacing: '-0.03em' }}>Joy Life — Event Tracker</h1>
        <label style={{ display: 'block', fontSize: 12, color: '#71717A', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Password</label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E4E4E7', fontSize: 14, marginBottom: 16, fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
        {error && <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none', background: '#330066', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  )
}
