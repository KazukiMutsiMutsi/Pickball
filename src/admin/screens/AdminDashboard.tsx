import React from 'react';
import { getAllBookings, getAllCourts } from '@/src/booking/bookingStore';
import { TODAY } from '../data/mock';
import { ADMIN_CUSTOMERS, ADMIN_STAFF } from '../data/mock';

export default function AdminDashboard() {
  const ADMIN_BOOKINGS = getAllBookings();
  const ADMIN_COURTS   = getAllCourts();

  const todayB    = ADMIN_BOOKINGS.filter((b) => b.date === TODAY);
  const revenue   = ADMIN_BOOKINGS.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0);
  const todayRev  = todayB.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0);
  const pending   = todayB.filter((b) => b.status === 'pending').length;
  const active    = ADMIN_COURTS.filter((c) => c.active).length;

  const stats = [
    { icon: '💰', label: 'Total Revenue',    value: `₱${revenue.toLocaleString()}`,  sub: `₱${todayRev.toLocaleString()} today`, accent: '#16a34a' },
    { icon: '📅', label: "Today's Bookings", value: todayB.length,                   sub: `${pending} pending approval`,         accent: '#2563eb' },
    { icon: '👤', label: 'Total Customers',  value: ADMIN_CUSTOMERS.length,          sub: `${ADMIN_CUSTOMERS.filter(u=>u.status==='active').length} active`, accent: '#0284c7' },
    { icon: '🏓', label: 'Active Courts',    value: active,                           sub: `of ${ADMIN_COURTS.length} total`,     accent: '#7c3aed' },
    { icon: '👷', label: 'Staff Members',    value: ADMIN_STAFF.length,              sub: `${ADMIN_STAFF.filter(s=>s.status==='active').length} on active`, accent: '#d97706' },
  ];

  // Revenue per court
  const courtRevenue = ADMIN_COURTS.map((c) => ({
    name: c.name,
    revenue: ADMIN_BOOKINGS.filter((b) => b.courtId === c.id && b.paid).reduce((s, b) => s + b.amount, 0),
    bookings: ADMIN_BOOKINGS.filter((b) => b.courtId === c.id).length,
  }));

  const maxRev = Math.max(...courtRevenue.map((c) => c.revenue), 1);

  // Recent bookings
  const recent = [...ADMIN_BOOKINGS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const STATUS_COLOR: Record<string, string> = {
    confirmed:'#2563eb', pending:'#d97706', checked_in:'#16a34a',
    completed:'#64748b', cancelled:'#dc2626', no_show:'#dc2626', reschedule_requested:'#7c3aed',
  };
  const STATUS_LABEL: Record<string, string> = {
    confirmed:'Confirmed', pending:'Pending', checked_in:'On Court',
    completed:'Completed', cancelled:'Cancelled', no_show:'No Show', reschedule_requested:'↻ Reschedule',
  };

  return (
    <div style={s.page}>
      {/* Banner */}
      <div style={s.banner}>
        <div>
          <div style={s.bannerTitle}>Welcome back, Admin 👋</div>
          <div style={s.bannerSub}>PicklePro · Pajo, Lapu-Lapu City · Full system access</div>
        </div>
        <span style={{ fontSize: 52 }}>🏓</span>
      </div>

      {/* KPI stats */}
      <div style={s.statsGrid}>
        {stats.map((st) => (
          <div key={st.label} style={{ ...s.statCard, borderTop: `3px solid ${st.accent}` }}>
            <div style={{ ...s.statIcon, background: st.accent + '18' }}>{st.icon}</div>
            <div style={s.statValue}>{st.value}</div>
            <div style={s.statLabel}>{st.label}</div>
            <div style={s.statSub}>{st.sub}</div>
          </div>
        ))}
      </div>

      <div style={s.twoCol}>
        {/* Recent bookings */}
        <div style={s.card}>
          <div style={s.cardHead}><h3 style={s.cardTitle}>Recent Bookings</h3></div>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>{['ID','Player','Court','Date','Amount','Status'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} style={s.tr}>
                    <td style={{ ...s.td, fontFamily:'monospace', fontSize:11, color:'#94a3b8' }}>{b.id}</td>
                    <td style={s.td}><div style={s.playerName}>{b.playerName}</div><div style={s.playerPhone}>{b.playerPhone}</div></td>
                    <td style={s.td}>{b.courtName}</td>
                    <td style={s.td}>{b.date}</td>
                    <td style={{ ...s.td, fontWeight:700 }}>₱{b.amount.toLocaleString()}</td>
                    <td style={s.td}><span style={{ ...s.badge, background: STATUS_COLOR[b.status]+'18', color: STATUS_COLOR[b.status] }}>{STATUS_LABEL[b.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Court revenue */}
        <div style={s.card}>
          <div style={s.cardHead}><h3 style={s.cardTitle}>Revenue by Court</h3></div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {courtRevenue.map((c) => (
              <div key={c.name}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{c.name}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#16a34a' }}>₱{c.revenue.toLocaleString()}</span>
                </div>
                <div style={{ background:'#f1f5f9', borderRadius:99, height:8, overflow:'hidden' }}>
                  <div style={{ width:`${(c.revenue/maxRev)*100}%`, background:'#7c3aed', height:'100%', borderRadius:99, transition:'width 600ms' }} />
                </div>
                <div style={{ fontSize:11, color:'#94a3b8', marginTop:3 }}>{c.bookings} bookings</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:       { display:'flex', flexDirection:'column', gap:24 },
  banner:     { background:'linear-gradient(135deg,#1e1b4b,#4c1d95)', borderRadius:16, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', color:'#fff' },
  bannerTitle:{ fontSize:20, fontWeight:800, marginBottom:4 },
  bannerSub:  { fontSize:13, color:'#c4b5fd' },
  statsGrid:  { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:16 },
  statCard:   { background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'16px 18px', display:'flex', flexDirection:'column', gap:4 },
  statIcon:   { width:36, height:36, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, marginBottom:4 },
  statValue:  { fontSize:26, fontWeight:900, color:'#0f172a' },
  statLabel:  { fontSize:12, fontWeight:700, color:'#0f172a' },
  statSub:    { fontSize:11, color:'#94a3b8' },
  twoCol:     { display:'grid', gridTemplateColumns:'1fr 340px', gap:20, alignItems:'start' },
  card:       { background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' },
  cardHead:   { padding:'16px 20px', borderBottom:'1px solid #e2e8f0' },
  cardTitle:  { fontSize:15, fontWeight:700, color:'#0f172a', margin:0 },
  table:      { width:'100%', borderCollapse:'collapse' as const, minWidth:500 },
  th:         { padding:'10px 16px', textAlign:'left' as const, fontSize:11, fontWeight:700, color:'#64748b', borderBottom:'1px solid #e2e8f0', background:'#f8fafc', textTransform:'uppercase' as const, letterSpacing:0.5, whiteSpace:'nowrap' as const },
  tr:         { borderBottom:'1px solid #f1f5f9' },
  td:         { padding:'12px 16px', fontSize:13, color:'#0f172a', verticalAlign:'middle' as const },
  playerName: { fontWeight:700, fontSize:13 },
  playerPhone:{ fontSize:11, color:'#94a3b8' },
  badge:      { display:'inline-block', padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:700 },
};
