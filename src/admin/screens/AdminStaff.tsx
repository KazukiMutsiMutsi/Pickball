import React, { useState } from 'react';
import { ADMIN_STAFF, AUDIT_LOG } from '../data/mock';
import type { AdminStaffMember } from '../types';

export default function AdminStaff() {
  const [staff, setStaff] = useState<AdminStaffMember[]>(ADMIN_STAFF);
  const [tab, setTab] = useState<'members' | 'audit'>('members');

  const toggle = (id: string) =>
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'suspended' : 'active' } : s));

  return (
    <div style={s.page}>
      <div style={s.tabs}>
        <button style={{ ...s.tab, ...(tab==='members' ? s.tabActive : {}) }} onClick={()=>setTab('members')}>👷 Staff Members</button>
        <button style={{ ...s.tab, ...(tab==='audit'   ? s.tabActive : {}) }} onClick={()=>setTab('audit')}>📋 Audit Log</button>
      </div>

      {tab === 'members' && (
        <div style={s.card}>
          <div style={{ overflowX:'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>{['Staff','Email','Phone','Joined','Last Login','Actions Taken','Status','Actions'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {staff.map((m) => (
                  <tr key={m.id} style={s.tr}>
                    <td style={s.td}>
                      <div style={s.userCell}>
                        <div style={{ ...s.avatar, background: m.status==='suspended' ? '#94a3b8' : '#7c3aed' }}>{m.name[0]}</div>
                        <span style={{ fontWeight:700 }}>{m.name}</span>
                      </div>
                    </td>
                    <td style={s.td}>{m.email}</td>
                    <td style={s.td}>{m.phone}</td>
                    <td style={s.td}>{m.joinedDate}</td>
                    <td style={s.td}>{m.lastLogin}</td>
                    <td style={{ ...s.td, fontWeight:700, textAlign:'center' as const }}>{m.totalActions}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, background: m.status==='active' ? '#dcfce7':'#fee2e2', color: m.status==='active' ? '#15803d':'#dc2626' }}>
                        {m.status.charAt(0).toUpperCase()+m.status.slice(1)}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button
                        style={{ ...s.btnToggle, background: m.status==='active' ? '#fef3c7':'#dcfce7', color: m.status==='active' ? '#b45309':'#15803d' }}
                        onClick={()=>toggle(m.id)}
                      >
                        {m.status==='active' ? '⏸ Suspend' : '▶ Restore'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'audit' && (
        <div style={s.card}>
          <div style={{ overflowX:'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>{['Timestamp','Staff','Action','Target'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {AUDIT_LOG.map((a) => (
                  <tr key={a.id} style={s.tr}>
                    <td style={{ ...s.td, fontFamily:'monospace', fontSize:11, color:'#94a3b8', whiteSpace:'nowrap' as const }}>{a.timestamp}</td>
                    <td style={{ ...s.td, fontWeight:700 }}>{a.staffName}</td>
                    <td style={s.td}>{a.action}</td>
                    <td style={{ ...s.td, color:'#475569' }}>{a.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:      { display:'flex', flexDirection:'column', gap:16 },
  tabs:      { display:'flex', border:'1.5px solid #e2e8f0', borderRadius:8, overflow:'hidden', alignSelf:'flex-start' },
  tab:       { padding:'8px 20px', border:'none', background:'#fff', fontSize:13, fontWeight:600, color:'#64748b', cursor:'pointer' },
  tabActive: { background:'#0f172a', color:'#fff' },
  card:      { background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' },
  table:     { width:'100%', borderCollapse:'collapse' as const, minWidth:760 },
  th:        { padding:'10px 16px', textAlign:'left' as const, fontSize:11, fontWeight:700, color:'#64748b', borderBottom:'1px solid #e2e8f0', background:'#f8fafc', textTransform:'uppercase' as const, letterSpacing:0.5, whiteSpace:'nowrap' as const },
  tr:        { borderBottom:'1px solid #f1f5f9' },
  td:        { padding:'12px 16px', fontSize:13, color:'#0f172a', verticalAlign:'middle' as const },
  userCell:  { display:'flex', alignItems:'center', gap:10 },
  avatar:    { width:32, height:32, borderRadius:'50%', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, flexShrink:0 },
  badge:     { display:'inline-block', padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:700 },
  btnToggle: { padding:'5px 12px', borderRadius:6, border:'none', fontSize:12, fontWeight:700, cursor:'pointer' },
};
