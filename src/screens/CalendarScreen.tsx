import { useState, useMemo, useRef } from 'react';
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
import { getHolidaysInMonth, getHolidaysOnDate, holidayDotColor, holidayLabel } from '../lib/israeliHolidays';
import type { IsraeliHoliday } from '../lib/israeliHolidays';
import { CatDot, NavBtn, PageHeader, glassCard, glassCardLarge } from '../components/atoms';
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

export function CalendarScreen({ events, tasks, dateFormat, onEditEvent, onEditTask, onAddEvent, onAddTask }: {
  events: CalEvent[];
  tasks: Task[];
  dateFormat: DateFormat;
  onEditEvent: (ev: CalEvent, date: string) => void;
  onEditTask: (t: Task) => void;
  onAddEvent: (date: string) => void;
  onAddTask: (date: string) => void;
}) {
  const cats = useCats();
  const [month, setMonth] = useState(THIS_MONTH);
  const [year, setYear]   = useState(THIS_YEAR);
  const [sel, setSel]     = useState(TODAY_DAY);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const grid = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const days  = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    return cells;
  }, [month, year]);

  const holidayMap = useMemo(() => getHolidaysInMonth(year, month), [year, month]);

  // Compute dots dynamically from events + date-based tasks
  const dots = useMemo(() => {
    const map: Record<number, string[]> = {};
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const evCats = events
        .filter(ev => isItemOnDate(ev.date, ev.recurrence, date, ev.excludeDates))
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
  const selDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(sel).padStart(2, '0')}`;

  const selHolidays: IsraeliHoliday[] = getHolidaysOnDate(selDateStr);

  const selEvents = events
    .filter(ev => isItemOnDate(ev.date, ev.recurrence ?? 'once', selDate, ev.excludeDates))
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

  function goToMonth(y: number, m: number) {
    setYear(y); setMonth(m);
    // On the current month jump to today, otherwise to the 1st
    setSel(y === THIS_YEAR && m === THIS_MONTH ? TODAY_DAY : 1);
  }
  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    goToMonth(d.getFullYear(), d.getMonth());
  }

  // ── Swipe between months ──────────────────────────────────────────
  // RTL: the next month sits to the left, so dragging right (dx > 0) brings it in.
  const gridRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ id: number; x0: number; y0: number; t0: number; dx: number; horizontal: boolean | null } | null>(null);
  const animating = useRef(false);
  const justSwiped = useRef(false);

  function setGridStyle(transform: string, opacity: number, transition: string) {
    const el = gridRef.current;
    if (!el) return;
    el.style.transition = transition;
    el.style.transform = transform;
    el.style.opacity = String(opacity);
  }

  /** Slide the grid out, switch month, slide the new one in. dir: +1 next, -1 previous. */
  function slideMonth(dir: 1 | -1) {
    if (animating.current) return;
    const el = gridRef.current;
    if (!el) { shiftMonth(dir); return; }
    animating.current = true;
    const w = el.offsetWidth;
    const out = dir === 1 ? w : -w;
    setGridStyle(`translateX(${out * 0.6}px)`, 0, 'transform .16s ease-in, opacity .16s ease-in');
    setTimeout(() => {
      shiftMonth(dir);
      setGridStyle(`translateX(${-out * 0.6}px)`, 0, 'none');
      // Let React paint the new month, then slide it in
      setTimeout(() => {
        void gridRef.current?.offsetWidth; // flush the jump before animating
        setGridStyle('translateX(0)', 1, 'transform .26s cubic-bezier(.2,.8,.2,1), opacity .2s ease-out');
      }, 16);
      setTimeout(() => { animating.current = false; }, 300);
    }, 160);
  }

  function onSwipeDown(e: React.PointerEvent) {
    if (animating.current || (e.pointerType === 'mouse' && e.button !== 0)) return;
    swipe.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: Date.now(), dx: 0, horizontal: null };
  }
  function onSwipeMove(e: React.PointerEvent) {
    const s = swipe.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x0, dy = e.clientY - s.y0;
    if (s.horizontal === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      s.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!s.horizontal) { swipe.current = null; return; }
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    }
    s.dx = dx;
    const w = gridRef.current?.offsetWidth ?? 300;
    setGridStyle(`translateX(${dx}px)`, 1 - Math.min(Math.abs(dx) / w, 1) * 0.5, 'none');
  }
  function onSwipeEnd(e: React.PointerEvent) {
    const s = swipe.current;
    if (!s || s.id !== e.pointerId) return;
    swipe.current = null;
    if (!s.horizontal) return;
    justSwiped.current = true;
    setTimeout(() => { justSwiped.current = false; }, 50);
    const velocity = Math.abs(s.dx) / Math.max(1, Date.now() - s.t0); // px per ms
    if (Math.abs(s.dx) > 60 || (Math.abs(s.dx) > 20 && velocity > 0.4)) {
      slideMonth(s.dx > 0 ? 1 : -1);
    } else {
      setGridStyle('translateX(0)', 1, 'transform .22s cubic-bezier(.34,1.56,.64,1), opacity .2s');
    }
  }

  const onThisMonth = month === THIS_MONTH && year === THIS_YEAR;

  return (
    <div style={{ paddingBottom: 100 }}>
      <PageHeader
        icon={<Icon.calendar size={24} color="#fff" sw={1.8} />}
        title={formatMonthYear(new Date(year, month, 1), dateFormat)}
        titleSub={dateFormat === 'both' ? getHebrewMonthYear(new Date(year, month, 1)) : undefined}
        sub={selEvents.length > 0 ? `${selEvents.length} אירועים ב-${sel} בחודש` : undefined}
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!(onThisMonth && sel === TODAY_DAY) && (
              <button
                onClick={() => goToMonth(THIS_YEAR, THIS_MONTH)}
                style={{
                  height: 36, padding: '0 12px', borderRadius: 12, border: 'none',
                  background: T.color.primarySoft, color: T.color.primaryDeep,
                  fontSize: 13.5, fontWeight: 800, fontFamily: T.fonts.body, cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  animation: 'yomiFadeIn .2s ease-out',
                }}
              >היום</button>
            )}
            <NavBtn onClick={() => slideMonth(-1)}><Icon.chevR size={18} color={T.color.text} /></NavBtn>
            <NavBtn onClick={() => slideMonth(1)}><Icon.chevL size={18} color={T.color.text} /></NavBtn>
            <style>{`@keyframes yomiFadeIn { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: scale(1); } }`}</style>
          </div>
        }
      />
      <div style={{ padding: '0 16px' }}>

      {/* Calendar grid */}
      <div
        onPointerDown={onSwipeDown}
        onPointerMove={onSwipeMove}
        onPointerUp={onSwipeEnd}
        onPointerCancel={onSwipeEnd}
        onClickCapture={e => { if (justSwiped.current) { e.stopPropagation(); e.preventDefault(); } }}
        style={{
          ...glassCardLarge,
          padding: '14px 12px 16px',
          overflow: 'hidden', touchAction: 'pan-y',
          userSelect: 'none', WebkitUserSelect: 'none',
        }}
      >
      <div ref={gridRef} style={{ willChange: 'transform' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
          {weekdaysShort.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: T.color.textMuted, padding: '4px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, rowGap: 4 }}>
          {grid.map((d, i) => {
            if (!d) return <div key={i} />;
            const isToday    = month === THIS_MONTH && year === THIS_YEAR && d === TODAY_DAY;
            const isSel      = d === sel;
            const dayDots    = dots[d] ?? [];
            const dayHols    = holidayMap[d] ?? [];
            const primaryHol = dayHols[0];
            return (
              <button key={i} onClick={() => setSel(d)} style={{
                border: 'none', cursor: 'pointer',
                background: isSel ? T.color.primary : (isToday ? T.color.primarySoft : 'transparent'),
                borderRadius: 13, padding: '3px 0 5px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                transition: 'background .15s', WebkitTapHighlightColor: 'transparent',
              }}>
                {/* Holiday indicator — always rendered for uniform cell height */}
                <span style={{ height: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {primaryHol && (
                    <span style={{
                      width: 5, height: 5, borderRadius: 99,
                      background: isSel ? 'rgba(255,255,255,0.75)' : holidayDotColor(primaryHol),
                    }} />
                  )}
                </span>
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
      </div>

      {/* Selected day */}
      <div style={{ marginTop: 22 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '6px 2px 13px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <h2 style={{
              margin: 0, fontFamily: T.fonts.heading, fontWeight: 700,
              fontSize: Math.round(23 * T.headingScale), color: T.color.text, lineHeight: 1.15,
            }}>
              {dateFormat === 'both' ? (
                <>
                  {getGregorianDayMonth(selDate)}
                  <span style={{ display: 'block', fontSize: '0.68em', color: T.color.textMuted, fontWeight: 400, marginTop: 1 }}>
                    {getHebrewDayMonth(selDate)}
                  </span>
                </>
              ) : formatDayMonth(selDate, dateFormat)}
            </h2>
            {selItems.length > 0 && (
              <span style={{ fontSize: 12.5, color: T.color.textMuted, paddingBottom: 3 }}>
                {selItems.length} פריטים
              </span>
            )}
          </div>

          {/* Add button */}
          <div style={{ position: 'relative', marginBottom: 4 }}>
            {addMenuOpen && (
              <div onClick={() => setAddMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 20 }} />
            )}
            <button
              onClick={() => setAddMenuOpen(o => !o)}
              style={{
                width: 32, height: 32, borderRadius: 99,
                background: `linear-gradient(135deg, ${T.color.primary}, ${T.color.heroFrom})`,
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: '#fff', fontWeight: 300,
                boxShadow: `0 1px 0 rgba(255,255,255,0.4) inset, 0 4px 12px ${T.color.primary}55`,
                WebkitTapHighlightColor: 'transparent',
              }}
            >+</button>
            {addMenuOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', insetInlineEnd: 0, zIndex: 21,
                background: '#fff', borderRadius: 16, padding: '6px 0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: 148, direction: 'rtl',
              }}>
                <button onClick={() => { setAddMenuOpen(false); onAddTask(selDateStr); }} style={{
                  width: '100%', border: 'none', background: 'none', cursor: 'pointer',
                  padding: '11px 16px', fontSize: 14, fontWeight: 600,
                  fontFamily: T.fonts.body, color: T.color.text,
                  display: 'flex', alignItems: 'center', gap: 10, textAlign: 'right',
                }}>
                  <span style={{ fontSize: 16 }}>✓</span> משימה
                </button>
                <div style={{ height: 1, background: T.color.line, margin: '0 10px' }} />
                <button onClick={() => { setAddMenuOpen(false); onAddEvent(selDateStr); }} style={{
                  width: '100%', border: 'none', background: 'none', cursor: 'pointer',
                  padding: '11px 16px', fontSize: 14, fontWeight: 600,
                  fontFamily: T.fonts.body, color: T.color.text,
                  display: 'flex', alignItems: 'center', gap: 10, textAlign: 'right',
                }}>
                  <span style={{ fontSize: 16 }}>📅</span> אירוע
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Holiday cards */}
        {selHolidays.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: selItems.length > 0 ? 9 : 0 }}>
            {selHolidays.map(h => (
              <div key={h.name} style={{
                ...glassCard,
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              }}>
                <span style={{
                  width: 5, height: 26, borderRadius: 99,
                  background: holidayDotColor(h), flexShrink: 0,
                }} />
                <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: T.color.text }}>{h.name}</span>
                <span style={{
                  fontSize: 11.5, color: T.color.textMuted, fontWeight: 600,
                  background: T.color.primarySoft, borderRadius: 8, padding: '2px 8px',
                }}>{holidayLabel(h)}</span>
              </div>
            ))}
          </div>
        )}

        {selItems.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {selItems.map(item => {
              if (item.kind === 'event') {
                const ev = item.ev;
                const recurring = ev.recurrence && ev.recurrence !== 'once';
                return (
                  <div key={ev.id} onClick={() => onEditEvent(ev, selDateStr)} style={{
                    ...glassCard,
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', cursor: 'pointer',
                  }}>
                    <span style={{
                      width: 5, height: 26, borderRadius: 99,
                      background: catColor(ev.cat, cats), flexShrink: 0,
                    }} />
                    <span style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: 13.5, fontWeight: 800, width: 44, fontVariantNumeric: 'tabular-nums',
                      background: `linear-gradient(120deg, ${T.color.primaryDeep}, ${T.color.heroFrom})`,
                      WebkitBackgroundClip: 'text', backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent', color: 'transparent',
                    }}>{ev.time}</span>
                    <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: T.color.text }}>{ev.title}</span>
                    {recurring && <RecurIcon />}
                    <CatDot id={ev.cat} size={9} />
                  </div>
                );
              } else {
                const t = item.t;
                const recurring = t.recurrence && t.recurrence !== 'once';
                return (
                  <div key={t.id} onClick={() => onEditTask(t)} style={{
                    ...glassCard,
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    opacity: t.done ? 0.55 : 1, cursor: 'pointer',
                  }}>
                    <span style={{
                      width: 5, height: 26, borderRadius: 99,
                      background: catColor(t.cat, cats), flexShrink: 0,
                    }} />
                    {t.time && <span style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: 13.5, fontWeight: 800, width: 44, fontVariantNumeric: 'tabular-nums',
                      background: `linear-gradient(120deg, ${T.color.primaryDeep}, ${T.color.heroFrom})`,
                      WebkitBackgroundClip: 'text', backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent', color: 'transparent',
                    }}>{t.time}</span>}
                    <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: T.color.text,
                      textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</span>
                    {recurring && <RecurIcon />}
                    <CatDot id={t.cat} size={9} />
                  </div>
                );
              }
            })}
          </div>
        ) : selHolidays.length === 0 ? (
          <div style={{
            ...glassCardLarge,
            padding: '28px 16px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: T.fonts.heading, fontSize: 18, fontWeight: 800, letterSpacing: '-0.4px', color: T.color.text, marginBottom: 4 }}>יום פנוי לגמרי</div>
            <div style={{ fontSize: 13.5, color: T.color.textMuted }}>אין פריטים מתוכננים ליום הזה</div>
          </div>
        ) : null}
      </div>
      </div>
    </div>
  );
}
