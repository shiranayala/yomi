import { useState } from 'react';
import { theme } from '../theme';
import type { CalEvent, CatId, Recurrence } from '../lib/types';
import { todayStr } from '../lib/recurrence';
import {
  Field, TextInput, DateInput, TimeInput, CatPicker,
  RecurrencePicker, Divider,
} from './FormFields';
import { ConfirmDialog } from './ConfirmDialog';
import { Icon } from '../icons';

const T = theme;

interface Props {
  initial?: CalEvent;
  defaultDate?: string;
  onSave: (ev: CalEvent) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

function newId() { return 'ev' + Date.now(); }

export function EventForm({ initial, defaultDate, onSave, onDelete, onClose }: Props) {
  const isEdit = !!initial;
  const [title, setTitle]   = useState(initial?.title ?? '');
  const [date, setDate]     = useState(initial?.date ?? defaultDate ?? todayStr());
  const [time, setTime]     = useState(initial?.time ?? '');
  const [end, setEnd]       = useState(initial?.end ?? '');
  const [cat, setCat]       = useState<CatId>(initial?.cat ?? 'personal');
  const [place, setPlace]   = useState(initial?.place ?? '');
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? 'once');
  const [notes, setNotes]   = useState(initial?.notes ?? '');
  const [expanded, setExpanded] = useState(
    isEdit && (
      (initial?.cat ?? 'personal') !== 'personal' ||
      !!initial?.place || !!initial?.notes ||
      (initial?.recurrence ?? 'once') !== 'once'
    )
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const endTimeError = end && time && end <= time
    ? 'שעת הסיום חייבת להיות אחרי שעת ההתחלה' : '';
  const valid = title.trim() && date && time && !endTimeError;

  function handleSave() {
    if (!valid) return;
    onSave({
      id: initial?.id ?? newId(),
      title: title.trim(),
      date, time,
      end: end || undefined,
      cat,
      place: place.trim() || undefined,
      reminder: initial?.reminder,
      recurrence,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <div dir="rtl" style={{ fontFamily: T.fonts.body }}>
      <Field label="שם האירוע" required>
        <TextInput value={title} onChange={setTitle} />
      </Field>

      <Field label="תאריך" required>
        <DateInput value={date} onChange={setDate} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="שעת התחלה" required>
          <TimeInput value={time} onChange={setTime} />
        </Field>
        <Field label="שעת סיום">
          <TimeInput value={end} onChange={setEnd} />
        </Field>
      </div>
      {endTimeError && (
        <div style={{ color: '#e05c5c', fontSize: 12.5, marginTop: -6, marginBottom: 10 }}>{endTimeError}</div>
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

          <Field label="מיקום (אופציונלי)">
            <TextInput value={place} onChange={setPlace} />
          </Field>

          <Field label="חזרה">
            <RecurrencePicker value={recurrence} onChange={setRecurrence} />
          </Field>

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
      >{isEdit ? 'שמור שינויים' : 'הוסף אירוע'}</button>

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
