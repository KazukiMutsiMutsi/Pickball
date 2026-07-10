import React, { useState } from 'react';
import { STAFF_BOOKINGS, STAFF_COURTS, TODAY } from '../data/mock';
import type { StaffCourt } from '../types';

type CloseReason = 'Court Maintenance' | 'Fully Booked';

interface CourtState extends StaffCourt {
  closeReason?: CloseReason;
}

const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  Indoor:  { bg: '#dbeafe', color: '#1d4ed8' },
  Outdoor: { bg: '#dcfce7', color: '#15803d' },
  Covered: { bg: '#fef3c7', color: '#b45309' },
};

const CLOSE_REASONS: CloseReason[] = ['Court Maintenance', 'Fully Booked'];

const REASON_CONFIG: Record<CloseReason, { icon: string; color: string; bg: string }> = {
  'Court Maintenance': { icon: '🔧', color: '#b45309', bg: '#fef3c7' },
  'Fully Booked':      { icon: '🚫', color: '#dc2626', bg: '#fee2e2' },
};

// ─── Close reason picker modal ───────────────────────────────────────────────
function CloseModal({
  courtName,
  onConfirm,
  onCancel,
}: {
  courtName: string;
  onConfirm: (reason: CloseReason) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<CloseReason | null>(null);

  return (
    <div style={m.backdrop}>
      <div style={m.modal}>
        <div style={m.header}>
          <div>
            <h3 style={m.title}>Close {courtName}?</h3>
            <p style={m.sub}>Select a reason before closing the court.</p>
          </div>
          <button onClick={onCancel} style={m.closeBtn}>✕</button>
        </div>

        <div style={m.options}>
          {CLOSE_REASONS.map((reason) => {
            const cfg = REASON_CONFIG[reason];
            const isSelected = selected === reason;
            return (
              <button
                key={reason}
                onClick={() => setSelected(reason)}
                style={{
                  ...m.option,
                  borderColor:   isSelected ? cfg.color : '#e2e8f0',
                  background:    isSelected ? cfg.bg    : '#fff',
                }}
              >
                <span style={m.optionIcon}>{cfg.icon}</span>
                <span style={{ ...m.optionLabel, color: isSelected ? cfg.color : '#0f172a', fontWeight: isSelected ? 700 : 500 }}>
                  {reason}
                </span>
                {isSelected && <span style={{ ...m.checkMark, color: cfg.color }}>✓</span>}
              </button>
            );
          })}
        </div>

        <div style={m.actions}>
          <button style={m.btnCancel} onClick={onCancel}>Cancel</button>
          <button
            style={{ ...m.btnConfirm, opacity: selected ? 1 : 0.45, cursor: selected ? 'pointer' : 'not-allowed' }}
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
          >
            Confirm Close
          </button>
        </div>
      </div>
    </div>
  );
}

const m: Record<string, React.CSSProperties> = {
  backdrop:    { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal:       { background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.18)', width: '100%', maxWidth: 400, padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: 16 },
  header:      { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  title:       { fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 },
  sub:         { fontSize: 13, color: '#64748b', margin: '4px 0 0 0' },
  closeBtn:    { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8', padding: 2, flexShrink: 0 },
  options:     { display: 'flex', flexDirection: 'column', gap: 10 },
  option:      { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1.5px solid', borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 140ms' },
  optionIcon:  { fontSize: 20, flexShrink: 0 },
  optionLabel: { flex: 1, fontSize: 14 },
  checkMark:   { fontSize: 16, fontWeight: 800, flexShrink: 0 },
  actions:     { display: 'flex', justifyContent: 'flex-end', gap: 8 },
  btnCancel:   { padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnConfirm:  { padding: '9px 18px', borderRadius: 8, border: 'none', background: '#0f172a', color: '#fff', fontSize: 13, fontWeight: 700 },
};

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function StaffCourts() {
  const [courts,       setCourts]       = useState<CourtState[]>(STAFF_COURTS);
  const [pendingClose, setPendingClose] = useState<string | null>(null); // courtId awaiting reason

  const handleToggle = (id: string, currentlyActive: boolean) => {
    if (currentlyActive) {
      // Turning OFF → ask for reason first
      setPendingClose(id);
    } else {
      // Turning ON → open immediately, clear reason
      setCourts((prev) => prev.map((c) => c.id === id ? { ...c, active: true, closeReason: undefined } : c));
    }
  };

  const handleCloseConfirm = (reason: CloseReason) => {
    if (!pendingClose) return;
    setCourts((prev) => prev.map((c) => c.id === pendingClose ? { ...c, active: false, closeReason: reason } : c));
    setPendingClose(null);
  };

  const totalActive   = courts.filter((c) => c.active).length;
  const totalInactive = courts.filter((c) => !c.active).length;
  const totalBookings = STAFF_BOOKINGS.filter((b) => b.date === TODAY && b.status !== 'cancelled').length;

  // Current time for "now playing" check
  const now    = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const toMin  = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

  return (
    <div style={s.page}>
      {/* Summary row */}
      <div style={s.summaryRow}>
        {[
          { label: 'Total Courts',   value: courts.length, color: '#2563eb' },
          { label: 'Open',           value: totalActive,   color: '#16a34a' },
          { label: 'Closed',         value: totalInactive, color: '#94a3b8' },
          { label: 'Bookings Today', value: totalBookings, color: '#7c3aed' },
        ].map((stat) => (
          <div key={stat.label} style={{ ...s.summaryCard, borderTop: `3px solid ${stat.color}` }}>
            <div style={{ ...s.summaryValue, color: stat.color }}>{stat.value}</div>
            <div style={s.summaryLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Court cards */}
      <div style={s.grid}>
        {courts.map((court) => {
          const tc = TYPE_COLOR[court.type] ?? { bg: '#f1f5f9', color: '#475569' };

          const todayBookings = STAFF_BOOKINGS.filter(
            (b) => b.courtId === court.id && b.date === TODAY && b.status !== 'cancelled',
          );

          // Players currently on court right now
          const nowPlaying = STAFF_BOOKINGS.filter(
            (b) =>
              b.courtId === court.id &&
              b.date    === TODAY &&
              b.status  === 'checked_in' &&
              nowMin >= toMin(b.startTime) &&
              nowMin  <  toMin(b.endTime),
          ).length;

          const reasonCfg = court.closeReason ? REASON_CONFIG[court.closeReason] : null;

          return (
            <div key={court.id} style={{ ...s.courtCard, opacity: court.active ? 1 : 0.72 }}>
              {/* Header: type badge + toggle */}
              <div style={s.courtCardHead}>
                <span style={{ ...s.typeBadge, background: tc.bg, color: tc.color }}>{court.type}</span>
                <label style={s.toggleWrap} aria-label={`Toggle ${court.name}`}>
                  <input
                    type="checkbox"
                    checked={court.active}
                    onChange={() => handleToggle(court.id, court.active)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ ...s.toggleTrack, background: court.active ? '#16a34a' : '#cbd5e1' }}>
                    <div style={{ ...s.toggleThumb, transform: court.active ? 'translateX(20px)' : 'translateX(2px)' }} />
                  </div>
                </label>
              </div>

              <div style={s.courtName}>{court.name}</div>
              <div style={s.courtLocation}>📍 {court.location}</div>

              {/* Stats: price · slots · today · now playing */}
              <div style={s.courtStats}>
                <div style={s.courtStat}>
                  <div style={s.courtStatValue}>₱{court.pricePerHour}</div>
                  <div style={s.courtStatLabel}>per hour</div>
                </div>
                <div style={s.courtStat}>
                  <div style={s.courtStatValue}>{court.totalSlots}</div>
                  <div style={s.courtStatLabel}>total slots</div>
                </div>
                <div style={s.courtStat}>
                  <div style={{ ...s.courtStatValue, color: '#2563eb' }}>{todayBookings.length}</div>
                  <div style={s.courtStatLabel}>today</div>
                </div>
                <div style={s.courtStat}>
                  <div style={{ ...s.courtStatValue, color: nowPlaying > 0 ? '#16a34a' : '#94a3b8' }}>{nowPlaying}</div>
                  <div style={s.courtStatLabel}>playing now</div>
                </div>
              </div>

              {/* Status bar */}
              <div style={s.statusBar}>
                {court.active ? (
                  <>
                    <div style={{ ...s.statusDot, background: '#16a34a', boxShadow: nowPlaying > 0 ? '0 0 0 3px #bbf7d0' : 'none' }} />
                    <span style={{ ...s.statusLabel, color: '#15803d' }}>
                      {nowPlaying > 0 ? `${nowPlaying} player${nowPlaying > 1 ? 's' : ''} playing now` : 'Court is Open'}
                    </span>
                  </>
                ) : (
                  <>
                    <div style={{ ...s.statusDot, background: reasonCfg?.color ?? '#94a3b8' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: reasonCfg?.color ?? '#64748b' }}>
                      {court.closeReason ? `${REASON_CONFIG[court.closeReason].icon} ${court.closeReason}` : 'Court is Closed'}
                    </span>
                  </>
                )}
              </div>

              {/* Reason badge when closed */}
              {!court.active && court.closeReason && (
                <div style={{ ...s.reasonBadge, background: reasonCfg?.bg, color: reasonCfg?.color }}>
                  {reasonCfg?.icon} {court.closeReason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Close reason modal */}
      {pendingClose && (
        <CloseModal
          courtName={courts.find((c) => c.id === pendingClose)?.name ?? 'Court'}
          onConfirm={handleCloseConfirm}
          onCancel={() => setPendingClose(null)}
        />
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:          { display: 'flex', flexDirection: 'column', gap: 24 },
  summaryRow:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 },
  summaryCard:   { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', textAlign: 'center' as const },
  summaryValue:  { fontSize: 28, fontWeight: 900, marginBottom: 4 },
  summaryLabel:  { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  grid:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 },
  courtCard:     { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, transition: 'opacity 200ms' },
  courtCardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  typeBadge:     { padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 },
  toggleWrap:    { cursor: 'pointer', display: 'flex', alignItems: 'center' },
  toggleTrack:   { width: 44, height: 24, borderRadius: 12, position: 'relative' as const, transition: 'background 200ms', flexShrink: 0 },
  toggleThumb:   { position: 'absolute' as const, top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)', transition: 'transform 200ms' },
  courtName:     { fontSize: 15, fontWeight: 800, color: '#0f172a' },
  courtLocation: { fontSize: 12, color: '#64748b' },
  courtStats:    { display: 'flex', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', paddingTop: 12, paddingBottom: 12 },
  courtStat:     { flex: 1, textAlign: 'center' as const },
  courtStatValue:{ fontSize: 16, fontWeight: 900, color: '#0f172a' },
  courtStatLabel:{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.3, marginTop: 2 },
  statusBar:     { display: 'flex', alignItems: 'center', gap: 8 },
  statusDot:     { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  statusLabel:   { fontSize: 12, fontWeight: 700 },
  reasonBadge:   { alignSelf: 'flex-start', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 },
};
