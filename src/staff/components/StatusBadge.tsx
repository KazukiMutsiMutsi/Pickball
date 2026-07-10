import type { BookingStatus } from '../types';

const CONFIG: Record<BookingStatus, { label: string; bg: string; color: string }> = {
  confirmed:             { label: 'Confirmed',    bg: '#dbeafe', color: '#1d4ed8' },
  pending:               { label: 'Pending',      bg: '#fef3c7', color: '#b45309' },
  checked_in:            { label: 'Checked In',   bg: '#dcfce7', color: '#15803d' },
  completed:             { label: 'Completed',    bg: '#f1f5f9', color: '#475569' },
  cancelled:             { label: 'Cancelled',    bg: '#fee2e2', color: '#dc2626' },
  no_show:               { label: 'No Show',      bg: '#fee2e2', color: '#dc2626' },
  reschedule_requested:  { label: '↻ Reschedule', bg: '#fdf4ff', color: '#7c3aed' },
};

interface Props {
  status: BookingStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = CONFIG[status];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
        borderRadius: 99,
        fontSize: size === 'sm' ? 10 : 11,
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}
