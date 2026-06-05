import type { HabitLog } from './types';

export function calcStreak(logs: HabitLog[], habitId: string): number {
  const dates = new Set(
    logs.filter(l => l.habitId === habitId).map(l => l.date)
  );
  const today = new Date().toISOString().slice(0, 10);
  const d = new Date();
  if (!dates.has(today)) d.setDate(d.getDate() - 1);
  let count = 0;
  while (true) {
    const s = d.toISOString().slice(0, 10);
    if (!dates.has(s)) break;
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
