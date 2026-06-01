import { theme, catColor, softLine } from '../theme';
import type { Task } from '../lib/types';
import { Check, Chip, AddRow, SectionHead } from '../components/atoms';
import { Icon } from '../icons';

const T = theme;
const TOP_INSET = 20;

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

export function TasksScreen({ tasks, onToggleTask, onAddTask }: {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string) => void;
}) {
  const todayTasks = tasks.filter(t => t.today);
  const laterTasks = tasks.filter(t => !t.today);
  const doneTodayCount = todayTasks.filter(t => t.done).length;

  return (
    <div style={{ padding: `${TOP_INSET + 8}px 18px 100px` }}>
      <h1 style={{
        margin: '0 2px 6px', fontFamily: T.fonts.hand, fontWeight: 400,
        fontSize: Math.round(34 * T.headingScale), color: T.color.text,
      }}>משימות</h1>

      {/* Today progress bar */}
      <div style={{
        background: T.color.surface, borderRadius: T.radius.tile,
        boxShadow: T.cardShadow, padding: '12px 16px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: T.color.textMuted, marginBottom: 6 }}>
            הושלמו היום: <b style={{ color: T.color.text }}>{doneTodayCount}</b> מתוך <b style={{ color: T.color.text }}>{todayTasks.length}</b>
          </div>
          <div style={{ height: 7, borderRadius: 99, background: T.color.surfaceAlt, overflow: 'hidden' }}>
            <div style={{
              width: `${todayTasks.length ? doneTodayCount / todayTasks.length * 100 : 0}%`,
              height: '100%', background: T.color.primary, borderRadius: 99,
              transition: 'width .5s',
            }} />
          </div>
        </div>
        <span style={{
          fontSize: 12.5, fontWeight: 700, color: T.color.primaryDeep, direction: 'ltr',
          background: T.color.primarySoft, borderRadius: 99, padding: '4px 10px',
        }}>{doneTodayCount}/{todayTasks.length}</span>
      </div>

      <SectionHead sub={`${doneTodayCount}/${todayTasks.length}`}>היום</SectionHead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {todayTasks.map(t => <TaskItem key={t.id} t={t} onToggle={onToggleTask} />)}
      </div>

      <div style={{ height: 18 }} />

      <SectionHead>בהמשך</SectionHead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {laterTasks.map(t => <TaskItem key={t.id} t={t} onToggle={onToggleTask} />)}
        <AddRow placeholder="הוסף משימה חדשה…" onAdd={onAddTask} />
      </div>
    </div>
  );
}
