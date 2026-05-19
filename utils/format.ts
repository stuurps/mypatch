const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  if (d.getFullYear() === new Date().getFullYear()) return `${day} ${month}`;
  return `${day} ${month} ${d.getFullYear()}`;
}
