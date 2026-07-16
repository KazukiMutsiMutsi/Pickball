// Shared in-memory notification store

export interface AppNotification {
  id: string;
  type: 'booking' | 'reminder' | 'promo' | 'system' | 'cancellation';
  title: string;
  message: string;
  time: string;
  read: boolean;
  createdAt: number; // timestamp ms
}

const ICON_MAP: Record<AppNotification['type'], string> = {
  booking:      '📅',
  reminder:     '⏰',
  promo:        '🎉',
  system:       'ℹ️',
  cancellation: '❌',
};

export function getNotifIcon(type: AppNotification['type']) {
  return ICON_MAP[type] ?? 'ℹ️';
}

// ── Seed with one welcome notification ───────────────────────────────────────
let notifications: AppNotification[] = [
  {
    id:        'SYS-001',
    type:      'system',
    title:     'Welcome to PicklePro! 🏓',
    message:   'Book courts, track your sessions, and enjoy the game. Tap "Book a Court" to get started.',
    time:      'Just now',
    read:      false,
    createdAt: Date.now(),
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// ── Public API ────────────────────────────────────────────────────────────────
export function getNotifications(): AppNotification[] {
  return notifications
    .map(n => ({ ...n, time: relativeTime(n.createdAt) }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getUnreadCount(): number {
  return notifications.filter(n => !n.read).length;
}

export function markRead(id: string): void {
  notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
}

export function markAllRead(): void {
  notifications = notifications.map(n => ({ ...n, read: true }));
}

export function addNotification(
  type: AppNotification['type'],
  title: string,
  message: string,
): void {
  const id = `NOTIF-${Date.now().toString(36).toUpperCase()}`;
  notifications = [
    { id, type, title, message, time: 'Just now', read: false, createdAt: Date.now() },
    ...notifications,
  ];
}

// Called automatically when a booking is confirmed
export function notifyBookingConfirmed(params: {
  bookingId: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  grandTotal: number;
  players: number;
}): void {
  const { bookingId, courtName, date, startTime, endTime, grandTotal, players } = params;
  const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  addNotification(
    'booking',
    '✅ Booking Confirmed!',
    `${courtName} on ${fmtDate(date)} from ${fmt(startTime)} to ${fmt(endTime)} · ${players} player${players !== 1 ? 's' : ''} · ₱${grandTotal.toFixed(2)} paid. Booking ID: ${bookingId}`,
  );
}

export function notifyBookingCancelled(courtName: string, date: string): void {
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  addNotification(
    'cancellation',
    '❌ Booking Cancelled',
    `Your booking at ${courtName} on ${fmtDate(date)} has been cancelled.`,
  );
}
