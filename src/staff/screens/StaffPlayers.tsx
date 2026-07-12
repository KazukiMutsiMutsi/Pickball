import React from 'react';
import { getAllBookings, getAllCourts } from '@/src/booking/bookingStore';
import type { BookingStatus, StaffBooking } from '../types';
import { fmt12 } from '../utils/time';

interface CourtPlayer {
  bookingId:   string;
  name:        string;
  phone:       string;
  date:        string;
  startTime:   string;
  endTime:     string;
  durationHrs: number;
  companions:  number;
  amount:      number;
  paid:        boolean;
  status:      BookingStatus;
}

function buildCourtPlayers(): Map<string, CourtPlayer[]> {
  const map = new Map<string, CourtPlayer[]>();
  getAllCourts().forEach((c) => map.set(c.id, []));

  getAllBookings().forEach((b: StaffBooking) => {
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
  pending:              { bg: '#fef3c7', color: '#b45309', label: 'Pending'      },
  checked_in:           { bg: '#dcfce7', color: '#15803d', label: 'On Court'     },
  completed:            { bg: '#f1f5f9', color: '#475569', label: 'Completed'    },
  cancelled:            { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled'    },
  no_show:              { bg: '#fee2e2', color: '#dc2626', label: 'No Show'      },
  reschedule_requested: { bg: '#fdf4ff', color: '#7c3aed', label: '↻ Reschedule' },
};

export default function StaffPlayers() {
  return (
    <div style={s.page}>
      <div style={s.infoBox}>
        <span>ℹ️</span>
        <span style={s.infoText}>
          Players are grouped by court. Each card shows booking details including companions, payment, duration, and status.
        </span>
      </div>

      {/* 3-column grid */}
      <div style={s.columns}>
        {getAllCourts().map((court) => {
          const players = COURT_PLAYERS.get(court.id) ?? [];
          const totalRevenue = players.filter((p) => p.paid).reduce((sum, p) => sum + p.amount, 0);

          return (
            <div key={court.id} style={s.col}>
              {/* Column header */}
              <div style={s.colHead}>
                <div style={s.colHeadLeft}>
                  <span style={s.courtIcon}>🏓</span>
                  <span style={s.courtName}>{court.name}</span>
                  <span style={s.typeBadge}>{court.type}</span>
                </div>
                <div style={s.colHeadRight}>
                  <span style={s.playerCount}>{players.length} booking{players.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Revenue sub-header */}
              <div style={s.revenueRow}>
                💰 <span style={s.revenueAmt}>₱{totalRevenue.toLocaleString()}</span> collected
              </div>

              {/* Player cards */}
              <div style={s.colBody}>
                {players.length === 0 ? (
                  <div style={s.empty}>No bookings for this court.</div>
                ) : (
                  players.map((p) => {
                    const st = STATUS_STYLE[p.status];
                    return (
                      <div key={p.bookingId} style={s.card}>
                        {/* Top: avatar + name + status */}
                        <div style={s.cardTop}>
                          <div style={s.avatar}>{p.name[0]}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={s.playerName}>{p.name}</div>
                            <div style={s.playerPhone}>📞 {p.phone}</div>
                          </div>
                          <span style={{ ...s.statusBadge, background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                        </div>

                        {/* Chips row */}
                        <div style={s.chips}>
                          <span style={s.chip}>📅 {p.date}</span>
                          <span style={s.chip}>🕐 {fmt12(p.startTime)}–{fmt12(p.endTime)}</span>
                          <span style={s.chip}>⏱ {p.durationHrs}hr{p.durationHrs !== 1 ? 's' : ''}</span>
                          <span style={s.chip}>
                            👥 {p.companions === 0 ? 'Solo' : `+${p.companions} companion${p.companions > 1 ? 's' : ''}`}
                          </span>
                          <span style={{
                            ...s.chip,
                            background: p.paid ? '#dcfce7' : '#fef3c7',
                            color:      p.paid ? '#15803d' : '#b45309',
                            fontWeight: 700,
                          }}>
                            💰 ₱{p.amount.toLocaleString()} · {p.paid ? 'Paid ✓' : 'Unpaid'}
                          </span>
                        </div>

                        {/* Booking ID */}
                        <div style={s.bookingId}>{p.bookingId}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:    { display: 'flex', flexDirection: 'column', gap: 20 },
  infoBox: { display: 'flex', alignItems: 'flex-start', gap: 10, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#1e40af' },
  infoText:{ lineHeight: 1.5 },

  // 3-column grid
  columns: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' },
  col:     { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' as const },

  colHead:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' },
  colHeadLeft:  { display: 'flex', alignItems: 'center', gap: 10 },
  colHeadRight: { display: 'flex', alignItems: 'center', gap: 8 },
  courtIcon:    { fontSize: 20 },
  courtName:    { fontSize: 17, fontWeight: 800, color: '#0f172a' },
  typeBadge:    { fontSize: 11, fontWeight: 700, background: '#e2e8f0', color: '#475569', padding: '3px 9px', borderRadius: 99, textTransform: 'uppercase' as const, letterSpacing: 0.4 },
  playerCount:  { fontSize: 13, color: '#94a3b8', fontWeight: 600 },

  revenueRow:  { display: 'flex', alignItems: 'center', gap: 4, padding: '10px 20px', borderBottom: '1px solid #f1f5f9', fontSize: 13, color: '#64748b', background: '#f0fdf4' },
  revenueAmt:  { fontWeight: 800, color: '#15803d', fontSize: 14 },

  colBody: { display: 'flex', flexDirection: 'column' as const, gap: 14, padding: 16 },
  empty:   { fontSize: 14, color: '#94a3b8', textAlign: 'center' as const, padding: '32px 0' },

  card:        { border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column' as const, gap: 10 },
  cardTop:     { display: 'flex', alignItems: 'center', gap: 12 },
  avatar:      { width: 44, height: 44, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, flexShrink: 0 },
  playerName:  { fontSize: 15, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  playerPhone: { fontSize: 13, color: '#64748b', marginTop: 2 },
  statusBadge: { fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap' as const, flexShrink: 0 },

  chips:     { display: 'flex', flexWrap: 'wrap' as const, gap: 7 },
  chip:      { fontSize: 12, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 7, padding: '4px 10px', whiteSpace: 'nowrap' as const },
  bookingId: { fontSize: 11, fontFamily: 'monospace', color: '#94a3b8', marginTop: 2 },
};
