import { useState } from 'react';
import { theme } from '../theme';
import type { Task, CatId, Recurrence } from '../lib/types';
import { todayStr } from '../lib/recurrence';
import {
  Field, TextInput, DateInput, TimeInput, Pills, CatPicker,
  RecurrencePicker, Divider,
} from './FormFields';
import { ConfirmDialog } from './ConfirmDialog';
import { Icon } from '../icons';

const T = theme;

type When = 'later' | 'today' | 'date';

const WHEN_OPTIONS: { value: When; label: string }[] = [
  { value: 'later', label: 'להמשך' },
  { value: 'today', label: 'היום'  },
  { value: 'date',  label: 'תאריך' },
];

function getInitialWhen(task?: Task): When {
  if (!task) return 'today';
  if (task.today) return 'today';
  if (task.date) return 'date';
  return 'later';
}

function newId() { return 'tsk' + Date.now(); }

interface Props {
  initial?: Task;
  defaultDate?: string;
  onSave: (t: Task) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export function TaskForm({ initial, defaultDate, onSave, onDelete, onClose }: Props) {
  const isEdit = !!initial;
  const [title, setTitle]     = useState(initial?.title ?? '');
  const [when, setWhen]       = useState<When>(defaultDate && !initial ? 'date' : getInitialWhen(initial));
  const [date, setDate]       = useState(initial?.date ?? defaultDate ?? todayStr());
  const [time, setTime]       = useState(initial?.time ?? '');
  const [cat, setCat]         = useState<CatId>(initial?.cat ?? 'personal');
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? 'once');
  const [notes, setNotes]     = useState(initial?.notes ?? '');
  const [expanded, setExpanded] = useState(
    isEdit && ((initial?.cat ?? 'personal') !== 'personal' || !!initial?.notes)
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const valid =
    title.trim() &&
    (when !== 'date' || !!date);

  function handleSave() {
    if (!valid) return;
    const hasTime = !!time;
    onSave({
      id: initial?.id ?? newId(),
      title: title.trim(),
      cat,
      done: initial?.done ?? false,
      time: hasTime ? time : null,
      today: when === 'today',
      type: hasTime ? 'scheduled' : 'general',
      date: when === 'date' ? date : undefined,
      recurrence: when === 'date' ? recurrence : 'once',
      notes: notes.trim() || undefined,
      reminder: initial?.reminder,
    });
  }

  return (
    <div dir="rtl" style={{ fontFamily: T.fonts.body }}>
      <Field label="שם המשימה" required>
        <TextInput value={title} onChange={setTitle} />
      </Field>

      <Field label="מתי" required>
        <Pills<When> options={WHEN_OPTIONS} value={when} onChange={setWhen} />
      </Field>

      {when === 'today' && (
        <Field label="שעה (אופציונלי)">
          <TimeInput value={time} onChange={setTime} />
        </Field>
      )}

      {when === 'date' && (
        <>
          <Field label="תאריך" required>
            <DateInput value={date} onChange={setDate} />
          </Field>
          <Field label="שעה (אופציונלי)">
            <TimeInput value={time} onChange={setTime} />
          </Field>
        </>
      )}

      {/* More details toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 5,
          color: T.color.textMuted, fontSize: 13.5, fontWeight: 600,
          padding: '4px 0 12px', fontFamily: T.fonts.body,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{ display: 'inline-flex', transform: expanded ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform .2s' }}>
          <Icon.chevR size={13} color={T.color.textMuted} />
        </span>
        פרטים נוספים
      </button>

      {expanded && (
        <>
          <Field label="קטגוריה">
            <CatPicker value={cat} onChange={setCat} />
          </Field>

          {when === 'date' && (
            <Field label="חזרה">
              <RecurrencePicker value={recurrence} onChange={setRecurrence} />
            </Field>
          )}

          <Field label="הערות (אופציונלי)">
            <TextInput value={notes} onChange={setNotes} multiline />
          </Field>

          <Divider />
        </>
      )}

      <button
        onClick={handleSave}
        disabled={!valid}
        style={{
          width: '100%', border: 'none', borderRadius: 99,
          padding: '14px 0', background: valid ? T.color.primary : T.color.surfaceAlt,
          color: valid ? T.color.onPrimary : T.color.textMuted,
          fontSize: 16, fontWeight: 700, cursor: valid ? 'pointer' : 'default',
          fontFamily: T.fonts.body, marginBottom: 12,
          transition: 'all .18s',
        }}
      >{isEdit ? 'שמור שינויים' : 'הוסף משימה'}</button>

      {isEdit && onDelete && (
        <>
          <button onClick={() => setConfirmDelete(true)} style={{
            width: '100%', border: '1.5px solid #e05c5c', borderRadius: 99,
            padding: '12px 0', background: 'transparent',
            color: '#e05c5c', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: T.fonts.body,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon.trash size={16} color="#e05c5c" />
            מחק משימה
          </button>
          <ConfirmDialog
            open={confirmDelete}
            message="האם למחוק את המשימה?"
            onConfirm={() => { onDelete(initial!.id); onClose(); }}
            onCancel={() => setConfirmDelete(false)}
          />
        </>
      )}
    </div>
  );
}
