import { theme } from '../theme';
import type { Note, NoteTone } from '../lib/types';
import { NavBtn, PageHeader } from '../components/atoms';
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
        cursor: 'pointer', position: 'relative',
      }}
    >
      {n.pinned && (
        <span style={{ position: 'absolute', top: 10, insetInlineEnd: 12, opacity: 0.7 }}>
          <Icon.pin size={13} color={tone.text} />
        </span>
      )}
      {n.title && (
        <div style={{
          fontFamily: T.fonts.hand, fontSize: 19, color: tone.text, lineHeight: 1.2,
          marginBottom: n.body ? 6 : 0, paddingInlineEnd: n.pinned ? 20 : 0,
        }}>
          {n.title}
        </div>
      )}
      {n.body && (
        <div style={{
          fontSize: 13.5, color: tone.text, opacity: 0.82, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {n.body}
        </div>
      )}
      {!n.title && !n.body && (
        <div style={{ fontSize: 13.5, color: tone.text, opacity: 0.45 }}>פתק ריק</div>
      )}
    </div>
  );
}

export function NotesScreen({ notes, onAdd, onEdit }: {
  notes: Note[];
  onAdd: () => void;
  onEdit: (n: Note) => void;
}) {
  const sorted = [...notes].sort((a, b) => {
    if (a.pinned === b.pinned) return 0;
    return a.pinned ? -1 : 1;
  });
  const colA = sorted.filter((_, i) => i % 2 === 0);
  const colB = sorted.filter((_, i) => i % 2 === 1);

  return (
    <div style={{ paddingBottom: 100 }}>
      <PageHeader
        icon={<Icon.note size={25} color="#fff" sw={1.8} />}
        title="פתקים"
        sub={notes.length > 0 ? `${notes.length} פתקים` : undefined}
        action={
          <NavBtn onClick={onAdd}>
            <Icon.plus size={18} color={T.color.text} />
          </NavBtn>
        }
      />

      <div style={{ padding: '0 18px' }}>
        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: T.color.textMuted, fontSize: 15 }}>
            <div style={{ fontFamily: T.fonts.hand, fontSize: 28, marginBottom: 8 }}>אין פתקים עדיין</div>
            לחצי על + כדי להוסיף
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>{colA.map(n => <NoteCard key={n.id} n={n} onEdit={onEdit} />)}</div>
            <div style={{ flex: 1 }}>{colB.map(n => <NoteCard key={n.id} n={n} onEdit={onEdit} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
