/**
 * RebookModal — Staff-only conflict resolution.
 *
 * Shown when staff tries to approve a pending booking that conflicts
 * with an existing confirmed booking on the same court/time.
 *
 * Four choices (no Decline):
 *   1. Change Court — same time   (least disruptive)
 *   2. Change Time  — same court
 *   3. Change Both  — full flexibility
 *   4. Hold         — leave pending, decide later
 */

import React, { useState } from 'react';
import { STAFF_COURTS } from '../data/mock';
import type { StaffBooking } from '../types';
import { freeCourtsAt } from '../utils/conflicts';
import { fmt12 } from '../utils/time';

type RebookMode = 'court' | 'time' | 'both' | null;

interface Props {
  /** The pending booking that has a conflict */
  booking: StaffBooking;
  /** The existing confirmed booking that is blocking it */
  conflicting: StaffBooking;
  /** All current bookings — used for free-slot checks */
  allBookings: StaffBooking[];
  /** Staff confirmed a rebook — apply the updated fields */
  onConfirm: (updated: Pick<StaffBooking, 'date' | 'startTime' | 'endTime' | 'durationHrs' | 'courtId' | 'courtName'>) => void;
  /** Staff chose Hold — leave the booking as pending */
  onHold: () => void;
  onClose: () => void;
}

export default function RebookModal({
  booking,
  conflicting,
  allBookings,
  onConfirm,
  onHold,
  onClose,
}: Props) {
  const [mode,      setMode]      = useState<RebookMode>(null);
  const [courtId,   setCourtId]   = useState(booking.courtId);
  const [startTime, setStartTime] = useState(booking.startTime);
  const [endTime,   setEndTime]   = useState(booking.endTime);
  const [date,      setDate]      = useState(booking.date);
  const [error,     setError]     = useState('');

  const calcDuration = (s: string, e: string) => {
    const [sh, sm] = s.split(':').map(Number);
    const [eh, em] = e.split(':').map(Number);
    return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
  };

  const selectedCourt = STAFF_COURTS.find((c) => c.id === courtId);

  // Courts free at the booking's original time (for mode='court')
  const freeCourts = freeCourtsAt(
    date, booking.startTime, booking.endTime,
    booking.id, allBookings,
    STAFF_COURTS.filter((c) => c.active).map((c) => c.id),
  );

  const handleConfirm = () => {
    setError('');
    if (!date)      { setError('Date is required.');       return; }
    if (!startTime) { setError('Start time is required.'); return; }
    if (!endTime)   { setError('End time is required.');   return; }
    const dur = calcDuration(startTime, endTime);
    if (dur <= 0)   { setError('End time must be after start time.'); return; }

    onConfirm({
      date,
      startTime,
      endTime,
      durationHrs: dur,
      courtId,
      courtName: selectedCourt?.name ?? booking.courtName,
    });
  };

  return (
    <div style={s.backdrop} role="dialog" aria-modal="true" aria-label="Resolve booking conflict">
      <div style={s.modal}>

        {/* ── Header ── */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <span style={s.headerIcon}>⚠️</span>
            <div>
              <h2 style={s.title}>Booking Conflict Detected</h2>
              <p style={s.subtitle}>The slot is already taken — choose how to resolve it</p>
            </div>
          </div>
          <button onClick={onClose} style={s.closeBtn} aria-label="Close">✕</button>
        </div>

        {/* ── Conflict info ── */}
        <div style={s.conflictRow}>
          {/* Pending booking */}
          <div style={s.conflictCard}>
            <div style={s.conflictCardLabel}>⏳ Pending (needs slot)</div>
            <div style={s.conflictName}>{booking.playerName}</div>
            <div style={s.conflictDetail}>🏓 {booking.courtName}</div>
            <div style={s.conflictDetail}>🕐 {fmt12(booking.startTime)} – {fmt12(booking.endTime)}</div>
            <div style={s.conflictDetail}>📞 {booking.playerPhone}</div>
          </div>
          <div style={s.vsLabel}>conflicts with</div>
          {/* Existing booking */}
          <div style={{ ...s.conflictCard, ...s.conflictCardTaken }}>
            <div style={s.conflictCardLabelTaken}>✅ Already Confirmed</div>
            <div style={s.conflictName}>{conflicting.playerName}</div>
            <div style={s.conflictDetail}>🏓 {conflicting.courtName}</div>
            <div style={s.conflictDetail}>🕐 {fmt12(conflicting.startTime)} – {fmt12(conflicting.endTime)}</div>
            <div style={s.conflictDetail}>📞 {conflicting.playerPhone}</div>
          </div>
        </div>

        {/* ── Mode selector ── */}
        {mode === null && (
          <>
            <div style={s.choicesLabel}>How would you like to resolve this?</div>
            <div style={s.choices}>
              <button style={s.choiceBtn} onClick={() => setMode('court')}>
                <span style={s.choiceIcon}>🏓</span>
                <div style={s.choiceText}>
                  <div style={s.choiceTitle}>Change Court</div>
                  <div style={s.choiceSub}>Keep {fmt12(booking.startTime)}–{fmt12(booking.endTime)}, move to a free court</div>
                </div>
                {freeCourts.length === 0 && (
                  <span style={s.noSlotTag}>No free courts</span>
                )}
              </button>

              <button style={s.choiceBtn} onClick={() => setMode('time')}>
                <span style={s.choiceIcon}>🕐</span>
                <div style={s.choiceText}>
                  <div style={s.choiceTitle}>Change Time</div>
                  <div style={s.choiceSub}>Keep {booking.courtName}, pick a different time slot</div>
                </div>
              </button>

              <button style={s.choiceBtn} onClick={() => setMode('both')}>
                <span style={s.choiceIcon}>✏️</span>
                <div style={s.choiceText}>
                  <div style={s.choiceTitle}>Change Both</div>
                  <div style={s.choiceSub}>Pick a new court and a new time</div>
                </div>
              </button>

              <button style={{ ...s.choiceBtn, ...s.choiceBtnHold }} onClick={onHold}>
                <span style={s.choiceIcon}>⏸</span>
                <div style={s.choiceText}>
                  <div style={{ ...s.choiceTitle, color: '#64748b' }}>Hold as Pending</div>
                  <div style={s.choiceSub}>Decide later — booking stays pending</div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* ── Edit form (shown after mode is picked) ── */}
        {mode !== null && (
          <>
            {/* Back button */}
            <button style={s.backBtn} onClick={() => { setMode(null); setError(''); }}>
              ← Back to choices
            </button>

            <div style={s.fieldsLabel}>
              {mode === 'court' && '🏓 Select a free court — time stays the same'}
              {mode === 'time'  && '🕐 Pick a new time — court stays the same'}
              {mode === 'both'  && '✏️ Choose a new court and time'}
            </div>

            {error && <div style={s.errorBox} role="alert">⚠️ {error}</div>}

            <div style={s.fields}>
              {/* Date — editable in 'both' mode only */}
              {mode === 'both' && (
                <div style={s.field}>
                  <label style={s.label} htmlFor="rb-date">Date</label>
                  <input
                    id="rb-date"
                    type="date"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setError(''); }}
                    style={s.input}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>
              )}

              {/* Start time */}
              {(mode === 'time' || mode === 'both') && (
                <div style={s.field}>
                  <label style={s.label} htmlFor="rb-start">Start time</label>
                  <input
                    id="rb-start"
                    type="time"
                    value={startTime}
                    onChange={(e) => { setStartTime(e.target.value); setError(''); }}
                    style={s.input}
                  />
                </div>
              )}

              {/* End time */}
              {(mode === 'time' || mode === 'both') && (
                <div style={s.field}>
                  <label style={s.label} htmlFor="rb-end">End time</label>
                  <input
                    id="rb-end"
                    type="time"
                    value={endTime}
                    onChange={(e) => { setEndTime(e.target.value); setError(''); }}
                    style={s.input}
                  />
                </div>
              )}

              {/* Court */}
              {(mode === 'court' || mode === 'both') && (
                <div style={{ ...s.field, gridColumn: mode === 'court' ? '1 / -1' : 'auto' }}>
                  <label style={s.label} htmlFor="rb-court">Court</label>
                  <select
                    id="rb-court"
                    value={courtId}
                    onChange={(e) => { setCourtId(e.target.value); setError(''); }}
                    style={s.select}
                  >
                    {STAFF_COURTS.filter((c) => c.active).map((c) => {
                      const isFree = mode === 'court'
                        ? freeCourts.includes(c.id)
                        : true; // in 'both' mode, show all active courts
                      return (
                        <option key={c.id} value={c.id} disabled={mode === 'court' && !isFree}>
                          {c.name} — ₱{c.pricePerHour}/hr ({c.type}){mode === 'court' && !isFree ? ' · Taken' : isFree ? ' · Free' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {mode === 'court' && freeCourts.length === 0 && (
                    <div style={s.noFreeCourtsMsg}>⚠️ All courts are taken at this time. Try "Change Both" instead.</div>
                  )}
                </div>
              )}
            </div>

            {/* Duration preview */}
            {(mode === 'time' || mode === 'both') && startTime && endTime && calcDuration(startTime, endTime) > 0 && (
              <div style={s.durationPreview}>
                ⏱ Duration: <strong>{calcDuration(startTime, endTime)}hr</strong>
                {selectedCourt && (
                  <> &nbsp;·&nbsp; Est. ₱{(calcDuration(startTime, endTime) * selectedCourt.pricePerHour * 21).toLocaleString()}</>
                )}
              </div>
            )}

            {/* Confirm */}
            <div style={s.actions}>
              <button style={s.btnCancel} onClick={onClose}>Cancel</button>
              <button
                style={{
                  ...s.btnConfirm,
                  opacity: mode === 'court' && freeCourts.length === 0 ? 0.45 : 1,
                  cursor:  mode === 'court' && freeCourts.length === 0 ? 'not-allowed' : 'pointer',
                }}
                onClick={handleConfirm}
                disabled={mode === 'court' && freeCourts.length === 0}
              >
                ✓ Confirm Rebook
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal:    { background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 16 },

  header:     { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerIcon: { width: 44, height: 44, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
  title:      { fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 },
  subtitle:   { fontSize: 12, color: '#64748b', margin: '2px 0 0 0' },
  closeBtn:   { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8', padding: 4, flexShrink: 0 },

  conflictRow:          { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' },
  conflictCard:         { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 },
  conflictCardTaken:    { background: '#f0fdf4', border: '1px solid #bbf7d0' },
  conflictCardLabel:    { fontSize: 10, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  conflictCardLabelTaken:{ fontSize: 10, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  conflictName:         { fontSize: 14, fontWeight: 800, color: '#0f172a' },
  conflictDetail:       { fontSize: 12, color: '#64748b' },
  vsLabel:              { fontSize: 11, fontWeight: 700, color: '#dc2626', textAlign: 'center', background: '#fee2e2', padding: '4px 10px', borderRadius: 99, whiteSpace: 'nowrap' },

  choicesLabel: { fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  choices:      { display: 'flex', flexDirection: 'column', gap: 8 },
  choiceBtn: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 16px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, background: '#fff', cursor: 'pointer',
    textAlign: 'left', transition: 'border-color 140ms, background 140ms',
  },
  choiceBtnHold: { background: '#f8fafc' },
  choiceIcon:    { fontSize: 22, flexShrink: 0, width: 32, textAlign: 'center' },
  choiceText:    { flex: 1 },
  choiceTitle:   { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  choiceSub:     { fontSize: 12, color: '#94a3b8' },
  noSlotTag:     { fontSize: 10, fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: 99, flexShrink: 0 },

  backBtn:    { background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#2563eb', fontWeight: 600, padding: 0, textAlign: 'left' },
  fieldsLabel:{ fontSize: 12, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 },
  errorBox:   { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 500 },

  fields: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  field:  { display: 'flex', flexDirection: 'column', gap: 5 },
  label:  { fontSize: 12, fontWeight: 700, color: '#374151' },
  input:  { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' },
  select: { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', cursor: 'pointer', width: '100%' },

  noFreeCourtsMsg: { fontSize: 11, color: '#dc2626', marginTop: 4 },
  durationPreview: { fontSize: 13, color: '#475569', background: '#f1f5f9', borderRadius: 8, padding: '9px 14px' },

  actions:    { display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 },
  btnCancel:  { padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnConfirm: { padding: '9px 18px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700 },
};
