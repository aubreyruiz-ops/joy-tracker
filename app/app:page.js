'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const fmt = n => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const today = () => new Date().toISOString().slice(0, 10)

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [user, setUser] = useState('Alex')
  const [data, setData] = useState({ clients: [], events: [], expenses: [], invoices: [], sponsors: [] })
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
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
    setData({
      clients: c.data || [],
      events: e.data || [],
      expenses: ex.data || [],
      invoices: i.data || [],
      sponsors: s.data || [],
    })
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Calculations
  const getClient = id => data.clients.find(c => c.id === id) || { service_rate: 10, gcio_style: false, name: '?' }
  const getEvent = id => data.events.find(e => e.id === id) || { commission_waived: false, name: '?' }
  const clientName = id => getClient(id).name
  const eventName = id => getEvent(id).name
  const isGcio = id => !!getClient(id).gcio_style
  const rate = id => getClient(id).service_rate / 100

  const evtSpent = eid => data.expenses.filter(e => e.event_id === eid).reduce((a, e) => a + Number(e.amount), 0)
  const evtGross = eid => { const ev = getEvent(eid); return ev.commission_waived ? 0 : evtSpent(eid) * rate(ev.client_id) }
  const evtJoy = eid => data.sponsors.filter(s => s.event_id === eid && s.joy_contribution).reduce((a, s) => a + Number(s.amount), 0)
  const evtNet = eid => evtGross(eid) - evtJoy(eid)
  const evtAllSp = eid => data.sponsors.filter(s => s.event_id === eid).reduce((a, s) => a + Number(s.amount), 0)
  const evtSurplus = eid => { const ev = getEvent(eid); if (!isGcio(ev.client_id)) return null; return evtAllSp(eid) - evtSpent(eid) - evtNet(eid) }
  const cliSpent = cid => data.expenses.filter(e => e.client_id === cid).reduce((a, e) => a + Number(e.amount), 0)
  const cliNet = cid => data.events.filter(e => e.client_id === cid).reduce((a, ev) => a + evtNet(ev.id), 0)
  const cliSurplus = cid => { if (!isGcio(cid)) return null; return data.events.filter(e => e.client_id === cid).reduce((a, ev) => a + (evtSurplus(ev.id) || 0), 0) }
  const cliExtSp = cid => data.sponsors.filter(s => s.client_id === cid && !s.joy_contribution).reduce((a, s) => a + Number(s.amount), 0)

  // Modals
  const openModal = (type, defaults = {}) => { setModal(type); setForm({ date: today(), status: 'Pending', category: 'Misc', service_rate: 10, ...defaults }) }
  const closeModal = () => { setModal(null); setForm({}) }

  const save = async () => {
    if (modal === 'addClient') {
      await supabase.from('clients').insert({ name: form.name, contact: form.contact || '', service_rate: Number(form.service_rate) || 10, gcio_style: !!form.gcio_style })
    } else if (modal === 'addEvent') {
      await supabase.from('events').insert({ client_id: form.client_id, name: form.name, date: form.date, city: form.city || '', location: form.location || '', commission_waived: !!form.commission_waived })
    } else if (modal === 'editEvent') {
      await supabase.from('events').update({ name: form.name, commission_waived: !!form.commission_waived }).eq('id', form.id)
    } else if (modal === 'addExpense') {
      await supabase.from('expenses').insert({ client_id: form.client_id, event_id: form.event_id, description: form.description || '', amount: Number(form.amount) || 0, date: form.date, category: form.category, vendor: form.vendor || '', added_by: user })
    } else if (modal === 'addInvoice' || modal === 'editInvoice') {
      if (form.id) {
        await supabase.from('invoices').update({ amount: Number(form.amount), date: form.date, status: form.status, notes: form.notes || '' }).eq('id', form.id)
      } else {
        await supabase.from('invoices').insert({ client_id: form.client_id, event_id: form.event_id, amount: Number(form.amount) || 0, date: form.date, status: form.status, notes: form.notes || '', added_by: user })
      }
    } else if (modal === 'addSponsor') {
      await supabase.from('sponsors').insert({ client_id: form.client_id, event_id: form.event_id, sponsor_name: form.sponsor_name || '', amount: Number(form.amount) || 0, date: form.date, status: form.status, joy_contribution: !!form.joy_contribution, notes: form.notes || '', added_by: user })
    }
    closeModal()
    await load()
    if (eventDetail) setEventDetail(data.events.find(e => e.id === eventDetail.id) || eventDetail)
  }

  const eventsForClient = cid => form.client_id === cid ? data.events.filter(e => e.client_id === form.client_id) : data.events.filter(e => e.client_id === form.client_id)

  const s = { // styles
    page: { fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', fontSize: 14, color: '#1a1a1a', background: '#f5f4f0', minHeight: '100vh' },
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: '#fff', borderBottom: '1px solid #e8e6e0', position: 'sticky', top: 0, zIndex: 50 },
    tabs: { display: 'flex', background: '#fff', borderBottom: '1px solid #e8e6e0', padding: '0 24px', overflowX: 'auto' },
    tab: (active) => ({ fontSize: 13, padding: '10px 16px', cursor: 'pointer', borderBottom: active ? '2px solid #1a1a1a' : '2px solid transparent', color: active ? '#1a1a1a' : '#888', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }),
    content: { padding: 24, maxWidth: 1200, margin: '0 auto' },
    metric: { background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e8e6e0' },
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12, marginBottom: 20 },
    card: { background: '#fff', borderRadius: 10, border: '1px solid #e8e6e0', padding: '14px 18px', marginBottom: 10, cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #e8e6e0' },
    th: { textAlign: 'left', padding: '9px 12px', color: '#888', fontWeight: 500, borderBottom: '1px solid #e8e6e0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.03em', background: '#faf9f7' },
    td: { padding: '9px 12px', borderBottom: '1px solid #f0ede8' },
    badge: (type) => ({ display: 'inline-block', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: type === 'Paid' ? '#EAF3DE' : type === 'Pending' ? '#FFF3CD' : type === 'waived' ? '#f0ede8' : '#E6F1FB', color: type === 'Paid' ? '#3B6D11' : type === 'Pending' ? '#856404' : type === 'waived' ? '#888' : '#185FA5' }),
    tag: { display: 'inline-block', fontSize: 10, padding: '2px 7px', borderRadius: 5, background: '#f0ede8', color: '#666', border: '1px solid #e8e6e0' },
    btn: { fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 },
    btnPrimary: { fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid #1a1a1a', background: '#1a1a1a', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 },
    btnSm: { fontSize: 11, padding: '3px 10px', borderRadius: 7, border: '1px solid #ddd', background: '#fff', color: '#1a1a1a', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 },
    sectionHdr: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    backBtn: { fontSize: 12, color: '#888', cursor: 'pointer', marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500, background: 'none', border: 'none', fontFamily: 'inherit' },
    infoBox: { fontSize: 11, color: '#888', padding: '10px 14px', background: '#faf9f7', borderRadius: 8, marginBottom: 16, lineHeight: 1.6, border: '1px solid #e8e6e0' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
    modalBox: { background: '#fff', borderRadius: 14, padding: 24, width: 420, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
    label: { display: 'block', fontSize: 11, color: '#888', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' },
    input: { width: '100%', fontSize: 13, fontFamily: 'inherit', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', color: '#1a1a1a', boxSizing: 'border-box' },
  }

  const Metric = ({ label, val, color }) => (
    <div style={s.metric}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || '#1a1a1a' }}>{val}</div>
    </div>
  )

  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  )

  // Dashboard
  const Dashboard = () => {
    const totalNet = data.clients.reduce((a, c) => a + cliNet(c.id), 0)
    const totalSpent = data.expenses.reduce((a, e) => a + Number(e.amount), 0)
    const pendingTotal = data.invoices.filter(i => i.status === 'Pending' && Number(i.amount) > 0).reduce((a, i) => a + Number(i.amount), 0)
    const extSponsor = data.sponsors.filter(s => !s.joy_contribution).reduce((a, s) => a + Number(s.amount), 0)
    return (
      <div style={s.content}>
        <div style={s.infoBox}>Joy net commission = (expenses × rate) − Joy contributions. GCIO surplus = all sponsor income − expenses − Joy net commission, returned to client.</div>
        <div style={s.metricGrid}>
          <Metric label="Joy's total net commission" val={fmt(totalNet)} color="#BA7517" />
          <Metric label="Total spent (fronted)" val={fmt(totalSpent)} color="#D85A30" />
          <Metric label="Pending invoices" val={fmt(pendingTotal)} color={pendingTotal > 0 ? '#BA7517' : '#1a1a1a'} />
          <Metric label="External sponsor income" val={fmt(extSponsor)} color="#378ADD" />
        </div>
        <div style={s.sectionHdr}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>All clients</span>
          <button style={s.btnSm} onClick={load}>↻ Refresh</button>
        </div>
        <table style={s.table}>
          <thead><tr>
            {['Client', 'Rate', 'Spent', 'Joy net commission', 'GCIO surplus'].map(h => <th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {data.clients.map(c => {
              const surplus = cliSurplus(c.id)
              const jc = data.sponsors.filter(s => s.client_id === c.id && s.joy_contribution).reduce((a, s) => a + Number(s.amount), 0)
              const waived = data.events.filter(e => e.client_id === c.id && e.commission_waived).length
              return (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => { setClientDetail(c); setPage('clients') }}>
                  <td style={{ ...s.td, fontWeight: 700 }}>{c.name}</td>
                  <td style={s.td}><span style={s.tag}>{c.service_rate}%</span></td>
                  <td style={{ ...s.td, color: '#D85A30', fontWeight: 600 }}>{fmt(cliSpent(c.id))}</td>
                  <td style={{ ...s.td, color: '#BA7517', fontWeight: 600 }}>{fmt(cliNet(c.id))}{jc > 0 && <span style={{ fontSize: 10, color: '#D85A30', marginLeft: 4 }}>(-{fmt(jc)})</span>}{waived > 0 && <span style={{ ...s.badge('waived'), marginLeft: 4 }}>{waived} waived</span>}</td>
                  <td style={s.td}>{c.gcio_style && surplus !== null ? <span style={{ color: surplus >= 0 ? '#1D9E75' : '#D85A30', fontSize: 11, fontWeight: 600 }}>{surplus >= 0 ? fmt(surplus) + ' to client' : fmt(Math.abs(surplus)) + ' shortfall'}</span> : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  // Clients list
  const ClientList = () => (
    <div style={s.content}>
      <div style={s.sectionHdr}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Clients ({data.clients.length})</span>
        <button style={s.btnSm} onClick={() => openModal('addEvent', { client_id: data.clients[0]?.id })}>+ New event</button>
      </div>
      {data.clients.map(c => {
        const surplus = cliSurplus(c.id)
        const pending = data.invoices.filter(i => i.client_id === c.id && i.status === 'Pending' && Number(i.amount) > 0).reduce((a, i) => a + Number(i.amount), 0)
        return (
          <div key={c.id} style={s.card} onClick={() => setClientDetail(c)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}{pending > 0 && <span style={{ ...s.badge('Pending'), marginLeft: 6 }}>{fmt(pending)} pending</span>}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{data.events.filter(e => e.client_id === c.id).length} events · {c.service_rate}%{c.gcio_style ? ' · GCIO-style' : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: 16, textAlign: 'right' }}>
                <div><div style={{ fontSize: 12, fontWeight: 700, color: '#D85A30' }}>{fmt(cliSpent(c.id))}</div><div style={{ fontSize: 10, color: '#aaa' }}>spent</div></div>
                <div><div style={{ fontSize: 12, fontWeight: 700, color: '#BA7517' }}>{fmt(cliNet(c.id))}</div><div style={{ fontSize: 10, color: '#aaa' }}>commission</div></div>
                {c.gcio_style
                  ? <div><div style={{ fontSize: 12, fontWeight: 700, color: (surplus || 0) >= 0 ? '#1D9E75' : '#D85A30' }}>{fmt(surplus || 0)}</div><div style={{ fontSize: 10, color: '#aaa' }}>GCIO surplus</div></div>
                  : <div><div style={{ fontSize: 12, fontWeight: 700, color: '#378ADD' }}>{fmt(cliExtSp(c.id))}</div><div style={{ fontSize: 10, color: '#aaa' }}>sponsor</div></div>
                }
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  // Client detail
  const ClientDetail = ({ client }) => {
    const events = data.events.filter(e => e.client_id === client.id).sort((a, b) => b.date?.localeCompare(a.date))
    const surplus = cliSurplus(client.id)
    return (
      <div style={s.content}>
        <button style={s.backBtn} onClick={() => setClientDetail(null)}>← All clients</button>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>{client.name}</span>
          <span style={s.tag}>{client.service_rate}% commission</span>
          {client.gcio_style && <span style={{ ...s.tag, background: '#E6F1FB', color: '#185FA5', borderColor: '#b5d4f4' }}>GCIO-style</span>}
        </div>
        <div style={s.metricGrid}>
          <Metric label="Total spent" val={fmt(cliSpent(client.id))} color="#D85A30" />
          <Metric label="Joy net commission" val={fmt(cliNet(client.id))} color="#BA7517" />
          {client.gcio_style
            ? <><Metric label="Total sponsor income" val={fmt(data.sponsors.filter(s => s.client_id === client.id).reduce((a, s) => a + Number(s.amount), 0))} color="#378ADD" /><Metric label={`Surplus to ${client.name}`} val={fmt(surplus || 0)} color={(surplus || 0) >= 0 ? '#1D9E75' : '#D85A30'} /></>
            : <><Metric label="Events" val={events.length} /><div /></>
          }
        </div>
        <div style={s.sectionHdr}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Events ({events.length})</span>
          <button style={s.btnSm} onClick={() => openModal('addEvent', { client_id: client.id })}>+ Add event</button>
        </div>
        {events.map(ev => {
          const surplus = evtSurplus(ev.id)
          const hasUnpaid = data.invoices.some(i => i.event_id === ev.id && i.status === 'Pending' && Number(i.amount) > 0)
          return (
            <div key={ev.id} style={s.card} onClick={() => setEventDetail(ev)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{ev.name}{ev.commission_waived && <span style={{ ...s.badge('waived'), marginLeft: 6 }}>waived</span>}{hasUnpaid && <span style={{ ...s.badge('Pending'), marginLeft: 6 }}>unpaid</span>}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{ev.date} · {ev.city}</div>
                </div>
                <div style={{ display: 'flex', gap: 12, textAlign: 'right' }}>
                  <div><div style={{ fontSize: 12, fontWeight: 700, color: '#D85A30' }}>{fmt(evtSpent(ev.id))}</div><div style={{ fontSize: 10, color: '#aaa' }}>spent</div></div>
                  <div><div style={{ fontSize: 12, fontWeight: 700, color: '#BA7517' }}>{fmt(evtNet(ev.id))}</div><div style={{ fontSize: 10, color: '#aaa' }}>commission</div></div>
                  {client.gcio_style && surplus !== null && <div><div style={{ fontSize: 12, fontWeight: 700, color: surplus >= 0 ? '#1D9E75' : '#D85A30' }}>{fmt(surplus)}</div><div style={{ fontSize: 10, color: '#aaa' }}>surplus</div></div>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Event detail
  const EventDetail = ({ event }) => {
    const client = getClient(event.client_id)
    const gcio = client.gcio_style
    const spent = evtSpent(event.id), gross = evtGross(event.id), jc = evtJoy(event.id), net = evtNet(event.id)
    const allSp = evtAllSp(event.id), surplus = evtSurplus(event.id)
    const exps = data.expenses.filter(e => e.event_id === event.id)
    const invs = data.invoices.filter(i => i.event_id === event.id)
    const spons = data.sponsors.filter(s => s.event_id === event.id)
    return (
      <div style={s.content}>
        <button style={s.backBtn} onClick={() => setEventDetail(null)}>← {client.name}</button>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 17, fontWeight: 800 }}>{event.name}</span>
          <span style={s.tag}>{event.date}</span>
          <span style={s.tag}>{event.city}</span>
          {event.commission_waived && <span style={s.badge('waived')}>commission waived</span>}
          <button style={s.btnSm} onClick={() => openModal('editEvent', { id: event.id, name: event.name, commission_waived: event.commission_waived })}>Edit</button>
        </div>
        <div style={s.metricGrid}>
          <Metric label={`Spent (fronted)`} val={fmt(spent)} color="#D85A30" />
          <Metric label={`Gross commission (${event.commission_waived ? 'waived' : Math.round(rate(event.client_id) * 100) + '%'})`} val={fmt(gross)} color="#aaa" />
          {jc > 0 ? <Metric label="Joy contribution (deducted)" val={'-' + fmt(jc)} color="#D85A30" /> : <div />}
          <Metric label="Joy net commission" val={fmt(net)} color="#BA7517" />
        </div>
        {gcio && <><div style={s.metricGrid}>
          <Metric label="All sponsor income" val={fmt(allSp)} color="#378ADD" />
          <Metric label="Surplus to Global CIO" val={fmt(surplus || 0)} color={(surplus || 0) >= 0 ? '#1D9E75' : '#D85A30'} />
        </div>
          <div style={s.infoBox}>{fmt(allSp)} sponsors − {fmt(spent)} expenses − {fmt(net)} net commission = <strong>{fmt(surplus || 0)} to Global CIO</strong></div>
        </>}

        {/* Expenses */}
        <div style={{ marginBottom: 24 }}>
          <div style={s.sectionHdr}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Expenses</span>
            <button style={s.btnSm} onClick={() => openModal('addExpense', { client_id: event.client_id, event_id: event.id })}>+ Add</button>
          </div>
          <table style={s.table}><thead><tr>{['Date', 'Category', 'Vendor', 'Description', 'Amount', 'By'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>{exps.length ? exps.map(e => <tr key={e.id}><td style={s.td}>{e.date}</td><td style={s.td}><span style={s.tag}>{e.category}</span></td><td style={s.td}>{e.vendor}</td><td style={{ ...s.td, color: '#666' }}>{e.description}</td><td style={{ ...s.td, fontWeight: 700 }}>{fmt(e.amount)}</td><td style={{ ...s.td, color: '#aaa' }}>{e.added_by}</td></tr>) : <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#aaa' }}>None yet</td></tr>}</tbody>
          </table>
        </div>

        {/* Invoices */}
        <div style={{ marginBottom: 24 }}>
          <div style={s.sectionHdr}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Invoices sent</span>
            <button style={s.btnSm} onClick={() => openModal('addInvoice', { client_id: event.client_id, event_id: event.id })}>+ Add</button>
          </div>
          <table style={s.table}><thead><tr>{['Date', 'Amount', 'Status', 'Notes', 'By', ''].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>{invs.length ? invs.map(i => <tr key={i.id}><td style={s.td}>{i.date}</td><td style={{ ...s.td, fontWeight: 700 }}>{fmt(i.amount)}</td><td style={s.td}><span style={s.badge(i.status)}>{i.status}</span></td><td style={{ ...s.td, color: '#666' }}>{i.notes}</td><td style={{ ...s.td, color: '#aaa' }}>{i.added_by}</td><td style={s.td}><button style={s.btnSm} onClick={() => openModal('editInvoice', { id: i.id, client_id: i.client_id, event_id: i.event_id, amount: i.amount, date: i.date, status: i.status, notes: i.notes })}>Edit</button></td></tr>) : <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#aaa' }}>None yet</td></tr>}</tbody>
          </table>
        </div>

        {/* Sponsors */}
        {(gcio || spons.length > 0) && <div>
          <div style={s.sectionHdr}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Sponsor payments</span>
            <button style={s.btnSm} onClick={() => openModal('addSponsor', { client_id: event.client_id, event_id: event.id })}>+ Add</button>
          </div>
          <table style={s.table}><thead><tr>{['Date', 'Sponsor', 'Amount', 'Status', 'Type', 'Notes'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>{spons.length ? spons.map(sp => <tr key={sp.id}><td style={s.td}>{sp.date}</td><td style={{ ...s.td, fontWeight: 700 }}>{sp.sponsor_name}</td><td style={{ ...s.td, fontWeight: 700, color: sp.joy_contribution ? '#BA7517' : '#378ADD' }}>{fmt(sp.amount)}</td><td style={s.td}><span style={s.badge(sp.status)}>{sp.status}</span></td><td style={s.td}>{sp.joy_contribution ? <span style={s.badge('waived')}>Joy contribution</span> : <span style={{ fontSize: 11, color: '#aaa' }}>External</span>}</td><td style={{ ...s.td, color: '#666' }}>{sp.notes}</td></tr>) : <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#aaa' }}>None yet</td></tr>}</tbody>
          </table>
        </div>}
      </div>
    )
  }

  // All Expenses
  const AllExpenses = () => (
    <div style={s.content}>
      <div style={s.sectionHdr}><span style={{ fontSize: 14, fontWeight: 700 }}>All expenses ({data.expenses.length})</span><button style={s.btnSm} onClick={() => openModal('addExpense', { client_id: data.clients[0]?.id, event_id: data.events[0]?.id })}>+ Add</button></div>
      <table style={s.table}><thead><tr>{['Date', 'Client', 'Event', 'Category', 'Vendor', 'Amount', 'By'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
        <tbody>{data.expenses.map(e => <tr key={e.id}><td style={s.td}>{e.date}</td><td style={s.td}>{clientName(e.client_id)}</td><td style={{ ...s.td, color: '#666' }}>{eventName(e.event_id)}</td><td style={s.td}><span style={s.tag}>{e.category}</span></td><td style={s.td}>{e.vendor}</td><td style={{ ...s.td, fontWeight: 700 }}>{fmt(e.amount)}</td><td style={{ ...s.td, color: '#aaa' }}>{e.added_by}</td></tr>)}</tbody>
      </table>
    </div>
  )

  // All Invoices
  const AllInvoices = () => (
    <div style={s.content}>
      <div style={s.sectionHdr}><span style={{ fontSize: 14, fontWeight: 700 }}>All invoices ({data.invoices.length})</span><button style={s.btnSm} onClick={() => openModal('addInvoice', { client_id: data.clients[0]?.id, event_id: data.events[0]?.id })}>+ Add</button></div>
      <table style={s.table}><thead><tr>{['Date', 'Client', 'Event', 'Amount', 'Status', 'Notes', 'By', ''].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
        <tbody>{data.invoices.map(i => <tr key={i.id}><td style={s.td}>{i.date}</td><td style={s.td}>{clientName(i.client_id)}</td><td style={{ ...s.td, color: '#666' }}>{eventName(i.event_id)}</td><td style={{ ...s.td, fontWeight: 700 }}>{fmt(i.amount)}</td><td style={s.td}><span style={s.badge(i.status)}>{i.status}</span></td><td style={{ ...s.td, color: '#666' }}>{i.notes}</td><td style={{ ...s.td, color: '#aaa' }}>{i.added_by}</td><td style={s.td}><button style={s.btnSm} onClick={() => openModal('editInvoice', { id: i.id, client_id: i.client_id, event_id: i.event_id, amount: i.amount, date: i.date, status: i.status, notes: i.notes })}>Edit</button></td></tr>)}</tbody>
      </table>
    </div>
  )

  // All Sponsors
  const AllSponsors = () => {
    const pending = data.sponsors.filter(s => s.status === 'Pending' && !s.joy_contribution)
    const pendingTotal = pending.reduce((a, s) => a + Number(s.amount), 0)
    const extPaid = data.sponsors.filter(s => !s.joy_contribution && s.status === 'Paid').reduce((a, s) => a + Number(s.amount), 0)
    const extPending = data.sponsors.filter(s => !s.joy_contribution && s.status === 'Pending').reduce((a, s) => a + Number(s.amount), 0)
    const joyTotal = data.sponsors.filter(s => s.joy_contribution).reduce((a, s) => a + Number(s.amount), 0)
    return (
      <div style={s.content}>
        <div style={s.metricGrid}>
          <Metric label="External sponsors received" val={fmt(extPaid)} color="#378ADD" />
          <Metric label="External sponsors pending" val={fmt(extPending)} color="#BA7517" />
          <Metric label="Joy contributions" val={fmt(joyTotal)} color="#BA7517" />
          <Metric label="Total entries" val={data.sponsors.length} />
        </div>
        {pending.length > 0 && <>
          <div style={s.sectionHdr}><span style={{ fontSize: 14, fontWeight: 700 }}>Pending — Global CIO Circle</span></div>
          <table style={{ ...s.table, marginBottom: 24 }}><thead><tr>{['Event', 'Sponsor', 'Amount', 'Notes'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {pending.map(sp => <tr key={sp.id}><td style={{ ...s.td, color: '#666' }}>{eventName(sp.event_id)}</td><td style={{ ...s.td, fontWeight: 700 }}>{sp.sponsor_name}</td><td style={{ ...s.td, fontWeight: 700, color: '#BA7517' }}>{fmt(sp.amount)}</td><td style={{ ...s.td, color: '#666' }}>{sp.notes}</td></tr>)}
              <tr><td colSpan={2} style={{ ...s.td, fontWeight: 700 }}>Total pending</td><td style={{ ...s.td, fontWeight: 700, color: '#BA7517' }}>{fmt(pendingTotal)}</td><td style={s.td} /></tr>
            </tbody>
          </table>
        </>}
        <div style={s.sectionHdr}><span style={{ fontSize: 14, fontWeight: 700 }}>All sponsor payments</span><button style={s.btnSm} onClick={() => openModal('addSponsor', { client_id: data.clients[0]?.id, event_id: data.events[0]?.id })}>+ Add</button></div>
        <table style={s.table}><thead><tr>{['Date', 'Event', 'Sponsor', 'Amount', 'Status', 'Type', 'Notes'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>{data.sponsors.map(sp => <tr key={sp.id}><td style={s.td}>{sp.date}</td><td style={{ ...s.td, color: '#666' }}>{eventName(sp.event_id)}</td><td style={{ ...s.td, fontWeight: 700 }}>{sp.sponsor_name}</td><td style={{ ...s.td, fontWeight: 700, color: sp.joy_contribution ? '#BA7517' : '#378ADD' }}>{fmt(sp.amount)}</td><td style={s.td}><span style={s.badge(sp.status)}>{sp.status}</span></td><td style={s.td}>{sp.joy_contribution ? <span style={s.badge('waived')}>Joy</span> : <span style={{ fontSize: 11, color: '#aaa' }}>External</span>}</td><td style={{ ...s.td, color: '#666' }}>{sp.notes}</td></tr>)}</tbody>
        </table>
      </div>
    )
  }

  // Modal content
  const ModalContent = () => {
    const clientEvents = form.client_id ? data.events.filter(e => e.client_id === form.client_id) : []
    return (
      <div style={s.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
        <div style={s.modalBox}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            {modal === 'addClient' ? 'New client' : modal === 'addEvent' ? 'New event' : modal === 'editEvent' ? 'Edit event' : modal === 'addExpense' ? 'Add expense' : modal === 'addInvoice' || modal === 'editInvoice' ? 'Invoice' : 'Add sponsor payment'}
          </h2>

          {modal === 'addClient' && <>
            <Field label="Company name"><input style={s.input} value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Contact"><input style={s.input} value={form.contact || ''} onChange={e => setForm({ ...form, contact: e.target.value })} /></Field>
            <Field label="Commission rate (%)"><input style={s.input} type="number" value={form.service_rate || 10} onChange={e => setForm({ ...form, service_rate: e.target.value })} /></Field>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><input type="checkbox" checked={!!form.gcio_style} onChange={e => setForm({ ...form, gcio_style: e.target.checked })} /><label style={{ fontSize: 13 }}>GCIO-style (sponsor income returned to client)</label></div>
          </>}

          {(modal === 'addEvent' || modal === 'editEvent') && <>
            {modal === 'addEvent' && <Field label="Client"><select style={s.input} value={form.client_id || ''} onChange={e => setForm({ ...form, client_id: e.target.value })}>{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>}
            <Field label="Event name"><input style={s.input} value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            {modal === 'addEvent' && <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Date"><input style={s.input} type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
                <Field label="City"><input style={s.input} value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} /></Field>
              </div>
              <Field label="Location / venue"><input style={s.input} value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} /></Field>
            </>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><input type="checkbox" checked={!!form.commission_waived} onChange={e => setForm({ ...form, commission_waived: e.target.checked })} /><label style={{ fontSize: 13 }}>Commission waived</label></div>
          </>}

          {modal === 'addExpense' && <>
            <Field label="Client"><select style={s.input} value={form.client_id || ''} onChange={e => setForm({ ...form, client_id: e.target.value, event_id: '' })}>{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
            <Field label="Event"><select style={s.input} value={form.event_id || ''} onChange={e => setForm({ ...form, event_id: e.target.value })}>{clientEvents.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Amount ($)"><input style={s.input} type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: e.target.value })} /></Field>
              <Field label="Date"><input style={s.input} type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Category"><select style={s.input} value={form.category || 'Misc'} onChange={e => setForm({ ...form, category: e.target.value })}>{['Venue', 'Food', 'Print', 'Travel', 'Swag', 'AV', 'Misc'].map(c => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Vendor"><input style={s.input} value={form.vendor || ''} onChange={e => setForm({ ...form, vendor: e.target.value })} /></Field>
            </div>
            <Field label="Description"><input style={s.input} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
          </>}

          {(modal === 'addInvoice' || modal === 'editInvoice') && <>
            {!form.id && <>
              <Field label="Client"><select style={s.input} value={form.client_id || ''} onChange={e => setForm({ ...form, client_id: e.target.value, event_id: '' })}>{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
              <Field label="Event"><select style={s.input} value={form.event_id || ''} onChange={e => setForm({ ...form, event_id: e.target.value })}>{clientEvents.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
            </>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Amount ($)"><input style={s.input} type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: e.target.value })} /></Field>
              <Field label="Date"><input style={s.input} type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
            </div>
            <Field label="Status"><select style={s.input} value={form.status || 'Pending'} onChange={e => setForm({ ...form, status: e.target.value })}>{['Pending', 'Paid', 'Partial'].map(v => <option key={v}>{v}</option>)}</select></Field>
            <Field label="Notes"><input style={s.input} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
          </>}

          {modal === 'addSponsor' && <>
            <Field label="Client"><select style={s.input} value={form.client_id || ''} onChange={e => setForm({ ...form, client_id: e.target.value, event_id: '' })}>{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
            <Field label="Event"><select style={s.input} value={form.event_id || ''} onChange={e => setForm({ ...form, event_id: e.target.value })}>{clientEvents.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
            <Field label="Sponsor name"><input style={s.input} value={form.sponsor_name || ''} onChange={e => setForm({ ...form, sponsor_name: e.target.value })} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Amount ($)"><input style={s.input} type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: e.target.value })} /></Field>
              <Field label="Date"><input style={s.input} type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
            </div>
            <Field label="Status"><select style={s.input} value={form.status || 'Paid'} onChange={e => setForm({ ...form, status: e.target.value })}>{['Paid', 'Pending'].map(v => <option key={v}>{v}</option>)}</select></Field>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><input type="checkbox" checked={!!form.joy_contribution} onChange={e => setForm({ ...form, joy_contribution: e.target.checked })} /><label style={{ fontSize: 13 }}>Joy's own contribution (deducted from Joy's commission)</label></div>
            <Field label="Notes"><input style={s.input} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
          </>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button style={s.btn} onClick={closeModal}>Cancel</button>
            <button style={s.btnPrimary} onClick={save}>Save</button>
          </div>
        </div>
      </div>
    )
  }

  const tabs = ['dashboard', 'clients', 'expenses', 'invoices', 'sponsors']
  const tabLabels = ['Dashboard', 'Clients', 'All expenses', 'Invoices', 'Sponsors']

  const renderPage = () => {
    if (loading) return <div style={{ ...s.content, textAlign: 'center', padding: 60, color: '#888' }}>Loading...</div>
    if (page === 'clients') {
      if (eventDetail) return <EventDetail event={eventDetail} />
      if (clientDetail) return <ClientDetail client={clientDetail} />
      return <ClientList />
    }
    if (page === 'expenses') return <AllExpenses />
    if (page === 'invoices') return <AllInvoices />
    if (page === 'sponsors') return <AllSponsors />
    return <Dashboard />
  }

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <h1 style={{ fontSize: 16, fontWeight: 800 }}>Event Tracker — Joy Life</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontFamily: 'inherit' }} value={user} onChange={e => setUser(e.target.value)}>
            {['Alex', 'Jordan', 'Sam', 'Taylor'].map(u => <option key={u}>{u}</option>)}
          </select>
          <button style={s.btnPrimary} onClick={() => openModal('addClient')}>+ Client</button>
        </div>
      </div>
      <div style={s.tabs}>
        {tabs.map((t, i) => (
          <div key={t} style={s.tab(page === t)} onClick={() => { setPage(t); setClientDetail(null); setEventDetail(null) }}>{tabLabels[i]}</div>
        ))}
      </div>
      {renderPage()}
      {modal && <ModalContent />}
    </div>
  )
}
