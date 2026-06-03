import { useState } from 'react';
import { theme } from '../theme';
import type { Note, Tag } from '../lib/types';
import { noteColorStyle, colorForKey, NEUTRAL_STYLE } from '../lib/tagColors';
import { NavBtn, PageHeader } from '../components/atoms';
import { Icon } from '../icons';

const T = theme;

function NoteCard({ n, tags, onEdit }: { n: Note; tags: Tag[]; onEdit: (n: Note) => void }) {
  const style = noteColorStyle(n.tags ?? [], tags);
  const noteTags = (n.tags ?? []).map(id => tags.find(t => t.id === id)).filter(Boolean) as Tag[];

  return (
    <div
      onClick={() => onEdit(n)}
      style={{
        background: style.bg, border: '1px solid ' + style.edge,
        borderRadius: T.radius.tile, padding: '13px 14px', marginBottom: 12,
        cursor: 'pointer', position: 'relative',
      }}
    >
      {n.pinned && (
        <span style={{ position: 'absolute', top: 10, insetInlineEnd: 12, opacity: 0.7 }}>
          <Icon.pin size={13} color={style.text} />
        </span>
      )}
      {n.title && (
        <div style={{
          fontFamily: T.fonts.hand, fontSize: 19, color: style.text, lineHeight: 1.2,
          marginBottom: n.body ? 6 : (noteTags.length ? 8 : 0),
          paddingInlineEnd: n.pinned ? 20 : 0,
        }}>
          {n.title}
        </div>
      )}
      {n.body && (
        <div style={{
          fontSize: 13.5, color: style.text, opacity: 0.82, lineHeight: 1.5,
          marginBottom: noteTags.length ? 8 : 0,
          display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {n.body}
        </div>
      )}
      {!n.title && !n.body && (
        <div style={{ fontSize: 13.5, color: style.text, opacity: 0.45, marginBottom: noteTags.length ? 8 : 0 }}>
          פתק ריק
        </div>
      )}
      {/* Tag chips */}
      {noteTags.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {noteTags.map(tag => {
            const c = colorForKey(tag.color);
            return (
              <span key={tag.id} style={{
                background: c.edge, color: c.text, borderRadius: 99,
                padding: '2px 8px', fontSize: 11.5, fontWeight: 600,
              }}>
                {tag.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function NotesScreen({ notes, tags, onAdd, onEdit }: {
  notes: Note[];
  tags: Tag[];
  onAdd: () => void;
  onEdit: (n: Note) => void;
}) {
  const [filterTagId, setFilterTagId] = useState<string | null>(null);

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned === b.pinned) return 0;
    return a.pinned ? -1 : 1;
  });

  const visible = filterTagId
    ? sorted.filter(n => n.tags?.includes(filterTagId))
    : sorted;

  const colA = visible.filter((_, i) => i % 2 === 0);
  const colB = visible.filter((_, i) => i % 2 === 1);

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
        {/* Filter bar */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 14, scrollbarWidth: 'none' }}>
            <button
              onClick={() => setFilterTagId(null)}
              style={{
                flexShrink: 0, border: 'none', borderRadius: 99, cursor: 'pointer',
                padding: '6px 14px', fontSize: 13, fontWeight: 600,
                fontFamily: T.fonts.body, WebkitTapHighlightColor: 'transparent',
                background: filterTagId === null ? T.color.primary : T.color.surfaceAlt,
                color: filterTagId === null ? T.color.onPrimary : T.color.textMuted,
              }}
            >
              הכל
            </button>
            {tags.map(tag => {
              const active = filterTagId === tag.id;
              const c = colorForKey(tag.color);
              return (
                <button
                  key={tag.id}
                  onClick={() => setFilterTagId(active ? null : tag.id)}
                  style={{
                    flexShrink: 0, border: active ? `1.5px solid ${c.edge}` : 'none',
                    borderRadius: 99, cursor: 'pointer',
                    padding: '6px 14px', fontSize: 13, fontWeight: 600,
                    fontFamily: T.fonts.body, WebkitTapHighlightColor: 'transparent',
                    background: active ? c.bg : T.color.surfaceAlt,
                    color: active ? c.text : T.color.textMuted,
                  }}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        )}

        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: T.color.textMuted, fontSize: 15 }}>
            {filterTagId
              ? <div style={{ fontFamily: T.fonts.hand, fontSize: 24, marginBottom: 8 }}>אין פתקים בתגית זו</div>
              : <><div style={{ fontFamily: T.fonts.hand, fontSize: 28, marginBottom: 8 }}>אין פתקים עדיין</div>לחצי על + כדי להוסיף</>
            }
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>{colA.map(n => <NoteCard key={n.id} n={n} tags={tags} onEdit={onEdit} />)}</div>
            <div style={{ flex: 1 }}>{colB.map(n => <NoteCard key={n.id} n={n} tags={tags} onEdit={onEdit} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
