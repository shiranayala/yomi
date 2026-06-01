import { useState } from 'react';
import { theme } from '../theme';
import type { CalEvent, CatId, Reminder, Recurrence } from '../lib/types';
import { todayStr } from '../lib/recurrence';
import {
  Field, TextInput, DateInput, TimeInput, Pills, CatPicker,
  REMINDER_OPTIONS, RECURRENCE_OPTIONS, Divider,
} from './FormFields';
import { ConfirmDialog } from './ConfirmDialog';
import { Icon } from '../icons';

const T = theme;

interface Props {
  initial?: CalEvent;
  onSave: (ev: CalEvent) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

function newId() { return 'ev' + Date.now(); }

export function EventForm({ initial, onSave, onDelete, onClose }: Props) {
  const isEdit = !!initial;
  const [title, setTitle] = useState(initial?.title ?? '');
  const [date, setDate]   = useState(initial?.date ?? todayStr());
  const [time, setTime]   = useState(initial?.time ?? '');
  const [end, setEnd]     = useState(initial?.end ?? '');
  const [cat, setCat]     = useState<CatId>(initial?.cat ?? 'personal');
  const [place, setPlace] = useState(initial?.place ?? '');
  const [reminder, setReminder] = useState<Reminder>(initial?.reminder ?? 'none');
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? 'once');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const valid = title.trim() && date && time && cat;

  function handleSave() {
    if (!valid) return;
    onSave({
      id: initial?.id ?? newId(),
      title: title.trim(),
      date, time,
      end: end || undefined,
      cat,
      place: place.trim() || undefined,
      reminder,
      recurrence,
      notes: notes.trim() || undefined,
    });
    onClose();
  }

  return (
    <div dir="rtl" style={{ fontFamily: T.fonts.body }}>
      <Field label="שם האירוע" required>
        <TextInput value={title} onChange={setTitle} placeholder="למשל: פגישה עם מיכל" />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="תאריך" required>
          <DateInput value={date} onChange={setDate} />
        </Field>
        <Field label="שעת התחלה" required>
          <TimeInput value={time} onChange={setTime} />
        </Field>
      </div>

      <Field label="שעת סיום (אופציונלי)">
        <TimeInput value={end} onChange={setEnd} />
      </Field>

      <Field label="קטגוריה" required>
        <CatPicker value={cat} onChange={setCat} />
      </Field>

      <Field label="מיקום (אופציונלי)">
        <TextInput value={place} onChange={setPlace} placeholder="למשל: זום, בית קפה..." />
      </Field>

      <Divider />

      <Field label="תזכורת">
        <Pills<Reminder> options={REMINDER_OPTIONS} value={reminder} onChange={setReminder} />
      </Field>

      <Field label="חזרה">
        <Pills<Recurrence> options={RECURRENCE_OPTIONS} value={recurrence} onChange={setRecurrence} />
      </Field>

      <Divider />

      <Field label="הערות (אופציונלי)">
        <TextInput value={notes} onChange={setNotes} placeholder="כל מה שרלוונטי..." multiline />
      </Field>

      {/* Save button */}
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
      >{isEdit ? 'שמור שינויים' : 'הוסף אירוע'}</button>

      {/* Delete button */}
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
            מחק אירוע
          </button>
          <ConfirmDialog
            open={confirmDelete}
            message="האם למחוק את האירוע?"
            onConfirm={() => { onDelete(initial!.id); onClose(); }}
            onCancel={() => setConfirmDelete(false)}
          />
        </>
      )}
    </div>
  );
}
