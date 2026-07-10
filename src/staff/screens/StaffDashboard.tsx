import React from 'react';
import StatusBadge from '../components/StatusBadge';
import { STAFF_BOOKINGS, STAFF_COURTS, TODAY } from '../data/mock';
import { fmt12 } from '../utils/time';

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default function StaffDashboard() {
  const todayBookings = STAFF_BOOKINGS.filter((b) => b.date === TODAY);
  const total         = todayBookings.length;
  const checkedIn     = todayBookings.filter((b) => b.status === 'checked_in').length;
  const pending       = todayBookings.filter((b) => b.status === 'pending').length;
  const completed     = todayBookings.filter((b) => b.status === 'completed').length;
  const reschedules   = todayBookings.filter((b) => b.status === 'reschedule_requested').length;
  const activeCourts  = STAFF_COURTS.filter((c) => c.active).length;

  const upcoming = [...todayBookings]
    .filter((b) => b.status === 'confirmed' || b.status === 'pending' || b.status === 'reschedule_requested')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 5);

  const stats = [
    { icon: '📅', label: "Today's Bookings", value: total,        sub: `${completed} completed`,          accent: '#2563eb' },
    { icon: '✅', label: 'Checked In',        value: checkedIn,    sub: `${total - checkedIn} remaining`,  accent: '#16a34a' },
    { icon: '⏳', label: 'Pending',           value: pending,      sub: 'Need attention',                  accent: '#d97706' },
    { icon: '↻',  label: 'Reschedules',       value: reschedules,  sub: 'Customer requests',               accent: '#7c3aed' },
    { icon: '🏓', label: 'Active Courts',     value: activeCourts, sub: `of ${STAFF_COURTS.length} total`, accent: '#0284c7' },
  ];

  return (
    <div style={s.page}>
      {/* Banner */}
      <div style={s.banner}>
        <div>
          <div style={s.bannerTitle}>Good {getTimeOfDay()}, ready for your shift 👋</div>
          <div style={s.bannerSub}>
            {pending > 0 || reschedules > 0
              ? `${pending} pending · ${reschedules} reschedule request${reschedules !== 1 ? 's' : ''} · ${total - completed} bookings remaining`
              : `All caught up · ${total} bookings today`}
          </div>
        </div>
        <span style={s.bannerEmoji}>🏓</span>
      </div>

      {/* KPI stats */}
      <div style={s.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ ...s.statCard, borderTop: `3px solid ${stat.accent}` }}>
            <div style={{ ...s.statIcon, background: stat.accent + '18' }}>{stat.icon}</div>
            <div style={s.statValue}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
            <div style={s.statSub}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Two column */}
      <div style={s.twoCol}>
        {/* Upcoming table */}
        <div style={s.tableCard}>
          <div style={s.cardHead}>
            <h3 style={s.cardTitle}>Upcoming Bookings</h3>
            <span style={s.cardCount}>{upcoming.length} action needed</span>
          </div>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Player', 'Court', 'Time', 'Paid', 'Status'].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upcoming.length === 0 ? (
                  <tr><td colSpan={5} style={s.emptyCell}>✓ No pending bookings</td></tr>
                ) : upcoming.map((b) => (
                  <tr key={b.id} style={{ ...s.tr, ...(b.status === 'reschedule_requested' ? s.trReschedule : {}) }}>
                    <td style={s.td}>
                      <div style={s.playerCell}>
                        <div style={s.avatar}>{b.playerName[0]}</div>
                        <div>
                          <div style={s.playerName}>{b.playerName}</div>
                          <div style={s.playerPhone}>{b.playerPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>{b.courtName}</td>
                    <td style={{ ...s.td, whiteSpace: 'nowrap' as const }}>{fmt12(b.startTime)} – {fmt12(b.endTime)}</td>
                    <td style={s.td}>
                      <span style={b.paid ? s.paidBadge : s.unpaidBadge}>{b.paid ? '✓ Paid' : 'Unpaid'}</span>
                    </td>
                    <td style={s.td}><StatusBadge status={b.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Court overview */}
        <div style={s.courtCard}>
          <div style={s.cardHead}>
            <h3 style={s.cardTitle}>Court Overview</h3>
          </div>
          {STAFF_COURTS.map((c) => {
            const count = todayBookings.filter((b) => b.courtId === c.id && b.status !== 'cancelled').length;
            return (
              <div key={c.id} style={s.courtRow}>
                <div style={{ ...s.courtDot, background: c.active ? '#16a34a' : '#94a3b8' }} />
                <div style={{ flex: 1 }}>
                  <div style={s.courtName}>{c.name}</div>
                  <div style={s.courtMeta}>{c.type} · {count} bookings today</div>
                </div>
                <span style={c.active ? s.openBadge : s.closedBadge}>{c.active ? 'Open' : 'Closed'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:        { display: 'flex', flexDirection: 'column', gap: 24 },
  banner:      { background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', borderRadius: 16, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' },
  bannerTitle: { fontSize: 18, fontWeight: 800, marginBottom: 6 },
  bannerSub:   { fontSize: 13, color: '#94a3b8', lineHeight: 1.5 },
  bannerEmoji: { fontSize: 52, flexShrink: 0 },
  statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 16 },
  statCard:    { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4 },
  statIcon:    { width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 6 },
  statValue:   { fontSize: 26, fontWeight: 900, color: '#0f172a' },
  statLabel:   { fontSize: 12, fontWeight: 700, color: '#0f172a' },
  statSub:     { fontSize: 11, color: '#94a3b8' },
  twoCol:      { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' },
  tableCard:   { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' },
  courtCard:   { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' },
  cardHead:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' },
  cardTitle:   { fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 },
  cardCount:   { fontSize: 12, color: '#94a3b8', fontWeight: 600 },
  tableWrap:   { overflowX: 'auto' as const },
  table:       { width: '100%', borderCollapse: 'collapse' as const, minWidth: 500 },
  th:          { padding: '10px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', textTransform: 'uppercase' as const, letterSpacing: 0.5, whiteSpace: 'nowrap' as const },
  tr:          { borderBottom: '1px solid #f1f5f9' },
  trReschedule:{ background: '#fdf4ff' },
  td:          { padding: '12px 16px', fontSize: 13, color: '#0f172a', verticalAlign: 'middle' as const },
  emptyCell:   { padding: '28px 16px', textAlign: 'center' as const, color: '#94a3b8', fontSize: 13 },
  playerCell:  { display: 'flex', alignItems: 'center', gap: 10 },
  avatar:      { width: 32, height: 32, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 },
  playerName:  { fontWeight: 700, fontSize: 13 },
  playerPhone: { fontSize: 11, color: '#94a3b8' },
  paidBadge:   { display: 'inline-block', padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#15803d' },
  unpaidBadge: { display: 'inline-block', padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#fef3c7', color: '#b45309' },
  courtRow:    { display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: '1px solid #f1f5f9' },
  courtDot:    { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  courtName:   { fontSize: 13, fontWeight: 700, color: '#0f172a' },
  courtMeta:   { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  openBadge:   { display: 'inline-block', padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#15803d', flexShrink: 0 },
  closedBadge: { display: 'inline-block', padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#64748b', flexShrink: 0 },
};
