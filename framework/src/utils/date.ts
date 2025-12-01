/**
 * Returns a YYYY-MM-DD date string offset by `days` from today.
 * This works well with native `<input type="date">` fields.
 */
export function formatDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
