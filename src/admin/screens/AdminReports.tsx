import React, { useState } from 'react';
import { getAllBookings, getAllCourts } from '@/src/booking/bookingStore';

type Period = 'daily' | 'weekly' | 'monthly';

export default function AdminReports() {
  const [period, setPeriod] = useState<Period>('monthly');

  const ADMIN_BOOKINGS = getAllBookings();
  const ADMIN_COURTS   = getAllCourts();

  const paid = ADMIN_BOOKINGS.filter(b => b.paid);
  const totalRevenue  = paid.reduce((s,b) => s+b.amount, 0);
  const totalBookings = ADMIN_BOOKINGS.length;
  const avgPerBooking = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
  const paidRate      = totalBookings > 0 ? Math.round((paid.length / totalBookings) * 100) : 0;

  // Revenue per court
  const courtStats = ADMIN_COURTS.map(c => ({
    name: c.name,
    revenue: ADMIN_BOOKINGS.filter(b=>b.courtId===c.id&&b.paid).reduce((s,b)=>s+b.amount,0),
    bookings: ADMIN_BOOKINGS.filter(b=>b.courtId===c.id).length,
    completed: ADMIN_BOOKINGS.filter(b=>b.courtId===c.id&&b.status==='completed').length,
    noShow: ADMIN_BOOKINGS.filter(b=>b.courtId===c.id&&b.status==='no_show').length,
  }));
  const maxRev = Math.max(...courtStats.map(c=>c.revenue), 1);

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  ADMIN_BOOKINGS.forEach(b => { statusCounts[b.status] = (statusCounts[b.status]||0)+1; });
  const STATUS_COLOR: Record<string,string> = {
    confirmed:'#2563eb',pending:'#d97706',checked_in:'#16a34a',
    completed:'#64748b',cancelled:'#dc2626',no_show:'#dc2626',reschedule_requested:'#7c3aed',
  };
  const STATUS_LABEL: Record<string,string> = {
    confirmed:'Confirmed',pending:'Pending',checked_in:'On Court',
    completed:'Completed',cancelled:'Cancelled',no_show:'No Show',reschedule_requested:'Reschedule',
  };

  return (
    <div style={s.page}>
      {/* Period toggle */}
      <div style={s.periodRow}>
        {(['daily','weekly','monthly'] as Period[]).map(p => (
          <button key={p} style={{ ...s.periodBtn, ...(period===p ? s.periodBtnActive:{}) }} onClick={()=>setPeriod(p)}>
            {p.charAt(0).toUpperCase()+p.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary KPIs */}
      <div style={s.kpiGrid}>
        {[
          { label:'Total Revenue',    value:`₱${totalRevenue.toLocaleString()}`, icon:'💰', color:'#16a34a' },
          { label:'Total Bookings',   value:totalBookings,                        icon:'📅', color:'#2563eb' },
          { label:'Avg per Booking',  value:`₱${avgPerBooking.toLocaleString()}`, icon:'📊', color:'#7c3aed' },
          { label:'Payment Rate',     value:`${paidRate}%`,                       icon:'✅', color:'#0284c7' },
        ].map(k => (
          <div key={k.label} style={{ ...s.kpiCard, borderTop:`3px solid ${k.color}` }}>
            <div style={{ fontSize:24 }}>{k.icon}</div>
            <div style={{ fontSize:24, fontWeight:900, color:'#0f172a' }}>{k.value}</div>
            <div style={{ fontSize:12, fontWeight:700, color:'#64748b' }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={s.twoCol}>
        {/* Court breakdown */}
        <div style={s.card}>
          <div style={s.cardHead}><h3 style={s.cardTitle}>Revenue by Court</h3></div>
          <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:18 }}>
            {courtStats.map(c => (
              <div key={c.name}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:14, fontWeight:800, color:'#0f172a' }}>{c.name}</span>
                  <span style={{ fontSize:14, fontWeight:800, color:'#16a34a' }}>₱{c.revenue.toLocaleString()}</span>
                </div>
                <div style={{ background:'#f1f5f9', borderRadius:99, height:10, overflow:'hidden', marginBottom:4 }}>
                  <div style={{ width:`${(c.revenue/maxRev)*100}%`, background:'#7c3aed', height:'100%', borderRadius:99 }} />
                </div>
                <div style={{ display:'flex', gap:16, fontSize:11, color:'#94a3b8' }}>
                  <span>📅 {c.bookings} bookings</span>
                  <span>✅ {c.completed} completed</span>
                  <span>🚫 {c.noShow} no-show</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div style={s.card}>
          <div style={s.cardHead}><h3 style={s.cardTitle}>Booking Status Breakdown</h3></div>
          <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:12, height:12, borderRadius:3, background:STATUS_COLOR[status]??'#94a3b8', flexShrink:0 }} />
                <span style={{ flex:1, fontSize:13, color:'#0f172a' }}>{STATUS_LABEL[status]??status}</span>
                <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{count}</span>
                <div style={{ width:80, background:'#f1f5f9', borderRadius:99, height:6, overflow:'hidden' }}>
                  <div style={{ width:`${(count/totalBookings)*100}%`, background:STATUS_COLOR[status]??'#94a3b8', height:'100%', borderRadius:99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:          { display:'flex', flexDirection:'column', gap:20 },
  periodRow:     { display:'flex', border:'1.5px solid #e2e8f0', borderRadius:8, overflow:'hidden', alignSelf:'flex-start' },
  periodBtn:     { padding:'8px 20px', border:'none', background:'#fff', fontSize:13, fontWeight:600, color:'#64748b', cursor:'pointer' },
  periodBtnActive:{ background:'#7c3aed', color:'#fff' },
  kpiGrid:       { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:16 },
  kpiCard:       { background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'16px 18px', display:'flex', flexDirection:'column', gap:6 },
  twoCol:        { display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' },
  card:          { background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' },
  cardHead:      { padding:'16px 20px', borderBottom:'1px solid #e2e8f0' },
  cardTitle:     { fontSize:15, fontWeight:700, color:'#0f172a', margin:0 },
};
