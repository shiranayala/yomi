import { theme, catColor, softLine } from '../theme';
import { sampleEvents, monthNames, TODAY, weather, userName } from '../lib/data';
import type { Task } from '../lib/types';
import { Check, Chip, ProgressRing, AddRow, SectionHead } from '../components/atoms';
import { Icon } from '../icons';

const T = theme;
const TOP_INSET = 20;

function EventItem({ ev, last }: { ev: typeof sampleEvents[0]; last: boolean }) {
  const c = catColor(ev.cat);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
      <div style={{ width: 46, flexShrink: 0, textAlign: 'center', paddingTop: 2 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.color.text, fontVariantNumeric: 'tabular-nums' }}>{ev.time}</div>
        <div style={{ fontSize: 11, color: T.color.textMuted, fontVariantNumeric: 'tabular-nums' }}>{ev.end}</div>
      </div>
      <div style={{ width: 14, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ width: 11, height: 11, borderRadius: 99, background: c, marginTop: 4, boxShadow: '0 0 0 3px ' + c + '26' }} />
        {!last && <span style={{ flex: 1, width: 2, background: softLine('0.18'), marginTop: 2 }} />}
      </div>
      <div style={{
        flex: 1, marginBottom: 12, padding: '11px 14px',
        background: T.color.surface, borderRadius: T.radius.tile,
        boxShadow: T.cardShadow, borderInlineStart: '3px solid ' + c,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.color.text }}>{ev.title}</div>
        {ev.place && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: T.color.textMuted, fontSize: 12.5 }}>
            <Icon.mapPin size={13} color={T.color.textMuted} />{ev.place}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskItem({ t, onToggle }: { t: Task; onToggle: (id: string) => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      background: T.color.surface, borderRadius: T.radius.tile,
      boxShadow: T.cardShadow, transition: 'opacity .2s', opacity: t.done ? 0.55 : 1,
    }}>
      <Check checked={t.done} onToggle={() => onToggle(t.id)} color={catColor(t.cat)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15.5, fontWeight: 500, color: T.color.text, lineHeight: 1.35,
          textDecoration: t.done ? 'line-through' : 'none', textDecorationColor: T.color.textMuted,
        }}>{t.title}</div>
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

export function TodayScreen({ tasks, onToggleTask, onAddTask }: {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string) => void;
}) {
  const todayTasks = tasks.filter(t => t.today);
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
          <SectionHead sub={`${sampleEvents.length} אירועים`}>היומן שלך</SectionHead>
          <div>
            {sampleEvents.map((ev, i) => (
              <EventItem key={ev.id} ev={ev} last={i === sampleEvents.length - 1} />
            ))}
          </div>

          <div style={{ height: 10 }} />

          <SectionHead sub={`${done}/${todayTasks.length} הושלמו`}>משימות היום</SectionHead>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {todayTasks.map(t => (
              <TaskItem key={t.id} t={t} onToggle={onToggleTask} />
            ))}
            <AddRow placeholder="הוסף משימה להיום…" onAdd={onAddTask} />
          </div>
        </div>
      </div>
    </div>
  );
}
