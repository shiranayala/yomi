import { theme, catColor } from '../theme';
import type { Task } from '../lib/types';
import { isToday } from '../lib/recurrence';
import { Check, Chip, AddRow, SectionHead, PageHeader } from '../components/atoms';
import { Icon } from '../icons';

const T = theme;


function RecurIcon() {
  return (
    <span title="משימה חוזרת" style={{ opacity: 0.55, display: 'inline-flex', alignItems: 'center' }}>
      <Icon.repeat size={12} color={T.color.textMuted} sw={1.8} />
    </span>
  );
}

function TaskItem({ t, onToggle, onClick }: {
  t: Task;
  onToggle: (id: string) => void;
  onClick: () => void;
}) {
  const recurring = t.recurrence && t.recurrence !== 'once';
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
        background: T.color.surface, borderRadius: T.radius.tile,
        boxShadow: T.cardShadow, transition: 'opacity .2s', opacity: t.done ? 0.55 : 1,
        cursor: 'pointer',
      }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
          {t.time && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: T.color.textMuted, fontSize: 12, fontWeight: 600 }}>
              <Icon.clock size={13} color={T.color.textMuted} />{t.time}
            </span>
          )}
          {t.date && !t.time && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: T.color.textMuted, fontSize: 12, fontWeight: 600 }}>
              <Icon.calendar size={12} color={T.color.textMuted} />{t.date}
            </span>
          )}
          <Chip id={t.cat} />
        </div>
      </div>
    </div>
  );
}

export function TasksScreen({ tasks, onToggleTask, onAddTask, onEditTask }: {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string) => void;
  onEditTask: (t: Task) => void;
}) {
  const generalTodayTasks = tasks.filter(t =>
    t.type !== 'scheduled' && (t.today || (t.date && isToday(t.date, t.recurrence)))
  );
  const scheduledTodayTasks = tasks.filter(t =>
    t.type === 'scheduled' && t.date && isToday(t.date, t.recurrence)
  );
  const todayTasks = [...generalTodayTasks, ...scheduledTodayTasks]
    .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));
  const laterTasks = tasks.filter(t => !todayTasks.find(x => x.id === t.id));
  const doneTodayCount = todayTasks.filter(t => t.done).length;

  return (
    <div style={{ paddingBottom: 100 }}>
      <PageHeader
        icon={<Icon.checkCircle size={26} color="#fff" sw={1.8} />}
        title="משימות"
        sub={`${doneTodayCount} מתוך ${todayTasks.length} הושלמו היום`}
      />

      <div style={{ padding: '0 18px' }}>
      {/* Progress summary */}
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
              height: '100%', background: T.color.primary, borderRadius: 99, transition: 'width .5s',
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
        {todayTasks.map(t => (
          <TaskItem key={t.id} t={t} onToggle={onToggleTask} onClick={() => onEditTask(t)} />
        ))}
        {todayTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: T.color.textMuted, fontSize: 14 }}>
            אין משימות להיום 🎉
          </div>
        )}
      </div>

      <div style={{ height: 18 }} />

      <SectionHead>בהמשך</SectionHead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {laterTasks.map(t => (
          <TaskItem key={t.id} t={t} onToggle={onToggleTask} onClick={() => onEditTask(t)} />
        ))}
        <AddRow placeholder="הוסף משימה חדשה…" onAdd={onAddTask} />
      </div>
      </div>
    </div>
  );
}
