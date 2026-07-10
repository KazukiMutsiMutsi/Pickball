import React, { useState } from 'react';
import { STAFF_BOOKINGS, STAFF_COURTS } from '../data/mock';
import type { BookingStatus, StaffBooking } from '../types';
import { fmt12 } from '../utils/time';

// ── Per-court player entry derived from a booking ────────────────────────────
interface CourtPlayer {
  bookingId:   string;
  name:        string;
  phone:       string;
  date:        string;
  startTime:   string;
  endTime:     string;
  durationHrs: number;
  companions:  number;   // people accompanying the booker
  amount:      number;
  paid:        boolean;
  status:      BookingStatus;
}

// Build courtId → CourtPlayer[] (one entry per booking, not deduplicated)
function buildCourtPlayers(): Map<string, CourtPlayer[]> {
  const map = new Map<string, CourtPlayer[]>();
  STAFF_COURTS.forEach((c) => map.set(c.id, []));

  STAFF_BOOKINGS.forEach((b: StaffBooking) => {
    const list = map.get(b.courtId);
    if (!list) return;
    list.push({
      bookingId:   b.id,
      name:        b.playerName,
      phone:       b.playerPhone,
      date:        b.date,
      startTime:   b.startTime,
      endTime:     b.endTime,
      durationHrs: b.durationHrs,
      companions:  b.companions,
      amount:      b.amount,
      paid:        b.paid,
      status:      b.status,
    });
  });

  // Sort each court's list by date then start time
  map.forEach((list) => list.sort((a, b) =>
    a.date !== b.date
      ? a.date.localeCompare(b.date)
      : a.startTime.localeCompare(b.startTime),
  ));

  return map;
}

const COURT_PLAYERS = buildCourtPlayers();

const STATUS_STYLE: Record<BookingStatus, { bg: string; color: string; label: string }> = {
  confirmed:            { bg: '#dbeafe', color: '#1d4ed8', label: 'Confirmed'    },
  checked_in:           { bg: '#dcfce7', color: '#15803d', label: 'On Court'    },
  completed:            { bg: '#f1f5f9', color: '#475569', label: 'Completed'    },
  cancelled:            { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled'    },
  no_show:              { bg: '#fee2e2', color: '#dc2626', label: 'No Show'      },
  reschedule_requested: { bg: '#fdf4ff', color: '#7c3aed', label: '↻ Reschedule' },
};

export default function StaffPlayers() {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={s.page}>
      <div style={s.infoBox}>
        <span>ℹ️</span>
        <span style={s.infoText}>
          Players are grouped by court. Each card shows booking details including companions, payment, duration, and status.
        </span>
      </div>

      <div style={s.list}>
        {STAFF_COURTS.map((court) => {
          const players = COURT_PLAYERS.get(court.id) ?? [];
          const isOpen  = !!open[court.id];
          const totalRevenue = players.filter((p) => p.paid).reduce((sum, p) => sum + p.amount, 0);

          return (
            <div key={court.id} style={s.card}>
              {/* ── Dropdown header ── */}
              <button style={s.header} onClick={() => toggle(court.id)} aria-expanded={isOpen}>
                <div style={s.headerLeft}>
                  <span style={s.courtIcon}>🏓</span>
                  <span style={s.courtName}>{court.name}</span>
                  <span style={s.typeBadge}>{court.type}</span>
                </div>
                <div style={s.headerRight}>
                  <span style={s.playerCount}>{players.length} booking{players.length !== 1 ? 's' : ''}</span>
                  <span style={s.revenue}>₱{totalRevenue.toLocaleString()} collected</span>
                  <span style={{ ...s.chevron, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                </div>
              </button>

              {/* ── Player list ── */}
              {isOpen && (
                <div style={s.playerList}>
                  {players.length === 0 ? (
                    <div style={s.empty}>No bookings for this court.</div>
                  ) : (
                    players.map((p) => {
                      const st = STATUS_STYLE[p.status];
                      return (
                        <div key={p.bookingId} style={s.playerRow}>
                          {/* Avatar */}
                          <div style={s.avatar}>{p.name[0]}</div>

                          {/* Main info */}
                          <div style={s.playerBody}>
                            {/* Row 1: name + status badge */}
                            <div style={s.rowTop}>
                              <div style={s.playerName}>{p.name}</div>
                              <span style={{ ...s.statusBadge, background: st.bg, color: st.color }}>{st.label}</span>
                            </div>

                            {/* Row 2: phone */}
                            <div style={s.playerPhone}>📞 {p.phone}</div>

                            {/* Row 3: stats chips */}
                            <div style={s.chips}>
                              {/* Date & time slot */}
                              <span style={s.chip}>📅 {p.date} · {fmt12(p.startTime)}–{fmt12(p.endTime)}</span>
                              {/* Hours booked */}
                              <span style={s.chip}>⏱ {p.durationHrs}hr{p.durationHrs !== 1 ? 's' : ''}</span>
                              {/* Companions */}
                              <span style={s.chip}>
                                👥 {p.companions === 0 ? 'Solo' : `+${p.companions} companion${p.companions > 1 ? 's' : ''}`}
                              </span>
                              {/* Amount + payment status */}
                              <span style={{
                                ...s.chip,
                                background: p.paid ? '#dcfce7' : '#fef3c7',
                                color:      p.paid ? '#15803d' : '#b45309',
                                fontWeight: 700,
                              }}>
                                💰 ₱{p.amount.toLocaleString()} · {p.paid ? 'Paid ✓' : 'Unpaid'}
                              </span>
                            </div>

                            {/* Row 4: booking ID */}
                            <div style={s.bookingId}>{p.bookingId}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:        { display: 'flex', flexDirection: 'column', gap: 20 },
  infoBox:     { display: 'flex', alignItems: 'flex-start', gap: 10, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#1e40af' },
  infoText:    { lineHeight: 1.5 },
  list:        { display: 'flex', flexDirection: 'column', gap: 12 },

  card:        { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' },
  header:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 10 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 14 },
  courtIcon:   { fontSize: 18 },
  courtName:   { fontSize: 15, fontWeight: 700, color: '#0f172a' },
  typeBadge:   { fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase' as const, letterSpacing: 0.4 },
  playerCount: { fontSize: 12, color: '#64748b', fontWeight: 600 },
  revenue:     { fontSize: 12, color: '#15803d', fontWeight: 700, background: '#dcfce7', padding: '2px 10px', borderRadius: 99 },
  chevron:     { fontSize: 16, color: '#94a3b8', transition: 'transform 200ms ease', display: 'inline-block' },

  playerList:  { borderTop: '1px solid #f1f5f9' },
  playerRow:   { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 20px', borderBottom: '1px solid #f8fafc' },
  avatar:      { width: 40, height: 40, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0, marginTop: 2 },

  playerBody:  { flex: 1, display: 'flex', flexDirection: 'column', gap: 5 },
  rowTop:      { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const },
  playerName:  { fontSize: 14, fontWeight: 800, color: '#0f172a' },
  statusBadge: { fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99, whiteSpace: 'nowrap' as const },
  playerPhone: { fontSize: 12, color: '#64748b' },

  chips:       { display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 2 },
  chip:        { fontSize: 11, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 9px', whiteSpace: 'nowrap' as const },

  bookingId:   { fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', marginTop: 2 },
  empty:       { padding: '20px', fontSize: 13, color: '#94a3b8' },
};
