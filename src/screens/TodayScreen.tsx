import { theme, catColor, softLine } from '../theme';
import { monthNames, TODAY, weather, userName } from '../lib/data';
import type { Task, CalEvent } from '../lib/types';
import { isToday } from '../lib/recurrence';
import { Check, Chip, ProgressRing, AddRow, SectionHead } from '../components/atoms';
import { Icon } from '../icons';

const T = theme;
const TOP_INSET = 20;

function RecurIcon() {
  return (
    <span title="אירוע חוזר" style={{ opacity: 0.6, display: 'inline-flex', alignItems: 'center' }}>
      <Icon.repeat size={11} color={T.color.textMuted} sw={1.8} />
    </span>
  );
}

function EventItem({
  ev, last, onClick,
}: { ev: CalEvent; last: boolean; onClick: () => void }) {
  const c = catColor(ev.cat);
  const recurring = ev.recurrence && ev.recurrence !== 'once';
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
      <div style={{ width: 46, flexShrink: 0, textAlign: 'center', paddingTop: 2 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.color.text, fontVariantNumeric: 'tabular-nums' }}>{ev.time}</div>
        {ev.end && <div style={{ fontSize: 11, color: T.color.textMuted, fontVariantNumeric: 'tabular-nums' }}>{ev.end}</div>}
      </div>
      <div style={{ width: 14, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ width: 11, height: 11, borderRadius: 99, background: c, marginTop: 4, boxShadow: '0 0 0 3px ' + c + '26' }} />
        {!last && <span style={{ flex: 1, width: 2, background: softLine('0.18'), marginTop: 2 }} />}
      </div>
      <div
        onClick={onClick}
        style={{
          flex: 1, marginBottom: 12, padding: '11px 14px',
          background: T.color.surface, borderRadius: T.radius.tile,
          boxShadow: T.cardShadow, borderInlineStart: '3px solid ' + c,
          cursor: 'pointer',
        }}
      >
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
    </div>
  );
}

function TaskItem({
  t, onToggle, onClick,
}: { t: Task; onToggle: (id: string) => void; onClick: () => void }) {
  const recurring = t.recurrence && t.recurrence !== 'once';
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
        background: T.color.surface, borderRadius: T.radius.tile,
        boxShadow: T.cardShadow, transition: 'opacity .2s', opacity: t.done ? 0.55 : 1,
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
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

export function TodayScreen({ tasks, events, onToggleTask, onAddTask, onEditTask, onEditEvent }: {
  tasks: Task[];
  events: CalEvent[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string) => void;
  onEditTask: (t: Task) => void;
  onEditEvent: (ev: CalEvent) => void;
}) {
  const todayEvents = events
    .filter(ev => isToday(ev.date, ev.recurrence))
    .sort((a, b) => a.time.localeCompare(b.time));

  const todayTasks = tasks.filter(t =>
    t.type !== 'scheduled'
      ? t.today
      : !!(t.date && isToday(t.date, t.recurrence))
  );
  const done = todayTasks.filter(t => t.done).length;

  const now = TODAY;
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const dateLabel = `יום ${dayNames[now.getDay()]} · ${now.getDate()} ב${monthNames[now.getMonth()]}`;

  return (
    <div>
      {/* Hero block */}
      <div style={{
        padding: `${TOP_INSET + 12}px 18px 60px`,
        background: `linear-gradient(155deg, ${T.color.heroFrom} 0%, ${T.color.primaryDeep} 90%)`,
        color: T.color.onPrimary,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>{dateLabel}</div>
            <div style={{ fontFamily: T.fonts.hand, fontSize: 38, lineHeight: 1.05, marginTop: 6 }}>
              {T.greeting}, {userName}
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>מה על הפרק היום?</div>
          </div>
          <ProgressRing done={done} total={todayTasks.length} size={50} onDark />
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

      {/* Content floating over hero */}
      <div style={{ padding: '0 18px 100px', marginTop: -42 }}>
        <div style={{ background: T.color.bg, borderRadius: '26px 26px 0 0', paddingTop: 20 }}>
          <SectionHead sub={todayEvents.length ? `${todayEvents.length} אירועים` : ''}>היומן שלך</SectionHead>
          {todayEvents.length > 0 ? (
            <div>
              {todayEvents.map((ev, i) => (
                <EventItem
                  key={ev.id} ev={ev}
                  last={i === todayEvents.length - 1}
                  onClick={() => onEditEvent(ev)}
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
              אין אירועים מתוכננים להיום
            </div>
          )}

          <div style={{ height: 10 }} />

          <SectionHead sub={`${done}/${todayTasks.length} הושלמו`}>משימות היום</SectionHead>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {todayTasks.map(t => (
              <TaskItem
                key={t.id} t={t}
                onToggle={onToggleTask}
                onClick={() => onEditTask(t)}
              />
            ))}
            <AddRow placeholder="הוסף משימה להיום…" onAdd={onAddTask} />
          </div>
        </div>
      </div>
    </div>
  );
}
