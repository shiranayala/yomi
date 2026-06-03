import { useState } from 'react';
import { theme } from '../theme';
import type { Note, NoteTone } from '../lib/types';
import { NavBtn, AddRow, PageHeader } from '../components/atoms';
import { Icon } from '../icons';

const T = theme;

function NoteCard({ n, onEdit }: { n: Note; onEdit: (n: Note) => void }) {
  const tone = T.noteTones[n.tone as NoteTone] ?? T.noteTones.plain;
  return (
    <div
      onClick={() => onEdit(n)}
      style={{
        background: tone.bg, border: '1px solid ' + tone.edge,
        borderRadius: T.radius.tile, padding: '13px 14px', marginBottom: 12,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ fontFamily: T.fonts.hand, fontSize: 20, color: tone.text, lineHeight: 1.15 }}>
          {n.title}
        </div>
        {n.pinned && <Icon.pin size={15} color={tone.text} />}
      </div>
      {n.body && (
        <div style={{ fontSize: 13.5, color: tone.text, opacity: 0.82, marginTop: 7, lineHeight: 1.5 }}>
          {n.body}
        </div>
      )}
    </div>
  );
}

export function NotesScreen({ notes, onAdd, onEdit }: {
  notes: Note[];
  onAdd: (title: string) => void;
  onEdit: (n: Note) => void;
}) {
  const [adding, setAdding] = useState(false);

  const sorted = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const colA = sorted.filter((_, i) => i % 2 === 0);
  const colB = sorted.filter((_, i) => i % 2 === 1);

  return (
    <div style={{ paddingBottom: 100 }}>
      <PageHeader
        icon={<Icon.note size={25} color="#fff" sw={1.8} />}
        title="פתקים"
        sub={notes.length > 0 ? `${notes.length} פתקים` : undefined}
        action={
          <NavBtn onClick={() => setAdding(a => !a)}>
            <Icon.plus size={18} color={adding ? T.color.primary : T.color.text} />
          </NavBtn>
        }
      />

      <div style={{ padding: '0 18px' }}>
        {adding && (
          <div style={{ marginBottom: 14 }}>
            <AddRow
              placeholder="כותרת לפתק חדש…"
              onAdd={t => { onAdd(t); setAdding(false); }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>{colA.map(n => <NoteCard key={n.id} n={n} onEdit={onEdit} />)}</div>
          <div style={{ flex: 1 }}>{colB.map(n => <NoteCard key={n.id} n={n} onEdit={onEdit} />)}</div>
        </div>

        {notes.length === 0 && !adding && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: T.color.textMuted, fontSize: 15 }}>
            <div style={{ fontFamily: T.fonts.hand, fontSize: 28, marginBottom: 8 }}>אין פתקים עדיין</div>
            לחצי על + כדי להוסיף
          </div>
        )}
      </div>
    </div>
  );
}
