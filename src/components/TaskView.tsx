import { theme, catColor } from '../theme';
import { Icon } from '../icons';
import { Check, Chip } from './atoms';
import { useCats } from '../lib/CategoriesContext';
import { RECURRENCE_OPTIONS } from './FormFields';
import type { Task } from '../lib/types';
import { taskDay, longDayLabel } from '../lib/taskDays';

const T = theme;

/** Read-only look at a task: title, when, details. Edit / delete live in the sheet header. */
export function TaskView({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const cats = useCats();
  const day = taskDay(task);
  const rec = task.recurrence && task.recurrence !== 'once'
    ? RECURRENCE_OPTIONS.find(o => o.value === task.recurrence)?.label
    : null;
  const when = [day ? longDayLabel(day) : 'להמשך', task.time].filter(Boolean).join(' · ');

  return (
    <div dir="rtl" style={{ fontFamily: T.fonts.body }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ paddingTop: 3 }}>
          <Check checked={task.done} onToggle={onToggle} color={catColor(task.cat, cats)} />
        </div>
        <div style={{
          flex: 1, minWidth: 0,
          fontFamily: T.fonts.heading, fontSize: 21, fontWeight: 800, lineHeight: 1.3,
          letterSpacing: '-0.3px', color: T.color.text,
          textDecoration: task.done ? 'line-through' : 'none',
          opacity: task.done ? 0.55 : 1, wordBreak: 'break-word',
        }}>{task.title}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', margin: '14px 0 0' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 11px', borderRadius: 99, background: T.color.surfaceAlt,
          color: T.color.text, fontSize: 13.5, fontWeight: 600,
        }}>
          {task.time ? <Icon.clock size={14} color={T.color.textMuted} /> : <Icon.calendar size={14} color={T.color.textMuted} sw={1.8} />}
          {when}
        </span>
        {rec && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 11px', borderRadius: 99, background: T.color.surfaceAlt,
            color: T.color.text, fontSize: 13.5, fontWeight: 600,
          }}>
            <Icon.repeat size={14} color={T.color.textMuted} />{rec}
          </span>
        )}
        <Chip id={task.cat} />
      </div>

      {task.notes && (
        <div style={{
          marginTop: 18, padding: '12px 14px', borderRadius: T.radius.tile,
          background: T.color.bg, color: T.color.text,
          fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>{task.notes}</div>
      )}
    </div>
  );
}
