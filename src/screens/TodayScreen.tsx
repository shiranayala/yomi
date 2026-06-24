import { useState } from 'react';
import { theme, catColor } from '../theme';
import { useCats } from '../lib/CategoriesContext';
import type { Task, CalEvent } from '../lib/types';
import { isToday, isTomorrow, todayStr } from '../lib/recurrence';
import { Check, Chip, AddRow, SectionHead } from '../components/atoms';
import { Icon } from '../icons';
import { useWeather, type WeatherIconKey } from '../lib/useWeather';
import { getGregorianDayMonth, getHebrewDayMonth, type DateFormat } from '../lib/dateFormat';

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'בוקר טוב';
  if (h >= 12 && h < 17) return 'צהריים טובים';
  if (h >= 17 && h < 21) return 'ערב טוב';
  return 'לילה טוב';
}

const T = theme;
const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function RecurIcon() {
  return (
    <span style={{ opacity: 0.6, display: 'inline-flex', alignItems: 'center' }}>
      <Icon.repeat size={11} color={T.color.textMuted} sw={1.8} />
    </span>
  );
}

// ── Timeline ──────────────────────────────────────────────────────

type TimelineEntry =
  | { kind: 'event'; ev: CalEvent }
  | { kind: 'task';  t: Task };

// Shared glass surface used by every card in the Today screen
const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(18px) saturate(140%)',
  WebkitBackdropFilter: 'blur(18px) saturate(140%)',
  borderRadius: T.radius.tile,
  boxShadow:
    '0 1px 0 rgba(255,255,255,0.65) inset, 0 4px 12px rgba(155,125,212,0.07), 0 12px 26px rgba(155,125,212,0.09)',
  transition: 'transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s',
};

// Gradient time block (start + optional end) — reused by both event & task cards
function TimeBlock({ time, end }: { time: string; end?: string }) {
  return (
    <div style={{
      flexShrink: 0, textAlign: 'center', minWidth: 50,
      direction: 'ltr',
    }}>
      <div style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: end ? 16 : 18, fontWeight: 800, lineHeight: 1,
        letterSpacing: '-0.3px',
        background: `linear-gradient(120deg, ${T.color.primaryDeep} 0%, ${T.color.heroFrom} 100%)`,
        WebkitBackgroundClip: 'text', backgroundClip: 'text',
        WebkitTextFillColor: 'transparent', color: 'transparent',
        fontVariantNumeric: 'tabular-nums',
      }}>{time}</div>
      {end && (
        <div style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 11, fontWeight: 600, color: T.color.textMuted,
          marginTop: 3, fontVariantNumeric: 'tabular-nums',
        }}>{end}</div>
      )}
    </div>
  );
}

// Vertical colored pill that marks the category
function CatPill({ color }: { color: string }) {
  return (
    <span style={{
      width: 5, height: 36, borderRadius: 99,
      background: color, flexShrink: 0,
    }} />
  );
}

function TimelineEventCard({ ev, onClick }: { ev: CalEvent; onClick: () => void }) {
  const cats = useCats();
  const c = catColor(ev.cat, cats);
  const recurring = ev.recurrence && ev.recurrence !== 'once';
  return (
    <div onClick={onClick} style={{
      ...glassCard,
      padding: '14px 16px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {/* Time — appears on the RIGHT in RTL */}
      <TimeBlock time={ev.time} end={ev.end} />
      <CatPill color={c} />
      {/* Title + place — appears on the LEFT in RTL */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.color.text, flex: 1, lineHeight: 1.25 }}>
            {ev.title}
          </div>
          {recurring && <RecurIcon />}
        </div>
        {ev.place && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, color: T.color.textMuted, fontSize: 12 }}>
            <Icon.mapPin size={12} color={T.color.textMuted} />{ev.place}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineTaskCard({ t, onToggle, onClick }: {
  t: Task; onToggle: (id: string) => void; onClick: () => void;
}) {
  const cats = useCats();
  const c = catColor(t.cat, cats);
  const recurring = t.recurrence && t.recurrence !== 'once';
  return (
    <div onClick={onClick} style={{
      ...glassCard,
      padding: '13px 16px', cursor: 'pointer', opacity: t.done ? 0.55 : 1,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {/* Time — appears on the RIGHT in RTL */}
      {t.time && <TimeBlock time={t.time} />}
      <CatPill color={c} />
      {/* Title — appears in the middle, flex grows */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 600, color: T.color.text, lineHeight: 1.3,
          textDecoration: t.done ? 'line-through' : 'none',
          textDecorationColor: T.color.textMuted,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ flex: 1 }}>{t.title}</span>
          {recurring && <RecurIcon />}
        </div>
      </div>
      {/* Check — appears on the LEFT in RTL */}
      <div onClick={e => { e.stopPropagation(); onToggle(t.id); }}>
        <Check checked={t.done} onToggle={() => onToggle(t.id)} color={c} />
      </div>
    </div>
  );
}

// Integrated timeline item — single glass card per entry, time inside on the
// left (gradient), pill in middle, content on the right. No external column.
function TimelineItem({ entry, onToggleTask, onEditEvent, onEditTask }: {
  entry: TimelineEntry;
  onToggleTask: (id: string) => void;
  onEditEvent: (ev: CalEvent, date: string) => void;
  onEditTask: (t: Task) => void;
}) {
  return (
    <div style={{ marginBottom: 9 }}>
      {entry.kind === 'event'
        ? <TimelineEventCard ev={entry.ev} onClick={() => onEditEvent(entry.ev, todayStr())} />
        : <TimelineTaskCard  t={entry.t}  onToggle={onToggleTask} onClick={() => onEditTask(entry.t)} />
      }
    </div>
  );
}

// ── General task row ──────────────────────────────────────────────

function TaskItem({ t, onToggle, onClick }: {
  t: Task; onToggle: (id: string) => void; onClick: () => void;
}) {
  const cats = useCats();
  const recurring = t.recurrence && t.recurrence !== 'once';
  return (
    <div onClick={onClick} style={{
      ...glassCard,
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      opacity: t.done ? 0.55 : 1, cursor: 'pointer',
    }}>
      <div onClick={e => { e.stopPropagation(); onToggle(t.id); }}>
        <Check checked={t.done} onToggle={() => onToggle(t.id)} color={catColor(t.cat, cats)} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 600, color: T.color.text, lineHeight: 1.35,
          textDecoration: t.done ? 'line-through' : 'none', textDecorationColor: T.color.textMuted,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ flex: 1 }}>{t.title}</span>
          {recurring && <RecurIcon />}
        </div>
        {t.time && (
          <div style={{ marginTop: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: T.color.textMuted, fontSize: 12, fontWeight: 600 }}>
              <Icon.clock size={13} color={T.color.textMuted} />{t.time}
            </span>
          </div>
        )}
      </div>
      <Chip id={t.cat} />
    </div>
  );
}

// ── Tomorrow preview cards ────────────────────────────────────────

function TomorrowEventCard({ ev, onClick }: { ev: CalEvent; onClick: () => void }) {
  const cats = useCats();
  const c = catColor(ev.cat, cats);
  const recurring = ev.recurrence && ev.recurrence !== 'once';
  return (
    <div onClick={onClick} style={{
      ...glassCard,
      padding: '12px 16px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12,
      opacity: 0.82,
    }}>
      <TimeBlock time={ev.time} end={ev.end} />
      <CatPill color={c} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: T.color.text, flex: 1, lineHeight: 1.25 }}>
            {ev.title}
          </div>
          {recurring && <RecurIcon />}
        </div>
        {ev.place && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, color: T.color.textMuted, fontSize: 12 }}>
            <Icon.mapPin size={12} color={T.color.textMuted} />{ev.place}
          </div>
        )}
      </div>
    </div>
  );
}

function TomorrowTaskCard({ t, onClick }: { t: Task; onClick: () => void }) {
  const cats = useCats();
  const c = catColor(t.cat, cats);
  const recurring = t.recurrence && t.recurrence !== 'once';
  return (
    <div onClick={onClick} style={{
      ...glassCard,
      padding: '12px 14px', cursor: 'pointer', opacity: 0.82,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {t.time && <TimeBlock time={t.time} />}
      <CatPill color={c} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: T.color.text, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ flex: 1 }}>{t.title}</span>
          {recurring && <RecurIcon />}
        </div>
      </div>
      <Chip id={t.cat} />
    </div>
  );
}

// ── Weather ───────────────────────────────────────────────────────

const WEATHER_ICONS: Record<WeatherIconKey, (p: { size: number; color: string }) => React.ReactNode> = {
  sun:            p => <Icon.sun            {...p} />,
  cloudSun:       p => <Icon.cloudSun       {...p} />,
  cloud:          p => <Icon.cloud          {...p} />,
  cloudRain:      p => <Icon.cloudRain      {...p} />,
  cloudSnow:      p => <Icon.cloudSnow      {...p} />,
  fog:            p => <Icon.fog            {...p} />,
  cloudLightning: p => <Icon.cloudLightning {...p} />,
};

function WeatherWidget({ temp, label, icon }: { temp: number; label: string; icon: WeatherIconKey }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(14px) saturate(140%)',
      WebkitBackdropFilter: 'blur(14px) saturate(140%)',
      borderRadius: 99, padding: '8px 13px',
      fontSize: 13, fontWeight: 700, color: T.color.primaryDeep,
      boxShadow: `0 4px 14px ${T.color.primary}24`,
    }}>
      {WEATHER_ICONS[icon]({ size: 15, color: T.color.primaryDeep })}
      {temp}° {label}
    </span>
  );
}

// ── Screen ────────────────────────────────────────────────────────

export function TodayScreen({ tasks, events, userName, userEmail, dateFormat, onToggleTask, onAddTask, onEditTask, onEditEvent, onOpenSettings, onOpenWeather, onSignOut }: {
  tasks: Task[];
  events: CalEvent[];
  userName: string;
  userEmail: string;
  dateFormat: DateFormat;
  onToggleTask: (id: string) => void;
  onAddTask: (title: string) => void;
  onEditTask: (t: Task) => void;
  onEditEvent: (ev: CalEvent, date: string) => void;
  onOpenSettings: () => void;
  onOpenWeather: () => void;
  onSignOut: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const weather = useWeather();
  const now = new Date();
  const dayName = `יום ${DAY_NAMES[now.getDay()]}`;
  const primaryDate = dateFormat === 'hebrew'
    ? getHebrewDayMonth(now)
    : getGregorianDayMonth(now);
  const secondaryDate = dateFormat === 'both' ? getHebrewDayMonth(now) : null;

  const scheduledToday = tasks.filter(t =>
    t.time && (t.today || (t.date && isToday(t.date, t.recurrence)))
  );
  const generalToday = tasks.filter(t =>
    !t.time && (t.today || (t.date && isToday(t.date, t.recurrence)))
  );

  const todayEvents = events.filter(ev => isToday(ev.date, ev.recurrence, ev.excludeDates));

  // Tomorrow
  const tomorrowTasks = tasks.filter(t =>
    !t.today && t.date && isTomorrow(t.date, t.recurrence)
  );
  const tomorrowEvents = events.filter(ev => isTomorrow(ev.date, ev.recurrence, ev.excludeDates));
  const tomorrowTimeline: TimelineEntry[] = [
    ...tomorrowEvents.map(ev => ({ kind: 'event' as const, ev })),
    ...tomorrowTasks.filter(t => t.time).map(t => ({ kind: 'task' as const, t })),
  ].sort((a, b) => {
    const ta = a.kind === 'event' ? a.ev.time : (a.t.time ?? '');
    const tb = b.kind === 'event' ? b.ev.time : (b.t.time ?? '');
    return ta.localeCompare(tb);
  });
  const tomorrowGeneralTasks = tomorrowTasks.filter(t => !t.time);

  const tmrw = new Date();
  tmrw.setDate(tmrw.getDate() + 1);
  const tomorrowDayName = `יום ${DAY_NAMES[tmrw.getDay()]}`;
  const hasTomorrow = tomorrowTimeline.length > 0 || tomorrowGeneralTasks.length > 0;

  const timeline: TimelineEntry[] = [
    ...todayEvents.map(ev => ({ kind: 'event' as const, ev })),
    ...scheduledToday.map(t => ({ kind: 'task' as const, t })),
  ].sort((a, b) => {
    const ta = a.kind === 'event' ? a.ev.time : (a.t.time ?? '');
    const tb = b.kind === 'event' ? b.ev.time : (b.t.time ?? '');
    return ta.localeCompare(tb);
  });

  return (
    <div>
      {/* Hero — glass card on dreamy pastel background */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div style={{
          padding: '20px 20px 22px',
          background: 'rgba(255,255,255,0.62)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          borderRadius: 28,
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.65) inset, 0 4px 14px rgba(155,125,212,0.10), 0 20px 48px rgba(155,125,212,0.12)',
          color: T.color.text,
        }}>
          {/* Top row: profile+date (right) | logo (left) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>

            {/* Profile + date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(o => !o)} style={{
                  width: 36, height: 36, borderRadius: 99,
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(14px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(14px) saturate(140%)',
                  border: 'none',
                  boxShadow: `0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 12px ${T.color.primary}24`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent', flexShrink: 0,
                }}>
                  <Icon.user size={17} color={T.color.primaryDeep} sw={1.9} />
                </button>

                {menuOpen && (
                  <>
                    <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', insetInlineStart: 0, zIndex: 11,
                      background: '#fff', borderRadius: 18, padding: '16px',
                      boxShadow: `0 8px 32px ${T.color.primary}33`,
                      minWidth: 200, direction: 'rtl', color: T.color.text,
                    }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{userName || 'משתמשת'}</div>
                      <div style={{ fontSize: 12.5, color: T.color.textMuted, marginBottom: 14, marginTop: 2 }}>{userEmail}</div>
                      <div style={{ height: 1, background: T.color.line, marginBottom: 10 }} />
                      <button onClick={() => { setMenuOpen(false); onOpenSettings(); }} style={{
                        width: '100%', border: 'none', background: 'none',
                        display: 'flex', alignItems: 'center', gap: 8,
                        cursor: 'pointer', padding: '7px 0',
                        color: T.color.text, fontSize: 14, fontWeight: 600, fontFamily: T.fonts.body,
                      }}>
                        <Icon.settings size={15} color={T.color.text} />הגדרות
                      </button>
                      <button onClick={() => { setMenuOpen(false); onSignOut(); }} style={{
                        width: '100%', border: 'none', background: 'none',
                        display: 'flex', alignItems: 'center', gap: 8,
                        cursor: 'pointer', padding: '7px 0',
                        color: '#e05c5c', fontSize: 14, fontWeight: 600, fontFamily: T.fonts.body,
                      }}>
                        <Icon.logout size={15} color="#e05c5c" />התנתקות
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: T.color.primary, letterSpacing: '0.2px' }}>
                  {dayName} · {primaryDate}
                </div>
                {secondaryDate && (
                  <div style={{ fontSize: 11, fontWeight: 500, color: T.color.textMuted, marginTop: 1 }}>
                    {secondaryDate}
                  </div>
                )}
              </div>
            </div>

            {/* Logo */}
            <img
              src="/yomi-logo-horizontal-purple.svg"
              alt="יומי"
              style={{ height: 40, opacity: 0.95, flexShrink: 0 }}
            />
          </div>

          {/* Greeting — gradient text */}
          <div style={{
            fontFamily: T.fonts.heading, fontWeight: 800,
            fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.6px',
            background: `linear-gradient(120deg, ${T.color.primaryDeep} 0%, ${T.color.heroFrom} 100%)`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent', color: 'transparent',
            marginBottom: 14, paddingInlineStart: 2,
          }}>
            {getGreeting()}{userName ? `, ${userName}!` : '!'}
          </div>

          {/* Weather — tappable to open detail screen */}
          {weather && (
            <button
              onClick={onOpenWeather}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                WebkitTapHighlightColor: 'transparent',
                display: 'inline-flex', alignItems: 'center',
              }}
            >
              <WeatherWidget temp={weather.temp} label={weather.label} icon={weather.icon} />
            </button>
          )}
        </div>
      </div>

      {/* Content — no overlap, no negative margin */}
      <div style={{ padding: '8px 18px 100px' }}>
        <div>

          <SectionHead sub={timeline.length ? `${timeline.length} פריטים` : ''}>
            היומן שלך
          </SectionHead>
          {timeline.length > 0 ? (
            <div>
              {timeline.map(entry => (
                <TimelineItem
                  key={entry.kind === 'event' ? entry.ev.id : entry.t.id}
                  entry={entry}
                  onToggleTask={onToggleTask}
                  onEditEvent={onEditEvent}
                  onEditTask={onEditTask}
                />
              ))}
            </div>
          ) : (
            <div style={{
              padding: '18px 16px', textAlign: 'center',
              background: T.color.surface, borderRadius: T.radius.tile,
              boxShadow: T.cardShadow, marginBottom: 10,
              color: T.color.textMuted, fontSize: 14,
            }}>
              אין פריטים מתוזמנים להיום
            </div>
          )}

          <div style={{ height: 10 }} />

          <SectionHead sub={`${generalToday.filter(t => t.done).length}/${generalToday.length} הושלמו`}>
            משימות היום
          </SectionHead>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {generalToday.map(t => (
              <TaskItem key={t.id} t={t} onToggle={onToggleTask} onClick={() => onEditTask(t)} />
            ))}
            <AddRow placeholder="הוסף משימה להיום…" onAdd={onAddTask} />
          </div>

          {/* Tomorrow reminder */}
          {hasTomorrow && (
            <>
              <div style={{ height: 18 }} />
              <div style={{
                borderRadius: T.radius.tile,
                background: 'rgba(255,255,255,0.50)',
                backdropFilter: 'blur(16px) saturate(130%)',
                WebkitBackdropFilter: 'blur(16px) saturate(130%)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 16px rgba(155,125,212,0.08)',
                overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '14px 16px 10px',
                  borderBottom: `1px solid ${T.color.line}`,
                }}>
                  <Icon.calendar size={16} color={T.color.primary} sw={1.8} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.color.primaryDeep }}>
                      תזכורת לאירועי מחר
                    </div>
                    <div style={{ fontSize: 11.5, color: T.color.textMuted, fontWeight: 500, marginTop: 1 }}>
                      {tomorrowDayName}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11.5, fontWeight: 700, color: T.color.primary,
                    background: `${T.color.primary}18`, borderRadius: 99, padding: '3px 9px',
                  }}>
                    {tomorrowTimeline.length + tomorrowGeneralTasks.length} פריטים
                  </span>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px 12px' }}>
                  {tomorrowTimeline.map(entry =>
                    entry.kind === 'event'
                      ? <TomorrowEventCard key={entry.ev.id} ev={entry.ev} onClick={() => onEditEvent(entry.ev, todayStr())} />
                      : <TomorrowTaskCard  key={entry.t.id}  t={entry.t}  onClick={() => onEditTask(entry.t)} />
                  )}
                  {tomorrowGeneralTasks.map(t => (
                    <TomorrowTaskCard key={t.id} t={t} onClick={() => onEditTask(t)} />
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
