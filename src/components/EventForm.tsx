import { useState } from 'react';
import { theme } from '../theme';
import type { CalEvent, CatId, Recurrence } from '../lib/types';
import { todayStr } from '../lib/recurrence';
import {
  Field, TextInput, DateInput, TimeInput, RecurrencePicker, CategorySelect, SaveBar,
} from './FormFields';

const T = theme;

interface Props {
  initial?: CalEvent;
  defaultDate?: string;
  onSave: (ev: CalEvent) => void;
}

function newId() { return 'ev' + Date.now(); }

export function EventForm({ initial, defaultDate, onSave }: Props) {
  const isEdit = !!initial;
  const [title, setTitle]   = useState(initial?.title ?? '');
  const [date, setDate]     = useState(initial?.date ?? defaultDate ?? todayStr());
  const [time, setTime]     = useState(initial?.time ?? '');
  const [end, setEnd]       = useState(initial?.end ?? '');
  const [cat, setCat]       = useState<CatId>(initial?.cat ?? '');
  const [place, setPlace]   = useState(initial?.place ?? '');
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? 'once');
  const [notes, setNotes]   = useState(initial?.notes ?? '');

  const endTimeError = end && time && end <= time
    ? 'שעת הסיום חייבת להיות אחרי שעת ההתחלה' : '';
  const valid = !!(title.trim() && date && time && !endTimeError);

  function handleSave() {
    if (!valid) return;
    onSave({
      ...initial, // keep fields the form doesn't edit (excludeDates, routineId, done…)
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
        <TextInput value={title} onChange={setTitle} placeholder="מה האירוע?" />
      </Field>

      <Field label="תאריך" required>
        <DateInput value={date} onChange={setDate} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10 }}>
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

      <Field label="מיקום">
        <TextInput value={place} onChange={setPlace} placeholder="איפה?" />
      </Field>

      <Field label="פרטים נוספים">
        <TextInput value={notes} onChange={setNotes} multiline placeholder="כתבי כאן פרטים על האירוע…" />
      </Field>

      <Field label="קטגוריה">
        <CategorySelect value={cat} onChange={setCat} />
      </Field>

      <Field label="חזרה">
        <RecurrencePicker value={recurrence} onChange={setRecurrence} />
      </Field>

      <SaveBar valid={valid} onSave={handleSave} label={isEdit ? 'שמירה' : 'הוספה'} />
    </div>
  );
}
