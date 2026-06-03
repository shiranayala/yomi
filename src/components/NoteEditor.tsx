import { useState, useEffect, useRef } from 'react';
import { theme } from '../theme';
import type { Note, Tag } from '../lib/types';
import { colorForKey, noteColorStyle, NEUTRAL_STYLE } from '../lib/tagColors';
import { Icon } from '../icons';
import { ConfirmDialog } from './ConfirmDialog';
import { TagPanel } from './TagPanel';

const T = theme;

interface Props {
  note: Note;
  allTags: Tag[];
  onSave: (n: Note) => void;
  onSaveTag: (tag: Tag) => void;
  onDeleteTag: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function NoteEditor({ note, allTags, onSave, onSaveTag, onDeleteTag, onDelete, onClose }: Props) {
  const [title, setTitle]         = useState(note.title);
  const [body, setBody]           = useState(note.body ?? '');
  const [pinned, setPinned]       = useState(note.pinned ?? false);
  const [localTags, setLocalTags] = useState<string[]>(note.tags ?? []);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [tagsOpen, setTagsOpen]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const timerRef    = useRef<ReturnType<typeof setTimeout>>();
  const firstRender = useRef(true);

  const colorStyle = noteColorStyle(localTags, allTags);

  // Auto-save debounced
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (!title.trim() && !body.trim()) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSave({ ...note, title, body, pinned, tags: localTags });
    }, 700);
    return () => clearTimeout(timerRef.current);
  }, [title, body, pinned, localTags]); // eslint-disable-line

  function handleClose() {
    clearTimeout(timerRef.current);
    if (!title.trim() && !body.trim()) {
      onDelete(note.id);
    } else {
      onSave({ ...note, title, body, pinned, tags: localTags });
    }
    onClose();
  }

  function handleDelete() {
    clearTimeout(timerRef.current);
    onDelete(note.id);
    onClose();
  }

  function handlePin() {
    setPinned(p => !p);
    setMenuOpen(false);
  }

  function toggleTag(id: string) {
    setLocalTags(ts => ts.includes(id) ? ts.filter(t => t !== id) : [...ts, id]);
  }

  return (
    <div
      dir="rtl"
      style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: colorStyle.bg, fontFamily: T.fonts.body,
        transition: 'background .25s', position: 'relative',
      }}
    >
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 12px 6px', flexShrink: 0,
      }}>
        {/* 3-dot menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(m => !m)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 10px', borderRadius: 12,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon.more size={22} color={colorStyle.text} />
          </button>

          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
              <div style={{
                position: 'absolute', top: '100%', insetInlineStart: 0,
                background: T.color.surface, borderRadius: T.radius.tile,
                boxShadow: T.cardShadow, zIndex: 11, minWidth: 200,
                padding: '6px 0', overflow: 'hidden',
              }}>
                <button onClick={() => { setMenuOpen(false); setTagsOpen(true); }} style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                  color: T.color.text, fontSize: 14, fontFamily: T.fonts.body, fontWeight: 500,
                  WebkitTapHighlightColor: 'transparent',
                }}>
                  {/* tag icon inline */}
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.color.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  תגיות
                  {localTags.length > 0 && (
                    <span style={{ marginInlineStart: 'auto', fontSize: 12, color: T.color.textMuted, fontWeight: 600 }}>
                      {localTags.length}
                    </span>
                  )}
                </button>

                <div style={{ height: 1, background: T.color.line }} />

                <button onClick={handlePin} style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                  color: T.color.text, fontSize: 14, fontFamily: T.fonts.body, fontWeight: 500,
                  WebkitTapHighlightColor: 'transparent',
                }}>
                  <Icon.pin size={16} color={pinned ? T.color.primary : T.color.textMuted} />
                  {pinned ? 'הסר הצמדה' : 'הצמד פתק'}
                </button>

                <div style={{ height: 1, background: T.color.line }} />

                <button onClick={() => { setMenuOpen(false); setConfirmDelete(true); }} style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                  color: '#e05c5c', fontSize: 14, fontFamily: T.fonts.body, fontWeight: 500,
                  WebkitTapHighlightColor: 'transparent',
                }}>
                  <Icon.trash size={16} color="#e05c5c" />
                  מחק פתק
                </button>
              </div>
            </>
          )}
        </div>

        {/* Close */}
        <button onClick={handleClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '8px 10px', borderRadius: 12,
          WebkitTapHighlightColor: 'transparent',
        }}>
          <Icon.x size={22} color={colorStyle.text} />
        </button>
      </div>

      {/* Tag chips (below top bar) */}
      {localTags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, padding: '0 18px 6px', flexWrap: 'wrap', flexShrink: 0 }}>
          {localTags.map(tagId => {
            const tag = allTags.find(t => t.id === tagId);
            if (!tag) return null;
            const c = colorForKey(tag.color);
            return (
              <span key={tagId} style={{
                background: c.edge, color: c.text, borderRadius: 99,
                padding: '3px 10px', fontSize: 12, fontWeight: 600,
              }}>
                {tag.name}
              </span>
            );
          })}
        </div>
      )}

      {/* Title */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder=""
        style={{
          background: 'transparent', border: 'none', outline: 'none',
          fontSize: 21, fontWeight: 700, color: colorStyle.text,
          fontFamily: T.fonts.body, padding: '4px 20px 2px',
          width: '100%', boxSizing: 'border-box', flexShrink: 0,
          direction: 'rtl',
        }}
      />

      {/* Body */}
      <textarea
        autoFocus={!note.title}
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder=""
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          fontSize: 16.5, color: colorStyle.text, lineHeight: 1.75,
          fontFamily: T.fonts.body, padding: '10px 20px 40px',
          resize: 'none', width: '100%', boxSizing: 'border-box',
          direction: 'rtl',
        }}
      />

      {/* Tag panel overlay */}
      {tagsOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
          <TagPanel
            noteTags={localTags}
            allTags={allTags}
            onToggleTag={toggleTag}
            onSaveTag={onSaveTag}
            onDeleteTag={onDeleteTag}
            onClose={() => setTagsOpen(false)}
          />
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        message="האם למחוק את הפתק?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
