import { useMemo } from 'react';
import { theme, catColor } from '../theme';
import { useCats } from '../lib/CategoriesContext';
import type { Task } from '../lib/types';
import { isToday, todayStr } from '../lib/recurrence';
import { monthNames } from '../lib/data';
import { Check, Chip, AddRow, SectionHead, PageHeader } from '../components/atoms';
import { Icon } from '../icons';

const T = theme;
const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `יום ${DAY_NAMES[date.getDay()]} · ${d} ב${monthNames[m - 1]}`;
}

function RecurIcon() {
  return (
    <span style={{ opacity: 0.55, display: 'inline-flex', alignItems: 'center' }}>
      <Icon.repeat size={12} color={T.color.textMuted} sw={1.8} />
    </span>
  );
}

function TaskItem({ t, onToggle, onClick }: {
  t: Task; onToggle: (id: string) => void; onClick: () => void;
}) {
  const cats = useCats();
  const recurring = t.recurrence && t.recurrence !== 'once';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      background: T.color.surface, borderRadius: T.radius.tile,
      boxShadow: T.cardShadow, transition: 'opacity .2s', opacity: t.done ? 0.55 : 1,
      cursor: 'pointer',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
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

export function TasksScreen({ tasks, onToggleTask, onAddTask, onAddLaterTask, onEditTask }: {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string) => void;
  onAddLaterTask: (title: string) => void;
  onEditTask: (t: Task) => void;
}) {
  const tStr = todayStr();

  const { todayTasks, overdueTasks, laterTasks, dateSections } = useMemo(() => {
    const today: Task[] = [];
    const overdue: Task[] = [];
    const byDate: Record<string, Task[]> = {};
    const later: Task[] = [];

    tasks.forEach(t => {
      if (t.today || (t.date && isToday(t.date, t.recurrence))) {
        today.push(t);
        return;
      }
      if (t.date) {
        if (t.date < tStr) {
          if (!t.done) overdue.push(t);
          return;
        }
        if (!byDate[t.date]) byDate[t.date] = [];
        byDate[t.date].push(t);
        return;
      }
      later.push(t);
    });

    today.sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));
    overdue.sort((a, b) => a.date!.localeCompare(b.date!));

    const sortedDates = Object.keys(byDate).sort();
    const sections = sortedDates.map(date => ({
      date,
      label: formatDate(date),
      tasks: byDate[date].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')),
    }));

    return { todayTasks: today, overdueTasks: overdue, laterTasks: later, dateSections: sections };
  }, [tasks, tStr]);

  const doneTodayCount = todayTasks.filter(t => t.done).length;

  return (
    <div style={{ paddingBottom: 100 }}>
      <PageHeader
        icon={<Icon.checkCircle size={26} color="#fff" sw={1.8} />}
        title="משימות"
        sub={todayTasks.length > 0 ? `${doneTodayCount} מתוך ${todayTasks.length} הושלמו היום` : undefined}
      />

      <div style={{ padding: '0 18px' }}>

        {/* Today */}
        <SectionHead sub={`${doneTodayCount}/${todayTasks.length}`}>היום</SectionHead>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {todayTasks.map(t => (
            <TaskItem key={t.id} t={t} onToggle={onToggleTask} onClick={() => onEditTask(t)} />
          ))}
          {todayTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '12px 0', color: T.color.textMuted, fontSize: 14 }}>
              אין משימות להיום 🎉
            </div>
          )}
        </div>

        {/* Overdue */}
        {overdueTasks.length > 0 && (
          <>
            <div style={{ height: 18 }} />
            <SectionHead sub={`${overdueTasks.length}`}>בפיגור</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {overdueTasks.map(t => (
                <TaskItem key={t.id} t={t} onToggle={onToggleTask} onClick={() => onEditTask(t)} />
              ))}
            </div>
          </>
        )}

        {/* Later — no date */}
        <div style={{ height: 18 }} />
        <SectionHead>להמשך</SectionHead>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {laterTasks.map(t => (
            <TaskItem key={t.id} t={t} onToggle={onToggleTask} onClick={() => onEditTask(t)} />
          ))}
          <AddRow placeholder="הוסף משימה חדשה…" onAdd={onAddLaterTask} />
        </div>

        {/* Future date sections */}
        {dateSections.map(({ date, label, tasks: dTasks }) => (
          <div key={date}>
            <div style={{ height: 18 }} />
            <SectionHead>{label}</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {dTasks.map(t => (
                <TaskItem key={t.id} t={t} onToggle={onToggleTask} onClick={() => onEditTask(t)} />
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
