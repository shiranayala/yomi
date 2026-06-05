import { useState, useMemo } from 'react';
import { theme, catColor } from '../theme';
import { useCats } from '../lib/CategoriesContext';
import { weekdaysShort } from '../lib/data';
import type { CalEvent, Task } from '../lib/types';
import {
  formatDayMonth, formatMonthYear,
  getGregorianDayMonth, getHebrewDayMonth,
  getGregorianMonthYear, getHebrewMonthYear,
  type DateFormat,
} from '../lib/dateFormat';
import { isItemOnDate } from '../lib/recurrence';
import { CatDot, SectionHead, NavBtn, PageHeader } from '../components/atoms';
import { Icon } from '../icons';

const T = theme;


const now = new Date();
const THIS_YEAR  = now.getFullYear();
const THIS_MONTH = now.getMonth();
const TODAY_DAY  = now.getDate();

function RecurIcon() {
  return (
    <span style={{ opacity: 0.55, display: 'inline-flex', alignItems: 'center', marginInlineStart: 4 }}>
      <Icon.repeat size={11} color={T.color.textMuted} sw={1.8} />
    </span>
  );
}

export function CalendarScreen({ events, tasks, dateFormat, onEditEvent, onEditTask }: {
  events: CalEvent[];
  tasks: Task[];
  dateFormat: DateFormat;
  onEditEvent: (ev: CalEvent) => void;
  onEditTask: (t: Task) => void;
}) {
  const cats = useCats();
  const [month, setMonth] = useState(THIS_MONTH);
  const [year, setYear]   = useState(THIS_YEAR);
  const [sel, setSel]     = useState(TODAY_DAY);

  const grid = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const days  = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    return cells;
  }, [month, year]);

  // Compute dots dynamically from events + date-based tasks
  const dots = useMemo(() => {
    const map: Record<number, string[]> = {};
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const evCats = events
        .filter(ev => isItemOnDate(ev.date, ev.recurrence, date))
        .map(ev => ev.cat);
      const taskCats = tasks
        .filter(t => t.date && isItemOnDate(t.date, t.recurrence, date))
        .map(t => t.cat);
      const all = [...new Set([...evCats, ...taskCats])];
      if (all.length) map[d] = all;
    }
    return map;
  }, [events, tasks, month, year]);

  const selDate = new Date(year, month, sel);

  const selEvents = events
    .filter(ev => isItemOnDate(ev.date, ev.recurrence ?? 'once', selDate))
    .sort((a, b) => a.time.localeCompare(b.time));

  const isSelToday = sel === TODAY_DAY && month === THIS_MONTH && year === THIS_YEAR;

  const selTasks = tasks
    .filter(t => {
      if (t.date && isItemOnDate(t.date, t.recurrence ?? 'once', selDate)) return true;
      if (t.today && isSelToday) return true;
      return false;
    })
    .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));

  type SelItem =
    | { kind: 'event'; ev: CalEvent; time: string }
    | { kind: 'task';  t: Task;      time: string };

  const selItems: SelItem[] = [
    ...selEvents.map(ev => ({ kind: 'event' as const, ev, time: ev.time })),
    ...selTasks.map(t  => ({ kind: 'task'  as const, t,  time: t.time ?? '' })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <PageHeader
        icon={<Icon.calendar size={24} color="#fff" sw={1.8} />}
        title={formatMonthYear(new Date(year, month, 1), dateFormat)}
        titleSub={dateFormat === 'both' ? getHebrewMonthYear(new Date(year, month, 1)) : undefined}
        sub={selEvents.length > 0 ? `${selEvents.length} אירועים ב-${sel} בחודש` : undefined}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <NavBtn onClick={prevMonth}><Icon.chevR size={18} color={T.color.text} /></NavBtn>
            <NavBtn onClick={nextMonth}><Icon.chevL size={18} color={T.color.text} /></NavBtn>
          </div>
        }
      />
      <div style={{ padding: '0 16px' }}>

      {/* Calendar grid */}
      <div style={{
        background: T.color.surface, borderRadius: T.radius.card,
        boxShadow: T.cardShadow, padding: '14px 12px 16px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
          {weekdaysShort.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: T.color.textMuted, padding: '4px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, rowGap: 4 }}>
          {grid.map((d, i) => {
            if (!d) return <div key={i} />;
            const isToday = month === THIS_MONTH && year === THIS_YEAR && d === TODAY_DAY;
            const isSel   = d === sel;
            const dayDots = dots[d] ?? [];
            return (
              <button key={i} onClick={() => setSel(d)} style={{
                border: 'none', cursor: 'pointer',
                background: isSel ? T.color.primary : (isToday ? T.color.primarySoft : 'transparent'),
                borderRadius: 13, padding: '7px 0 5px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                transition: 'background .15s', WebkitTapHighlightColor: 'transparent',
              }}>
                <span style={{
                  fontSize: 14.5, fontWeight: (isToday || isSel) ? 700 : 500,
                  color: isSel ? T.color.onPrimary : (isToday ? T.color.primaryDeep : T.color.text),
                  fontVariantNumeric: 'tabular-nums',
                }}>{d}</span>
                <span style={{ display: 'flex', gap: 2.5, height: 6, alignItems: 'center' }}>
                  {dayDots.slice(0, 3).map((cid: string, k: number) => (
                    <span key={k} style={{
                      width: 5, height: 5, borderRadius: 99,
                      background: isSel ? 'rgba(255,255,255,0.9)' : catColor(cid, cats),
                    }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day */}
      <div style={{ marginTop: 22 }}>
        <SectionHead sub={selItems.length ? `${selItems.length} פריטים` : ''}>
          {dateFormat === 'both' ? (
            <>
              {getGregorianDayMonth(selDate)}
              <span style={{ display: 'block', fontSize: '0.68em', color: T.color.textMuted, fontWeight: 400, marginTop: 1 }}>
                {getHebrewDayMonth(selDate)}
              </span>
            </>
          ) : formatDayMonth(selDate, dateFormat)}
        </SectionHead>

        {selItems.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {selItems.map(item => {
              if (item.kind === 'event') {
                const ev = item.ev;
                const recurring = ev.recurrence && ev.recurrence !== 'once';
                return (
                  <div key={ev.id} onClick={() => onEditEvent(ev)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', background: T.color.surface,
                    borderRadius: T.radius.tile, boxShadow: T.cardShadow,
                    borderInlineStart: '3px solid ' + catColor(ev.cat, cats), cursor: 'pointer',
                  }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: T.color.text, width: 44, fontVariantNumeric: 'tabular-nums' }}>{ev.time}</span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: T.color.text }}>{ev.title}</span>
                    {recurring && <RecurIcon />}
                    <CatDot id={ev.cat} size={9} />
                  </div>
                );
              } else {
                const t = item.t;
                const recurring = t.recurrence && t.recurrence !== 'once';
                return (
                  <div key={t.id} onClick={() => onEditTask(t)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', background: T.color.surface,
                    borderRadius: T.radius.tile, boxShadow: T.cardShadow,
                    borderInlineStart: '3px solid ' + catColor(t.cat, cats),
                    opacity: t.done ? 0.55 : 1, cursor: 'pointer',
                  }}>
                    {t.time && <span style={{ fontSize: 13.5, fontWeight: 700, color: T.color.text, width: 44, fontVariantNumeric: 'tabular-nums' }}>{t.time}</span>}
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: T.color.text,
                      textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</span>
                    {recurring && <RecurIcon />}
                    <CatDot id={t.cat} size={9} />
                  </div>
                );
              }
            })}
          </div>
        ) : (
          <div style={{
            padding: '28px 16px', textAlign: 'center',
            background: T.color.surface, borderRadius: T.radius.card, boxShadow: T.cardShadow,
          }}>
            <div style={{ fontFamily: T.fonts.hand, fontSize: 22, color: T.color.text, marginBottom: 4 }}>יום פנוי לגמרי</div>
            <div style={{ fontSize: 13.5, color: T.color.textMuted }}>אין פריטים מתוכננים ליום הזה</div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
