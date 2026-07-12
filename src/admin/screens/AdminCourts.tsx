import React, { useState } from 'react';
import { getAllBookings, getAllCourts, updateCourt } from '@/src/booking/bookingStore';
import { TODAY } from '../data/mock';
import type { AdminCourt } from '../types';

export default function AdminCourts() {
  const [courts, setCourts] = useState<AdminCourt[]>(getAllCourts() as AdminCourt[]);
  const [editing, setEditing] = useState<AdminCourt | null>(null);
  const [form, setForm] = useState<Partial<AdminCourt>>({});

  const openEdit = (c: AdminCourt) => { setEditing(c); setForm({ ...c }); };
  const closeEdit = () => { setEditing(null); setForm({}); };

  const saveEdit = () => {
    if (!editing) return;
    updateCourt(editing.id, form as Partial<AdminCourt>);
    setCourts(getAllCourts() as AdminCourt[]);
    closeEdit();
  };

  const toggleActive = (id: string) => {
    const court = courts.find(c => c.id === id);
    if (!court) return;
    updateCourt(id, { active: !court.active });
    setCourts(getAllCourts() as AdminCourt[]);
  };

  return (
    <div style={s.page}>
      <div style={s.grid}>
        {courts.map((c) => {
          const todayBookings = getAllBookings().filter(b => b.courtId === c.id && b.date === TODAY).length;
          const totalBookings = getAllBookings().filter(b => b.courtId === c.id).length;
          const totalRevenue  = getAllBookings().filter(b => b.courtId === c.id && b.paid).reduce((s,b)=>s+b.amount,0);
          return (
            <div key={c.id} style={{ ...s.card, opacity: c.active ? 1 : 0.6 }}>
              <div style={s.cardTop}>
                <div style={{ ...s.dot, background: c.active ? '#16a34a' : '#94a3b8' }} />
                <span style={s.courtName}>{c.name}</span>
                <span style={{ ...s.typeBadge }}>{c.type}</span>
                <span style={{ ...s.statusBadge, background: c.active ? '#dcfce7' : '#f1f5f9', color: c.active ? '#15803d' : '#64748b' }}>
                  {c.active ? 'Open' : 'Closed'}
                </span>
              </div>

              <div style={s.meta}>
                <div style={s.metaRow}><span>📍</span> {c.location}</div>
                <div style={s.metaRow}><span>💰</span> ₱{c.pricePerHour}/hr</div>
              </div>

              <div style={s.statsRow}>
                <div style={s.stat}><div style={s.statVal}>{todayBookings}</div><div style={s.statLbl}>Today</div></div>
                <div style={s.stat}><div style={s.statVal}>{totalBookings}</div><div style={s.statLbl}>Total Bookings</div></div>
                <div style={s.stat}><div style={{ ...s.statVal, color:'#16a34a' }}>₱{totalRevenue.toLocaleString()}</div><div style={s.statLbl}>Revenue</div></div>
              </div>

              <div style={s.actions}>
                <button style={s.btnEdit} onClick={() => openEdit(c)}>✏️ Edit</button>
                <button style={{ ...s.btnToggle, background: c.active ? '#fef3c7' : '#dcfce7', color: c.active ? '#b45309' : '#15803d' }}
                  onClick={() => toggleActive(c.id)}>
                  {c.active ? '🔒 Close' : '🔓 Open'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={s.backdrop}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <h2 style={s.modalTitle}>Edit {editing.name}</h2>
              <button onClick={closeEdit} style={s.closeBtn}>✕</button>
            </div>
            {[
              { label:'Court Name', key:'name', type:'text' },
              { label:'Location',   key:'location', type:'text' },
              { label:'Price per Hour (₱)', key:'pricePerHour', type:'number' },
            ].map(({ label, key, type }) => (
              <div key={key} style={s.field}>
                <label style={s.label}>{label}</label>
                <input style={s.input} type={type} value={(form as any)[key] ?? ''} onChange={e=>setForm(f=>({ ...f, [key]: type==='number' ? Number(e.target.value) : e.target.value }))} />
              </div>
            ))}
            <div style={s.field}>
              <label style={s.label}>Type</label>
              <select style={s.input} value={form.type ?? 'Indoor'} onChange={e=>setForm(f=>({...f,type:e.target.value as any}))}>
                <option>Indoor</option><option>Outdoor</option><option>Covered</option>
              </select>
            </div>
            <div style={s.modalActions}>
              <button style={s.btnCancel} onClick={closeEdit}>Cancel</button>
              <button style={s.btnSave} onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:        { display:'flex', flexDirection:'column', gap:20 },
  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 },
  card:        { background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:20, display:'flex', flexDirection:'column', gap:14 },
  cardTop:     { display:'flex', alignItems:'center', gap:8 },
  dot:         { width:10, height:10, borderRadius:'50%', flexShrink:0 },
  courtName:   { fontSize:16, fontWeight:800, color:'#0f172a', flex:1 },
  typeBadge:   { fontSize:10, fontWeight:700, background:'#f1f5f9', color:'#475569', padding:'2px 8px', borderRadius:99, textTransform:'uppercase' as const },
  statusBadge: { fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:99 },
  meta:        { display:'flex', flexDirection:'column', gap:5 },
  metaRow:     { display:'flex', alignItems:'center', gap:7, fontSize:13, color:'#475569' },
  statsRow:    { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, background:'#f8fafc', borderRadius:10, padding:12 },
  stat:        { display:'flex', flexDirection:'column', alignItems:'center', gap:3 },
  statVal:     { fontSize:18, fontWeight:900, color:'#0f172a' },
  statLbl:     { fontSize:10, color:'#94a3b8', fontWeight:600, textAlign:'center' as const },
  actions:     { display:'flex', gap:8 },
  btnEdit:     { flex:1, padding:'8px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#fff', color:'#0f172a', fontSize:13, fontWeight:600, cursor:'pointer' },
  btnToggle:   { flex:1, padding:'8px', borderRadius:8, border:'none', fontSize:13, fontWeight:700, cursor:'pointer' },
  backdrop:    { position:'fixed' as const, inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  modal:       { background:'#fff', borderRadius:14, padding:28, width:'100%', maxWidth:440, display:'flex', flexDirection:'column', gap:14 },
  modalHead:   { display:'flex', alignItems:'center', justifyContent:'space-between' },
  modalTitle:  { fontSize:17, fontWeight:800, margin:0 },
  closeBtn:    { background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#94a3b8' },
  field:       { display:'flex', flexDirection:'column', gap:5 },
  label:       { fontSize:12, fontWeight:700, color:'#374151' },
  input:       { padding:'9px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, color:'#0f172a', outline:'none' },
  modalActions:{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:4 },
  btnCancel:   { padding:'9px 16px', borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', color:'#64748b', fontSize:13, cursor:'pointer' },
  btnSave:     { padding:'9px 18px', borderRadius:8, border:'none', background:'#7c3aed', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' },
};
