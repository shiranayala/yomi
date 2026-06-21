import { useMemo, useState } from 'react';
import { theme, catColor } from '../theme';
import { useCats } from '../lib/CategoriesContext';
import type { Task } from '../lib/types';
import { isToday, isItemOnDate, todayStr } from '../lib/recurrence';
import { monthNames } from '../lib/data';
import { Check, Chip, AddRow, SectionHead, PageHeader, glassCard } from '../components/atoms';
import { Icon } from '../icons';

const T = theme;
const OVERDUE_COLOR = '#e05c5c';
const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

type Tab = 'today' | 'tomorrow' | 'later' | 'future';

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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

function TaskItem({ t, onToggle, onClick, onDefer, overdue }: {
  t: Task;
  onToggle: (id: string) => void;
  onClick: () => void;
  onDefer?: () => void;
  overdue?: boolean;
}) {
  const cats = useCats();
  const recurring = t.recurrence && t.recurrence !== 'once';
  return (
    <div onClick={onClick} style={{
      ...glassCard,
      ...(overdue ? {
        background: 'rgba(255, 235, 235, 0.7)',
        borderInlineStart: `3px solid ${OVERDUE_COLOR}`,
      } : null),
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      opacity: t.done ? 0.55 : 1, cursor: 'pointer',
    }}>
      <div onClick={e => { e.stopPropagation(); onToggle(t.id); }}>
        <Check checked={t.done} onToggle={() => onToggle(t.id)} color={overdue ? OVERDUE_COLOR : catColor(t.cat, cats)} />
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
        {t.time && (
          <div style={{ marginTop: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: T.color.textMuted, fontSize: 12, fontWeight: 600 }}>
              <Icon.clock size={13} color={T.color.textMuted} />{t.time}
            </span>
          </div>
        )}
      </div>
      <Chip id={t.cat} />
      {onDefer && !recurring && (
        <button
          onClick={e => { e.stopPropagation(); onDefer(); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 6px', display: 'flex', alignItems: 'center',
            opacity: 0.4, WebkitTapHighlightColor: 'transparent', flexShrink: 0,
          }}
        >
          <Icon.arrowR size={15} color={T.color.textMuted} />
        </button>
      )}
    </div>
  );
}

const TAB_LABELS: { id: Tab; label: string }[] = [
  { id: 'today',    label: 'היום'    },
  { id: 'tomorrow', label: 'מחר'     },
  { id: 'later',    label: 'להמשך'   },
  { id: 'future',   label: 'עתידי'   },
];

export function TasksScreen({ tasks, onToggleTask, onAddTask, onAddTomorrowTask, onAddLaterTask, onEditTask, onDeferTask }: {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string) => void;
  onAddTomorrowTask: (title: string) => void;
  onAddLaterTask: (title: string) => void;
  onEditTask: (t: Task) => void;
  onDeferTask: (id: string) => void;
}) {
  const [tab, setTab] = useState<Tab>('today');
  const tStr  = todayStr();
  const tmStr = tomorrowStr();

  const { todayTasks, tomorrowTasks, overdueTasks, laterTasks, dateSections } = useMemo(() => {
    const today: Task[]    = [];
    const tomorrow: Task[] = [];
    const overdue: Task[]  = [];
    const byDate: Record<string, Task[]> = {};
    const later: Task[]    = [];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    tasks.forEach(t => {
      // Non-recurring past-date → overdue
      if (t.date && t.date < tStr && (t.recurrence ?? 'once') === 'once') {
        if (!t.done) overdue.push(t);
        return;
      }
      if (t.today || (t.date && isToday(t.date, t.recurrence))) {
        today.push(t);
        return;
      }
      // Recurring tasks that also fall on tomorrow go in tomorrow bucket
      if (t.date && isItemOnDate(t.date, t.recurrence, tomorrowDate)) {
        tomorrow.push(t);
        return;
      }
      if (t.date === tmStr) {
        tomorrow.push(t);
        return;
      }
      if (t.date) {
        if (!byDate[t.date]) byDate[t.date] = [];
        byDate[t.date].push(t);
        return;
      }
      later.push(t);
    });

    today.sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));
    tomorrow.sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));
    overdue.sort((a, b) => a.date!.localeCompare(b.date!));

    const sortedDates = Object.keys(byDate).sort();
    const sections = sortedDates.map(date => ({
      date,
      label: formatDate(date),
      tasks: byDate[date].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')),
    }));

    return { todayTasks: today, tomorrowTasks: tomorrow, overdueTasks: overdue, laterTasks: later, dateSections: sections };
  }, [tasks, tStr, tmStr]);

  const doneTodayCount = todayTasks.filter(t => t.done).length;
  const doneTmrCount   = tomorrowTasks.filter(t => t.done).length;

  const tabBadge: Partial<Record<Tab, number>> = {
    today:    overdueTasks.length > 0 ? todayTasks.length + overdueTasks.length : undefined,
    tomorrow: tomorrowTasks.length || undefined,
    later:    laterTasks.length || undefined,
    future:   dateSections.reduce((s, sec) => s + sec.tasks.length, 0) || undefined,
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      <PageHeader
        icon={<Icon.checkCircle size={26} color="#fff" sw={1.8} />}
        title="משימות"
        sub={todayTasks.length > 0 ? `${doneTodayCount} מתוך ${todayTasks.length} הושלמו היום` : undefined}
      />

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 6, padding: '0 18px 14px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {TAB_LABELS.map(({ id, label }) => {
          const active = tab === id;
          const badge  = tabBadge[id];
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flexShrink: 0, border: 'none', cursor: 'pointer',
                borderRadius: 99, padding: '7px 15px',
                background: active ? T.color.primary : T.color.surface,
                color: active ? T.color.onPrimary : T.color.text,
                fontSize: 13.5, fontWeight: 600, fontFamily: T.fonts.body,
                boxShadow: active ? `0 2px 8px ${T.color.primary}44` : T.cardShadow,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all .18s', WebkitTapHighlightColor: 'transparent',
              }}
            >
              {label}
              {badge != null && (
                <span style={{
                  background: active ? 'rgba(255,255,255,0.28)' : T.color.primarySoft,
                  color: active ? '#fff' : T.color.primaryDeep,
                  borderRadius: 99, fontSize: 11, fontWeight: 700,
                  padding: '1px 6px', lineHeight: 1.6,
                }}>{badge}</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '0 18px' }}>

        {/* ── TODAY TAB ── */}
        {tab === 'today' && (
          <>
            <SectionHead sub={`${doneTodayCount}/${todayTasks.length}`}>היום</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {todayTasks.map(t => (
                <TaskItem
                  key={t.id} t={t}
                  onToggle={onToggleTask}
                  onClick={() => onEditTask(t)}
                  onDefer={() => onDeferTask(t.id)}
                />
              ))}
              {todayTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '12px 0', color: T.color.textMuted, fontSize: 14 }}>
                  אין משימות להיום 🎉
                </div>
              )}
              <AddRow placeholder="הוסף משימה להיום…" onAdd={onAddTask} />
            </div>

            {overdueTasks.length > 0 && (
              <>
                <div style={{ height: 18 }} />
                <SectionHead color={OVERDUE_COLOR} sub={`${overdueTasks.length}`}>בפיגור</SectionHead>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {overdueTasks.map(t => (
                    <TaskItem key={t.id} t={t} onToggle={onToggleTask} onClick={() => onEditTask(t)} overdue />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── TOMORROW TAB ── */}
        {tab === 'tomorrow' && (
          <>
            <SectionHead sub={`${doneTmrCount}/${tomorrowTasks.length}`}>מחר</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {tomorrowTasks.map(t => (
                <TaskItem
                  key={t.id} t={t}
                  onToggle={onToggleTask}
                  onClick={() => onEditTask(t)}
                />
              ))}
              {tomorrowTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '12px 0', color: T.color.textMuted, fontSize: 14 }}>
                  אין משימות למחר
                </div>
              )}
              <AddRow placeholder="הוסף משימה למחר…" onAdd={onAddTomorrowTask} />
            </div>
          </>
        )}

        {/* ── LATER TAB ── */}
        {tab === 'later' && (
          <>
            <SectionHead>להמשך</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {laterTasks.map(t => (
                <TaskItem key={t.id} t={t} onToggle={onToggleTask} onClick={() => onEditTask(t)} />
              ))}
              {laterTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '12px 0', color: T.color.textMuted, fontSize: 14 }}>
                  אין משימות להמשך
                </div>
              )}
              <AddRow placeholder="הוסף משימה חדשה…" onAdd={onAddLaterTask} />
            </div>
          </>
        )}

        {/* ── FUTURE TAB ── */}
        {tab === 'future' && (
          <>
            {dateSections.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: T.color.textMuted, fontSize: 14 }}>
                אין משימות מתוכננות
              </div>
            )}
            {dateSections.map(({ date, label, tasks: dTasks }) => (
              <div key={date}>
                <SectionHead>{label}</SectionHead>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {dTasks.map(t => (
                    <TaskItem key={t.id} t={t} onToggle={onToggleTask} onClick={() => onEditTask(t)} />
                  ))}
                </div>
                <div style={{ height: 18 }} />
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
}
