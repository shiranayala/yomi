import { useState } from 'react';
import { theme } from '../theme';
import type { Task, CatId, Reminder, Recurrence, TaskType } from '../lib/types';
import { todayStr } from '../lib/recurrence';
import {
  Field, TextInput, DateInput, TimeInput, Pills, CatPicker,
  REMINDER_OPTIONS, RECURRENCE_OPTIONS, Divider,
} from './FormFields';
import { ConfirmDialog } from './ConfirmDialog';
import { Icon } from '../icons';

const T = theme;

interface Props {
  initial?: Task;
  onSave: (t: Task) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: 'general',   label: 'כללי' },
  { value: 'scheduled', label: 'מתוזמן' },
];

type When = 'today' | 'later' | 'date';

const WHEN_OPTIONS: { value: When; label: string }[] = [
  { value: 'today', label: 'היום' },
  { value: 'later', label: 'להמשך' },
  { value: 'date',  label: 'תאריך' },
];

function getInitialWhen(task?: Task): When {
  if (!task || task.today) return 'today';
  if (task.date) return 'date';
  return 'later';
}

function newId() { return 'tsk' + Date.now(); }

export function TaskForm({ initial, onSave, onDelete, onClose }: Props) {
  const isEdit = !!initial;
  const [title, setTitle]     = useState(initial?.title ?? '');
  const [type, setType]       = useState<TaskType>(initial?.type ?? 'general');
  const [when, setWhen]       = useState<When>(getInitialWhen(initial));
  const [date, setDate]       = useState(initial?.date ?? todayStr());
  const [time, setTime]       = useState(initial?.time ?? '');
  const [cat, setCat]         = useState<CatId>(initial?.cat ?? 'personal');
  const [reminder, setReminder] = useState<Reminder>(initial?.reminder ?? 'none');
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? 'once');
  const [notes, setNotes]     = useState(initial?.notes ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const valid =
    title.trim() && cat &&
    (type === 'general'
      ? (when !== 'date' || !!date)
      : (!!date && !!time));

  function handleSave() {
    if (!valid) return;
    onSave({
      id: initial?.id ?? newId(),
      title: title.trim(),
      cat,
      done: initial?.done ?? false,
      time: type === 'scheduled' ? time : null,
      today: type === 'general' && when === 'today',
      type,
      date: type === 'scheduled' ? date : (when === 'date' ? date : undefined),
      reminder,
      recurrence,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <div dir="rtl" style={{ fontFamily: T.fonts.body }}>
      <Field label="שם המשימה" required>
        <TextInput value={title} onChange={setTitle} placeholder="למשל: לקנות מתנה לנועה" />
      </Field>

      <Field label="סוג">
        <Pills<TaskType> options={TYPE_OPTIONS} value={type} onChange={setType} />
      </Field>

      {type === 'general' && (
        <Field label="מתי">
          <Pills<When> options={WHEN_OPTIONS} value={when} onChange={setWhen} />
          {when === 'date' && (
            <div style={{ marginTop: 10 }}>
              <DateInput value={date} onChange={setDate} />
            </div>
          )}
        </Field>
      )}

      {type === 'scheduled' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="תאריך" required>
            <DateInput value={date} onChange={setDate} />
          </Field>
          <Field label="שעה" required>
            <TimeInput value={time} onChange={setTime} />
          </Field>
        </div>
      )}

      <Field label="קטגוריה" required>
        <CatPicker value={cat} onChange={setCat} />
      </Field>

      <Divider />

      {type === 'scheduled' && (
        <Field label="תזכורת">
          <Pills<Reminder> options={REMINDER_OPTIONS} value={reminder} onChange={setReminder} />
        </Field>
      )}

      <Field label="חזרה">
        <Pills<Recurrence> options={RECURRENCE_OPTIONS} value={recurrence} onChange={setRecurrence} />
      </Field>

      <Divider />

      <Field label="הערות (אופציונלי)">
        <TextInput value={notes} onChange={setNotes} placeholder="כל מה שרלוונטי..." multiline />
      </Field>

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
