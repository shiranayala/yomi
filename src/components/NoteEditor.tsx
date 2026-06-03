import { useState, useEffect, useRef } from 'react';
import { theme } from '../theme';
import type { Note, NoteTone } from '../lib/types';
import { Icon } from '../icons';
import { ConfirmDialog } from './ConfirmDialog';

const T = theme;

const TONES: { value: NoteTone; color: string }[] = [
  { value: 'plain',  color: '#f4f3ef' },
  { value: 'amber',  color: '#fbf3df' },
  { value: 'green',  color: '#e6f0ea' },
  { value: 'blue',   color: '#e6eef7' },
  { value: 'purple', color: '#efe6f3' },
];

interface Props {
  note: Note;
  onSave: (n: Note) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function NoteEditor({ note, onSave, onDelete, onClose }: Props) {
  const [title, setTitle]   = useState(note.title);
  const [body, setBody]     = useState(note.body ?? '');
  const [tone, setTone]     = useState<NoteTone>(note.tone ?? 'plain');
  const [pinned, setPinned] = useState(note.pinned ?? false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const firstRender = useRef(true);

  const toneStyle = T.noteTones[tone];

  // Auto-save with debounce (skip first render)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (!title.trim() && !body.trim()) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSave({ ...note, title, body, tone, pinned });
    }, 700);
    return () => clearTimeout(timerRef.current);
  }, [title, body, tone, pinned]); // eslint-disable-line

  function handleClose() {
    clearTimeout(timerRef.current);
    if (!title.trim() && !body.trim()) {
      onDelete(note.id);
    } else {
      onSave({ ...note, title, body, tone, pinned });
    }
    onClose();
  }

  function handleDelete() {
    clearTimeout(timerRef.current);
    onDelete(note.id);
    onClose();
  }

  function handleTone(t: NoteTone) {
    setTone(t);
    setMenuOpen(false);
  }

  function handlePin() {
    setPinned(p => !p);
    setMenuOpen(false);
  }

  return (
    <div dir="rtl" style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: toneStyle.bg, fontFamily: T.fonts.body,
      transition: 'background .25s',
    }}>
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
              padding: '8px 10px', borderRadius: 12, color: toneStyle.text,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon.more size={22} color={toneStyle.text} />
          </button>

          {menuOpen && (
            <>
              <div
                onClick={() => setMenuOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 10 }}
              />
              <div style={{
                position: 'absolute', top: '100%', insetInlineStart: 0,
                background: T.color.surface, borderRadius: T.radius.tile,
                boxShadow: T.cardShadow, zIndex: 11, minWidth: 210,
                padding: '10px 0', overflow: 'hidden',
              }}>
                {/* Color swatches */}
                <div style={{ padding: '6px 14px 4px', fontSize: 12, color: T.color.textMuted, fontWeight: 600 }}>צבע</div>
                <div style={{ display: 'flex', gap: 8, padding: '4px 14px 12px' }}>
                  {TONES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => handleTone(t.value)}
                      style={{
                        width: 28, height: 28, borderRadius: 99, background: t.color, cursor: 'pointer',
                        border: tone === t.value ? `2.5px solid ${T.color.primary}` : '2px solid rgba(0,0,0,0.14)',
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>

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
        <button
          onClick={handleClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px 10px', borderRadius: 12,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Icon.x size={22} color={toneStyle.text} />
        </button>
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder=""
        style={{
          background: 'transparent', border: 'none', outline: 'none',
          fontSize: 21, fontWeight: 700, color: toneStyle.text,
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
          fontSize: 16.5, color: toneStyle.text, lineHeight: 1.75,
          fontFamily: T.fonts.body, padding: '10px 20px 40px',
          resize: 'none', width: '100%', boxSizing: 'border-box',
          direction: 'rtl',
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        message="האם למחוק את הפתק?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
