export type DateFormat = 'gregorian' | 'hebrew' | 'both';

const gregDM  = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long' });
const gregMY  = new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' });
const hebDM   = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { day: 'numeric', month: 'long' });
const hebMY   = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { month: 'long', year: 'numeric' });

export function formatDayMonth(date: Date, format: DateFormat): string {
  const g = gregDM.format(date);
  const h = hebDM.format(date);
  if (format === 'gregorian') return g;
  if (format === 'hebrew')    return h;
  return `${g} · ${h}`;
}

export function formatMonthYear(date: Date, format: DateFormat): string {
  const g = gregMY.format(date);
  const h = hebMY.format(date);
  if (format === 'gregorian') return g;
  if (format === 'hebrew')    return h;
  return `${g} · ${h}`;
}
