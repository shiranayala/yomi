import { useState } from 'react';
import { theme } from '../theme';
import type { Note, NoteTone } from '../lib/types';
import { Field, TextInput, Pills } from './FormFields';
import { ConfirmDialog } from './ConfirmDialog';
import { Icon } from '../icons';

const T = theme;

const TONE_OPTIONS: { value: NoteTone; label: string }[] = [
  { value: 'plain',  label: 'רגיל' },
  { value: 'amber',  label: 'זהב' },
  { value: 'green',  label: 'ירוק' },
  { value: 'blue',   label: 'כחול' },
  { value: 'purple', label: 'סגול' },
];

interface Props {
  note: Note;
  onSave: (n: Note) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function NoteForm({ note, onSave, onDelete, onClose }: Props) {
  const [title, setTitle]   = useState(note.title);
  const [body, setBody]     = useState(note.body ?? '');
  const [tone, setTone]     = useState<NoteTone>(note.tone ?? 'plain');
  const [pinned, setPinned] = useState(note.pinned ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const valid = title.trim().length > 0;

  return (
    <div dir="rtl" style={{ fontFamily: T.fonts.body }}>
      <Field label="כותרת" required>
        <TextInput value={title} onChange={setTitle} />
      </Field>

      <Field label="תוכן (אופציונלי)">
        <TextInput value={body} onChange={setBody} multiline />
      </Field>

      <Field label="צבע">
        <Pills<NoteTone> options={TONE_OPTIONS} value={tone} onChange={setTone} />
      </Field>

      {/* Pin toggle */}
      <button
        onClick={() => setPinned(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: pinned ? T.color.primarySoft : T.color.surfaceAlt,
          border: 'none', borderRadius: T.radius.tile, padding: '10px 14px',
          color: pinned ? T.color.primaryDeep : T.color.textMuted,
          fontFamily: T.fonts.body, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', marginBottom: 16, width: '100%',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <Icon.pin size={16} color={pinned ? T.color.primaryDeep : T.color.textMuted} />
        {pinned ? 'מוצמד' : 'הצמד פתק'}
      </button>

      <button
        onClick={() => { if (valid) onSave({ ...note, title: title.trim(), body: body.trim(), tone, pinned }); }}
        disabled={!valid}
        style={{
          width: '100%', border: 'none', borderRadius: 99,
          padding: '14px 0', background: valid ? T.color.primary : T.color.surfaceAlt,
          color: valid ? T.color.onPrimary : T.color.textMuted,
          fontSize: 16, fontWeight: 700, cursor: valid ? 'pointer' : 'default',
          fontFamily: T.fonts.body, marginBottom: 12, transition: 'all .18s',
        }}
      >שמור שינויים</button>

      <button onClick={() => setConfirmDelete(true)} style={{
        width: '100%', border: '1.5px solid #e05c5c', borderRadius: 99,
        padding: '12px 0', background: 'transparent',
        color: '#e05c5c', fontSize: 15, fontWeight: 600,
        cursor: 'pointer', fontFamily: T.fonts.body,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <Icon.trash size={16} color="#e05c5c" />
        מחק פתק
      </button>

      <ConfirmDialog
        open={confirmDelete}
        message="האם למחוק את הפתק?"
        onConfirm={() => onDelete(note.id)}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
