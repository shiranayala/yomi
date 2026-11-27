import { useState } from 'react';
import { theme } from '../theme';
import type { Task, CatId, Recurrence } from '../lib/types';
import { todayStr, tomorrowStr } from '../lib/recurrence';
import {
  Field, TextInput, DateInput, TimeInput, Pills, RecurrencePicker,
  CategorySelect, SaveBar, Chevron, rowButton,
} from './FormFields';
import { Icon } from '../icons';
import { nextDays, shortDayLabel, longDayLabel, taskDay } from '../lib/taskDays';

const T = theme;

type When = 'later' | 'today' | 'tomorrow' | 'date';

const WHEN_OPTIONS: { value: When; label: string }[] = [
  { value: 'later',    label: 'להמשך' },
  { value: 'today',    label: 'היום'  },
  { value: 'tomorrow', label: 'מחר'   },
  { value: 'date',     label: 'תאריך' },
];

function getInitialWhen(task?: Task): When {
  if (!task) return 'today';
  if (task.today) return 'today';
  if (task.date === tomorrowStr()) return 'tomorrow';
  if (task.date) return 'date';
  return 'later';
}

function newId() { return 'tsk' + Date.now(); }

interface Props {
  initial?: Task;
  defaultDate?: string;
  onSave: (t: Task) => void;
  /** Add copies of the task (with the form's current values) on these days */
  onCopy?: (t: Task, days: string[]) => void;
  /** Save the task (with the form's current values) on another day */
  onMove?: (t: Task, day: string) => void;
}

export function TaskForm({ initial, defaultDate, onSave, onCopy, onMove }: Props) {
  const isEdit = !!initial;
  const [title, setTitle]     = useState(initial?.title ?? '');
  const [when, setWhen]       = useState<When>(defaultDate && !initial ? 'date' : getInitialWhen(initial));
  const [date, setDate]       = useState(initial?.date ?? defaultDate ?? todayStr());
  const [time, setTime]       = useState(initial?.time ?? '');
  const [cat, setCat]         = useState<CatId>(initial?.cat ?? '');
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? 'once');
  const [notes, setNotes]     = useState(initial?.notes ?? '');

  const valid = !!title.trim() && (when !== 'date' || !!date);

  function current(): Task {
    const hasTime = !!time;
    return {
      id: initial?.id ?? newId(),
      title: title.trim(),
      cat,
      done: initial?.done ?? false,
      time: hasTime ? time : null,
      today: when === 'today',
      type: hasTime ? 'scheduled' : 'general',
      date: when === 'date' ? date : when === 'tomorrow' ? tomorrowStr() : undefined,
      recurrence: when === 'date' ? recurrence : 'once',
      notes: notes.trim() || undefined,
      reminder: initial?.reminder,
    };
  }

  function handleSave() {
    if (valid) onSave(current());
  }

  return (
    <div dir="rtl" style={{ fontFamily: T.fonts.body }}>
      <Field label="שם המשימה" required>
        <TextInput value={title} onChange={setTitle} placeholder="מה צריך לעשות?" />
      </Field>

      <Field label="מתי" required>
        <Pills<When> options={WHEN_OPTIONS} value={when} onChange={setWhen} />
      </Field>

      {when === 'date' && (
        <Field label="תאריך" required>
          <DateInput value={date} onChange={setDate} />
        </Field>
      )}

      {when !== 'later' && (
        <Field label="שעה (אופציונלי)">
          <TimeInput value={time} onChange={setTime} />
        </Field>
      )}

      <Field label="פרטים נוספים">
        <TextInput value={notes} onChange={setNotes} multiline placeholder="כתבי כאן פרטים על המשימה…" />
      </Field>

      <Field label="קטגוריה">
        <CategorySelect value={cat} onChange={setCat} />
      </Field>

      {when === 'date' && (
        <Field label="חזרה">
          <RecurrencePicker value={recurrence} onChange={setRecurrence} />
        </Field>
      )}

      {isEdit && onCopy && onMove && (
        <CopyMoveSection
          currentDay={valid ? taskDay(current()) : null}
          disabled={!valid}
          onCopy={days => onCopy(current(), days)}
          onMove={day => onMove(current(), day)}
        />
      )}

      <SaveBar valid={valid} onSave={handleSave} label={isEdit ? 'שמירה' : 'הוספה'} />
    </div>
  );
}

// ── Copy to more days / move to another day ──────────────────────────

function CopyMoveSection({ currentDay, disabled, onCopy, onMove }: {
  currentDay: string | null;
  disabled: boolean;
  onCopy: (days: string[]) => void;
  onMove: (day: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'copy' | 'move'>('copy');
  const [picked, setPicked] = useState<string[]>([]);
  const [otherDate, setOtherDate] = useState('');
  const days = nextDays(14);
  const extra = picked.filter(d => !days.includes(d)); // picked via "another date"

  const toggle = (d: string) => {
    if (d === currentDay) return;
    if (mode === 'move') { setPicked(p => (p[0] === d ? [] : [d])); return; }
    setPicked(p => (p.includes(d) ? p.filter(x => x !== d) : [...p, d].sort()));
  };
  const switchMode = (m: 'copy' | 'move') => {
    setMode(m);
    if (m === 'move') setPicked(p => p.slice(0, 1));
  };
  const addOther = (d: string) => {
    setOtherDate(d);
    if (d && d !== currentDay) {
      if (mode === 'move') setPicked([d]);
      else setPicked(p => (p.includes(d) ? p : [...p, d].sort()));
    }
  };

  const can = !disabled && picked.length > 0;
  const actionLabel = mode === 'copy'
    ? (picked.length > 1 ? `העתקה ל־${picked.length} ימים` : picked.length === 1 ? `העתקה ל${longDayLabel(picked[0])}` : 'בחרי ימים')
    : (picked.length ? `העברה ל${longDayLabel(picked[0])}` : 'בחרי יום');

  return (
    <div style={{ marginBottom: 18 }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={rowButton}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.color.text }}>
          <Icon.calendar size={16} color={T.color.primaryDeep} sw={1.9} />
          העתקה או העברה לימים אחרים
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <Pills<'copy' | 'move'>
            options={[{ value: 'copy', label: 'העתקה לימים נוספים' }, { value: 'move', label: 'העברה ליום אחר' }]}
            value={mode}
            onChange={switchMode}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 12 }}>
            {days.map(d => {
              const { top, bottom } = shortDayLabel(d);
              const here = d === currentDay;
              const on = picked.includes(d);
              return (
                <button key={d} type="button" onClick={() => toggle(d)} disabled={here} style={{
                  border: on ? `2px solid ${T.color.primary}` : '1.5px solid ' + T.color.line,
                  background: on ? T.color.primary : here ? T.color.surfaceAlt : T.color.surface,
                  color: on ? T.color.onPrimary : here ? T.color.textMuted : T.color.text,
                  borderRadius: 12, padding: '6px 0', cursor: here ? 'default' : 'pointer',
                  fontFamily: T.fonts.body, lineHeight: 1.25, opacity: here ? 0.6 : 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700 }}>{top}</span>
                  <span style={{ fontSize: 11, fontWeight: 500 }}>{bottom}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <span style={{ fontSize: 13, color: T.color.textMuted, fontWeight: 600, flexShrink: 0 }}>יום אחר:</span>
            <DateInput value={otherDate} onChange={addOther} />
          </div>
          {extra.length > 0 && (
            <div style={{ fontSize: 12.5, color: T.color.textMuted, marginTop: 8 }}>
              נבחרו גם: {extra.map(longDayLabel).join(', ')}
            </div>
          )}

          <button type="button" disabled={!can} onClick={() => {
            if (!can) return;
            if (mode === 'copy') onCopy(picked); else onMove(picked[0]);
          }} style={{
            marginTop: 14, width: '100%', borderRadius: 99, padding: '10px 0',
            border: '1.5px solid ' + (can ? T.color.primary : T.color.line),
            background: can ? T.color.primarySoft : 'transparent',
            color: can ? T.color.primaryDeep : T.color.textMuted,
            fontSize: 14, fontWeight: 700, fontFamily: T.fonts.body,
            cursor: can ? 'pointer' : 'default',
          }}>{actionLabel}</button>
        </div>
      )}
    </div>
  );
}

