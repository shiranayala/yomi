import { useState } from 'react';
import { theme, catColor, softLine } from '../theme';
import { useCats } from '../lib/CategoriesContext';
import type { Task, CalEvent, Habit, HabitLog } from '../lib/types';
import { isToday } from '../lib/recurrence';
import { Check, Chip, AddRow, SectionHead } from '../components/atoms';
import { HabitsSection } from '../components/HabitsSection';
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

function TimelineEventCard({ ev, onClick }: { ev: CalEvent; onClick: () => void }) {
  const cats = useCats();
  const c = catColor(ev.cat, cats);
  const recurring = ev.recurrence && ev.recurrence !== 'once';
  return (
    <div onClick={onClick} style={{
      flex: 1, marginBottom: 12, padding: '11px 14px',
      background: T.color.surface, borderRadius: T.radius.tile,
      boxShadow: T.cardShadow, borderInlineStart: '3px solid ' + c,
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.color.text, flex: 1 }}>{ev.title}</div>
        {recurring && <RecurIcon />}
      </div>
      {ev.place && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: T.color.textMuted, fontSize: 12.5 }}>
          <Icon.mapPin size={13} color={T.color.textMuted} />{ev.place}
        </div>
      )}
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
      flex: 1, marginBottom: 12, padding: '10px 14px',
      background: T.color.surface, borderRadius: T.radius.tile,
      boxShadow: T.cardShadow, borderInlineStart: '3px solid ' + c,
      cursor: 'pointer', opacity: t.done ? 0.55 : 1, transition: 'opacity .2s',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div onClick={e => { e.stopPropagation(); onToggle(t.id); }}>
        <Check checked={t.done} onToggle={() => onToggle(t.id)} color={c} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 15, fontWeight: 500, color: T.color.text,
          textDecoration: t.done ? 'line-through' : 'none',
          textDecorationColor: T.color.textMuted,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ flex: 1 }}>{t.title}</span>
          {recurring && <RecurIcon />}
        </div>
        <div style={{ marginTop: 4 }}><Chip id={t.cat} /></div>
      </div>
    </div>
  );
}

function TimelineItem({ entry, last, onToggleTask, onEditEvent, onEditTask }: {
  entry: TimelineEntry; last: boolean;
  onToggleTask: (id: string) => void;
  onEditEvent: (ev: CalEvent) => void;
  onEditTask: (t: Task) => void;
}) {
  const cats = useCats();
  const time = entry.kind === 'event' ? entry.ev.time : (entry.t.time ?? '');
  const end  = entry.kind === 'event' ? entry.ev.end  : undefined;
  const c    = catColor(entry.kind === 'event' ? entry.ev.cat : entry.t.cat, cats);

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
      <div style={{ width: 46, flexShrink: 0, textAlign: 'center', paddingTop: 2 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.color.text, fontVariantNumeric: 'tabular-nums' }}>{time}</div>
        {end && <div style={{ fontSize: 11, color: T.color.textMuted, fontVariantNumeric: 'tabular-nums' }}>{end}</div>}
      </div>
      <div style={{ width: 14, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ width: 11, height: 11, borderRadius: 99, background: c, marginTop: 4, boxShadow: '0 0 0 3px ' + c + '26' }} />
        {!last && <span style={{ flex: 1, width: 2, background: softLine('0.18'), marginTop: 2 }} />}
      </div>
      {entry.kind === 'event'
        ? <TimelineEventCard ev={entry.ev} onClick={() => onEditEvent(entry.ev)} />
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
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      background: T.color.surface, borderRadius: T.radius.tile,
      boxShadow: T.cardShadow, opacity: t.done ? 0.55 : 1,
      transition: 'opacity .2s', cursor: 'pointer',
    }}>
      <div onClick={e => { e.stopPropagation(); onToggle(t.id); }}>
        <Check checked={t.done} onToggle={() => onToggle(t.id)} color={catColor(t.cat, cats)} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15.5, fontWeight: 500, color: T.color.text, lineHeight: 1.35,
          textDecoration: t.done ? 'line-through' : 'none', textDecorationColor: T.color.textMuted,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ flex: 1 }}>{t.title}</span>
          {recurring && <RecurIcon />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
          {t.time && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: T.color.textMuted, fontSize: 12, fontWeight: 600 }}>
              <Icon.clock size={13} color={T.color.textMuted} />{t.time}
            </span>
          )}
          <Chip id={t.cat} />
        </div>
      </div>
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
      background: 'rgba(255,255,255,0.16)', borderRadius: 99, padding: '7px 13px',
      fontSize: 13.5, fontWeight: 600,
    }}>
      {WEATHER_ICONS[icon]({ size: 16, color: T.color.onPrimary })}
      {temp}° {label}
    </span>
  );
}

// ── Screen ────────────────────────────────────────────────────────

export function TodayScreen({ tasks, events, habits, habitLogs, userName, userEmail, dateFormat, onToggleTask, onAddTask, onEditTask, onEditEvent, onToggleHabit, onAddHabit, onEditHabit, onDeleteHabit, onOpenSettings, onSignOut }: {
  tasks: Task[];
  events: CalEvent[];
  habits: Habit[];
  habitLogs: HabitLog[];
  userName: string;
  userEmail: string;
  dateFormat: DateFormat;
  onToggleTask: (id: string) => void;
  onAddTask: (title: string) => void;
  onEditTask: (t: Task) => void;
  onEditEvent: (ev: CalEvent) => void;
  onToggleHabit: (habitId: string) => void;
  onAddHabit: (title: string) => void;
  onEditHabit: (id: string, title: string) => void;
  onDeleteHabit: (id: string) => void;
  onOpenSettings: () => void;
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

  const todayEvents = events.filter(ev => isToday(ev.date, ev.recurrence));
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
      {/* Hero */}
      <div style={{
        padding: '26px 18px 52px',
        background: `linear-gradient(155deg, ${T.color.heroFrom} 0%, ${T.color.primaryDeep} 90%)`,
        color: T.color.onPrimary,
      }}>
        {/* Top row: profile+date (right) | logo (left) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>

          {/* Profile + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(o => !o)} style={{
                width: 34, height: 34, borderRadius: 99,
                background: 'rgba(255,255,255,0.18)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent', flexShrink: 0,
              }}>
                <Icon.user size={17} color="#fff" sw={1.8} />
              </button>

              {menuOpen && (
                <>
                  <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', insetInlineStart: 0, zIndex: 11,
                    background: '#fff', borderRadius: 16, padding: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    minWidth: 200, direction: 'rtl', color: T.color.text,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{userName || 'משתמשת'}</div>
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
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>
                {dayName} · {primaryDate}
              </div>
              {secondaryDate && (
                <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.65, marginTop: 1 }}>
                  {secondaryDate}
                </div>
              )}
            </div>
          </div>

          {/* Logo */}
          <img
            src="/yomi-logo-horizontal-white.svg"
            alt="יומי"
            style={{ height: 44, opacity: 0.92, flexShrink: 0 }}
          />
        </div>

        {/* Greeting */}
        <div style={{ fontFamily: T.fonts.hand, fontSize: 28, lineHeight: 1.1, marginBottom: 16 }}>
          {getGreeting()}{userName ? `, ${userName}!` : '!'}
        </div>

        {/* Weather */}
        {weather && (
          <WeatherWidget temp={weather.temp} label={weather.label} icon={weather.icon} />
        )}
      </div>

      {/* Floating content card */}
      <div style={{ padding: '0 18px 100px', marginTop: -42 }}>
        <div style={{ background: T.color.bg, borderRadius: '26px 26px 0 0', paddingTop: 20 }}>

          <SectionHead sub={timeline.length ? `${timeline.length} פריטים` : ''}>
            היומן שלך
          </SectionHead>
          {timeline.length > 0 ? (
            <div>
              {timeline.map((entry, i) => (
                <TimelineItem
                  key={entry.kind === 'event' ? entry.ev.id : entry.t.id}
                  entry={entry} last={i === timeline.length - 1}
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

          <div style={{ height: 10 }} />

          <HabitsSection
            habits={habits}
            logs={habitLogs}
            onToggle={onToggleHabit}
            onAdd={onAddHabit}
            onEdit={onEditHabit}
            onDelete={onDeleteHabit}
          />

        </div>
      </div>
    </div>
  );
}
