/**
 * RescheduleModal
 *
 * Staff can ONLY edit a booking's date, time, and court when the customer
 * has explicitly requested a reschedule (status === 'reschedule_requested').
 * All other bookings are read-only.
 */

import React, { useState } from 'react';
import { getAllCourts } from '@/src/booking/bookingStore';
import type { StaffBooking } from '../types';

interface Props {
  booking: StaffBooking;
  onConfirm: (updated: Pick<StaffBooking, 'date' | 'startTime' | 'endTime' | 'durationHrs' | 'courtId' | 'courtName'>) => void;
  onDecline: () => void; // decline the reschedule request → keep original, set back to confirmed
  onClose: () => void;
}

export default function RescheduleModal({ booking, onConfirm, onDecline, onClose }: Props) {
  const [date,      setDate]      = useState(booking.date);
  const [startTime, setStartTime] = useState(booking.startTime);
  const [endTime,   setEndTime]   = useState(booking.endTime);
  const [courtId,   setCourtId]   = useState(booking.courtId);
  const [error,     setError]     = useState('');

  const selectedCourt = getAllCourts().find((c) => c.id === courtId);

  const calcDuration = (start: string, end: string): number => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
  };

  const handleConfirm = () => {
    setError('');
    if (!date)      { setError('Date is required.');       return; }
    if (!startTime) { setError('Start time is required.'); return; }
    if (!endTime)   { setError('End time is required.');   return; }
    const duration = calcDuration(startTime, endTime);
    if (duration <= 0) { setError('End time must be after start time.'); return; }

    const [sh] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    if (sh < 9)                           { setError('Opening time is 9:00 AM. Start time cannot be earlier.'); return; }
    if (eh > 0 || (eh === 0 && em === 0)) {
      // endTime "00:00" means midnight — allowed; anything after is not
    } else if (eh < 9) {
      // non-midnight early hour — invalid
      setError('Closing time is 12:00 AM. End time cannot exceed midnight.'); return;
    }
    // treat endTime > 23:59 as overflow past midnight
    const endMins = eh * 60 + em;
    const startMins = sh * 60 + (startTime.split(':').map(Number)[1]);
    if (endMins !== 0 && endMins < startMins) { setError('End time must be after start time.'); return; }
    if (endMins !== 0 && eh >= 1 && eh < 9)   { setError('Closing time is 12:00 AM. End time cannot exceed midnight.'); return; }

    onConfirm({
      date,
      startTime,
      endTime,
      durationHrs: duration,
      courtId,
      courtName: selectedCourt?.name ?? booking.courtName,
    });
  };

  return (
    /* ── Backdrop ── */
    <div style={s.backdrop} role="dialog" aria-modal="true" aria-label="Reschedule booking">
      <div style={s.modal}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <span style={s.headerIcon}>↻</span>
            <div>
              <h2 style={s.title}>Reschedule Request</h2>
              <p style={s.subtitle}>Customer has asked to change this booking</p>
            </div>
          </div>
          <button onClick={onClose} style={s.closeBtn} aria-label="Close">✕</button>
        </div>

        {/* Customer note */}
        {booking.rescheduleNote && (
          <div style={s.noteBox}>
            <span style={s.noteIcon}>💬</span>
            <div>
              <div style={s.noteLabel}>Customer's note</div>
              <div style={s.noteText}>"{booking.rescheduleNote}"</div>
            </div>
          </div>
        )}

        {/* Current booking info (read-only) */}
        <div style={s.currentBox}>
          <div style={s.currentLabel}>Current booking</div>
          <div style={s.currentRow}>
            <span>👤</span> {booking.playerName} · {booking.playerPhone}
          </div>
          <div style={s.currentRow}>
            <span>🏓</span> {booking.courtName}
          </div>
          <div style={s.currentRow}>
            <span>📅</span> {booking.date} &nbsp;·&nbsp; {booking.startTime} – {booking.endTime}
          </div>
          <div style={s.currentRow}>
            <span>💰</span> ₱{booking.amount.toLocaleString()} · {booking.paid ? 'Paid ✓' : 'Unpaid'}
          </div>
        </div>

        {/* ── Editable fields ── */}
        <div style={s.fieldsLabel}>New schedule</div>

        {error && (
          <div style={s.errorBox} role="alert">⚠️ {error}</div>
        )}

        <div style={s.fields}>
          {/* Date */}
          <div style={s.field}>
            <label style={s.label} htmlFor="rs-date">Date</label>
            <input
              id="rs-date"
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setError(''); }}
              style={s.input}
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>

          {/* Start time */}
          <div style={s.field}>
            <label style={s.label} htmlFor="rs-start">Start time</label>
            <input
              id="rs-start"
              type="time"
              value={startTime}
              onChange={(e) => { setStartTime(e.target.value); setError(''); }}
              style={s.input}
              min="09:00"
              max="23:59"
            />
          </div>

          {/* End time */}
          <div style={s.field}>
            <label style={s.label} htmlFor="rs-end">End time</label>
            <input
              id="rs-end"
              type="time"
              value={endTime}
              onChange={(e) => { setEndTime(e.target.value); setError(''); }}
              style={s.input}
              min="09:00"
            />
          </div>

          {/* Court */}
          <div style={{ ...s.field, gridColumn: '1 / -1' }}>
            <label style={s.label} htmlFor="rs-court">Court</label>
            <select
              id="rs-court"
              value={courtId}
              onChange={(e) => { setCourtId(e.target.value); setError(''); }}
              style={s.select}
            >
              {getAllCourts().filter((c) => c.active).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — ₱{c.pricePerHour}/hr ({c.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration preview */}
        {startTime && endTime && calcDuration(startTime, endTime) > 0 && (
          <div style={s.durationPreview}>
            ⏱ Duration: <strong>{calcDuration(startTime, endTime)}hr</strong>
            {selectedCourt && (
              <> &nbsp;·&nbsp; Est. amount: <strong>₱{(calcDuration(startTime, endTime) * selectedCourt.pricePerHour * 21).toLocaleString()}</strong></>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={s.actions}>
          <button style={s.btnDecline} onClick={onDecline}>
            ✕ Decline Request
          </button>
          <div style={s.actionRight}>
            <button style={s.btnCancel} onClick={onClose}>Cancel</button>
            <button style={s.btnConfirm} onClick={handleConfirm}>
              ✓ Confirm Reschedule
            </button>
          </div>
        </div>

        {/* Staff permission note */}
        <p style={s.permissionNote}>
          ℹ️ Staff can only edit bookings when the customer has requested a reschedule.
          Confirming will update the booking and notify the customer.
        </p>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed', inset: 0,
    background: 'rgba(15, 23, 42, 0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 16,
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    width: '100%', maxWidth: 560,
    maxHeight: '90vh', overflowY: 'auto',
    padding: '28px 28px 24px',
    display: 'flex', flexDirection: 'column', gap: 16,
  },

  header:     { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 10,
    background: '#fdf4ff', color: '#7c3aed',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, fontWeight: 800, flexShrink: 0,
  },
  title:    { fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 },
  subtitle: { fontSize: 12, color: '#64748b', margin: '2px 0 0 0' },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 18, color: '#94a3b8', padding: 4, flexShrink: 0,
  },

  noteBox: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    background: '#fdf4ff', border: '1px solid #e9d5ff',
    borderRadius: 10, padding: '12px 14px',
  },
  noteIcon:  { fontSize: 16, flexShrink: 0 },
  noteLabel: { fontSize: 11, fontWeight: 700, color: '#7c3aed', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  noteText:  { fontSize: 13, color: '#4c1d95', lineHeight: 1.5, fontStyle: 'italic' },

  currentBox: {
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 10, padding: '12px 14px',
    display: 'flex', flexDirection: 'column', gap: 5,
  },
  currentLabel: { fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  currentRow:   { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' },

  fieldsLabel: { fontSize: 12, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 },

  errorBox: {
    background: '#fee2e2', color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 500,
  },

  fields: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  field:  { display: 'flex', flexDirection: 'column', gap: 5 },
  label:  { fontSize: 12, fontWeight: 700, color: '#374151' },
  input: {
    padding: '9px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 13, color: '#0f172a',
    background: '#fff', outline: 'none', width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '9px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 13, color: '#0f172a',
    background: '#fff', outline: 'none', cursor: 'pointer', width: '100%',
  },

  durationPreview: {
    fontSize: 13, color: '#475569',
    background: '#f1f5f9', borderRadius: 8, padding: '9px 14px',
  },

  actions:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', paddingTop: 4 },
  actionRight: { display: 'flex', gap: 8 },
  btnDecline: {
    padding: '9px 16px', borderRadius: 8,
    border: '1px solid #fca5a5', background: '#fff',
    color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  btnCancel: {
    padding: '9px 16px', borderRadius: 8,
    border: '1px solid #e2e8f0', background: '#fff',
    color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  btnConfirm: {
    padding: '9px 18px', borderRadius: 8,
    border: 'none', background: '#16a34a',
    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },

  permissionNote: {
    fontSize: 11, color: '#94a3b8', lineHeight: 1.5,
    borderTop: '1px solid #f1f5f9', paddingTop: 12, margin: 0,
  },
};
