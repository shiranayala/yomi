export type DateFormat = 'gregorian' | 'hebrew' | 'both';

// ── Hebrew letter (gematria) conversion ───────────────────────────

const UNITS    = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const TENS     = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
const HUNDREDS = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];

function hebrewNumerals(n: number): string {
  const h = Math.floor(n / 100);
  const rem = n % 100;
  let s = HUNDREDS[h] ?? '';
  // 15 = טו, 16 = טז (avoid divine name abbreviations)
  if (rem === 15) s += 'טו';
  else if (rem === 16) s += 'טז';
  else {
    s += TENS[Math.floor(rem / 10)] ?? '';
    s += UNITS[rem % 10] ?? '';
  }
  return s;
}

function withGershayim(s: string): string {
  if (!s) return '';
  if (s.length === 1) return s + '\u05F3'; // geresh ׳
  return s.slice(0, -1) + '\u05F4' + s.slice(-1); // gershayim ״
}

function toHebrewDay(n: number): string {
  return withGershayim(hebrewNumerals(n));
}

function toHebrewYear(n: number): string {
  const thousands = Math.floor(n / 1000);
  const rem = n % 1000;
  return (UNITS[thousands] ?? '') + '\u05F3' + withGershayim(hebrewNumerals(rem));
}

// ── Intl formatters ───────────────────────────────────────────────

const gregDM = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long' });
const gregMY = new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' });
const hebFmt = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
  day: 'numeric', month: 'long', year: 'numeric',
});

function getHebParts(date: Date) {
  const parts = hebFmt.formatToParts(date);
  return {
    day:   parseInt(parts.find(p => p.type === 'day')?.value   ?? '1'),
    month: parts.find(p => p.type === 'month')?.value          ?? '',
    year:  parseInt(parts.find(p => p.type === 'year')?.value  ?? '5784'),
  };
}

// ── Public helpers ────────────────────────────────────────────────

export function getGregorianDayMonth(date: Date): string {
  return gregDM.format(date);
}

export function getGregorianMonthYear(date: Date): string {
  return gregMY.format(date);
}

export function getHebrewDayMonth(date: Date): string {
  const { day, month } = getHebParts(date);
  return `${toHebrewDay(day)} ב${month}`;
}

export function getHebrewMonthYear(date: Date): string {
  const { month, year } = getHebParts(date);
  return `${month} ${toHebrewYear(year)}`;
}

// ── Combined formatters (primary string only — caller adds secondary for 'both') ──

export function formatDayMonth(date: Date, format: DateFormat): string {
  if (format === 'hebrew') return getHebrewDayMonth(date);
  return getGregorianDayMonth(date);
}

export function formatMonthYear(date: Date, format: DateFormat): string {
  if (format === 'hebrew') return getHebrewMonthYear(date);
  return getGregorianMonthYear(date);
}
