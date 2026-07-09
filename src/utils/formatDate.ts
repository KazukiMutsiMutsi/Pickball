/**
 * Formats an ISO date string to a human-readable format.
 * Example: "2026-07-10" → "July 10, 2026"
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Formats a 24h time string to 12h AM/PM format.
 * Example: "14:00" → "2:00 PM"
 */
export function formatTime(time24: string): string {
  const [hourStr, minute] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${period}`;
}
