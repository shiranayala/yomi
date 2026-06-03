import { theme, catColor, softLine } from '../theme';
import type { Task, CalEvent } from '../lib/types';
import { isToday } from '../lib/recurrence';
import { Check, Chip, AddRow, SectionHead, ProgressRing } from '../components/atoms';
import { Icon } from '../icons';
import { monthNames, weather } from '../lib/data';

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
  const c = catColor(ev.cat);
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
  const c = catColor(t.cat);
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
  const time = entry.kind === 'event' ? entry.ev.time : (entry.t.time ?? '');
  const end  = entry.kind === 'event' ? entry.ev.end  : undefined;
  const c    = catColor(entry.kind === 'event' ? entry.ev.cat : entry.t.cat);

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
  const recurring = t.recurrence && t.recurrence !== 'once';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      background: T.color.surface, borderRadius: T.radius.tile,
      boxShadow: T.cardShadow, opacity: t.done ? 0.55 : 1,
      transition: 'opacity .2s', cursor: 'pointer',
    }}>
      <div onClick={e => { e.stopPropagation(); onToggle(t.id); }}>
        <Check checked={t.done} onToggle={() => onToggle(t.id)} color={catColor(t.cat)} />
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

// ── Screen ────────────────────────────────────────────────────────

export function TodayScreen({ tasks, events, userName, onToggleTask, onAddTask, onEditTask, onEditEvent, onOpenAddTask, onOpenAddEvent, onSignOut }: {
  tasks: Task[];
  events: CalEvent[];
  userName: string;
  onToggleTask: (id: string) => void;
  onAddTask: (title: string) => void;
  onEditTask: (t: Task) => void;
  onEditEvent: (ev: CalEvent) => void;
  onOpenAddTask: () => void;
  onOpenAddEvent: () => void;
  onSignOut: () => void;
}) {
  const now = new Date();
  const dateLabel = `יום ${DAY_NAMES[now.getDay()]} · ${now.getDate()} ב${monthNames[now.getMonth()]}`;

  const scheduledToday = tasks.filter(t =>
    t.time && (t.today || (t.date && isToday(t.date, t.recurrence)))
  );
  const generalToday = tasks.filter(t =>
    !t.time && (t.today || (t.date && isToday(t.date, t.recurrence)))
  );

  const todayAllCount = scheduledToday.length + generalToday.length;
  const todayDoneCount = [...scheduledToday, ...generalToday].filter(t => t.done).length;

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
      {/* Hero gradient — exactly as original design */}
      <div style={{
        padding: '32px 18px 60px',
        background: `linear-gradient(155deg, ${T.color.heroFrom} 0%, ${T.color.primaryDeep} 90%)`,
        color: T.color.onPrimary,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>{dateLabel}</div>
            <div style={{ fontFamily: T.fonts.hand, fontSize: 40, lineHeight: 1.05, marginTop: 6 }}>
              {getGreeting()}{userName ? `, ${userName}` : ''}
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>מה על הפרק היום?</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ProgressRing done={todayDoneCount} total={todayAllCount} size={50} onDark />
            </div>
            <button onClick={onOpenAddTask} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              borderRadius: 99, padding: '6px 12px',
              color: T.color.onPrimary, fontSize: 12.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: T.fonts.body,
              WebkitTapHighlightColor: 'transparent',
            }}>
              <Icon.plus size={12} color={T.color.onPrimary} sw={2.5} />
              משימה
            </button>
            <button onClick={onOpenAddEvent} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              background: 'rgba(255,255,255,0.12)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: 99, padding: '6px 12px',
              color: T.color.onPrimary, fontSize: 12.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: T.fonts.body,
              WebkitTapHighlightColor: 'transparent',
            }}>
              <Icon.calendar size={12} color={T.color.onPrimary} sw={2} />
              אירוע
            </button>
            <button onClick={onSignOut} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 99, padding: '5px 10px',
              color: 'rgba(255,255,255,0.65)', fontSize: 11.5, fontWeight: 500,
              cursor: 'pointer', fontFamily: T.fonts.body,
              WebkitTapHighlightColor: 'transparent', gap: 4,
            }}>
              <Icon.logout size={11} color="rgba(255,255,255,0.65)" />
              יציאה
            </button>
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.16)', borderRadius: 99, padding: '7px 13px',
            fontSize: 13.5, fontWeight: 600,
          }}>
            <Icon.sun size={16} color={T.color.onPrimary} />{weather.temp}° {weather.label}
          </span>
        </div>
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

        </div>
      </div>
    </div>
  );
}
