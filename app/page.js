'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const fmt = n => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const today = () => new Date().toISOString().slice(0, 10)
const fmtTime = ts => {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const C = {
  purple: '#330066', purpleLight: '#F0E6FF', white: '#FFFFFF',
  cream: '#FAF8F5', ink: '#1D1D1F', inkLight: '#6B6B6B', inkFaint: '#ABABAB',
  border: '#EBEBEB', borderLight: '#F3F3F3',
  green: '#12A06B', greenLight: '#E6F7EF',
  red: '#E5483A', redLight: '#FCECEA',
  amber: '#C27B00', amberLight: '#FEF4E0',
  blue: '#1A6FD4', blueLight: '#E4EFFC',
}

const inputSt = { width: '100%', fontSize: 13, fontFamily: 'inherit', padding: '9px 12px', border: '1.5px solid #EBEBEB', borderRadius: 10, background: '#FFFFFF', color: '#1D1D1F', boxSizing: 'border-box', outline: 'none' }

// ── Stable components defined OUTSIDE App to prevent focus loss ──────────────

const JoyLogo = ({ size = 32 }) => (
  <svg width={size * 1.59} height={size} viewBox="0 0 148 93" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.6032 71.2595C18.6881 71.0957 18.8298 70.9693 19.0012 70.9043C23.777 68.6141 27.8447 61.652 32.0576 43.6969C32.2661 42.7953 32.9924 39.5851 33.8962 35.5906C35.7475 27.4081 38.3434 15.9345 38.7583 14.2725C42.6262 -2.96803 55.9186 -0.439658 60.0952 1.11767C60.2092 1.16059 60.3111 1.23106 60.3918 1.3229C60.4726 1.41474 60.5298 1.52516 60.5585 1.64449C60.5872 1.76382 60.5864 1.88842 60.5563 2.00739C60.5262 2.12635 60.4676 2.23605 60.3857 2.32689C58.9875 3.92086 57.335 7.89663 55.0833 17.3689C53.8848 22.4073 49.5266 40.5272 47.9468 47.0863C43.3525 66.3423 28.7889 71.6555 19.3644 72.3517C19.183 72.3769 18.9987 72.3337 18.8468 72.2304C18.695 72.1271 18.5862 71.971 18.5412 71.7919C18.4963 71.6128 18.5184 71.4232 18.6032 71.2595Z" fill="white"/>
    <path d="M142.428 19.9888C148.221 21.8576 148.149 28.087 147.295 32.0994C145.796 38.3947 143.399 44.4368 140.177 50.0361C140.09 50.1923 139.951 50.3121 139.785 50.3741C139.619 50.4362 139.436 50.4362 139.27 50.3744C139.103 50.3126 138.964 50.1928 138.877 50.0368C138.791 49.8807 138.762 49.6986 138.797 49.5231C139.807 43.039 138.521 36.4029 135.165 30.7802C130.552 23.1585 138.306 18.6514 142.428 19.9888Z" fill="white"/>
    <path d="M102.751 25.6501C107.145 21.2896 121.945 12.9533 127.302 35.3789C129.423 43.8205 129.315 52.6756 126.989 61.0622C124.664 69.4488 120.201 77.0744 114.046 83.1797C113.926 83.2871 113.775 83.3537 113.616 83.3699C113.456 83.3862 113.296 83.3512 113.157 83.27C113.018 83.1889 112.908 83.0656 112.843 82.9178C112.778 82.77 112.76 82.6052 112.793 82.4468C117.078 66.1956 114.409 27.2991 103.205 26.9326C103.064 26.9194 102.929 26.8657 102.817 26.778C102.705 26.6902 102.62 26.5721 102.573 26.4373C102.525 26.3026 102.517 26.157 102.548 26.0175C102.58 25.8781 102.65 25.7506 102.751 25.6501Z" fill="white"/>
    <path d="M106.165 88.0715C106.336 88.035 106.515 88.0608 106.67 88.1442C106.824 88.2276 106.944 88.3634 107.01 88.5276C107.075 88.6917 107.08 88.8738 107.025 89.0417C106.97 89.2097 106.859 89.3527 106.71 89.4456C103.381 91.9224 99.3102 93.1707 95.1785 92.9817C84.2831 92.487 83.8291 83.8209 87.0251 79.7535C88.7446 77.7368 91.0516 76.3196 93.6168 75.7045C93.7383 75.6907 93.8613 75.7073 93.975 75.7529C94.0886 75.7985 94.1893 75.8716 94.2683 75.9657C94.3473 76.0599 94.402 76.1722 94.4278 76.2928C94.4535 76.4134 94.4494 76.5386 94.4159 76.6572C92.9813 81.4757 96.6676 89.7754 106.165 88.0715Z" fill="white"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M61.3845 28.7281C67.3615 23.5257 74.9733 20.6303 82.8667 20.5567C95.1967 20.5567 104.04 28.5083 104.04 40.7104C103.886 45.2095 102.82 49.6292 100.909 53.6971C98.9978 57.765 96.2813 61.395 92.9268 64.3635C87.1036 69.534 79.6194 72.3982 71.8623 72.4249C59.1147 72.4249 50.362 64.3635 50.362 52.0514C50.5649 47.6186 51.6446 43.2716 53.5376 39.2661C55.4306 35.2606 58.0986 31.6777 61.3845 28.7281ZM74.2048 67.6797C80.9237 64.107 85.4635 46.7382 86.208 43.8617C87.1704 40.5272 90.0577 20.4651 80.4334 25.1921C73.9602 28.4489 69.549 44.7978 68.5208 48.6084L68.4121 49.0101C67.1954 53.8469 64.4897 72.7364 74.2048 67.6797Z" fill="white"/>
    <path d="M2.60361 66.0857C2.69221 66.2091 2.81591 66.3024 2.95829 66.3532C3.10066 66.404 3.25498 66.4099 3.40076 66.3701C3.54655 66.3304 3.6769 66.2468 3.77453 66.1306C3.87216 66.0144 3.93244 65.8709 3.94738 65.7193C4.12897 62.6046 7.45208 58.8487 13.1359 59.2701C17.149 59.5816 19.201 53.1507 15.8779 49.7613C11.7739 45.5656 5.67249 47.2146 2.60361 51.5934C-1.64561 57.6578 0.00686236 62.8245 2.60361 66.0857Z" fill="white"/>
  </svg>
)

const Metric = ({ label, val, color }) => (
  <div style={{ background: C.white, borderRadius: 16, padding: '18px 20px', border: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 11, color: C.inkFaint, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 700, color: color || C.ink, letterSpacing: '-0.02em' }}>{val}</div>
  </div>
)

const Badge = ({ type }) => {
  const styles = { Paid: { bg: C.greenLight, color: C.green }, Pending: { bg: C.amberLight, color: C.amber }, Partial: { bg: C.blueLight, color: C.blue }, waived: { bg: C.borderLight, color: C.inkFaint } }
  const st = styles[type] || styles.waived
  return <span style={{ display: 'inline-block', fontSize: 11, padding: '3px 9px', borderRadius: 20, fontWeight: 600, background: st.bg, color: st.color }}>{type}</span>
}

const Tag = ({ children }) => (
  <span style={{ display: 'inline-block', fontSize: 11, padding: '2px 8px', borderRadius: 6, background: C.purpleLight, color: C.purple, fontWeight: 600 }}>{children}</span>
)

const Btn = ({ children, onClick, variant = 'ghost', size = 'md', danger }) => {
  const base = { fontSize: size === 'sm' ? 11 : 13, padding: size === 'sm' ? '4px 12px' : '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }
  const v = danger ? { background: C.redLight, color: C.red } : variant === 'primary' ? { background: C.purple, color: C.white } : variant === 'outline' ? { background: 'transparent', color: C.purple, border: `1.5px solid ${C.purple}` } : { background: C.borderLight, color: C.ink }
  return <button style={{ ...base, ...v }} onClick={onClick}>{children}</button>
}

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 12, color: C.inkLight, marginBottom: 5, fontWeight: 600 }}>{label}</label>
    {children}
  </div>
)

const TH = ({ children }) => (
  <th style={{ textAlign: 'left', padding: '10px 16px', color: C.inkFaint, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}`, background: C.cream }}>{children}</th>
)

const TD = ({ children, bold, faint, color }) => (
  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.borderLight}`, fontWeight: bold ? 700 : 400, color: faint ? C.inkFaint : color || C.ink, fontSize: 13 }}>{children}</td>
)

const InfoBox = ({ children }) => (
  <div style={{ fontSize: 12, color: C.inkLight, padding: '10px 14px', background: C.purpleLight, borderRadius: 10, marginBottom: 16, lineHeight: 1.6, borderLeft: `3px solid ${C.purple}` }}>{children}</div>
)

const SectionHeader = ({ title, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
    <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{title}</span>
    {action}
  </div>
)

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [data, setData] = useState({ clients: [], events: [], expenses: [], invoices: [], sponsors: [] })
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [showPending, setShowPending] = useState(false)
  const [clientDetail, setClientDetail] = useState(null)
  const [eventDetail, setEventDetail] = useState(null)
  const [form, setForm] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    const [c, e, ex, i, s] = await Promise.all([
      supabase.from('clients').select('*').order('name'),
      supabase.from('events').select('*').order('date', { ascending: false }),
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('invoices').select('*').order('date', { ascending: false }),
      supabase.from('sponsors').select('*').order('date', { ascending: false }),
    ])
    setData({ clients: c.data || [], events: e.data || [], expenses: ex.data || [], invoices: i.data || [], sponsors: s.data || [] })
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const getClient = id => data.clients.find(c => c.id === id) || { service_rate: 10, gcio_style: false, name: '?' }
  const getEvent = id => data.events.find(e => e.id === id) || { commission_waived: false, name: '?' }
  const clientName = id => getClient(id).name
  const eventName = id => getEvent(id).name
  const isGcio = id => !!getClient(id).gcio_style
  const rate = id => getClient(id).service_rate / 100

  const evtSpent = eid => data.expenses.filter(e => e.event_id === eid).reduce((a, e) => a + Number(e.amount), 0)
  const evtGross = eid => { const ev = getEvent(eid); if (ev.commission_waived) return 0; if (ev.commission_override != null) return Number(ev.commission_override); return evtSpent(eid) * rate(ev.client_id) }
  const evtJoy = eid => data.sponsors.filter(s => s.event_id === eid && s.joy_contribution).reduce((a, s) => a + Number(s.amount), 0)
  const evtNet = eid => evtGross(eid) - evtJoy(eid)
  const evtAllSp = eid => data.sponsors.filter(s => s.event_id === eid).reduce((a, s) => a + Number(s.amount), 0)
  const evtSurplus = eid => { const ev = getEvent(eid); if (!isGcio(ev.client_id)) return null; return evtAllSp(eid) - evtSpent(eid) - evtNet(eid) }
  const cliSpent = cid => data.expenses.filter(e => e.client_id === cid).reduce((a, e) => a + Number(e.amount), 0)
  const cliNet = cid => data.events.filter(e => e.client_id === cid).reduce((a, ev) => a + evtNet(ev.id), 0)
  const cliSurplus = cid => { if (!isGcio(cid)) return null; return data.events.filter(e => e.client_id === cid).reduce((a, ev) => a + (evtSurplus(ev.id) || 0), 0) }
  const cliExtSp = cid => data.sponsors.filter(s => s.client_id === cid && !s.joy_contribution).reduce((a, s) => a + Number(s.amount), 0)

  const openModal = (type, defaults = {}) => { setModal(type); setForm({ date: today(), status: 'Pending', category: 'Misc', service_rate: 10, ...defaults }) }
  const closeModal = () => { setModal(null); setForm({}) }
  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const deleteRecord = async (table, id) => {
    if (!confirm('Delete this record?')) return
    await supabase.from(table).delete().eq('id', id)
    await load()
  }

  const save = async () => {
    if (modal === 'addClient') {
      await supabase.from('clients').insert({ name: form.name, contact: form.contact || '', service_rate: Number(form.service_rate) || 10, gcio_style: !!form.gcio_style })
    } else if (modal === 'addEvent') {
      await supabase.from('events').insert({ client_id: form.client_id, name: form.name, date: form.date, city: form.city || '', location: form.location || '', commission_waived: !!form.commission_waived })
    } else if (modal === 'editEvent') {
      await supabase.from('events').update({ name: form.name, commission_waived: !!form.commission_waived, commission_override: form.commission_override != null && form.commission_override !== '' ? Number(form.commission_override) : null }).eq('id', form.id)
    } else if (modal === 'addExpense' || modal === 'editExpense') {
      if (form.id) {
        await supabase.from('expenses').update({ description: form.description || '', amount: Number(form.amount) || 0, date: form.date, category: form.category, vendor: form.vendor || '' }).eq('id', form.id)
      } else {
        await supabase.from('expenses').insert({ client_id: form.client_id, event_id: form.event_id, description: form.description || '', amount: Number(form.amount) || 0, date: form.date, category: form.category, vendor: form.vendor || '' })
      }
    } else if (modal === 'addInvoice' || modal === 'editInvoice') {
      if (form.id) {
        await supabase.from('invoices').update({ amount: Number(form.amount), date: form.date, status: form.status, notes: form.notes || '' }).eq('id', form.id)
      } else {
        await supabase.from('invoices').insert({ client_id: form.client_id, event_id: form.event_id, amount: Number(form.amount) || 0, date: form.date, status: form.status, notes: form.notes || '' })
      }
    } else if (modal === 'addSponsor') {
      await supabase.from('sponsors').insert({ client_id: form.client_id, event_id: form.event_id, sponsor_name: form.sponsor_name || '', amount: Number(form.amount) || 0, date: form.date, status: form.status, joy_contribution: !!form.joy_contribution, notes: form.notes || '' })
    } else if (modal === 'editSponsor') {
      await supabase.from('sponsors').update({ sponsor_name: form.sponsor_name || '', amount: Number(form.amount) || 0, date: form.date, status: form.status, joy_contribution: !!form.joy_contribution, notes: form.notes || '' }).eq('id', form.id)
    }
    closeModal()
    await load()
  }

  const clientEvents = form.client_id ? data.events.filter(e => e.client_id === form.client_id) : []

  const navTo = (p) => { setPage(p); setClientDetail(null); setEventDetail(null) }

  // ── Render ──────────────────────────────────────────────────────────────────
  const metricGrid = { display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12, marginBottom: 24 }
  const content = { padding: 24, maxWidth: 1200, margin: '0 auto' }

  const renderDashboard = () => {
    const totalNet = data.clients.reduce((a, c) => a + cliNet(c.id), 0)
    const totalSpent = data.expenses.reduce((a, e) => a + Number(e.amount), 0)
    const pendingInvs = data.invoices.filter(i => i.status === 'Pending' && Number(i.amount) > 0)
    const pendingTotal = pendingInvs.reduce((a, i) => a + Number(i.amount), 0)
    const extSponsor = data.sponsors.filter(s => !s.joy_contribution).reduce((a, s) => a + Number(s.amount), 0)
    return (
      <div style={content}>
        <div style={metricGrid}>
          <Metric label="Joy's net commission" val={fmt(totalNet)} color={C.purple} />
          <Metric label="Total spent (fronted)" val={fmt(totalSpent)} color={C.red} />
          <div onClick={() => setShowPending(v => !v)} style={{ background: C.white, borderRadius: 16, padding: '18px 20px', border: `1.5px solid ${pendingTotal > 0 ? C.amber : C.border}`, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(194,123,0,0.12)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ fontSize: 11, color: C.inkFaint, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Pending invoices {pendingTotal > 0 ? '↓' : ''}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: pendingTotal > 0 ? C.amber : C.ink, letterSpacing: '-0.02em' }}>{fmt(pendingTotal)}</div>
          </div>
          <Metric label="External sponsor income" val={fmt(extSponsor)} color={C.blue} />
        </div>
        {showPending && pendingTotal > 0 && (
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Outstanding invoices</span>
              <button onClick={() => setShowPending(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.inkFaint, fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr>{['Client','Event','Amount','Notes'].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
              <tbody>
                {pendingInvs.map(i => (
                  <tr key={i.id} style={{ cursor: 'pointer' }} onClick={() => { setPage('clients'); setClientDetail(data.clients.find(c => c.id === i.client_id)); setShowPending(false) }}
                    onMouseEnter={e => e.currentTarget.style.background = C.cream} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <TD>{clientName(i.client_id)}</TD>
                    <TD faint>{eventName(i.event_id)}</TD>
                    <TD bold color={C.amber}>{fmt(i.amount)}</TD>
                    <TD faint>{i.notes}</TD>
                  </tr>
                ))}
                <tr style={{ background: C.amberLight }}>
                  <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 700, color: C.amber }}>Total outstanding</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: C.amber }}>{fmt(pendingTotal)}</td>
                  <td style={{ padding: '12px 16px' }} />
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <SectionHeader title={`Clients (${data.clients.length})`} action={<Btn size="sm" onClick={load}>↻ Refresh</Btn>} />
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr>{['Client','Rate','Spent','Joy net commission','GCIO surplus'].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {data.clients.map(c => {
                const surplus = cliSurplus(c.id)
                const jc = data.sponsors.filter(s => s.client_id === c.id && s.joy_contribution).reduce((a, s) => a + Number(s.amount), 0)
                const waived = data.events.filter(e => e.client_id === c.id && e.commission_waived).length
                return (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => { setClientDetail(c); setPage('clients') }}
                    onMouseEnter={e => e.currentTarget.style.background = C.cream} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <TD bold>{c.name}</TD>
                    <TD><Tag>{c.service_rate}%</Tag></TD>
                    <TD color={C.red} bold>{fmt(cliSpent(c.id))}</TD>
                    <TD color={C.purple} bold>{fmt(cliNet(c.id))}{jc > 0 && <span style={{ fontSize: 11, color: C.red, marginLeft: 6 }}>(-{fmt(jc)} contrib)</span>}{waived > 0 && <span style={{ marginLeft: 6 }}><Badge type="waived" /></span>}</TD>
                    <TD>{c.gcio_style && surplus !== null ? <span style={{ color: surplus >= 0 ? C.green : C.red, fontWeight: 700 }}>{surplus >= 0 ? fmt(surplus) + ' to client' : fmt(Math.abs(surplus)) + ' shortfall'}</span> : <span style={{ color: C.inkFaint }}>—</span>}</TD>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderClientList = () => (
    <div style={content}>
      <SectionHeader title={`Clients (${data.clients.length})`} action={<Btn size="sm" onClick={() => openModal('addEvent', { client_id: data.clients[0]?.id })}>+ New event</Btn>} />
      {data.clients.map(c => {
        const surplus = cliSurplus(c.id)
        const pending = data.invoices.filter(i => i.client_id === c.id && i.status === 'Pending' && Number(i.amount) > 0).reduce((a, i) => a + Number(i.amount), 0)
        return (
          <div key={c.id} onClick={() => setClientDetail(c)}
            style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '16px 20px', marginBottom: 10, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(51,0,102,0.08)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>{c.name}{pending > 0 && <Badge type="Pending" />}</div>
                <div style={{ fontSize: 12, color: C.inkFaint, marginTop: 4 }}>{data.events.filter(e => e.client_id === c.id).length} events · {c.service_rate}%{c.gcio_style ? ' · GCIO-style' : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: 24, textAlign: 'right' }}>
                <div><div style={{ fontSize: 14, fontWeight: 700, color: C.red }}>{fmt(cliSpent(c.id))}</div><div style={{ fontSize: 11, color: C.inkFaint }}>spent</div></div>
                <div><div style={{ fontSize: 14, fontWeight: 700, color: C.purple }}>{fmt(cliNet(c.id))}</div><div style={{ fontSize: 11, color: C.inkFaint }}>commission</div></div>
                {c.gcio_style ? <div><div style={{ fontSize: 14, fontWeight: 700, color: (surplus || 0) >= 0 ? C.green : C.red }}>{fmt(surplus || 0)}</div><div style={{ fontSize: 11, color: C.inkFaint }}>GCIO surplus</div></div>
                  : <div><div style={{ fontSize: 14, fontWeight: 700, color: C.blue }}>{fmt(cliExtSp(c.id))}</div><div style={{ fontSize: 11, color: C.inkFaint }}>sponsor</div></div>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderClientDetail = (client) => {
    const events = data.events.filter(e => e.client_id === client.id).sort((a, b) => b.date?.localeCompare(a.date))
    const surplus = cliSurplus(client.id)
    return (
      <div style={content}>
        <button onClick={() => setClientDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.purple, fontWeight: 600, fontFamily: 'inherit', marginBottom: 18, padding: 0 }}>← All clients</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{client.name}</span>
          <Tag>{client.service_rate}% commission</Tag>
          {client.gcio_style && <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, fontWeight: 600, background: C.blueLight, color: C.blue }}>GCIO-style</span>}
        </div>
        <div style={metricGrid}>
          <Metric label="Total spent" val={fmt(cliSpent(client.id))} color={C.red} />
          <Metric label="Joy net commission" val={fmt(cliNet(client.id))} color={C.purple} />
          {client.gcio_style
            ? <><Metric label="Total sponsor income" val={fmt(data.sponsors.filter(s => s.client_id === client.id).reduce((a, s) => a + Number(s.amount), 0))} color={C.blue} /><Metric label={`Surplus to ${client.name}`} val={fmt(surplus || 0)} color={(surplus || 0) >= 0 ? C.green : C.red} /></>
            : <><Metric label="Events" val={events.length} /><div /></>}
        </div>
        <SectionHeader title={`Events (${events.length})`} action={<Btn size="sm" onClick={() => openModal('addEvent', { client_id: client.id })}>+ Add event</Btn>} />
        {events.map(ev => {
          const surplus = evtSurplus(ev.id)
          const hasUnpaid = data.invoices.some(i => i.event_id === ev.id && i.status === 'Pending' && Number(i.amount) > 0)
          return (
            <div key={ev.id} onClick={() => setEventDetail(ev)}
              style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '14px 18px', marginBottom: 10, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(51,0,102,0.08)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>{ev.name}{ev.commission_waived && <Badge type="waived" />}{hasUnpaid && <Badge type="Pending" />}</div>
                  <div style={{ fontSize: 12, color: C.inkFaint, marginTop: 4 }}>{ev.date} · {ev.city}</div>
                </div>
                <div style={{ display: 'flex', gap: 20, textAlign: 'right' }}>
                  <div><div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>{fmt(evtSpent(ev.id))}</div><div style={{ fontSize: 11, color: C.inkFaint }}>spent</div></div>
                  <div><div style={{ fontSize: 13, fontWeight: 700, color: C.purple }}>{fmt(evtNet(ev.id))}</div><div style={{ fontSize: 11, color: C.inkFaint }}>commission</div></div>
                  {client.gcio_style && surplus !== null && <div><div style={{ fontSize: 13, fontWeight: 700, color: surplus >= 0 ? C.green : C.red }}>{fmt(surplus)}</div><div style={{ fontSize: 11, color: C.inkFaint }}>surplus</div></div>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderEventDetail = (event) => {
    const client = getClient(event.client_id)
    const gcio = client.gcio_style
    const spent = evtSpent(event.id), gross = evtGross(event.id), jc = evtJoy(event.id), net = evtNet(event.id)
    const allSp = evtAllSp(event.id), surplus = evtSurplus(event.id)
    const exps = data.expenses.filter(e => e.event_id === event.id)
    const invs = data.invoices.filter(i => i.event_id === event.id)
    const spons = data.sponsors.filter(s => s.event_id === event.id)
    const tblStyle = { background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 28 }
    const tStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 }
    return (
      <div style={content}>
        <button onClick={() => setEventDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.purple, fontWeight: 600, fontFamily: 'inherit', marginBottom: 18, padding: 0 }}>← {client.name}</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>{event.name}</span>
          <Tag>{event.date}</Tag><Tag>{event.city}</Tag>
          {event.commission_waived && <Badge type="waived" />}
          <Btn size="sm" onClick={() => openModal('editEvent', { id: event.id, name: event.name, commission_waived: event.commission_waived, commission_override: event.commission_override })}>Edit</Btn>
        </div>
        <div style={metricGrid}>
          <Metric label="Spent (fronted)" val={fmt(spent)} color={C.red} />
          <Metric label={`Gross commission (${event.commission_waived ? 'waived' : event.commission_override != null ? 'fixed' : Math.round(rate(event.client_id) * 100) + '%'})`} val={fmt(gross)} color={C.inkFaint} />
          {jc > 0 ? <Metric label="Joy contribution (deducted)" val={'-' + fmt(jc)} color={C.red} /> : <div />}
          <Metric label="Joy net commission" val={fmt(net)} color={C.purple} />
        </div>
        {gcio && <><div style={metricGrid}><Metric label="All sponsor income" val={fmt(allSp)} color={C.blue} /><Metric label="Surplus to Global CIO" val={fmt(surplus || 0)} color={(surplus || 0) >= 0 ? C.green : C.red} /></div>
          <InfoBox>{fmt(allSp)} sponsors − {fmt(spent)} expenses − {fmt(net)} net commission = <strong>{fmt(surplus || 0)} to Global CIO</strong></InfoBox></>}

        <SectionHeader title="Expenses" action={<Btn size="sm" onClick={() => openModal('addExpense', { client_id: event.client_id, event_id: event.id })}>+ Add</Btn>} />
        <div style={tblStyle}><table style={tStyle}>
          <thead><tr>{['Date','Category','Vendor','Description','Amount','Last modified',''].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>{exps.length ? exps.map(e => <tr key={e.id} onMouseEnter={ev => ev.currentTarget.style.background = C.cream} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
            <TD faint>{e.date}</TD><TD><Tag>{e.category}</Tag></TD><TD>{e.vendor}</TD><TD faint>{e.description}</TD><TD bold>{fmt(e.amount)}</TD><TD faint>{fmtTime(e.updated_at)}</TD>
            <td style={{ padding: '8px 16px', borderBottom: `1px solid ${C.borderLight}` }}><div style={{ display: 'flex', gap: 6 }}>
              <Btn size="sm" onClick={ev => { ev.stopPropagation(); openModal('editExpense', { id: e.id, client_id: e.client_id, event_id: e.event_id, description: e.description, amount: e.amount, date: e.date, category: e.category, vendor: e.vendor }) }}>Edit</Btn>
              <Btn size="sm" danger onClick={ev => { ev.stopPropagation(); deleteRecord('expenses', e.id) }}>Delete</Btn>
            </div></td>
          </tr>) : <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: C.inkFaint }}>No expenses yet</td></tr>}</tbody>
        </table></div>

        <SectionHeader title="Invoices sent" action={<Btn size="sm" onClick={() => openModal('addInvoice', { client_id: event.client_id, event_id: event.id })}>+ Add</Btn>} />
        <div style={tblStyle}><table style={tStyle}>
          <thead><tr>{['Date','Amount','Status','Notes','Last modified',''].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>{invs.length ? invs.map(i => <tr key={i.id} onMouseEnter={ev => ev.currentTarget.style.background = C.cream} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
            <TD faint>{i.date}</TD><TD bold>{fmt(i.amount)}</TD><TD><Badge type={i.status} /></TD><TD faint>{i.notes}</TD><TD faint>{fmtTime(i.updated_at)}</TD>
            <td style={{ padding: '8px 16px', borderBottom: `1px solid ${C.borderLight}` }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn size="sm" onClick={() => openModal('editInvoice', { id: i.id, client_id: i.client_id, event_id: i.event_id, amount: i.amount, date: i.date, status: i.status, notes: i.notes })}>Edit</Btn>
                <Btn size="sm" danger onClick={() => deleteRecord('invoices', i.id)}>Delete</Btn>
              </div>
            </td>
          </tr>) : <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: C.inkFaint }}>No invoices yet</td></tr>}</tbody>
        </table></div>

        {(gcio || spons.length > 0) && <>
          <SectionHeader title="Sponsor payments" action={<Btn size="sm" onClick={() => openModal('addSponsor', { client_id: event.client_id, event_id: event.id })}>+ Add</Btn>} />
          <div style={tblStyle}><table style={tStyle}>
            <thead><tr>{['Date','Sponsor','Amount','Status','Type','Notes',''].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>{spons.length ? spons.map(sp => <tr key={sp.id} onMouseEnter={ev => ev.currentTarget.style.background = C.cream} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
              <TD faint>{sp.date}</TD><TD bold>{sp.sponsor_name}</TD><TD bold color={sp.joy_contribution ? C.amber : C.blue}>{fmt(sp.amount)}</TD><TD><Badge type={sp.status} /></TD>
              <TD>{sp.joy_contribution ? <Badge type="waived" /> : <span style={{ fontSize: 11, color: C.inkFaint }}>External</span>}</TD><TD faint>{sp.notes}</TD>
              <td style={{ padding: '8px 16px', borderBottom: `1px solid ${C.borderLight}` }}><div style={{ display: 'flex', gap: 6 }}>
                <Btn size="sm" onClick={() => openModal('editSponsor', { id: sp.id, sponsor_name: sp.sponsor_name, amount: sp.amount, date: sp.date, status: sp.status, joy_contribution: sp.joy_contribution, notes: sp.notes })}>Edit</Btn>
                <Btn size="sm" danger onClick={() => deleteRecord('sponsors', sp.id)}>Delete</Btn>
              </div></td>
            </tr>) : <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: C.inkFaint }}>No sponsors yet</td></tr>}</tbody>
          </table></div>
        </>}
      </div>
    )
  }

  const renderAllExpenses = () => {
    const tblStyle = { background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }
    return (
      <div style={content}>
        <SectionHeader title={`All expenses (${data.expenses.length})`} action={<Btn size="sm" onClick={() => openModal('addExpense', { client_id: data.clients[0]?.id, event_id: data.events[0]?.id })}>+ Add</Btn>} />
        <div style={tblStyle}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>{['Date','Client','Event','Category','Vendor','Amount','Last modified',''].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>{data.expenses.map(e => <tr key={e.id} onMouseEnter={ev => ev.currentTarget.style.background = C.cream} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
            <TD faint>{e.date}</TD><TD>{clientName(e.client_id)}</TD><TD faint>{eventName(e.event_id)}</TD><TD><Tag>{e.category}</Tag></TD><TD>{e.vendor}</TD><TD bold>{fmt(e.amount)}</TD><TD faint>{fmtTime(e.updated_at)}</TD>
            <td style={{ padding: '8px 16px', borderBottom: `1px solid ${C.borderLight}` }}><div style={{ display: 'flex', gap: 6 }}>
              <Btn size="sm" onClick={() => openModal('editExpense', { id: e.id, client_id: e.client_id, event_id: e.event_id, description: e.description, amount: e.amount, date: e.date, category: e.category, vendor: e.vendor })}>Edit</Btn>
              <Btn size="sm" danger onClick={() => deleteRecord('expenses', e.id)}>Delete</Btn>
            </div></td>
          </tr>)}</tbody>
        </table></div>
      </div>
    )
  }

  const renderAllInvoices = () => (
    <div style={content}>
      <SectionHeader title={`All invoices (${data.invoices.length})`} action={<Btn size="sm" onClick={() => openModal('addInvoice', { client_id: data.clients[0]?.id, event_id: data.events[0]?.id })}>+ Add</Btn>} />
      <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead><tr>{['Date','Client','Event','Amount','Status','Notes','Last modified',''].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
        <tbody>{data.invoices.map(i => <tr key={i.id} onMouseEnter={ev => ev.currentTarget.style.background = C.cream} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
          <TD faint>{i.date}</TD><TD>{clientName(i.client_id)}</TD><TD faint>{eventName(i.event_id)}</TD><TD bold>{fmt(i.amount)}</TD><TD><Badge type={i.status} /></TD><TD faint>{i.notes}</TD><TD faint>{fmtTime(i.updated_at)}</TD>
          <td style={{ padding: '8px 16px', borderBottom: `1px solid ${C.borderLight}` }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn size="sm" onClick={() => openModal('editInvoice', { id: i.id, client_id: i.client_id, event_id: i.event_id, amount: i.amount, date: i.date, status: i.status, notes: i.notes })}>Edit</Btn>
              <Btn size="sm" danger onClick={() => deleteRecord('invoices', i.id)}>Delete</Btn>
            </div>
          </td>
        </tr>)}</tbody>
      </table></div>
    </div>
  )

  const renderAllSponsors = () => {
    const pending = data.sponsors.filter(s => s.status === 'Pending' && !s.joy_contribution)
    const pendingTotal = pending.reduce((a, s) => a + Number(s.amount), 0)
    const extPaid = data.sponsors.filter(s => !s.joy_contribution && s.status === 'Paid').reduce((a, s) => a + Number(s.amount), 0)
    const extPending = data.sponsors.filter(s => !s.joy_contribution && s.status === 'Pending').reduce((a, s) => a + Number(s.amount), 0)
    const joyTotal = data.sponsors.filter(s => s.joy_contribution).reduce((a, s) => a + Number(s.amount), 0)
    const tblStyle = { background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 28 }
    const tStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 }
    return (
      <div style={content}>
        <div style={metricGrid}>
          <Metric label="External sponsors received" val={fmt(extPaid)} color={C.blue} />
          <Metric label="External sponsors pending" val={fmt(extPending)} color={C.amber} />
          <Metric label="Joy contributions" val={fmt(joyTotal)} color={C.amber} />
          <Metric label="Total entries" val={data.sponsors.length} />
        </div>
        {pending.length > 0 && <>
          <SectionHeader title="Pending — Global CIO Circle" />
          <div style={tblStyle}><table style={tStyle}>
            <thead><tr>{['Event','Sponsor','Amount','Notes'].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {pending.map(sp => <tr key={sp.id} onMouseEnter={ev => ev.currentTarget.style.background = C.cream} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
                <TD faint>{eventName(sp.event_id)}</TD><TD bold>{sp.sponsor_name}</TD><TD bold color={C.amber}>{fmt(sp.amount)}</TD><TD faint>{sp.notes}</TD>
              </tr>)}
              <tr style={{ background: C.purpleLight }}><td colSpan={2} style={{ padding: '12px 16px', fontWeight: 700, color: C.purple }}>Total pending</td><td style={{ padding: '12px 16px', fontWeight: 700, color: C.amber }}>{fmt(pendingTotal)}</td><td style={{ padding: '12px 16px' }} /></tr>
            </tbody>
          </table></div>
        </>}
        <SectionHeader title="All sponsor payments" action={<Btn size="sm" onClick={() => openModal('addSponsor', { client_id: data.clients[0]?.id, event_id: data.events[0]?.id })}>+ Add</Btn>} />
        <div style={tblStyle}><table style={tStyle}>
          <thead><tr>{['Date','Event','Sponsor','Amount','Status','Type','Notes',''].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>{data.sponsors.map(sp => <tr key={sp.id} onMouseEnter={ev => ev.currentTarget.style.background = C.cream} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
            <TD faint>{sp.date}</TD><TD faint>{eventName(sp.event_id)}</TD><TD bold>{sp.sponsor_name}</TD><TD bold color={sp.joy_contribution ? C.amber : C.blue}>{fmt(sp.amount)}</TD><TD><Badge type={sp.status} /></TD>
            <TD>{sp.joy_contribution ? <Badge type="waived" /> : <span style={{ fontSize: 11, color: C.inkFaint }}>External</span>}</TD><TD faint>{sp.notes}</TD>
            <td style={{ padding: '8px 16px', borderBottom: `1px solid ${C.borderLight}` }}><div style={{ display: 'flex', gap: 6 }}>
              <Btn size="sm" onClick={() => openModal('editSponsor', { id: sp.id, sponsor_name: sp.sponsor_name, amount: sp.amount, date: sp.date, status: sp.status, joy_contribution: sp.joy_contribution, notes: sp.notes })}>Edit</Btn>
              <Btn size="sm" danger onClick={() => deleteRecord('sponsors', sp.id)}>Delete</Btn>
            </div></td>
          </tr>)}</tbody>
        </table></div>
      </div>
    )
  }

  const renderModal = () => {
    if (!modal) return null
    const titles = { addClient: 'New client', addEvent: 'New event', editEvent: 'Edit event', addExpense: 'Add expense', editExpense: 'Edit expense', addInvoice: 'Invoice', editInvoice: 'Invoice', addSponsor: 'Add sponsor payment', editSponsor: 'Edit sponsor payment' }
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(29,29,31,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
        onClick={e => e.target === e.currentTarget && closeModal()}>
        <div style={{ background: C.white, borderRadius: 20, padding: 28, width: 440, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, letterSpacing: '-0.02em' }}>{titles[modal]}</h2>

          {modal === 'addClient' && <>
            <Field label="Company name"><input style={inputSt} value={form.name || ''} onChange={e => setF('name', e.target.value)} /></Field>
            <Field label="Contact"><input style={inputSt} value={form.contact || ''} onChange={e => setF('contact', e.target.value)} /></Field>
            <Field label="Commission rate (%)"><input style={inputSt} type="number" value={form.service_rate || 10} onChange={e => setF('service_rate', e.target.value)} /></Field>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}><input type="checkbox" checked={!!form.gcio_style} onChange={e => setF('gcio_style', e.target.checked)} /><label style={{ fontSize: 13 }}>GCIO-style (sponsor income returned to client)</label></div>
          </>}

          {(modal === 'addEvent' || modal === 'editEvent') && <>
            {modal === 'addEvent' && <Field label="Client"><select style={inputSt} value={form.client_id || ''} onChange={e => setF('client_id', e.target.value)}>{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>}
            <Field label="Event name"><input style={inputSt} value={form.name || ''} onChange={e => setF('name', e.target.value)} /></Field>
            {modal === 'addEvent' && <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Date"><input style={inputSt} type="date" value={form.date || ''} onChange={e => setF('date', e.target.value)} /></Field>
                <Field label="City"><input style={inputSt} value={form.city || ''} onChange={e => setF('city', e.target.value)} /></Field>
              </div>
              <Field label="Location / venue"><input style={inputSt} value={form.location || ''} onChange={e => setF('location', e.target.value)} /></Field>
            </>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}><input type="checkbox" checked={!!form.commission_waived} onChange={e => setF('commission_waived', e.target.checked)} /><label style={{ fontSize: 13 }}>Commission waived</label></div>
            <Field label="Commission override ($) — leave blank to use rate"><input style={inputSt} type="number" value={form.commission_override ?? ''} onChange={e => setF('commission_override', e.target.value === '' ? null : e.target.value)} placeholder="e.g. 14450.16" /></Field>
          </>}

          {(modal === 'addExpense' || modal === 'editExpense') && <>
            {!form.id && <>
              <Field label="Client"><select style={inputSt} value={form.client_id || ''} onChange={e => setF('client_id', e.target.value)}>{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
              <Field label="Event"><select style={inputSt} value={form.event_id || ''} onChange={e => setF('event_id', e.target.value)}>{clientEvents.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
            </>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Amount ($)"><input style={inputSt} type="number" value={form.amount || ''} onChange={e => setF('amount', e.target.value)} /></Field>
              <Field label="Date"><input style={inputSt} type="date" value={form.date || ''} onChange={e => setF('date', e.target.value)} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Category"><select style={inputSt} value={form.category || 'Misc'} onChange={e => setF('category', e.target.value)}>{['Venue','Food','Print','Travel','Swag','AV','Misc'].map(c => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Vendor"><input style={inputSt} value={form.vendor || ''} onChange={e => setF('vendor', e.target.value)} /></Field>
            </div>
            <Field label="Description"><input style={inputSt} value={form.description || ''} onChange={e => setF('description', e.target.value)} /></Field>
          </>}

          {(modal === 'addInvoice' || modal === 'editInvoice') && <>
            {!form.id && <>
              <Field label="Client"><select style={inputSt} value={form.client_id || ''} onChange={e => setF('client_id', e.target.value)}>{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
              <Field label="Event"><select style={inputSt} value={form.event_id || ''} onChange={e => setF('event_id', e.target.value)}>{clientEvents.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
            </>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Amount ($)"><input style={inputSt} type="number" value={form.amount || ''} onChange={e => setF('amount', e.target.value)} /></Field>
              <Field label="Date"><input style={inputSt} type="date" value={form.date || ''} onChange={e => setF('date', e.target.value)} /></Field>
            </div>
            <Field label="Status"><select style={inputSt} value={form.status || 'Pending'} onChange={e => setF('status', e.target.value)}>{['Pending','Paid','Partial'].map(v => <option key={v}>{v}</option>)}</select></Field>
            <Field label="Notes"><input style={inputSt} value={form.notes || ''} onChange={e => setF('notes', e.target.value)} /></Field>
          </>}

          {(modal === 'addSponsor' || modal === 'editSponsor') && <>
            {!form.id && <><Field label="Client"><select style={inputSt} value={form.client_id || ''} onChange={e => setF('client_id', e.target.value)}>{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
            <Field label="Event"><select style={inputSt} value={form.event_id || ''} onChange={e => setF('event_id', e.target.value)}>{clientEvents.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field></> }
            <Field label="Sponsor name"><input style={inputSt} value={form.sponsor_name || ''} onChange={e => setF('sponsor_name', e.target.value)} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Amount ($)"><input style={inputSt} type="number" value={form.amount || ''} onChange={e => setF('amount', e.target.value)} /></Field>
              <Field label="Date"><input style={inputSt} type="date" value={form.date || ''} onChange={e => setF('date', e.target.value)} /></Field>
            </div>
            <Field label="Status"><select style={inputSt} value={form.status || 'Paid'} onChange={e => setF('status', e.target.value)}>{['Paid','Pending'].map(v => <option key={v}>{v}</option>)}</select></Field>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}><input type="checkbox" checked={!!form.joy_contribution} onChange={e => setF('joy_contribution', e.target.checked)} /><label style={{ fontSize: 13 }}>Joy's own contribution (deducted from commission)</label></div>
            <Field label="Notes"><input style={inputSt} value={form.notes || ''} onChange={e => setF('notes', e.target.value)} /></Field>
          </>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <Btn onClick={closeModal}>Cancel</Btn>
            <Btn variant="primary" onClick={save}>Save</Btn>
          </div>
        </div>
      </div>
    )
  }

  const tabs = ['dashboard','clients','expenses','invoices','sponsors']
  const tabLabels = ['Dashboard','Clients','All expenses','Invoices','Sponsors']

  const renderPage = () => {
    if (loading) return <div style={{ textAlign: 'center', padding: 80, color: C.inkFaint }}>Loading your data...</div>
    if (page === 'clients') {
      if (eventDetail) return renderEventDetail(eventDetail)
      if (clientDetail) return renderClientDetail(clientDetail)
      return renderClientList()
    }
    if (page === 'expenses') return renderAllExpenses()
    if (page === 'invoices') return renderAllInvoices()
    if (page === 'sponsors') return renderAllSponsors()
    return renderDashboard()
  }

  return (
    <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif', fontSize: 14, color: C.ink, background: C.cream, minHeight: '100vh' }}>
      <div style={{ background: C.purple, padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <JoyLogo size={26} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>|</span>
            <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>Event Tracker</span>
          </div>
          <button style={{ fontSize: 12, padding: '6px 16px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
            onClick={() => openModal('addClient')}>+ Client</button>
        </div>
      </div>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 4 }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => navTo(t)}
              style={{ fontSize: 13, padding: '14px 16px', cursor: 'pointer', border: 'none', borderBottom: page === t ? `2px solid ${C.purple}` : '2px solid transparent', color: page === t ? C.purple : C.inkFaint, fontWeight: page === t ? 700 : 500, background: 'none', fontFamily: 'inherit' }}>
              {tabLabels[i]}
            </button>
          ))}
        </div>
      </div>
      {renderPage()}
      {renderModal()}
    </div>
  )
}
