import { useState } from 'react';
import RescheduleModal from '../components/RescheduleModal';
import StatusBadge from '../components/StatusBadge';
import { getAllBookings, updateBooking } from '@/src/booking/bookingStore';
import { TODAY } from '../data/mock';
import type { BookingStatus, StaffBooking } from '../types';
import { fmt12 } from '../utils/time';

export default function StaffCheckIn() {
  const [bookings,         setBookings]         = useState<StaffBooking[]>(getAllBookings());
  const [search,           setSearch]           = useState('');
  const [rescheduleTarget, setRescheduleTarget] = useState<StaffBooking | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const updateStatus = (id: string, status: BookingStatus) => {
    updateBooking(id, { status });
    setBookings(getAllBookings());
  };

  // Accept customer reschedule request → open reschedule modal
  const handleAcceptReschedule = (booking: StaffBooking) =>
    setRescheduleTarget(booking);

  // Decline customer reschedule → keep original, confirm it
  const handleDeclineReschedule = (id: string) =>
    updateStatus(id, 'confirmed');

  // Reschedule confirm (customer-requested path)
  const handleRescheduleConfirm = (
    updated: Pick<StaffBooking, 'date'|'startTime'|'endTime'|'durationHrs'|'courtId'|'courtName'>,
  ) => {
    if (!rescheduleTarget) return;
    updateBooking(rescheduleTarget.id, { ...updated, status: 'confirmed', rescheduleNote: undefined });
    setBookings(getAllBookings());
    setRescheduleTarget(null);
  };

  const handleRescheduleModalDecline = () => {
    if (!rescheduleTarget) return;
    updateBooking(rescheduleTarget.id, { status: 'confirmed' });
    setBookings(getAllBookings());
    setRescheduleTarget(null);
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const todayAll = bookings.filter((b) => b.date === TODAY);

  const todayActive = todayAll
    .filter((b) =>
      b.status === 'confirmed' ||
      b.status === 'pending'   ||
      b.status === 'checked_in' ||
      b.status === 'reschedule_requested',
    )
    .filter((b) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        b.playerName.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.courtName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const confirmedCount  = todayAll.filter((b) => b.status === 'confirmed').length;
  const checkedInCount  = todayAll.filter((b) => b.status === 'checked_in').length;
  const pendingCount    = todayAll.filter((b) => b.status === 'pending').length;
  const rescheduleCount = todayAll.filter((b) => b.status === 'reschedule_requested').length;

  // Reports
  const noShowCount    = todayAll.filter((b) => b.status === 'no_show').length;
  const completedCount = todayAll.filter((b) => b.status === 'completed').length;
  const cancelledCount = todayAll.filter((b) => b.status === 'cancelled').length;

  return (
    <div style={s.page}>

      {/* ── Summary counts ── */}
      <div style={s.summaryRow}>
        {[
          { label: 'Awaiting Check-In', value: confirmedCount,  color: '#2563eb', bg: '#dbeafe' },
          { label: 'On Court',          value: checkedInCount,  color: '#15803d', bg: '#dcfce7' },
          { label: 'Pending Approval',  value: pendingCount,    color: '#b45309', bg: '#fef3c7' },
          { label: 'Reschedule Req.',   value: rescheduleCount, color: '#7c3aed', bg: '#fdf4ff' },
        ].map((stat) => (
          <div key={stat.label} style={{ ...s.summaryCard, background: stat.bg, borderColor: stat.color + '44' }}>
            <div style={{ ...s.summaryValue, color: stat.color }}>{stat.value}</div>
            <div style={{ ...s.summaryLabel, color: stat.color }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={s.searchWrap}>
        <span style={s.searchIcon}>🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search player name, booking ID, or court…"
          style={s.searchInput}
          aria-label="Search check-ins"
        />
        {search && <button onClick={() => setSearch('')} style={s.clearBtn} aria-label="Clear">✕</button>}
      </div>

      {/* ── Active booking cards ── */}
      {todayActive.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyEmoji}>✅</div>
          <div style={s.emptyTitle}>All clear</div>
          <div style={s.emptySub}>No active bookings match your search.</div>
        </div>
      ) : (
        <div style={s.cardGrid}>
          {todayActive.map((b) => (
            <div
              key={b.id}
              style={{
                ...s.checkCard,
                borderLeft: `4px solid ${
                  b.status === 'reschedule_requested' ? '#7c3aed'
                  : b.status === 'checked_in'         ? '#16a34a'
                  : b.status === 'pending'             ? '#d97706'
                  : '#2563eb'
                }`,
              }}
            >
              {/* Player info */}
              <div style={s.checkCardTop}>
                <div style={s.checkAvatar}>{b.playerName[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={s.checkPlayerName}>{b.playerName}</div>
                  <div style={s.checkPhone}>{b.playerPhone}</div>
                </div>
                <StatusBadge status={b.status} />
              </div>

              {/* ── Reschedule request — response-based UI ── */}
              {b.status === 'reschedule_requested' && (
                <div style={s.rescheduleBox}>
                  <div style={s.rescheduleHeader}>
                    <span style={s.rescheduleIcon}>↻</span>
                    <span style={s.rescheduleTitle}>Customer wants to rebook</span>
                  </div>
                  {b.rescheduleNote && (
                    <div style={s.rescheduleNote}>
                      💬 "{b.rescheduleNote}"
                    </div>
                  )}
                  <div style={s.rescheduleActions}>
                    <button style={s.btnAccept} onClick={() => handleAcceptReschedule(b)}>
                      ✓ Accept & Rebook
                    </button>
                    <button style={s.btnKeep} onClick={() => handleDeclineReschedule(b.id)}>
                      Keep Original Schedule
                    </button>
                  </div>
                </div>
              )}

              {/* Booking details */}
              <div style={s.checkDetails}>
                <div style={s.checkDetail}><span>📅</span> {new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div style={s.checkDetail}><span>🏓</span> {b.courtName}</div>
                <div style={s.checkDetail}><span>🕐</span> {fmt12(b.startTime)} – {fmt12(b.endTime)} · {b.durationHrs}hr</div>
                <div style={s.checkDetail}>
                  <span>💰</span> ₱{b.amount.toLocaleString()}
                  <span style={b.paid ? s.paidTag : s.unpaidTag}>{b.paid ? 'Paid' : 'Unpaid'}</span>
                </div>
              </div>

              <div style={s.checkId}>{b.id}</div>

              {/* Standard workflow actions (non-reschedule) */}
              {b.status !== 'reschedule_requested' && (
                <div style={s.checkActions}>
                  {b.status === 'pending' && (
                    <>
                      <button style={s.btnGreen} onClick={() => updateStatus(b.id, 'confirmed')}>✓ Approve</button>
                      <button style={s.btnRed}   onClick={() => updateStatus(b.id, 'cancelled')}>✕ Decline</button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <>
                      <button style={s.btnGreen} onClick={() => updateStatus(b.id, 'checked_in')}>✅ On Court</button>
                      <button style={s.btnGhost} onClick={() => updateStatus(b.id, 'no_show')}>No Show</button>
                    </>
                  )}
                  {b.status === 'checked_in' && (
                    <button style={s.btnBlue} onClick={() => updateStatus(b.id, 'completed')}>✓ Mark Complete</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── End-of-shift Reports ── */}
      <div style={s.reportCard}>
        <div style={s.reportHeader}>
          <h3 style={s.reportTitle}>📋 Today's Report</h3>
          <span style={s.reportSub}>End-of-shift summary</span>
        </div>
        <div style={s.reportGrid}>
          {[
            { icon: '✅', label: 'Completed', value: completedCount, color: '#15803d', bg: '#dcfce7' },
            { icon: '⏳', label: 'Pending',   value: pendingCount,   color: '#b45309', bg: '#fef3c7' },
            { icon: '🚫', label: 'No Show',   value: noShowCount,    color: '#dc2626', bg: '#fee2e2' },
            { icon: '✕',  label: 'Cancelled', value: cancelledCount, color: '#64748b', bg: '#f1f5f9' },
          ].map((r) => (
            <div key={r.label} style={{ ...s.reportItem, background: r.bg }}>
              <span style={s.reportItemIcon}>{r.icon}</span>
              <div style={{ ...s.reportItemValue, color: r.color }}>{r.value}</div>
              <div style={{ ...s.reportItemLabel, color: r.color }}>{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modals ── */}
      {rescheduleTarget && (
        <RescheduleModal
          booking={rescheduleTarget}
          onConfirm={handleRescheduleConfirm}
          onDecline={handleRescheduleModalDecline}
          onClose={() => setRescheduleTarget(null)}
        />
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:        { display: 'flex', flexDirection: 'column', gap: 20 },

  summaryRow:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 },
  summaryCard: { border: '1px solid', borderRadius: 12, padding: '16px 20px', textAlign: 'center' as const },
  summaryValue:{ fontSize: 32, fontWeight: 900, marginBottom: 4 },
  summaryLabel:{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 0.4 },

  searchWrap:  { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0 16px' },
  searchIcon:  { fontSize: 15, color: '#94a3b8' },
  searchInput: { flex: 1, padding: '12px 0', border: 'none', outline: 'none', fontSize: 14, color: '#0f172a', background: 'transparent' },
  clearBtn:    { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 14, padding: 4 },

  empty:      { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: 800, color: '#0f172a' },
  emptySub:   { fontSize: 13, color: '#94a3b8' },

  cardGrid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  checkCard:       { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 },
  checkCardTop:    { display: 'flex', alignItems: 'center', gap: 12 },
  checkAvatar:     { width: 42, height: 42, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, flexShrink: 0 },
  checkPlayerName: { fontSize: 15, fontWeight: 800, color: '#0f172a' },
  checkPhone:      { fontSize: 12, color: '#64748b', marginTop: 1 },

  rescheduleBox:     { background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 },
  rescheduleHeader:  { display: 'flex', alignItems: 'center', gap: 8 },
  rescheduleIcon:    { fontSize: 16, color: '#7c3aed' },
  rescheduleTitle:   { fontSize: 13, fontWeight: 700, color: '#4c1d95' },
  rescheduleNote:    { fontSize: 12, color: '#4c1d95', fontStyle: 'italic', lineHeight: 1.5 },
  rescheduleActions: { display: 'flex', gap: 8, marginTop: 4 },
  btnAccept:         { flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  btnKeep:           { flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e9d5ff', background: '#fff', color: '#7c3aed', fontSize: 12, fontWeight: 600, cursor: 'pointer' },

  checkDetails: { display: 'flex', flexDirection: 'column', gap: 5, padding: '10px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' },
  checkDetail:  { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' },
  paidTag:      { marginLeft: 6, padding: '1px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#15803d' },
  unpaidTag:    { marginLeft: 6, padding: '1px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#b45309' },
  checkId:      { fontSize: 11, fontFamily: 'monospace', color: '#94a3b8' },
  checkActions: { display: 'flex', gap: 8 },

  btnGreen: { flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  btnBlue:  { flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  btnRed:   { flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  btnGhost: { flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' },

  reportCard:      { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' },
  reportHeader:    { display: 'flex', alignItems: 'baseline', gap: 10, padding: '16px 20px', borderBottom: '1px solid #f1f5f9' },
  reportTitle:     { fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 },
  reportSub:       { fontSize: 12, color: '#94a3b8' },
  reportGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 0 },
  reportItem:      { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', gap: 4, borderRight: '1px solid #f1f5f9' },
  reportItemIcon:  { fontSize: 22 },
  reportItemValue: { fontSize: 28, fontWeight: 900 },
  reportItemLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 0.4 },
};
