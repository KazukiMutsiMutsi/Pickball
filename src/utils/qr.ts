/**
 * Minimal QR code helpers.
 *
 * generateQRMatrix   – returns a boolean 2D array (true = dark module)
 * makeBookingToken   – returns a compact string suitable for encoding in QR
 *
 * This is a simplified, purely decorative QR renderer. For production,
 * replace with a proper library such as `react-native-qrcode-svg`.
 */

export interface BookingTokenParams {
  bookingId: string;
  courtName: string;
  date: string;
  time: string;
}

/** Build a compact URL-safe token string from booking params. */
export function makeBookingToken(params: BookingTokenParams): string {
  const payload = [
    params.bookingId,
    params.courtName,
    params.date,
    params.time,
  ]
    .map((v) => encodeURIComponent(v))
    .join('|');
  return `picklepro://ticket?d=${payload}`;
}

// ─── Very small QR-ish matrix generator ──────────────────────────────────────
// This is NOT a real QR code — it produces a visually plausible grid.
// Use a proper library for scannable codes in production.

const SIZE = 21; // version-1 QR is 21×21

function hashString(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h >>> 0;
  }
  return h;
}

/** Generate a SIZE×SIZE boolean matrix from the data string. */
export function generateQRMatrix(data: string): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: SIZE }, () =>
    new Array(SIZE).fill(false),
  );

  const seed = hashString(data);

  // Fill data area pseudo-randomly
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = hashString(`${seed}:${r}:${c}`) % 2 === 0;
      matrix[r][c] = v;
    }
  }

  // Draw three finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[row + r][col + c] = edge || inner;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, SIZE - 7);
  drawFinder(SIZE - 7, 0);

  return matrix;
}
