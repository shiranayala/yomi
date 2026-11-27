import { useState } from 'react';
import { theme } from '../theme';
import type { Task, CatId, Recurrence } from '../lib/types';
import { todayStr, tomorrowStr } from '../lib/recurrence';
import {
  Field, TextInput, DateInput, TimeInput, Pills, RecurrencePicker,
} from './FormFields';
import { Icon } from '../icons';
import { useCats } from '../lib/CategoriesContext';
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

      {/* Save stays reachable while scrolling */}
      <div style={{
        position: 'sticky', bottom: 0, margin: '8px -20px -40px', padding: '12px 20px 24px',
        background: `linear-gradient(to top, ${T.color.surface} 75%, ${T.color.surface}00)`,
        display: 'flex', justifyContent: 'center',
      }}>
        <button
          onClick={handleSave}
          disabled={!valid}
          style={{
            border: 'none', borderRadius: 99, padding: '11px 34px', minWidth: 150,
            background: valid ? T.color.primary : T.color.surfaceAlt,
            color: valid ? T.color.onPrimary : T.color.textMuted,
            fontSize: 15, fontWeight: 700, cursor: valid ? 'pointer' : 'default',
            fontFamily: T.fonts.body,
            boxShadow: valid ? `0 6px 16px ${T.color.primary}40` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}
        >
          <Icon.check size={16} color={valid ? T.color.onPrimary : T.color.textMuted} sw={2.4} />
          {isEdit ? 'שמירה' : 'הוספה'}
        </button>
      </div>
    </div>
  );
}

// ── Category: one row that opens the choices ─────────────────────────

function CategorySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const cats = useCats();
  const [open, setOpen] = useState(false);
  const current = cats[value];

  const choice = (id: string, label: string, color: string | null) => {
    const active = id === value;
    return (
      <button key={id || 'none'} type="button" onClick={() => { onChange(id); setOpen(false); }} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 99,
        border: active ? `2px solid ${color ?? T.color.primary}` : '1.5px solid transparent',
        background: active ? (color ?? T.color.primary) + '22' : T.color.surfaceAlt,
        color: active ? (color ?? T.color.primaryDeep) : T.color.textMuted,
        fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: 'pointer', fontFamily: T.fonts.body,
      }}>
        {color
          ? <span style={{ width: 8, height: 8, borderRadius: 99, background: color }} />
          : <span style={{ width: 8, height: 8, borderRadius: 99, border: '1.5px solid ' + T.color.textMuted }} />}
        {label}
      </button>
    );
  };

  return (
    <div>
      <button type="button" onClick={() => setOpen(o => !o)} style={rowButton}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {current
            ? <span style={{ width: 10, height: 10, borderRadius: 99, background: current.color }} />
            : <span style={{ width: 10, height: 10, borderRadius: 99, border: '1.5px solid ' + T.color.textMuted }} />}
          <span style={{ color: current ? T.color.text : T.color.textMuted }}>
            {current ? current.label : 'ללא קטגוריה'}
          </span>
        </span>
        <Chevron open={open} />
      </button>
      {open && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 10 }}>
          {choice('', 'ללא', null)}
          {Object.values(cats).map(c => choice(c.id, c.label, c.color))}
        </div>
      )}
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

const rowButton: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  border: '1.5px solid ' + T.color.line, borderRadius: T.radius.tile,
  padding: '11px 14px', background: T.color.bg, cursor: 'pointer',
  fontSize: 15, fontFamily: T.fonts.body, textAlign: 'right',
};

function Chevron({ open }: { open: boolean }) {
  return (
    <span style={{ display: 'inline-flex', transform: open ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform .2s' }}>
      <Icon.chevR size={14} color={T.color.textMuted} />
    </span>
  );
}
