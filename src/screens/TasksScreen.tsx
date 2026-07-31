import { useMemo, useState } from 'react';
import { theme, catColor } from '../theme';
import { useCats } from '../lib/CategoriesContext';
import type { Task, Routine, RoutineLog } from '../lib/types';
import { isToday, isItemOnDate, todayStr } from '../lib/recurrence';
import { monthNames } from '../lib/data';
import { getRoutineIcon } from '../lib/routineIcons';
import { weekDates, countOn } from '../lib/points';
import { Check, Chip, AddRow, SectionHead, PageHeader, glassCard, glassCardLarge } from '../components/atoms';
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

// ── Points ───────────────────────────────────────────────────────────

const POINTS_DONE_GRADIENT = 'linear-gradient(135deg, #9e9ea8 0%, #bdbdc7 100%)';

function PointsSection({ routines, routineLogs }: {
  routines: Routine[];
  routineLogs: RoutineLog[];
}) {
  const daily = routines.filter(r => r.kind === 'daily');
  const wDates = weekDates();

  // Per-routine: days completed this week (= points)
  const weekly = daily.map(r => ({
    r,
    days: wDates.filter(ds => countOn(r.id, routineLogs, ds) >= r.target).length,
  }));
  const weekTotal = weekly.reduce((s, w) => s + w.days, 0);

  // All-time points: every log row (one per routine+day) that reached its target
  const allTime = daily.reduce((sum, r) =>
    sum + routineLogs.filter(l => l.routineId === r.id && l.count >= r.target).length, 0);

  return (
    <>
      <div style={{ height: 26 }} />
      <SectionHead>⭐ הנקודות שלי</SectionHead>

      {/* Weekly summary — resets every Sunday */}
      <div style={{ ...glassCardLarge, padding: '16px 16px 14px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.color.text }}>השבוע</div>
            <div style={{ fontSize: 11.5, color: T.color.textMuted, fontWeight: 500, marginTop: 1 }}>
              מתאפס כל יום ראשון
            </div>
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 800,
            background: `linear-gradient(120deg, ${T.color.primaryDeep} 0%, ${T.color.heroFrom} 100%)`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent', color: 'transparent',
            direction: 'ltr',
          }}>{weekTotal}</div>
        </div>

        {/* Per-routine: name + times completed. Simple and clear. */}
        {weekly.length > 0 && (
          <>
            <div style={{ height: 1, background: T.color.line, margin: '14px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {weekly.map(({ r, days }) => {
                const ic = getRoutineIcon(r.iconKey);
                const Icon_ = ic.icon;
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      width: 34, height: 34, borderRadius: 12, flexShrink: 0,
                      background: days > 0 ? ic.gradient : POINTS_DONE_GRADIENT,
                      color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(155,125,212,0.18)',
                    }}>
                      <Icon_ size={18} sw={2.2} />
                    </span>
                    <span style={{
                      flex: 1, fontSize: 15.5, fontWeight: 700, color: T.color.text, minWidth: 0,
                    }}>
                      {r.title}
                    </span>
                    <span style={{
                      fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 800,
                      color: days > 0 ? T.color.primaryDeep : T.color.textMuted,
                      direction: 'ltr', flexShrink: 0,
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}>
                      {days} <span style={{ fontSize: 14 }}>⭐</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* All-time total */}
      <div style={{
        borderRadius: T.radius.tile,
        background: `linear-gradient(135deg, ${T.color.primaryDeep} 0%, ${T.color.heroFrom} 100%)`,
        padding: '18px 20px',
        color: '#fff', position: 'relative', overflow: 'hidden',
        boxShadow: `0 8px 24px ${T.color.primary}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          position: 'absolute', top: -24, left: -24, width: 96, height: 96,
          background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 800 }}>סה״כ נקודות שצברת</div>
          <div style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.85, marginTop: 2 }}>
            מכל הזמנים · ממשיך להצטבר
          </div>
        </div>
        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: 34, fontWeight: 800,
          direction: 'ltr', display: 'flex', alignItems: 'center', gap: 8,
          textShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          {allTime}<span style={{ fontSize: 22 }}>⭐</span>
        </div>
      </div>
    </>
  );
}

const TAB_LABELS: { id: Tab; label: string }[] = [
  { id: 'today',    label: 'היום'    },
  { id: 'tomorrow', label: 'מחר'     },
  { id: 'later',    label: 'להמשך'   },
  { id: 'future',   label: 'עתידי'   },
];

export function TasksScreen({ tasks, routines, routineLogs, onToggleTask, onAddTask, onAddTomorrowTask, onAddLaterTask, onEditTask, onDeferTask }: {
  tasks: Task[];
  routines: Routine[];
  routineLogs: RoutineLog[];
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

        {/* ── Points ── */}
        <PointsSection routines={routines} routineLogs={routineLogs} />

      </div>
    </div>
  );
}
