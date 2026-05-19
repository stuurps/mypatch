import { formatDate } from '@/utils/format';

describe('formatDate', () => {
  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 2;

  it('shows day and month only when same year', () => {
    const iso = new Date(currentYear, 4, 13).toISOString();
    expect(formatDate(iso)).toBe('13 May');
  });

  it('includes year for a date from a previous year', () => {
    const iso = new Date(prevYear, 4, 13).toISOString();
    expect(formatDate(iso)).toBe(`13 May ${prevYear}`);
  });

  it('formats single-digit days without padding', () => {
    const iso = new Date(currentYear, 0, 3).toISOString();
    expect(formatDate(iso)).toBe('3 Jan');
  });

  it('uses correct month names', () => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    months.forEach((month, i) => {
      const iso = new Date(currentYear, i, 1).toISOString();
      expect(formatDate(iso)).toContain(month);
    });
  });
});
