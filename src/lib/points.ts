import type { Routine, RoutineLog } from './types';
import { weekStartStr } from './routineIcons';

/** The 7 dates (YYYY-MM-DD) of the current week, Sunday first. */
export function weekDates(): string[] {
  const [y, m, d] = weekStartStr().split('-').map(Number);
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(y, m - 1, d + i);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  });
}

/** Total taps for a routine on a specific date. */
export function countOn(routineId: string, logs: RoutineLog[], date: string): number {
  return logs
    .filter(l => l.routineId === routineId && l.date === date)
    .reduce((s, l) => s + l.count, 0);
}

/** Points earned from daily routines this week: one per day a routine hit its target. */
export function routineWeekPoints(routines: Routine[], logs: RoutineLog[]): number {
  const dates = weekDates();
  return routines
    .filter(r => r.kind === 'daily')
    .reduce((sum, r) =>
      sum + dates.filter(ds => countOn(r.id, logs, ds) >= r.target).length, 0);
}
