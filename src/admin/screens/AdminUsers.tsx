import React, { useState } from 'react';
import { ADMIN_CUSTOMERS } from '../data/mock';
import type { AdminCustomer } from '../types';

export default function AdminUsers() {
  const [customers, setCustomers] = useState<AdminCustomer[]>(ADMIN_CUSTOMERS);
  const [search, setSearch] = useState('');

  const update = (id: string, status: AdminCustomer['status']) =>
    setCustomers(prev => prev.map(u => u.id === id ? { ...u, status } : u));

  const filtered = customers.filter(u => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
  });

  const STATUS_STYLE: Record<AdminCustomer['status'], { bg: string; color: string }> = {
    active:  { bg:'#dcfce7', color:'#15803d' },
    flagged: { bg:'#fef3c7', color:'#b45309' },
    banned:  { bg:'#fee2e2', color:'#dc2626' },
  };

  return (
    <div style={s.page}>
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <span>🔍</span>
          <input style={s.searchInput} placeholder="Search name, email or phone…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <span style={s.pill}>{filtered.length} customers · {customers.filter(u=>u.status==='banned').length} banned · {customers.filter(u=>u.status==='flagged').length} flagged</span>
      </div>

      <div style={s.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>{['Customer','Email','Phone','Joined','Bookings','Total Spent','Status','Actions'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={s.empty}>No customers found.</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} style={s.tr}>
                  <td style={s.td}>
                    <div style={s.userCell}>
                      <div style={s.avatar}>{u.name[0]}</div>
                      <span style={{ fontWeight:700 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>{u.phone}</td>
                  <td style={s.td}>{u.joinedDate}</td>
                  <td style={{ ...s.td, fontWeight:700, textAlign:'center' as const }}>{u.totalBookings}</td>
                  <td style={{ ...s.td, fontWeight:700, color:'#16a34a' }}>₱{u.totalSpent.toLocaleString()}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...STATUS_STYLE[u.status] }}>{u.status.charAt(0).toUpperCase()+u.status.slice(1)}</span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display:'flex', gap:6 }}>
                      {u.status !== 'flagged' && <button style={s.btnWarn} onClick={()=>update(u.id,'flagged')}>🚩 Flag</button>}
                      {u.status !== 'banned'  && <button style={s.btnRed}  onClick={()=>update(u.id,'banned')}>🚫 Ban</button>}
                      {u.status !== 'active'  && <button style={s.btnGreen} onClick={()=>update(u.id,'active')}>✓ Restore</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:       { display:'flex', flexDirection:'column', gap:16 },
  toolbar:    { display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' },
  searchWrap: { display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'0 12px' },
  searchInput:{ padding:'9px 0', border:'none', outline:'none', fontSize:13, color:'#0f172a', background:'transparent', minWidth:240 },
  pill:       { fontSize:13, color:'#94a3b8', fontWeight:600 },
  card:       { background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' },
  table:      { width:'100%', borderCollapse:'collapse' as const, minWidth:860 },
  th:         { padding:'10px 16px', textAlign:'left' as const, fontSize:11, fontWeight:700, color:'#64748b', borderBottom:'1px solid #e2e8f0', background:'#f8fafc', textTransform:'uppercase' as const, letterSpacing:0.5, whiteSpace:'nowrap' as const },
  tr:         { borderBottom:'1px solid #f1f5f9' },
  td:         { padding:'12px 16px', fontSize:13, color:'#0f172a', verticalAlign:'middle' as const },
  empty:      { padding:'32px', textAlign:'center' as const, color:'#94a3b8' },
  userCell:   { display:'flex', alignItems:'center', gap:10 },
  avatar:     { width:32, height:32, borderRadius:'50%', background:'#7c3aed', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, flexShrink:0 },
  badge:      { display:'inline-block', padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:700 },
  btnGreen:   { padding:'5px 10px', borderRadius:6, border:'none', background:'#16a34a', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer' },
  btnRed:     { padding:'5px 10px', borderRadius:6, border:'none', background:'#dc2626', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer' },
  btnWarn:    { padding:'5px 10px', borderRadius:6, border:'none', background:'#d97706', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer' },
};
