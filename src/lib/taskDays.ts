import type { Task } from './types';
import { todayStr, tomorrowStr } from './recurrence';

const DAY_SHORT = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const DAY_FULL = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** The next `n` days starting today, as YYYY-MM-DD. */
export function nextDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(ymd(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** Short chip label: "היום", "מחר", or weekday letter + day.month */
export function shortDayLabel(day: string): { top: string; bottom: string } {
  const d = parseYmd(day);
  const dm = `${d.getDate()}.${d.getMonth() + 1}`;
  if (day === todayStr()) return { top: 'היום', bottom: dm };
  if (day === tomorrowStr()) return { top: 'מחר', bottom: dm };
  return { top: DAY_SHORT[d.getDay()], bottom: dm };
}

/** Readable label: "היום", "מחר", "יום שלישי, 2.12" */
export function longDayLabel(day: string): string {
  const d = parseYmd(day);
  if (day === todayStr()) return 'היום';
  if (day === tomorrowStr()) return 'מחר';
  return `יום ${DAY_FULL[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}`;
}

/** The day a task is on, or null for "later" tasks. */
export function taskDay(t: Task): string | null {
  if (t.today) return t.todayDate ?? todayStr();
  return t.date ?? null;
}

/** The task's date fields set so it shows on `day`. */
export function placeOnDay(t: Task, day: string): Task {
  const today = todayStr();
  if (day === today) {
    return { ...t, today: true, todayDate: today, date: undefined };
  }
  return { ...t, today: false, todayDate: undefined, date: day };
}
