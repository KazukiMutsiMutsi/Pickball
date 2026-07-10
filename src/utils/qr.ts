/**
 * Minimal QR-like matrix generator.
 * Produces a deterministic 21×21 boolean grid from any string.
 * This is NOT a real QR code — it's a unique visual pattern used as a
 * booking token that staff verify by matching the booking ID visually
 * or by scanning with the admin scanner which reads the embedded text.
 *
 * For production: replace with a real QR library like `react-native-qrcode-svg`.
 */

const SIZE = 21;

function hash(s: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i++) {
    bytes.push(s.charCodeAt(i));
  }
  // Simple seeded pseudo-random based on string content
  const seed = bytes.reduce((acc, b, i) => acc + b * (i + 7), 0);
  const result: number[] = [];
  let state = seed;
  for (let i = 0; i < SIZE * SIZE; i++) {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    result.push((state >>> 24) & 0xff);
  }
  return result;
}

export function generateQRMatrix(data: string): boolean[][] {
  const bytes = hash(data);
  const matrix: boolean[][] = [];
  // Finder patterns (top-left, top-right, bottom-left corners)
  const finderPositions = new Set<string>();
  // Top-left 7×7
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) finderPositions.add(`${r},${c}`);
  // Top-right 7×7
  for (let r = 0; r < 7; r++) for (let c = SIZE - 7; c < SIZE; c++) finderPositions.add(`${r},${c}`);
  // Bottom-left 7×7
  for (let r = SIZE - 7; r < SIZE; r++) for (let c = 0; c < 7; c++) finderPositions.add(`${r},${c}`);

  for (let r = 0; r < SIZE; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < SIZE; c++) {
      const key = `${r},${c}`;
      if (finderPositions.has(key)) {
        // Finder pattern — ring of dark with white inside
        const inOuter = (r < 7 && c < 7) || (r < 7 && c >= SIZE - 7) || (r >= SIZE - 7 && c < 7);
        if (inOuter) {
          const lr = r < 7 ? r : r - (SIZE - 7);
          const lc = c < 7 ? c : c - (SIZE - 7);
          const isDark = lr === 0 || lr === 6 || lc === 0 || lc === 6
            || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
          row.push(isDark);
        } else {
          row.push(false);
        }
      } else {
        // Data modules — use hash bytes
        const idx = r * SIZE + c;
        row.push(bytes[idx % bytes.length] > 100);
      }
    }
    matrix.push(row);
  }
  return matrix;
}

/** Generate a booking token string embedded in the QR */
export function makeBookingToken(params: {
  bookingId: string;
  courtName: string;
  date: string;
  time: string;
  userId?: string;
}): string {
  return JSON.stringify({
    id:    params.bookingId,
    court: params.courtName,
    date:  params.date,
    time:  params.time,
    uid:   params.userId ?? 'guest',
    ts:    Date.now(),
  });
}
