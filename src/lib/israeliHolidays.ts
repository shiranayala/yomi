import { HebrewCalendar, flags } from '@hebcal/core';
import type { Event } from '@hebcal/core';

export type HolidayType = 'chag' | 'fast' | 'modern' | 'minor';

export interface IsraeliHoliday {
  date: string;       // YYYY-MM-DD
  name: string;       // Hebrew display name
  type: HolidayType;
  somber: boolean;    // fast days + days of mourning/remembrance
}

// Mapping: hebcal English desc → Hebrew name + somber flag
const INCLUDE: Record<string, { name: string; somber: boolean }> = {
  'Tu BiShvat':                  { name: 'ט"ו בשבט', somber: false },
  "Ta'anit Esther":              { name: 'תענית אסתר', somber: true },
  'Purim':                       { name: 'פורים', somber: false },
  'Shushan Purim':               { name: 'שושן פורים', somber: false },
  'Purim Katan':                 { name: 'פורים קטן', somber: false },
  'Shushan Purim Katan':        { name: 'שושן פורים קטן', somber: false },
  "Ta'anit Bechorot":           { name: 'תענית בכורות', somber: true },
  'Pesach I':                    { name: 'פסח', somber: false },
  "Pesach II (CH''M)":          { name: 'חול המועד פסח', somber: false },
  "Pesach III (CH''M)":         { name: 'חול המועד פסח', somber: false },
  "Pesach IV (CH''M)":          { name: 'חול המועד פסח', somber: false },
  "Pesach V (CH''M)":           { name: 'חול המועד פסח', somber: false },
  "Pesach VI (CH''M)":          { name: 'חול המועד פסח', somber: false },
  'Pesach VII':                  { name: 'שביעי של פסח', somber: false },
  'Yom HaShoah':                 { name: 'יום השואה', somber: true },
  'Yom HaZikaron':               { name: 'יום הזיכרון', somber: true },
  "Yom HaAtzma'ut":             { name: 'יום העצמאות', somber: false },
  'Lag BaOmer':                  { name: 'ל"ג בעומר', somber: false },
  'Yom Yerushalayim':            { name: 'יום ירושלים', somber: false },
  'Shavuot':                     { name: 'שבועות', somber: false },
  'Tzom Tammuz':                 { name: 'שבעה עשר בתמוז', somber: true },
  "Tish'a B'Av":                { name: 'תשעה באב', somber: true },
  "Tu B'Av":                     { name: 'ט"ו באב', somber: false },
  'Leil Selichot':               { name: 'ליל סליחות', somber: false },
  'Rosh Hashana II':             { name: 'ראש השנה ב׳', somber: false },
  'Tzom Gedaliah':               { name: 'צום גדליה', somber: true },
  'Yom Kippur':                  { name: 'יום כיפור', somber: true },
  'Sukkot I':                    { name: 'סוכות', somber: false },
  "Sukkot II (CH''M)":          { name: 'חול המועד סוכות', somber: false },
  "Sukkot III (CH''M)":         { name: 'חול המועד סוכות', somber: false },
  "Sukkot IV (CH''M)":          { name: 'חול המועד סוכות', somber: false },
  "Sukkot V (CH''M)":           { name: 'חול המועד סוכות', somber: false },
  "Sukkot VI (CH''M)":          { name: 'חול המועד סוכות', somber: false },
  'Sukkot VII (Hoshana Raba)':  { name: 'הושענא רבה', somber: false },
  'Shmini Atzeret':              { name: 'שמיני עצרת / שמחת תורה', somber: false },
  "Asara B'Tevet":               { name: 'צום עשרה בטבת', somber: true },
  'Yitzhak Rabin Memorial Day': { name: 'יום הזיכרון לרבין', somber: true },
  'Sigd':                        { name: 'סיגד', somber: false },
  'Chag HaBanot':                { name: 'חג הבנות', somber: false },
};

const HEB_DIGITS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח'];

function lookupEvent(ev: Event): { name: string; somber: boolean } | null {
  const desc = ev.getDesc();
  // Rosh Hashana with year number: "Rosh Hashana 5787"
  if (/^Rosh Hashana \d/.test(desc)) return { name: 'ראש השנה', somber: false };
  // Chanukah candle nights
  const chanM = desc.match(/^Chanukah: (\d+) Candle/);
  if (chanM) {
    const n = parseInt(chanM[1]);
    return { name: `חנוכה — נר ${HEB_DIGITS[n - 1] ?? n}׳`, somber: false };
  }
  // Skip Erev events and redundant entries
  if (desc.startsWith('Erev ') || desc === 'Chanukah: 8th Day') return null;
  return INCLUDE[desc] ?? null;
}

function getType(f: number): HolidayType {
  if (f & (flags.MAJOR_FAST | flags.MINOR_FAST)) return 'fast';
  if (f & flags.CHAG) return 'chag';
  if (f & flags.MODERN_HOLIDAY) return 'modern';
  return 'minor';
}

function pad2(n: number) { return String(n).padStart(2, '0'); }

const KEEP =
  flags.CHAG |
  flags.MAJOR_FAST |
  flags.MINOR_FAST |
  flags.MODERN_HOLIDAY |
  flags.MINOR_HOLIDAY |
  flags.CHOL_HAMOED |
  flags.CHANUKAH_CANDLES;

function buildForYear(year: number): IsraeliHoliday[] {
  const evs = HebrewCalendar.calendar({
    year,
    isHebrewYear: false,
    il: true,
    noHolidays: false,
    sedrot: false,
    omer: false,
    yomKippurKatan: false,
  });
  const result: IsraeliHoliday[] = [];
  for (const ev of evs) {
    if (!(ev.getFlags() & KEEP)) continue;
    const lookup = lookupEvent(ev);
    if (!lookup) continue;
    const g = ev.getDate().greg();
    const date = `${g.getFullYear()}-${pad2(g.getMonth() + 1)}-${pad2(g.getDate())}`;
    result.push({ date, name: lookup.name, type: getType(ev.getFlags()), somber: lookup.somber });
  }
  return result;
}

const _loaded = new Set<number>();
const _byDate: Record<string, IsraeliHoliday[]> = {};

function ensureYear(year: number) {
  if (_loaded.has(year)) return;
  _loaded.add(year);
  for (const h of buildForYear(year)) {
    (_byDate[h.date] ??= []).push(h);
  }
}

[2025, 2026, 2027, 2028].forEach(ensureYear);

export function getHolidaysOnDate(dateStr: string): IsraeliHoliday[] {
  ensureYear(parseInt(dateStr.slice(0, 4)));
  return _byDate[dateStr] ?? [];
}

export function getHolidaysInMonth(year: number, month: number): Record<number, IsraeliHoliday[]> {
  ensureYear(year);
  const prefix = `${year}-${pad2(month + 1)}-`;
  const result: Record<number, IsraeliHoliday[]> = {};
  for (const [date, holidays] of Object.entries(_byDate)) {
    if (date.startsWith(prefix)) {
      result[parseInt(date.slice(8))] = holidays;
    }
  }
  return result;
}

export function holidayDotColor(h: IsraeliHoliday): string {
  if (h.somber) return '#94A3B8';
  if (h.type === 'modern') return '#3B82F6';
  return '#F59E0B';
}

export function holidayLabel(h: IsraeliHoliday): string {
  if (h.type === 'fast') return 'יום צום';
  if (h.somber) return 'יום זיכרון';
  if (h.type === 'modern') return 'יום לאומי';
  if (h.type === 'chag') return 'חג';
  return 'מועד';
}
