/**
 * Formats a number as a USD currency string.
 * Example: 20 → "$20.00"
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
