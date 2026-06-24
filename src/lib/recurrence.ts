import type { Recurrence } from './types';

function dayStart(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function parseLocalDate(str: string): Date {
  // Avoid timezone issues by parsing as local date
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isItemOnDate(
  itemDate: string,
  recurrence: Recurrence = 'once',
  checkDate: Date,
  excludeDates?: string[],
): boolean {
  const start = dayStart(parseLocalDate(itemDate));
  const check = dayStart(checkDate);

  if (start > check) return false;

  if (excludeDates?.length) {
    const d = checkDate;
    const checkStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (excludeDates.includes(checkStr)) return false;
  }

  switch (recurrence) {
    case 'once':
      return start.getTime() === check.getTime();
    case 'daily':
      return true;
    case 'weekly':
      return start.getDay() === check.getDay();
    case 'biweekly': {
      const diff = Math.round((check.getTime() - start.getTime()) / 86400000);
      return diff % 14 === 0;
    }
    case 'monthly':
      return start.getDate() === check.getDate();
  }
}

export function isToday(itemDate: string, recurrence: Recurrence = 'once', excludeDates?: string[]): boolean {
  return isItemOnDate(itemDate, recurrence, new Date(), excludeDates);
}

export const todayStr = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const tomorrowStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function isTomorrow(itemDate: string, recurrence: Recurrence = 'once', excludeDates?: string[]): boolean {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return isItemOnDate(itemDate, recurrence, d, excludeDates);
}
