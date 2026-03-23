'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const fmt = n => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const today = () => new Date().toISOString().slice(0, 10)
const fmtTime = ts => {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const C = {
  purple: '#330066',
  purpleLight: '#F5EEFF',
  purpleMid: '#6B21A8',
  white: '#FFFFFF',
  offWhite: '#F9F9FB',
  cream: '#FAF8F5',
  ink: '#111118',
  inkMid: '#444455',
  inkLight: '#888899',
  inkFaint: '#BBBBCC',
  border: '#EBEBF0',
  borderLight: '#F3F3F7',
  shadow: '0 2px 12px rgba(51,0,102,0.06)',
  shadowMd: '0 4px 24px rgba(51,0,102,0.10)',
  green: '#059669', greenLight: '#ECFDF5',
  red: '#DC2626', redLight: '#FEF2F2',
  amber: '#B45309', amberLight: '#FFFBEB',
  blue: '#1D4ED8', blueLight: '#EFF6FF',
}

const inputSt = {
  width: '100%', fontSize: 14, fontFamily: 'inherit', padding: '10px 14px',
  border: `1.5px solid ${C.border}`, borderRadius: 12, background: C.white,
  color: C.ink, boxSizing: 'border-box', outline: 'none',
  transition: 'border-color 0.15s',
}

// ── Static components (outside App to prevent re-render focus loss) ───────────

const JoyLogo = ({ size = 28 }) => (
  <svg width={size * 1.59} height={size} viewBox="0 0 148 93" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.6032 71.2595C18.6881 71.0957 18.8298 70.9693 19.0012 70.9043C23.777 68.6141 27.8447 61.652 32.0576 43.6969C32.2661 42.7953 32.9924 39.5851 33.8962 35.5906C35.7475 27.4081 38.3434 15.9345 38.7583 14.2725C42.6262 -2.96803 55.9186 -0.439658 60.0952 1.11767C60.5585 1.64449C60.5872 1.76382 60.5864 1.88842 60.5563 2.00739C60.5262 2.12635 60.4676 2.23605 60.3857 2.32689C58.9875 3.92086 57.335 7.89663 55.0833 17.3689C53.8848 22.4073 49.5266 40.5272 47.9468 47.0863C43.3525 66.3423 28.7889 71.6555 19.3644 72.3517C19.183 72.3769 18.9987 72.3337 18.8468 72.2304C18.695 72.1271 18.5862 71.971 18.5412 71.7919C18.4963 71.6128 18.5184 71.4232 18.6032 71.2595Z" fill="white"/>
    <path d="M142.428 19.9888C148.221 21.8576 148.149 28.087 147.295 32.0994C145.796 38.3947 143.399 44.4368 140.177 50.0361C138.877 50.0368C138.791 49.8807 138.762 49.6986 138.797 49.5231C139.807 43.039 138.521 36.4029 135.165 30.7802C130.552 23.1585 138.306 18.6514 142.428 19.9888Z" fill="white"/>
    <path d="M102.751 25.6501C107.145 21.2896 121.945 12.9533 127.302 35.3789C129.423 43.8205 129.315 52.6756 126.989 61.0622C124.664 69.4488 120.201 77.0744 114.046 83.1797C112.793 82.4468C117.078 66.1956 114.409 27.2991 103.205 26.9326C102.548 26.0175C102.58 25.8781 102.65 25.7506 102.751 25.6501Z" fill="white"/>
    <path d="M106.165 88.0715C106.336 88.035 106.515 88.0608 106.67 88.1442C106.824 88.2276 106.944 88.3634 107.01 88.5276C107.075 88.6917 107.08 88.8738 107.025 89.0417C106.97 89.2097 106.859 89.3527 106.71 89.4456C103.381 91.9224 99.3102 93.1707 95.1785 92.9817C84.2831 92.487 83.8291 83.8209 87.0251 79.7535C94.4159 76.6572C92.9813 81.4757 96.6676 89.7754 106.165 88.0715Z" fill="white"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M61.3845 28.7281C67.3615 23.5257 74.9733 20.6303 82.8667 20.5567C95.1967 20.5567 104.04 28.5083 104.04 40.7104C103.886 45.2095 102.82 49.6292 100.909 53.6971C98.9978 57.765 96.2813 61.395 92.9268 64.3635C87.1036 69.534 79.6194 72.3982 71.8623 72.4249C59.1147 72.4249 50.362 64.3635 50.362 52.0514C50.5649 47.6186 51.6446 43.2716 53.5376 39.2661C55.4306 35.2606 58.0986 31.6777 61.3845 28.7281ZM74.2048 67.6797C80.9237 64.107 85.4635 46.7382 86.208 43.8617C87.1704 40.5272 90.0577 20.4651 80.4334 25.1921C73.9602 28.4489 69.549 44.7978 68.5208 48.6084L68.4121 49.0101C67.1954 53.8469 64.4897 72.7364 74.2048 67.6797Z" fill="white"/>
    <path d="M2.60361 66.0857C2.69221 66.2091 2.81591 66.3024 2.95829 66.3532C3.40076 66.3701C3.54655 66.3304 3.6769 66.2468 3.77453 66.1306C3.87216 66.0144 3.93244 65.8709 3.94738 65.7193C4.12897 62.6046 7.45208 58.8487 13.1359 59.2701C17.149 59.5816 19.201 53.1507 15.8779 49.7613C11.7739 45.5656 5.67249 47.2146 2.60361 51.5934C-1.64561 57.6578 0.00686236 62.8245 2.60361 66.0857Z" fill="white"/>
  </svg>
)

const Pill = ({ children, color = C.inkLight, bg = C.borderLight, size = 11 }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: size, padding: '3px 10px', borderRadius: 999, fontWeight: 600, background: bg, color, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>{children}</span>
)

const StatusPill = ({ status }) => {
  const map = {
    Paid: { bg: C.greenLight, color: C.green },
    Pending: { bg: C.amberLight, color: C.amber },
    Partial: { bg: C.blueLight, color: C.blue },
    waived: { bg: C.borderLight, color: C.inkLight },
  }
  const s = map[status] || map.waived
  return <Pill bg={s.bg} color={s.color}>{status}</Pill>
}

const CategoryPill = ({ cat }) => (
  <Pill bg={C.purpleLight} color={C.purpleMid}>{cat}</Pill>
)

const Btn = ({ children, onClick, variant = 'ghost', size = 'md', danger }) => {
  const sizes = { sm: { fontSize: 12, padding: '5px 12px', borderRadius: 8 }, md: { fontSize: 13, padding: '9px 20px', borderRadius: 10 } }
  const variants = {
    primary: { background: C.purple, color: '#fff', border: 'none' },
    ghost: { background: C.offWhite, color: C.inkMid, border: `1px solid ${C.border}` },
    text: { background: 'transparent', color: C.purple, border: 'none', padding: 0 },
  }
  const v = danger ? { background: C.redLight, color: C.red, border: 'none' } : variants[variant]
  return (
    <button style={{ ...sizes[size], ...v, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}
      onClick={onClick}>{children}</button>
  )
}

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 12, color: C.inkLight, marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</label>
    {hint && <div style={{ fontSize: 11, color: C.inkFaint, marginBottom: 6 }}>{hint}</div>}
    {children}
  </div>
)

const Card = ({ children, onClick, noPad, style = {} }) => (
  <div onClick={onClick} style={{
    background: C.white, borderRadius: 18, border: `1px solid ${C.border}`,
    padding: noPad ? 0 : '20px 24px', cursor: onClick ? 'pointer' : 'default',
    boxShadow: C.shadow, transition: 'box-shadow 0.2s, transform 0.2s', overflow: 'hidden', ...style
  }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = C.shadowMd; e.currentTarget.style.transform = 'translateY(-1px)' } }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = C.shadow; e.currentTarget.style.transform = 'translateY(0)' }}>
    {children}
  </div>
)

const StatCard = ({ label, value, color, sub, onClick }) => (
  <div onClick={onClick} style={{
    background: C.white, borderRadius: 18, padding: '22px 24px', border: `1px solid ${C.border}`,
    boxShadow: C.shadow, cursor: onClick ? 'pointer' : 'default', transition: 'box-shadow 0.2s'
  }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.boxShadow = C.shadowMd }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = C.shadow }}>
    <div style={{ fontSize: 11, color: C.inkFaint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color: color || C.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: C.inkFaint, marginTop: 6 }}>{sub}</div>}
  </div>
)

const SectionTitle = ({ children, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 8 }}>
    <h2 style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: 0, letterSpacing: '-0.02em' }}>{children}</h2>
    {action}
  </div>
)

const BackLink = ({ label, onClick }) => (
  <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.inkLight, fontFamily: 'inherit', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24, padding: 0, letterSpacing: '-0.01em' }}>
    <span style={{ fontSize: 16 }}>←</span> {label}
  </button>
)

const DataTable = ({ headers, rows, empty = 'Nothing here yet' }) => (
  <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: C.shadow }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ background: C.offWhite }}>
          {headers.map((h, i) => (
            <th key={i} style={{ textAlign: 'left', padding: '11px 18px', color: C.inkFaint, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length > 0 ? rows : (
          <tr><td colSpan={headers.length} style={{ padding: '36px 18px', textAlign: 'center', color: C.inkFaint, fontSize: 13 }}>{empty}</td></tr>
        )}
      </tbody>
    </table>
  </div>
)

const TD = ({ children, bold, faint, color, right, nowrap }) => (
  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${C.borderLight}`, fontWeight: bold ? 700 : 400, color: faint ? C.inkFaint : color || C.ink, fontSize: 13, textAlign: right ? 'right' : 'left', whiteSpace: nowrap ? 'nowrap' : 'normal' }}>{children}</td>
)

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [data, setData] = useState({ clients: [], events: [], expenses: [], invoices: [], sponsors: [] })
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [clientDetail, setClientDetail] = useState(null)
  const [eventDetail, setEventDetail] = useState(null)
  const [form, setForm] = useState({})
  const [showPending, setShowPending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [c, e, ex, i, s] = await Promise.all([
      supabase.from('clients').select('*').order('name'),
      supabase.from('events').select('*').order('date', { ascending: false }),
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('invoices').select('*').order('date', { ascending: false }),
      supabase.from('sponsors').select('*').order('date', { ascending: false }),
    ])
    setData({ clients: c.data||[], events: e.data||[], expenses: ex.data||[], invoices: i.data||[], sponsors: s.data||[] })
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const gc = id => data.clients.find(c => c.id === id) || { service_rate: 10, gcio_style: false, name: '?' }
  const ge = id => data.events.find(e => e.id === id) || { commission_waived: false, name: '?' }
  const cName = id => gc(id).name
  const eName = id => ge(id).name
  const isGcio = id => !!gc(id).gcio_style
  const rate = id => gc(id).service_rate / 100

  const evtSpent = eid => data.expenses.filter(e => e.event_id === eid).reduce((a,e) => a+Number(e.amount), 0)
  const evtGross = eid => { const ev = ge(eid); if (ev.commission_waived) return 0; if (ev.commission_override != null) return Number(ev.commission_override); return evtSpent(eid) * rate(ev.client_id) }
  const evtJoy = eid => data.sponsors.filter(s => s.event_id === eid && s.joy_contribution).reduce((a,s) => a+Number(s.amount), 0)
  const evtNet = eid => evtGross(eid) - evtJoy(eid)
  const evtAllSp = eid => data.sponsors.filter(s => s.event_id === eid).reduce((a,s) => a+Number(s.amount), 0)
  const evtSurplus = eid => { const ev = ge(eid); if (!isGcio(ev.client_id)) return null; return evtAllSp(eid) - evtSpent(eid) - evtNet(eid) }
  const cliSpent = cid => data.expenses.filter(e => e.client_id === cid).reduce((a,e) => a+Number(e.amount), 0)
  const cliNet = cid => data.events.filter(e => e.client_id === cid).reduce((a,ev) => a+evtNet(ev.id), 0)
  const cliSurplus = cid => { if (!isGcio(cid)) return null; return data.events.filter(e => e.client_id === cid).reduce((a,ev) => a+(evtSurplus(ev.id)||0), 0) }
  const cliExtSp = cid => data.sponsors.filter(s => s.client_id === cid && !s.joy_contribution).reduce((a,s) => a+Number(s.amount), 0)

  const openModal = (type, defaults = {}) => { setModal(type); setForm({ date: today(), status: 'Pending', category: 'Misc', service_rate: 10, ...defaults }) }
  const closeModal = () => { setModal(null); setForm({}) }
  const sf = (k,v) => setForm(f => ({ ...f, [k]: v }))

  const del = async (table, id) => {
    if (!confirm('Delete this record?')) return
    await supabase.from(table).delete().eq('id', id)
    await load()
  }

  const save = async () => {
    if (modal === 'addClient') {
      await supabase.from('clients').insert({ name: form.name, contact: form.contact||'', service_rate: Number(form.service_rate)||10, gcio_style: !!form.gcio_style })
    } else if (modal === 'addEvent') {
      await supabase.from('events').insert({ client_id: form.client_id, name: form.name, date: form.date, city: form.city||'', location: form.location||'', commission_waived: !!form.commission_waived })
    } else if (modal === 'editEvent') {
      await supabase.from('events').update({ name: form.name, commission_waived: !!form.commission_waived, commission_override: form.commission_override!=null&&form.commission_override!=='' ? Number(form.commission_override) : null }).eq('id', form.id)
    } else if (modal === 'addExpense' || modal === 'editExpense') {
      const d = { description: form.description||'', amount: Number(form.amount)||0, date: form.date, category: form.category, vendor: form.vendor||'', receipt_url: form.receipt_url||null }
      if (form.id) { await supabase.from('expenses').update(d).eq('id', form.id) }
      else { await supabase.from('expenses').insert({ ...d, client_id: form.client_id, event_id: form.event_id }) }
    } else if (modal === 'addInvoice' || modal === 'editInvoice') {
      const d = { amount: Number(form.amount)||0, date: form.date, status: form.status, notes: form.notes||'' }
      if (form.id) { await supabase.from('invoices').update(d).eq('id', form.id) }
      else { await supabase.from('invoices').insert({ ...d, client_id: form.client_id, event_id: form.event_id }) }
    } else if (modal === 'addSponsor' || modal === 'editSponsor') {
      const d = { sponsor_name: form.sponsor_name||'', amount: Number(form.amount)||0, date: form.date, status: form.status, joy_contribution: !!form.joy_contribution, notes: form.notes||'' }
      if (form.id) { await supabase.from('sponsors').update(d).eq('id', form.id) }
      else { await supabase.from('sponsors').insert({ ...d, client_id: form.client_id, event_id: form.event_id }) }
    }
    closeModal(); await load()
  }

  const clientEvents = form.client_id ? data.events.filter(e => e.client_id === form.client_id) : []
  const navTo = p => { setPage(p); setClientDetail(null); setEventDetail(null) }

  const wrap = { padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }
  const grid4 = { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }

  // ── Dashboard ───────────────────────────────────────────────────────────────
  const renderDashboard = () => {
    const totalNet = data.clients.reduce((a,c) => a+cliNet(c.id), 0)
    const totalSpent = data.expenses.reduce((a,e) => a+Number(e.amount), 0)
    const pendingInvs = data.invoices.filter(i => i.status==='Pending' && Number(i.amount)>0)
    const pendingTotal = pendingInvs.reduce((a,i) => a+Number(i.amount), 0)
    const extSponsor = data.sponsors.filter(s => !s.joy_contribution).reduce((a,s) => a+Number(s.amount), 0)
    return (
      <div style={wrap}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: C.ink, margin: '0 0 4px', letterSpacing: '-0.04em' }}>Overview</h1>
          <p style={{ fontSize: 14, color: C.inkLight, margin: 0 }}>All clients · {data.events.length} events tracked</p>
        </div>
        <div style={grid4}>
          <StatCard label="Joy's net commission" value={fmt(totalNet)} color={C.purple} />
          <StatCard label="Total spent (fronted)" value={fmt(totalSpent)} color={C.red} />
          <StatCard label="Pending invoices" value={fmt(pendingTotal)} color={pendingTotal > 0 ? C.amber : C.ink}
            sub={pendingInvs.length > 0 ? `${pendingInvs.length} invoice${pendingInvs.length > 1 ? 's' : ''} outstanding — click to view` : 'All paid up'}
            onClick={pendingTotal > 0 ? () => setShowPending(v => !v) : null} />
          <StatCard label="External sponsor income" value={fmt(extSponsor)} color={C.blue} />
        </div>

        {showPending && pendingTotal > 0 && (
          <Card noPad style={{ marginBottom: 28, border: `1.5px solid ${C.amberLight}` }}>
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: C.amber }}>Outstanding invoices</span>
              <button onClick={() => setShowPending(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.inkFaint, fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
            </div>
            <DataTable
              headers={['Client', 'Event', 'Amount', 'Notes']}
              rows={[
                ...pendingInvs.map(i => (
                  <tr key={i.id} style={{ cursor: 'pointer' }}
                    onClick={() => { setPage('clients'); setClientDetail(data.clients.find(c => c.id === i.client_id)); setShowPending(false) }}
                    onMouseEnter={e => e.currentTarget.style.background = C.offWhite}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <TD>{cName(i.client_id)}</TD>
                    <TD faint>{eName(i.event_id)}</TD>
                    <TD bold color={C.amber}>{fmt(i.amount)}</TD>
                    <TD faint>{i.notes}</TD>
                  </tr>
                )),
                <tr key="total" style={{ background: C.amberLight }}>
                  <td colSpan={2} style={{ padding: '12px 18px', fontWeight: 800, color: C.amber, fontSize: 13 }}>Total outstanding</td>
                  <td style={{ padding: '12px 18px', fontWeight: 800, color: C.amber, fontSize: 13 }}>{fmt(pendingTotal)}</td>
                  <td style={{ padding: '12px 18px' }} />
                </tr>
              ]}
            />
          </Card>
        )}

        <SectionTitle action={<Btn size="sm" onClick={load}>↻ Refresh</Btn>}>Clients</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.clients.map(c => {
            const surplus = cliSurplus(c.id)
            const jc = data.sponsors.filter(s => s.client_id === c.id && s.joy_contribution).reduce((a,s) => a+Number(s.amount), 0)
            const waived = data.events.filter(e => e.client_id === c.id && e.commission_waived).length
            const pending = data.invoices.filter(i => i.client_id === c.id && i.status === 'Pending' && Number(i.amount) > 0).reduce((a,i) => a+Number(i.amount), 0)
            return (
              <Card key={c.id} onClick={() => { setClientDetail(c); setPage('clients') }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>{c.name}</span>
                      <Pill bg={C.purpleLight} color={C.purpleMid}>{c.service_rate}%</Pill>
                      {c.gcio_style && <Pill bg={C.blueLight} color={C.blue}>GCIO</Pill>}
                      {pending > 0 && <Pill bg={C.amberLight} color={C.amber}>{fmt(pending)} pending</Pill>}
                      {waived > 0 && <Pill bg={C.borderLight} color={C.inkLight}>{waived} waived</Pill>}
                    </div>
                    <div style={{ fontSize: 13, color: C.inkFaint, marginTop: 5 }}>
                      {data.events.filter(e => e.client_id === c.id).length} events
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 32, textAlign: 'right', flexShrink: 0 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.red, letterSpacing: '-0.02em' }}>{fmt(cliSpent(c.id))}</div>
                      <div style={{ fontSize: 11, color: C.inkFaint, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>spent</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.purple, letterSpacing: '-0.02em' }}>{fmt(cliNet(c.id))}{jc > 0 && <span style={{ fontSize: 11, color: C.red, marginLeft: 4 }}>(-{fmt(jc)})</span>}</div>
                      <div style={{ fontSize: 11, color: C.inkFaint, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>commission</div>
                    </div>
                    {c.gcio_style
                      ? <div><div style={{ fontSize: 15, fontWeight: 800, color: (surplus||0) >= 0 ? C.green : C.red, letterSpacing: '-0.02em' }}>{fmt(surplus||0)}</div><div style={{ fontSize: 11, color: C.inkFaint, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>surplus</div></div>
                      : <div><div style={{ fontSize: 15, fontWeight: 800, color: C.blue, letterSpacing: '-0.02em' }}>{fmt(cliExtSp(c.id))}</div><div style={{ fontSize: 11, color: C.inkFaint, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>sponsors</div></div>
                    }
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Client detail ────────────────────────────────────────────────────────────
  const renderClientDetail = client => {
    const events = data.events.filter(e => e.client_id === client.id).sort((a,b) => b.date?.localeCompare(a.date))
    const surplus = cliSurplus(client.id)
    return (
      <div style={wrap}>
        <BackLink label="All clients" onClick={() => setClientDetail(null)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.ink, margin: 0, letterSpacing: '-0.04em' }}>{client.name}</h1>
          <Pill bg={C.purpleLight} color={C.purpleMid}>{client.service_rate}% commission</Pill>
          {client.gcio_style && <Pill bg={C.blueLight} color={C.blue}>GCIO-style</Pill>}
        </div>
        <div style={grid4}>
          <StatCard label="Total spent" value={fmt(cliSpent(client.id))} color={C.red} />
          <StatCard label="Joy net commission" value={fmt(cliNet(client.id))} color={C.purple} />
          {client.gcio_style
            ? <><StatCard label="Total sponsor income" value={fmt(data.sponsors.filter(s => s.client_id === client.id).reduce((a,s) => a+Number(s.amount),0))} color={C.blue} />
               <StatCard label={`Surplus to ${client.name}`} value={fmt(surplus||0)} color={(surplus||0) >= 0 ? C.green : C.red} /></>
            : <><StatCard label="Events" value={events.length} /><div /></>
          }
        </div>
        <SectionTitle action={<Btn size="sm" onClick={() => openModal('addEvent', { client_id: client.id })}>+ Add event</Btn>}>
          Events ({events.length})
        </SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.map(ev => {
            const surplus = evtSurplus(ev.id)
            const hasUnpaid = data.invoices.some(i => i.event_id === ev.id && i.status === 'Pending' && Number(i.amount) > 0)
            return (
              <Card key={ev.id} onClick={() => setEventDetail(ev)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{ev.name}</span>
                      {ev.commission_waived && <Pill bg={C.borderLight} color={C.inkLight}>waived</Pill>}
                      {hasUnpaid && <Pill bg={C.amberLight} color={C.amber}>unpaid invoice</Pill>}
                    </div>
                    <div style={{ fontSize: 13, color: C.inkFaint }}>{ev.date} · {ev.city}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 28, textAlign: 'right', flexShrink: 0 }}>
                    <div><div style={{ fontSize: 14, fontWeight: 800, color: C.red }}>{fmt(evtSpent(ev.id))}</div><div style={{ fontSize: 11, color: C.inkFaint, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>spent</div></div>
                    <div><div style={{ fontSize: 14, fontWeight: 800, color: C.purple }}>{fmt(evtNet(ev.id))}</div><div style={{ fontSize: 11, color: C.inkFaint, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>commission</div></div>
                    {client.gcio_style && surplus !== null && <div><div style={{ fontSize: 14, fontWeight: 800, color: surplus >= 0 ? C.green : C.red }}>{fmt(surplus)}</div><div style={{ fontSize: 11, color: C.inkFaint, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>surplus</div></div>}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Event detail ─────────────────────────────────────────────────────────────
  const renderEventDetail = event => {
    const client = gc(event.client_id)
    const gcio = client.gcio_style
    const spent = evtSpent(event.id), gross = evtGross(event.id), jc = evtJoy(event.id), net = evtNet(event.id)
    const allSp = evtAllSp(event.id), surplus = evtSurplus(event.id)
    const exps = data.expenses.filter(e => e.event_id === event.id)
    const invs = data.invoices.filter(i => i.event_id === event.id)
    const spons = data.sponsors.filter(s => s.event_id === event.id)
    const commLabel = event.commission_waived ? 'waived' : event.commission_override != null ? 'fixed' : `${Math.round(rate(event.client_id)*100)}%`

    return (
      <div style={wrap}>
        <BackLink label={client.name} onClick={() => setEventDetail(null)} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: C.ink, margin: '0 0 8px', letterSpacing: '-0.03em' }}>{event.name}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Pill bg={C.borderLight} color={C.inkMid}>{event.date}</Pill>
              <Pill bg={C.borderLight} color={C.inkMid}>{event.city}</Pill>
              {event.commission_waived && <Pill bg={C.borderLight} color={C.inkLight}>commission waived</Pill>}
            </div>
          </div>
          <Btn size="sm" onClick={() => openModal('editEvent', { id: event.id, name: event.name, commission_waived: event.commission_waived, commission_override: event.commission_override })}>Edit event</Btn>
        </div>

        <div style={grid4}>
          <StatCard label="Spent (fronted)" value={fmt(spent)} color={C.red} />
          <StatCard label={`Gross commission (${commLabel})`} value={fmt(gross)} color={C.inkFaint} />
          {jc > 0 ? <StatCard label="Joy contribution (deducted)" value={'-' + fmt(jc)} color={C.red} /> : <div />}
          <StatCard label="Joy net commission" value={fmt(net)} color={C.purple} />
        </div>

        {gcio && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <StatCard label="All sponsor income" value={fmt(allSp)} color={C.blue} />
              <StatCard label="Surplus to Global CIO" value={fmt(surplus||0)} color={(surplus||0) >= 0 ? C.green : C.red} />
            </div>
            <div style={{ background: C.purpleLight, borderRadius: 12, padding: '12px 18px', marginBottom: 24, fontSize: 13, color: C.purpleMid, borderLeft: `3px solid ${C.purple}` }}>
              {fmt(allSp)} sponsors − {fmt(spent)} expenses − {fmt(net)} net commission = <strong>{fmt(surplus||0)} to Global CIO</strong>
            </div>
          </>
        )}

        {/* Expenses */}
        <SectionTitle action={<Btn size="sm" onClick={() => openModal('addExpense', { client_id: event.client_id, event_id: event.id })}>+ Add expense</Btn>}>
          Expenses
        </SectionTitle>
        <div style={{ marginBottom: 32 }}>
          <DataTable
            headers={['Date', 'Category', 'Vendor', 'Description', 'Amount', 'Receipt', 'Modified', '']}
            rows={exps.map(e => (
              <tr key={e.id} onMouseEnter={ev => ev.currentTarget.style.background = C.offWhite} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
                <TD faint nowrap>{e.date}</TD>
                <TD><CategoryPill cat={e.category} /></TD>
                <TD>{e.vendor}</TD>
                <TD faint>{e.description}</TD>
                <TD bold>{fmt(e.amount)}</TD>
                <TD>{e.receipt_url ? <a href={e.receipt_url} target="_blank" rel="noreferrer" style={{ color: C.purple, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>View ↗</a> : <span style={{ color: C.inkFaint }}>—</span>}</TD>
                <TD faint nowrap>{fmtTime(e.updated_at)}</TD>
                <td style={{ padding: '8px 18px', borderBottom: `1px solid ${C.borderLight}`, whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn size="sm" onClick={() => openModal('editExpense', { id: e.id, client_id: e.client_id, event_id: e.event_id, description: e.description, amount: e.amount, date: e.date, category: e.category, vendor: e.vendor, receipt_url: e.receipt_url })}>Edit</Btn>
                    <Btn size="sm" danger onClick={() => del('expenses', e.id)}>Delete</Btn>
                  </div>
                </td>
              </tr>
            ))}
          />
        </div>

        {/* Invoices */}
        <SectionTitle action={<Btn size="sm" onClick={() => openModal('addInvoice', { client_id: event.client_id, event_id: event.id })}>+ Add invoice</Btn>}>
          Invoices sent
        </SectionTitle>
        <div style={{ marginBottom: 32 }}>
          <DataTable
            headers={['Date', 'Amount', 'Status', 'Notes', 'Modified', '']}
            rows={invs.map(i => (
              <tr key={i.id} onMouseEnter={ev => ev.currentTarget.style.background = C.offWhite} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
                <TD faint nowrap>{i.date}</TD>
                <TD bold>{fmt(i.amount)}</TD>
                <TD><StatusPill status={i.status} /></TD>
                <TD faint>{i.notes}</TD>
                <TD faint nowrap>{fmtTime(i.updated_at)}</TD>
                <td style={{ padding: '8px 18px', borderBottom: `1px solid ${C.borderLight}`, whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn size="sm" onClick={() => openModal('editInvoice', { id: i.id, amount: i.amount, date: i.date, status: i.status, notes: i.notes })}>Edit</Btn>
                    <Btn size="sm" danger onClick={() => del('invoices', i.id)}>Delete</Btn>
                  </div>
                </td>
              </tr>
            ))}
          />
        </div>

        {/* Sponsors */}
        {(gcio || spons.length > 0) && (
          <>
            <SectionTitle action={<Btn size="sm" onClick={() => openModal('addSponsor', { client_id: event.client_id, event_id: event.id })}>+ Add sponsor</Btn>}>
              Sponsor payments
            </SectionTitle>
            <DataTable
              headers={['Date', 'Sponsor', 'Amount', 'Status', 'Type', 'Notes', '']}
              rows={spons.map(sp => (
                <tr key={sp.id} onMouseEnter={ev => ev.currentTarget.style.background = C.offWhite} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
                  <TD faint nowrap>{sp.date}</TD>
                  <TD bold>{sp.sponsor_name}</TD>
                  <TD bold color={sp.joy_contribution ? C.amber : C.blue}>{fmt(sp.amount)}</TD>
                  <TD><StatusPill status={sp.status} /></TD>
                  <TD>{sp.joy_contribution ? <Pill bg={C.amberLight} color={C.amber}>Joy contrib</Pill> : <span style={{ color: C.inkFaint, fontSize: 12 }}>External</span>}</TD>
                  <TD faint>{sp.notes}</TD>
                  <td style={{ padding: '8px 18px', borderBottom: `1px solid ${C.borderLight}`, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" onClick={() => openModal('editSponsor', { id: sp.id, sponsor_name: sp.sponsor_name, amount: sp.amount, date: sp.date, status: sp.status, joy_contribution: sp.joy_contribution, notes: sp.notes })}>Edit</Btn>
                      <Btn size="sm" danger onClick={() => del('sponsors', sp.id)}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            />
          </>
        )}
      </div>
    )
  }

  // ── All Expenses ─────────────────────────────────────────────────────────────
  const renderAllExpenses = () => (
    <div style={wrap}>
      <SectionTitle action={<Btn size="sm" onClick={() => openModal('addExpense', { client_id: data.clients[0]?.id, event_id: data.events[0]?.id })}>+ Add expense</Btn>}>
        All expenses ({data.expenses.length})
      </SectionTitle>
      <DataTable
        headers={['Date', 'Client', 'Event', 'Category', 'Vendor', 'Amount', 'Receipt', 'Modified', '']}
        rows={data.expenses.map(e => (
          <tr key={e.id} onMouseEnter={ev => ev.currentTarget.style.background = C.offWhite} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
            <TD faint nowrap>{e.date}</TD>
            <TD>{cName(e.client_id)}</TD>
            <TD faint>{eName(e.event_id)}</TD>
            <TD><CategoryPill cat={e.category} /></TD>
            <TD>{e.vendor}</TD>
            <TD bold>{fmt(e.amount)}</TD>
            <TD>{e.receipt_url ? <a href={e.receipt_url} target="_blank" rel="noreferrer" style={{ color: C.purple, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>View ↗</a> : <span style={{ color: C.inkFaint }}>—</span>}</TD>
            <TD faint nowrap>{fmtTime(e.updated_at)}</TD>
            <td style={{ padding: '8px 18px', borderBottom: `1px solid ${C.borderLight}`, whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn size="sm" onClick={() => openModal('editExpense', { id: e.id, client_id: e.client_id, event_id: e.event_id, description: e.description, amount: e.amount, date: e.date, category: e.category, vendor: e.vendor, receipt_url: e.receipt_url })}>Edit</Btn>
                <Btn size="sm" danger onClick={() => del('expenses', e.id)}>Delete</Btn>
              </div>
            </td>
          </tr>
        ))}
      />
    </div>
  )

  // ── All Invoices ──────────────────────────────────────────────────────────────
  const renderAllInvoices = () => (
    <div style={wrap}>
      <SectionTitle action={<Btn size="sm" onClick={() => openModal('addInvoice', { client_id: data.clients[0]?.id, event_id: data.events[0]?.id })}>+ Add invoice</Btn>}>
        All invoices ({data.invoices.length})
      </SectionTitle>
      <DataTable
        headers={['Date', 'Client', 'Event', 'Amount', 'Status', 'Notes', 'Modified', '']}
        rows={data.invoices.map(i => (
          <tr key={i.id} onMouseEnter={ev => ev.currentTarget.style.background = C.offWhite} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
            <TD faint nowrap>{i.date}</TD>
            <TD>{cName(i.client_id)}</TD>
            <TD faint>{eName(i.event_id)}</TD>
            <TD bold>{fmt(i.amount)}</TD>
            <TD><StatusPill status={i.status} /></TD>
            <TD faint>{i.notes}</TD>
            <TD faint nowrap>{fmtTime(i.updated_at)}</TD>
            <td style={{ padding: '8px 18px', borderBottom: `1px solid ${C.borderLight}`, whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn size="sm" onClick={() => openModal('editInvoice', { id: i.id, amount: i.amount, date: i.date, status: i.status, notes: i.notes })}>Edit</Btn>
                <Btn size="sm" danger onClick={() => del('invoices', i.id)}>Delete</Btn>
              </div>
            </td>
          </tr>
        ))}
      />
    </div>
  )

  // ── All Sponsors ──────────────────────────────────────────────────────────────
  const renderAllSponsors = () => {
    const pending = data.sponsors.filter(s => s.status==='Pending' && !s.joy_contribution)
    const pendingTotal = pending.reduce((a,s) => a+Number(s.amount), 0)
    const extPaid = data.sponsors.filter(s => !s.joy_contribution && s.status==='Paid').reduce((a,s) => a+Number(s.amount), 0)
    const extPending = data.sponsors.filter(s => !s.joy_contribution && s.status==='Pending').reduce((a,s) => a+Number(s.amount), 0)
    const joyTotal = data.sponsors.filter(s => s.joy_contribution).reduce((a,s) => a+Number(s.amount), 0)
    return (
      <div style={wrap}>
        <div style={grid4}>
          <StatCard label="External sponsors received" value={fmt(extPaid)} color={C.blue} />
          <StatCard label="External sponsors pending" value={fmt(extPending)} color={C.amber} />
          <StatCard label="Joy contributions" value={fmt(joyTotal)} color={C.amber} />
          <StatCard label="Total entries" value={data.sponsors.length} />
        </div>
        {pending.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionTitle>Pending — Global CIO Circle</SectionTitle>
            <DataTable
              headers={['Event', 'Sponsor', 'Amount', 'Notes']}
              rows={[
                ...pending.map(sp => (
                  <tr key={sp.id} onMouseEnter={e => e.currentTarget.style.background = C.offWhite} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <TD faint>{eName(sp.event_id)}</TD>
                    <TD bold>{sp.sponsor_name}</TD>
                    <TD bold color={C.amber}>{fmt(sp.amount)}</TD>
                    <TD faint>{sp.notes}</TD>
                  </tr>
                )),
                <tr key="total" style={{ background: C.amberLight }}>
                  <td colSpan={2} style={{ padding: '12px 18px', fontWeight: 800, color: C.amber, fontSize: 13 }}>Total pending</td>
                  <td style={{ padding: '12px 18px', fontWeight: 800, color: C.amber, fontSize: 13 }}>{fmt(pendingTotal)}</td>
                  <td style={{ padding: '12px 18px' }} />
                </tr>
              ]}
            />
          </div>
        )}
        <SectionTitle action={<Btn size="sm" onClick={() => openModal('addSponsor', { client_id: data.clients[0]?.id, event_id: data.events[0]?.id })}>+ Add sponsor</Btn>}>
          All sponsor payments
        </SectionTitle>
        <DataTable
          headers={['Date', 'Event', 'Sponsor', 'Amount', 'Status', 'Type', 'Notes', '']}
          rows={data.sponsors.map(sp => (
            <tr key={sp.id} onMouseEnter={e => e.currentTarget.style.background = C.offWhite} onMouseLeave={e => e.currentTarget.style.background = ''}>
              <TD faint nowrap>{sp.date}</TD>
              <TD faint>{eName(sp.event_id)}</TD>
              <TD bold>{sp.sponsor_name}</TD>
              <TD bold color={sp.joy_contribution ? C.amber : C.blue}>{fmt(sp.amount)}</TD>
              <TD><StatusPill status={sp.status} /></TD>
              <TD>{sp.joy_contribution ? <Pill bg={C.amberLight} color={C.amber}>Joy contrib</Pill> : <span style={{ color: C.inkFaint, fontSize: 12 }}>External</span>}</TD>
              <TD faint>{sp.notes}</TD>
              <td style={{ padding: '8px 18px', borderBottom: `1px solid ${C.borderLight}`, whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn size="sm" onClick={() => openModal('editSponsor', { id: sp.id, sponsor_name: sp.sponsor_name, amount: sp.amount, date: sp.date, status: sp.status, joy_contribution: sp.joy_contribution, notes: sp.notes })}>Edit</Btn>
                  <Btn size="sm" danger onClick={() => del('sponsors', sp.id)}>Delete</Btn>
                </div>
              </td>
            </tr>
          ))}
        />
      </div>
    )
  }

  // ── Modal ─────────────────────────────────────────────────────────────────────
  const renderModal = () => {
    if (!modal) return null
    const titles = { addClient:'New client', addEvent:'New event', editEvent:'Edit event', addExpense:'Add expense', editExpense:'Edit expense', addInvoice:'Invoice', editInvoice:'Edit invoice', addSponsor:'Add sponsor', editSponsor:'Edit sponsor' }
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(17,17,24,0.45)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}
        onClick={e => e.target===e.currentTarget && closeModal()}>
        <div style={{ background:C.white, borderRadius:22, padding:32, width:460, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 32px 80px rgba(0,0,0,0.22)' }}>
          <h2 style={{ fontSize:20, fontWeight:900, marginBottom:24, color:C.ink, letterSpacing:'-0.03em', margin:'0 0 24px' }}>{titles[modal]}</h2>

          {modal==='addClient' && <>
            <Field label="Company name"><input style={inputSt} value={form.name||''} onChange={e=>sf('name',e.target.value)} autoFocus /></Field>
            <Field label="Contact"><input style={inputSt} value={form.contact||''} onChange={e=>sf('contact',e.target.value)} /></Field>
            <Field label="Commission rate (%)"><input style={inputSt} type="number" value={form.service_rate||10} onChange={e=>sf('service_rate',e.target.value)} /></Field>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}><input type="checkbox" checked={!!form.gcio_style} onChange={e=>sf('gcio_style',e.target.checked)} /><label style={{ fontSize:14, color:C.ink }}>GCIO-style (sponsor income returned to client)</label></div>
          </>}

          {(modal==='addEvent'||modal==='editEvent') && <>
            {modal==='addEvent' && <Field label="Client"><select style={inputSt} value={form.client_id||''} onChange={e=>sf('client_id',e.target.value)}>{data.clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>}
            <Field label="Event name"><input style={inputSt} value={form.name||''} onChange={e=>sf('name',e.target.value)} autoFocus /></Field>
            {modal==='addEvent' && <>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Field label="Date"><input style={inputSt} type="date" value={form.date||''} onChange={e=>sf('date',e.target.value)} /></Field>
                <Field label="City"><input style={inputSt} value={form.city||''} onChange={e=>sf('city',e.target.value)} /></Field>
              </div>
              <Field label="Location / venue"><input style={inputSt} value={form.location||''} onChange={e=>sf('location',e.target.value)} /></Field>
            </>}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}><input type="checkbox" checked={!!form.commission_waived} onChange={e=>sf('commission_waived',e.target.checked)} /><label style={{ fontSize:14 }}>Commission waived</label></div>
            <Field label="Commission override ($)" hint="Leave blank to use the rate automatically"><input style={inputSt} type="number" value={form.commission_override??''} onChange={e=>sf('commission_override',e.target.value===''?null:e.target.value)} placeholder="e.g. 14450.16" /></Field>
          </>}

          {(modal==='addExpense'||modal==='editExpense') && <>
            {!form.id && <>
              <Field label="Client"><select style={inputSt} value={form.client_id||''} onChange={e=>sf('client_id',e.target.value)}>{data.clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
              <Field label="Event"><select style={inputSt} value={form.event_id||''} onChange={e=>sf('event_id',e.target.value)}>{clientEvents.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
            </>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Amount ($)"><input style={inputSt} type="number" value={form.amount||''} onChange={e=>sf('amount',e.target.value)} autoFocus={!!form.id} /></Field>
              <Field label="Date"><input style={inputSt} type="date" value={form.date||''} onChange={e=>sf('date',e.target.value)} /></Field>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Category"><select style={inputSt} value={form.category||'Misc'} onChange={e=>sf('category',e.target.value)}>{['Venue','Food','Print','Travel','Swag','AV','Misc'].map(c=><option key={c}>{c}</option>)}</select></Field>
              <Field label="Vendor"><input style={inputSt} value={form.vendor||''} onChange={e=>sf('vendor',e.target.value)} /></Field>
            </div>
            <Field label="Description"><input style={inputSt} value={form.description||''} onChange={e=>sf('description',e.target.value)} /></Field>
            <Field label="Receipt link" hint="Paste a Google Drive, Dropbox, or any URL"><input style={inputSt} value={form.receipt_url||''} onChange={e=>sf('receipt_url',e.target.value)} placeholder="https://drive.google.com/..." /></Field>
          </>}

          {(modal==='addInvoice'||modal==='editInvoice') && <>
            {!form.id && <>
              <Field label="Client"><select style={inputSt} value={form.client_id||''} onChange={e=>sf('client_id',e.target.value)}>{data.clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
              <Field label="Event"><select style={inputSt} value={form.event_id||''} onChange={e=>sf('event_id',e.target.value)}>{clientEvents.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
            </>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Amount ($)"><input style={inputSt} type="number" value={form.amount||''} onChange={e=>sf('amount',e.target.value)} autoFocus /></Field>
              <Field label="Date"><input style={inputSt} type="date" value={form.date||''} onChange={e=>sf('date',e.target.value)} /></Field>
            </div>
            <Field label="Status"><select style={inputSt} value={form.status||'Pending'} onChange={e=>sf('status',e.target.value)}>{['Pending','Paid','Partial'].map(v=><option key={v}>{v}</option>)}</select></Field>
            <Field label="Notes"><input style={inputSt} value={form.notes||''} onChange={e=>sf('notes',e.target.value)} /></Field>
          </>}

          {(modal==='addSponsor'||modal==='editSponsor') && <>
            {!form.id && <>
              <Field label="Client"><select style={inputSt} value={form.client_id||''} onChange={e=>sf('client_id',e.target.value)}>{data.clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
              <Field label="Event"><select style={inputSt} value={form.event_id||''} onChange={e=>sf('event_id',e.target.value)}>{clientEvents.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
            </>}
            <Field label="Sponsor name"><input style={inputSt} value={form.sponsor_name||''} onChange={e=>sf('sponsor_name',e.target.value)} autoFocus /></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Amount ($)"><input style={inputSt} type="number" value={form.amount||''} onChange={e=>sf('amount',e.target.value)} /></Field>
              <Field label="Date"><input style={inputSt} type="date" value={form.date||''} onChange={e=>sf('date',e.target.value)} /></Field>
            </div>
            <Field label="Status"><select style={inputSt} value={form.status||'Paid'} onChange={e=>sf('status',e.target.value)}>{['Paid','Pending'].map(v=><option key={v}>{v}</option>)}</select></Field>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}><input type="checkbox" checked={!!form.joy_contribution} onChange={e=>sf('joy_contribution',e.target.checked)} /><label style={{ fontSize:14 }}>Joy's own contribution (deducted from commission)</label></div>
            <Field label="Notes"><input style={inputSt} value={form.notes||''} onChange={e=>sf('notes',e.target.value)} /></Field>
          </>}

          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:24, paddingTop:16, borderTop:`1px solid ${C.border}` }}>
            <Btn onClick={closeModal}>Cancel</Btn>
            <Btn variant="primary" onClick={save}>Save</Btn>
          </div>
        </div>
      </div>
    )
  }

  // ── Nav & layout ──────────────────────────────────────────────────────────────
  const tabs = ['dashboard','clients','expenses','invoices','sponsors']
  const tabLabels = ['Dashboard','Clients','All expenses','Invoices','Sponsors']

  const renderPage = () => {
    if (loading) return <div style={{ textAlign:'center', padding:100, color:C.inkFaint, fontSize:14 }}>Loading your data...</div>
    if (page==='clients') {
      if (eventDetail) return renderEventDetail(eventDetail)
      if (clientDetail) return renderClientDetail(clientDetail)
      return (
        <div style={wrap}>
          <SectionTitle action={<Btn size="sm" onClick={() => openModal('addEvent', { client_id: data.clients[0]?.id })}>+ New event</Btn>}>
            Clients ({data.clients.length})
          </SectionTitle>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {data.clients.map(c => {
              const surplus = cliSurplus(c.id)
              const pending = data.invoices.filter(i => i.client_id===c.id && i.status==='Pending' && Number(i.amount)>0).reduce((a,i) => a+Number(i.amount), 0)
              return (
                <Card key={c.id} onClick={() => setClientDetail(c)}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                        <span style={{ fontSize:16, fontWeight:800, color:C.ink }}>{c.name}</span>
                        <Pill bg={C.purpleLight} color={C.purpleMid}>{c.service_rate}%</Pill>
                        {c.gcio_style && <Pill bg={C.blueLight} color={C.blue}>GCIO</Pill>}
                        {pending > 0 && <Pill bg={C.amberLight} color={C.amber}>{fmt(pending)} pending</Pill>}
                      </div>
                      <div style={{ fontSize:13, color:C.inkFaint }}>{data.events.filter(e => e.client_id===c.id).length} events</div>
                    </div>
                    <div style={{ display:'flex', gap:28, textAlign:'right' }}>
                      <div><div style={{ fontSize:15, fontWeight:800, color:C.red }}>{fmt(cliSpent(c.id))}</div><div style={{ fontSize:11, color:C.inkFaint, marginTop:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>spent</div></div>
                      <div><div style={{ fontSize:15, fontWeight:800, color:C.purple }}>{fmt(cliNet(c.id))}</div><div style={{ fontSize:11, color:C.inkFaint, marginTop:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>commission</div></div>
                      {c.gcio_style
                        ? <div><div style={{ fontSize:15, fontWeight:800, color:(surplus||0)>=0?C.green:C.red }}>{fmt(surplus||0)}</div><div style={{ fontSize:11, color:C.inkFaint, marginTop:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>surplus</div></div>
                        : <div><div style={{ fontSize:15, fontWeight:800, color:C.blue }}>{fmt(cliExtSp(c.id))}</div><div style={{ fontSize:11, color:C.inkFaint, marginTop:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>sponsors</div></div>
                      }
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )
    }
    if (page==='expenses') return renderAllExpenses()
    if (page==='invoices') return renderAllInvoices()
    if (page==='sponsors') return renderAllSponsors()
    return renderDashboard()
  }

  return (
    <div style={{ fontFamily:'-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif', fontSize:14, color:C.ink, background:C.offWhite, minHeight:'100vh' }}>
      {/* Topbar */}
      <div style={{ background:C.purple, padding:'0 32px', position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 0 rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:58 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <JoyLogo size={26} />
            <div style={{ width:1, height:18, background:'rgba(255,255,255,0.25)' }} />
            <span style={{ color:'rgba(255,255,255,0.85)', fontSize:13, fontWeight:600, letterSpacing:'-0.01em' }}>Event Tracker</span>
          </div>
          <button style={{ fontSize:13, padding:'7px 18px', borderRadius:10, border:'1.5px solid rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.12)', color:'white', cursor:'pointer', fontFamily:'inherit', fontWeight:700, letterSpacing:'-0.01em' }}
            onClick={() => openModal('addClient')}>+ New client</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:'0 32px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', gap:2 }}>
          {tabs.map((t,i) => (
            <button key={t} onClick={() => navTo(t)} style={{
              fontSize:13, padding:'15px 18px', cursor:'pointer', border:'none',
              borderBottom: page===t ? `2px solid ${C.purple}` : '2px solid transparent',
              color: page===t ? C.purple : C.inkFaint,
              fontWeight: page===t ? 800 : 500,
              background:'none', fontFamily:'inherit', letterSpacing:'-0.01em',
              transition:'color 0.15s'
            }}>{tabLabels[i]}</button>
          ))}
        </div>
      </div>

      {renderPage()}
      {renderModal()}
    </div>
  )
}
