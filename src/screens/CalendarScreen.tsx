import { useState, useMemo } from 'react';
import { theme, catColor } from '../theme';
import { weekdaysShort, monthNames, monthDots, dayAgenda } from '../lib/data';
import { CatDot, SectionHead, NavBtn } from '../components/atoms';
import { Icon } from '../icons';

const T = theme;
const TOP_INSET = 20;

const THIS_MONTH = 4; // May (0-indexed), matching sample data
const THIS_YEAR = 2026;
const TODAY_DAY = 29;

export function CalendarScreen() {
  const [month, setMonth] = useState(THIS_MONTH);
  const [year, setYear] = useState(THIS_YEAR);
  const [sel, setSel] = useState(TODAY_DAY);

  const grid = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    return cells;
  }, [month, year]);

  const dots = month === THIS_MONTH && year === THIS_YEAR ? monthDots : {};
  const agenda = (month === THIS_MONTH && year === THIS_YEAR && dayAgenda[sel]) ? dayAgenda[sel] : [];

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  return (
    <div style={{ padding: `${TOP_INSET + 8}px 16px 100px` }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 18, padding: '0 2px',
      }}>
        <h1 style={{
          margin: 0, fontFamily: T.fonts.hand, fontWeight: 400,
          fontSize: Math.round(34 * T.headingScale), color: T.color.text,
        }}>{monthNames[month]} {year}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <NavBtn onClick={prevMonth}>
            <Icon.chevR size={18} color={T.color.text} />
          </NavBtn>
          <NavBtn onClick={nextMonth}>
            <Icon.chevL size={18} color={T.color.text} />
          </NavBtn>
        </div>
      </div>

      <div style={{
        background: T.color.surface, borderRadius: T.radius.card,
        boxShadow: T.cardShadow, padding: '14px 12px 16px',
      }}>
        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
          {weekdaysShort.map((d, i) => (
            <div key={i} style={{
              textAlign: 'center', fontSize: 11.5, fontWeight: 700,
              color: T.color.textMuted, padding: '4px 0',
            }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, rowGap: 4 }}>
          {grid.map((d, i) => {
            if (!d) return <div key={i} />;
            const isToday = month === THIS_MONTH && year === THIS_YEAR && d === TODAY_DAY;
            const isSel = d === sel;
            const dayDots = (dots as Record<number, string[]>)[d] ?? [];
            return (
              <button key={i} onClick={() => setSel(d)} style={{
                border: 'none', cursor: 'pointer',
                background: isSel ? T.color.primary : (isToday ? T.color.primarySoft : 'transparent'),
                borderRadius: 13, padding: '7px 0 5px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                transition: 'background .15s', WebkitTapHighlightColor: 'transparent',
              }}>
                <span style={{
                  fontSize: 14.5,
                  fontWeight: (isToday || isSel) ? 700 : 500,
                  color: isSel ? T.color.onPrimary : (isToday ? T.color.primaryDeep : T.color.text),
                  fontVariantNumeric: 'tabular-nums',
                }}>{d}</span>
                <span style={{ display: 'flex', gap: 2.5, height: 6, alignItems: 'center' }}>
                  {dayDots.slice(0, 3).map((cid: string, k: number) => (
                    <span key={k} style={{
                      width: 5, height: 5, borderRadius: 99,
                      background: isSel ? 'rgba(255,255,255,0.9)' : catColor(cid),
                    }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day agenda */}
      <div style={{ marginTop: 22 }}>
        <SectionHead sub={agenda.length ? `${agenda.length} אירועים` : ''}>
          {sel} ב{monthNames[month]}
        </SectionHead>

        {agenda.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {agenda.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', background: T.color.surface,
                borderRadius: T.radius.tile, boxShadow: T.cardShadow,
                borderInlineStart: '3px solid ' + catColor(a.cat),
              }}>
                <span style={{
                  fontSize: 13.5, fontWeight: 700, color: T.color.text,
                  width: 44, fontVariantNumeric: 'tabular-nums',
                }}>{a.time}</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: T.color.text }}>{a.title}</span>
                <CatDot id={a.cat} size={9} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '28px 16px', textAlign: 'center',
            background: T.color.surface, borderRadius: T.radius.card, boxShadow: T.cardShadow,
          }}>
            <div style={{ fontFamily: T.fonts.hand, fontSize: 22, color: T.color.text, marginBottom: 4 }}>
              יום פנוי לגמרי
            </div>
            <div style={{ fontSize: 13.5, color: T.color.textMuted }}>
              אין אירועים מתוכננים ליום הזה
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
