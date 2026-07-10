import React, { useEffect, useRef, useState } from 'react';
import RebookModal from '../components/RebookModal';
import RescheduleModal from '../components/RescheduleModal';
import StatusBadge from '../components/StatusBadge';
import { STAFF_BOOKINGS, STAFF_COURTS, TODAY } from '../data/mock';
import type { BookingStatus, StaffBooking } from '../types';
import { findConflict } from '../utils/conflicts';
import { fmt12 } from '../utils/time';

// ─── Constants ────────────────────────────────────────────────────────────────
type ViewMode     = 'month' | 'day' | 'list';
type FilterStatus = 'all' | BookingStatus;
interface ConflictState { pending: StaffBooking; existing: StaffBooking; }

const HOURS  = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM–10 PM
const HOUR_W = 90;   // px per hour — wider = more readable
const ROW_H  = 80;   // px per court row — taller blocks

const STATUS_COLOR: Record<string, string> = {
  confirmed:            '#2563eb',
  checked_in:           '#16a34a',
  pending:              '#d97706',
  completed:            '#64748b',
  cancelled:            '#dc2626',
  no_show:              '#dc2626',
  reschedule_requested: '#7c3aed',
};

// ─── Pure helpers (no hooks) ──────────────────────────────────────────────────
function toMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function timeToX(t: string) {
  return (toMin(t) - 6 * 60) * (HOUR_W / 60);
}
function durationToW(s: string, e: string) {
  return (toMin(e) - toMin(s)) * (HOUR_W / 60);
}

/** Minutes remaining until booking ends. Negative = already ended. */
function minsRemaining(endTime: string, now: Date): number {
  const endMin  = toMin(endTime);
  const nowMin  = now.getHours() * 60 + now.getMinutes();
  return endMin - nowMin;
}

/** Is this booking currently in progress right now? */
function isNowPlaying(b: StaffBooking, now: Date): boolean {
  if (b.status !== 'checked_in' && b.status !== 'confirmed') return false;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= toMin(b.startTime) && nowMin < toMin(b.endTime);
}

// ─── CalBlock — single booking block on the timeline ─────────────────────────
function CalBlock({
  booking, now, onClick,
}: { booking: StaffBooking; now: Date; onClick: () => void }) {
  const x     = timeToX(booking.startTime);
  const w     = Math.max(durationToW(booking.startTime, booking.endTime) - 4, 22);
  const color = STATUS_COLOR[booking.status] ?? '#64748b';
  const playing = isNowPlaying(booking, now);
  const minsLeft = playing ? minsRemaining(booking.endTime, now) : null;

  return (
    <div
      title={`${booking.playerName} · ${fmt12(booking.startTime)}–${fmt12(booking.endTime)} · ${booking.status}`}
      onClick={onClick}
      style={{
        position: 'absolute', left: x + 2, top: 6,
        width: w, height: ROW_H - 12,
        background: color,
        borderRadius: 6, cursor: 'pointer', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 8px',
        boxShadow: playing ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : '0 1px 4px rgba(0,0,0,.15)',
        outline: playing ? `2px solid ${color}` : 'none',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {booking.playerName.split(' ')[0]}
      </div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.85)', whiteSpace: 'nowrap' }}>
        {fmt12(booking.startTime)}–{fmt12(booking.endTime)}
      </div>
      {minsLeft !== null && minsLeft > 0 && (
        <div style={{ fontSize: 9, color: '#fff', fontWeight: 700, background: 'rgba(0,0,0,.25)', borderRadius: 4, padding: '1px 4px', marginTop: 2, alignSelf: 'flex-start', whiteSpace: 'nowrap' }}>
          {minsLeft}m left
        </div>
      )}
    </div>
  );
}

// ─── CourtRow — timeline lane only (label is in the sticky column) ───────────
function CourtRow({
  bookings, now, totalW, onBlock,
}: {
  bookings: StaffBooking[]; now: Date;
  totalW: number; onBlock: (b: StaffBooking) => void;
}) {
  return (
    <div style={{ position: 'relative', height: ROW_H, width: totalW, borderBottom: '1px solid #f1f5f9', background: '#fafafa', flexShrink: 0 }}>
      {/* Hour grid lines */}
      {HOURS.map((h) => (
        <div key={h} style={{ position: 'absolute', left: (h - 6) * HOUR_W, top: 0, bottom: 0, width: 1, background: '#f1f5f9' }} />
      ))}
      {/* Booking blocks */}
      {bookings.map((b) => (
        <CalBlock key={b.id} booking={b} now={now} onClick={() => onBlock(b)} />
      ))}
    </div>
  );
}

// ─── MonthGrid — current month only ──────────────────────────────────────────
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_DOT: Record<string, string> = {
  confirmed:            '#2563eb',
  checked_in:           '#16a34a',
  pending:              '#d97706',
  completed:            '#94a3b8',
  reschedule_requested: '#7c3aed',
  no_show:              '#dc2626',
  cancelled:            '#dc2626',
};

function MonthGrid({
  bookings,
  selectedDate,
  onSelectDay,
}: {
  bookings: StaffBooking[];
  selectedDate: string;
  onSelectDay: (date: string) => void;
}) {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // First day of month and total days
  const firstDay  = new Date(year, month, 1).getDay(); // 0=Sun
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Build grid cells: leading blanks + days
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const pad  = (n: number) => String(n).padStart(2, '0');
  const toDate = (day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

  return (
    <div style={mg.wrap}>
      {/* Month title */}
      <div style={mg.header}>
        <span style={mg.monthTitle}>{monthName}</span>
        <span style={mg.subTitle}>Current month only — click any day to view its schedule</span>
      </div>

      {/* Weekday headers */}
      <div style={mg.weekRow}>
        {WEEKDAYS.map((d) => (
          <div key={d} style={mg.weekLabel}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={mg.grid}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`blank-${idx}`} style={mg.blankCell} />;

          const dateStr     = toDate(day);
          const dayBookings = bookings.filter((b) => b.date === dateStr);
          const isToday     = dateStr === TODAY;
          const isSelected  = dateStr === selectedDate;
          const isPast      = dateStr < TODAY;
          const isFuture    = dateStr > TODAY;

          // Up to 3 booking dots to show
          const dots = dayBookings.slice(0, 3);
          const more = dayBookings.length - 3;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDay(dateStr)}
              style={{
                ...mg.cell,
                ...(isSelected ? mg.cellSelected : {}),
                ...(isToday && !isSelected ? mg.cellToday : {}),
                ...(isPast && !isToday ? mg.cellPast : {}),
                ...(isFuture ? mg.cellFuture : {}),
                cursor: dayBookings.length > 0 || !isFuture ? 'pointer' : 'default',
              }}
            >
              <div style={{
                ...mg.dayNum,
                ...(isToday ? mg.dayNumToday : {}),
                ...(isSelected ? mg.dayNumSelected : {}),
              }}>
                {day}
              </div>

              {/* Booking count badge */}
              {dayBookings.length > 0 && (
                <div style={mg.countBadge}>{dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}</div>
              )}

              {/* Status dots */}
              {dots.length > 0 && (
                <div style={mg.dotsRow}>
                  {dots.map((b) => (
                    <div
                      key={b.id}
                      title={`${b.playerName} · ${b.courtName} · ${b.startTime}–${b.endTime}`}
                      style={{ ...mg.dot, background: STATUS_DOT[b.status] ?? '#94a3b8' }}
                    />
                  ))}
                  {more > 0 && <span style={mg.moreDots}>+{more}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const mg: Record<string, React.CSSProperties> = {
  wrap:         { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' },
  header:       { display: 'flex', alignItems: 'baseline', gap: 12, padding: '16px 20px', borderBottom: '1px solid #f1f5f9' },
  monthTitle:   { fontSize: 17, fontWeight: 800, color: '#0f172a' },
  subTitle:     { fontSize: 12, color: '#94a3b8' },
  weekRow:      { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' },
  weekLabel:    { padding: '8px 0', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' },
  blankCell:    { minHeight: 88, borderRight: '1px solid #f8fafc', borderBottom: '1px solid #f1f5f9', background: '#fafafa' },
  cell: {
    minHeight: 88, padding: '8px 10px',
    borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9',
    display: 'flex', flexDirection: 'column', gap: 4,
    transition: 'background 120ms',
  },
  cellToday:    { background: '#eff6ff' },
  cellSelected: { background: '#dbeafe', outline: '2px solid #2563eb' },
  cellPast:     { background: '#fafafa' },
  cellFuture:   { background: '#fff' },
  dayNum:       { fontSize: 13, fontWeight: 600, color: '#475569', alignSelf: 'flex-start', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' },
  dayNumToday:  { background: '#2563eb', color: '#fff', fontWeight: 800 },
  dayNumSelected:{ background: '#1d4ed8', color: '#fff', fontWeight: 800 },
  countBadge:   { fontSize: 10, fontWeight: 700, color: '#2563eb', background: '#dbeafe', borderRadius: 4, padding: '1px 6px', alignSelf: 'flex-start' },
  dotsRow:      { display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' },
  dot:          { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  moreDots:     { fontSize: 9, color: '#94a3b8', fontWeight: 600 },
};

// ─── Main export ──────────────────────────────────────────────────────────────
export default function StaffSchedule() {
  const [bookings,         setBookings]         = useState<StaffBooking[]>(STAFF_BOOKINGS);
  const [view,             setView]             = useState<ViewMode>('month');
  const [selectedDate,     setSelectedDate]     = useState<string>(TODAY);
  const [filterCourt,      setFilterCourt]      = useState('all');
  const [filterStatus,     setFilterStatus]     = useState<FilterStatus>('all');
  const [selected,         setSelected]         = useState<StaffBooking | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<StaffBooking | null>(null);
  const [conflictState,    setConflictState]    = useState<ConflictState | null>(null);
  const [now,              setNow]              = useState(new Date());
  const calRef = useRef<HTMLDivElement>(null);

  // Real-time clock — ticks every minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll day timeline to current time on mount / view change
  useEffect(() => {
    if (view === 'day' && calRef.current) {
      const x = timeToX(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`);
      calRef.current.scrollLeft = Math.max(0, x - 200);
    }
  }, [view]);

  // ── Status updater ────────────────────────────────────────────────────────
  const updateStatus = (id: string, status: BookingStatus) =>
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));

  // ── Approve with conflict check ───────────────────────────────────────────
  const handleApprove = (booking: StaffBooking) => {
    const conflict = findConflict(booking, bookings);
    if (conflict) setConflictState({ pending: booking, existing: conflict });
    else updateStatus(booking.id, 'confirmed');
  };

  // ── Rebook confirm (conflict resolution) ─────────────────────────────────
  const handleRebookConfirm = (updated: Pick<StaffBooking,'date'|'startTime'|'endTime'|'durationHrs'|'courtId'|'courtName'>) => {
    if (!conflictState) return;
    setBookings((prev) => prev.map((b) =>
      b.id === conflictState.pending.id ? { ...b, ...updated, status: 'confirmed' } : b,
    ));
    setConflictState(null);
  };

  // ── Reschedule confirm (customer-requested) ───────────────────────────────
  const handleRescheduleConfirm = (updated: Pick<StaffBooking,'date'|'startTime'|'endTime'|'durationHrs'|'courtId'|'courtName'>) => {
    if (!rescheduleTarget) return;
    setBookings((prev) => prev.map((b) =>
      b.id === rescheduleTarget.id ? { ...b, ...updated, status: 'confirmed', rescheduleNote: undefined } : b,
    ));
    setRescheduleTarget(null);
  };

  const handleRescheduleDecline = () => {
    if (!rescheduleTarget) return;
    updateStatus(rescheduleTarget.id, 'confirmed');
    setRescheduleTarget(null);
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const todayBookings   = bookings.filter((b) => b.date === selectedDate);
  const rescheduleCount = bookings.filter((b) => b.date === TODAY && b.status === 'reschedule_requested').length;
  const activeCourts    = STAFF_COURTS.filter((c) => c.active)
                           .filter((c) => filterCourt === 'all' || c.id === filterCourt);

  const nowX = timeToX(
    `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
  );

  const listFiltered = todayBookings
    .filter((b) => filterCourt  === 'all' || b.courtId === filterCourt)
    .filter((b) => filterStatus === 'all' || b.status  === filterStatus)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div style={s.page}>

      {/* ── Reschedule alert banner ── */}
      {rescheduleCount > 0 && (
        <div style={s.alertBanner}>
          <span>↻</span>
          <span><strong>{rescheduleCount}</strong> customer{rescheduleCount > 1 ? 's have' : ' has'} requested a reschedule — review below.</span>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div style={s.toolbar}>
        <div style={s.filters}>
          <select value={filterCourt} onChange={(e) => setFilterCourt(e.target.value)} style={s.select} aria-label="Filter court">
            <option value="all">All Courts</option>
            {STAFF_COURTS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {view === 'list' && (
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)} style={s.select} aria-label="Filter status">
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="checked_in">Checked In</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
              <option value="reschedule_requested">Reschedule Requested</option>
            </select>
          )}
          <span style={s.countPill}>{listFiltered.length} booking{listFiltered.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={s.viewToggle}>
          <button style={{ ...s.viewBtn, ...(view === 'month' ? s.viewBtnActive : {}) }} onClick={() => setView('month')}>🗓 Month</button>
          <button style={{ ...s.viewBtn, ...(view === 'day'   ? s.viewBtnActive : {}) }} onClick={() => setView('day')}>📅 Day</button>
          <button style={{ ...s.viewBtn, ...(view === 'list'  ? s.viewBtnActive : {}) }} onClick={() => setView('list')}>☰ List</button>
        </div>
      </div>

      {/* ══ MONTH VIEW ══ */}
      {view === 'month' && (
        <MonthGrid
          bookings={bookings}
          selectedDate={selectedDate}
          onSelectDay={(date) => { setSelectedDate(date); setView('day'); }}
        />
      )}

      {/* ══ DAY / TIMELINE VIEW ══ */}
      {view === 'day' && (
        <div style={s.calCard}>
          {/* Legend — compact, one line */}
          <div style={s.legend}>
            {[
              { color: '#16a34a', label: 'Checked In' },
              { color: '#2563eb', label: 'Confirmed' },
              { color: '#d97706', label: 'Pending' },
              { color: '#7c3aed', label: 'Reschedule' },
              { color: '#64748b', label: 'Completed' },
              { color: '#dc2626', label: 'No Show' },
            ].map(({ color, label }) => (
              <div key={label} style={s.legendItem}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                <span style={s.legendLabel}>{label}</span>
              </div>
            ))}
            <div style={s.legendItem}>
              <div style={{ width: 2, height: 16, background: '#ef4444', borderRadius: 1 }} />
              <span style={s.legendLabel}>Now</span>
            </div>
            <div style={s.legendItem}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 0 3px #bbf7d0' }} />
              <span style={s.legendLabel}>Now Playing</span>
            </div>
          </div>

          {/* Scrollable grid */}
          <div style={{ overflowX: 'auto', overflowY: 'hidden' }} ref={calRef}>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 148 + HOURS.length * HOUR_W }}>

              {/* Header row: empty corner + hour labels */}
              <div style={{ display: 'flex', height: 36, borderBottom: '2px solid #e2e8f0', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 5 }}>
                <div style={{ flexShrink: 0, width: 148, borderRight: '1px solid #e2e8f0' }} />
                {HOURS.map((h) => (
                  <div key={h} style={{ width: HOUR_W, flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', paddingLeft: 8, borderLeft: '1px solid #f1f5f9' }}>
                    {h % 12 || 12}{h < 12 ? ' am' : ' pm'}
                  </div>
                ))}
              </div>

              {/* Court rows: label + lane side by side */}
              {activeCourts.map((court) => {
                const courtBookings = todayBookings.filter((b) => b.courtId === court.id && b.status !== 'cancelled');
                const playing = courtBookings.some((b) => isNowPlaying(b, now));
                return (
                  <div key={court.id} style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
                    {/* Court label — single source, no duplication */}
                    <div style={{ flexShrink: 0, width: 148, height: ROW_H, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, background: playing ? '#f0fdf4' : '#fff', borderRight: '1px solid #e2e8f0' }}>
                      {playing
                        ? <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#16a34a', flexShrink: 0, boxShadow: '0 0 0 3px #bbf7d0' }} />
                        : <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#e2e8f0', flexShrink: 0 }} />
                      }
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>{court.name.split(' ').slice(0, 2).join(' ')}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{court.type}</div>
                      </div>
                    </div>

                    {/* Timeline lane */}
                    <div style={{ position: 'relative', flex: 1, height: ROW_H }}>
                      <CourtRow bookings={courtBookings} now={now} totalW={HOURS.length * HOUR_W} onBlock={setSelected} />
                      {/* Now line — only within the lane */}
                      {nowX >= 0 && nowX <= HOURS.length * HOUR_W && (
                        <div style={{ position: 'absolute', left: nowX, top: 0, bottom: 0, width: 2, background: '#ef4444', zIndex: 4, pointerEvents: 'none' }} />
                      )}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* ── Selected booking detail panel ── */}
          {selected && (
            <div style={s.detailPanel}>
              <div style={s.detailHeader}>
                <div>
                  <div style={s.detailName}>{selected.playerName}</div>
                  <div style={s.detailSub}>{selected.playerPhone}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusBadge status={selected.status} />
                  <button onClick={() => setSelected(null)} style={s.closeBtn}>✕</button>
                </div>
              </div>
              <div style={s.detailGrid}>
                <div style={s.detailItem}><span style={s.detailIcon}>🏓</span>{selected.courtName}</div>
                <div style={s.detailItem}><span style={s.detailIcon}>🕐</span>{fmt12(selected.startTime)} – {fmt12(selected.endTime)} · {selected.durationHrs}hr</div>
                <div style={s.detailItem}><span style={s.detailIcon}>💰</span>₱{selected.amount.toLocaleString()} · <span style={selected.paid ? s.paid : s.unpaid}>{selected.paid ? 'Paid' : 'Unpaid'}</span></div>
                {isNowPlaying(selected, now) && (
                  <div style={s.detailItem}>
                    <span style={s.detailIcon}>⏱</span>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>
                      {minsRemaining(selected.endTime, now)}m remaining
                    </span>
                  </div>
                )}
              </div>
              <div style={s.detailActions}>
                {selected.status === 'pending' && (
                  <button style={s.btnGreen} onClick={() => { handleApprove(selected); setSelected(null); }}>Approve</button>
                )}
                {selected.status === 'confirmed' && (
                  <>
                    <button style={s.btnGreen}  onClick={() => { updateStatus(selected.id, 'checked_in'); setSelected(null); }}>Check In</button>
                    <button style={s.btnGhost}  onClick={() => { updateStatus(selected.id, 'no_show');    setSelected(null); }}>No Show</button>
                  </>
                )}
                {selected.status === 'checked_in' && (
                  <button style={s.btnBlue} onClick={() => { updateStatus(selected.id, 'completed'); setSelected(null); }}>Mark Complete</button>
                )}
                {selected.status === 'reschedule_requested' && (
                  <button style={s.btnViolet} onClick={() => { setRescheduleTarget(selected); setSelected(null); }}>↻ Review Reschedule</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ LIST VIEW ══ */}
      {view === 'list' && (
        <div style={s.tableCard}>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>{['ID','Player','Court','Time','Amount','Paid','Status','Actions'].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {listFiltered.length === 0 ? (
                  <tr><td colSpan={8} style={s.emptyCell}>No bookings match your filters.</td></tr>
                ) : listFiltered.map((b) => {
                  const playing = isNowPlaying(b, now);
                  const mLeft   = playing ? minsRemaining(b.endTime, now) : null;
                  return (
                    <tr key={b.id} style={{ ...s.tr, ...(b.status === 'reschedule_requested' ? s.trPurple : {}), ...(playing ? s.trGreen : {}) }}>
                      <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>{b.id}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{b.playerName[0]}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{b.playerName}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{b.playerPhone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={s.td}>{b.courtName}</td>
                      <td style={{ ...s.td, whiteSpace: 'nowrap' as const }}>
                        {fmt12(b.startTime)} – {fmt12(b.endTime)}
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{b.durationHrs}hr</div>
                        {mLeft !== null && <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>{mLeft}m left</div>}
                      </td>
                      <td style={{ ...s.td, fontWeight: 700 }}>₱{b.amount.toLocaleString()}</td>
                      <td style={s.td}><span style={b.paid ? s.paidBadge : s.unpaidBadge}>{b.paid ? '✓ Paid' : 'Unpaid'}</span></td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <StatusBadge status={b.status} size="sm" />
                          {b.status === 'reschedule_requested' && b.rescheduleNote && (
                            <div style={{ fontSize: 10, color: '#7c3aed', fontStyle: 'italic' }} title={b.rescheduleNote}>
                              💬 {b.rescheduleNote.slice(0, 30)}{b.rescheduleNote.length > 30 ? '…' : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                          {b.status === 'reschedule_requested' && <button style={s.btnViolet} onClick={() => setRescheduleTarget(b)}>↻ Review</button>}
                          {b.status === 'pending'    && <><button style={s.btnGreen} onClick={() => handleApprove(b)}>Approve</button><button style={s.btnGhost} onClick={() => updateStatus(b.id, 'cancelled')}>Decline</button></>}
                          {b.status === 'confirmed'  && <><button style={s.btnGreen} onClick={() => updateStatus(b.id, 'checked_in')}>Check In</button><button style={s.btnGhost} onClick={() => updateStatus(b.id, 'no_show')}>No Show</button></>}
                          {b.status === 'checked_in' && <button style={s.btnBlue} onClick={() => updateStatus(b.id, 'completed')}>Complete</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {rescheduleTarget && (
        <RescheduleModal booking={rescheduleTarget} onConfirm={handleRescheduleConfirm} onDecline={handleRescheduleDecline} onClose={() => setRescheduleTarget(null)} />
      )}
      {conflictState && (
        <RebookModal booking={conflictState.pending} conflicting={conflictState.existing} allBookings={bookings} onConfirm={handleRebookConfirm} onHold={() => setConflictState(null)} onClose={() => setConflictState(null)} />
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page:        { display: 'flex', flexDirection: 'column', gap: 16 },
  alertBanner: { display: 'flex', alignItems: 'center', gap: 10, background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#4c1d95' },
  toolbar:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  filters:     { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  select:      { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', cursor: 'pointer' },
  countPill:   { fontSize: 13, color: '#94a3b8', fontWeight: 600 },
  viewToggle:  { display: 'flex', border: '1.5px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' },
  viewBtn:     { padding: '7px 14px', border: 'none', background: '#fff', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer' },
  viewBtnActive: { background: '#0f172a', color: '#fff' },

  calCard:     { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' },
  legend:      { display: 'flex', flexWrap: 'wrap', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' },
  legendItem:  { display: 'flex', alignItems: 'center', gap: 5 },
  legendLabel: { fontSize: 11, color: '#64748b', textTransform: 'capitalize' },

  detailPanel:   { borderTop: '1px solid #e2e8f0', padding: '16px 20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 },
  detailHeader:  { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  detailName:    { fontSize: 15, fontWeight: 800, color: '#0f172a' },
  detailSub:     { fontSize: 12, color: '#64748b', marginTop: 2 },
  detailGrid:    { display: 'flex', flexDirection: 'column', gap: 6 },
  detailItem:    { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' },
  detailIcon:    { fontSize: 14, flexShrink: 0 },
  detailActions: { display: 'flex', gap: 8 },
  paid:          { color: '#15803d', fontWeight: 700 },
  unpaid:        { color: '#b45309', fontWeight: 700 },
  closeBtn:      { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#94a3b8', padding: 4 },

  tableCard:   { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' },
  table:       { width: '100%', borderCollapse: 'collapse' as const, minWidth: 860 },
  th:          { padding: '10px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', textTransform: 'uppercase' as const, letterSpacing: 0.5, whiteSpace: 'nowrap' as const },
  tr:          { borderBottom: '1px solid #f1f5f9' },
  trPurple:    { background: '#fdf4ff' },
  trGreen:     { background: '#f0fdf4' },
  td:          { padding: '12px 16px', fontSize: 13, color: '#0f172a', verticalAlign: 'middle' as const },
  emptyCell:   { padding: '32px 16px', textAlign: 'center' as const, color: '#94a3b8', fontSize: 13 },
  paidBadge:   { display: 'inline-block', padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#15803d' },
  unpaidBadge: { display: 'inline-block', padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#fef3c7', color: '#b45309' },

  btnGreen:  { padding: '5px 12px', borderRadius: 6, border: 'none', background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  btnBlue:   { padding: '5px 12px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  btnViolet: { padding: '5px 12px', borderRadius: 6, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  btnGhost:  { padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
};
