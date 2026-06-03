import { useState } from 'react';
import { theme } from '../theme';
import type { Tag } from '../lib/types';
import { TAG_COLORS, TAG_COLOR_KEYS, colorForKey } from '../lib/tagColors';
import { Icon } from '../icons';
import { ConfirmDialog } from './ConfirmDialog';

const T = theme;

interface Props {
  noteTags: string[];
  allTags: Tag[];
  onToggleTag: (id: string) => void;
  onSaveTag: (tag: Tag) => void;
  onDeleteTag: (id: string) => void;
  onClose: () => void;
}

function ColorDot({ colorKey, selected, size = 26, onClick }: { colorKey: string; selected?: boolean; size?: number; onClick?: () => void }) {
  const c = colorForKey(colorKey);
  return (
    <button
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: 99,
        background: c.bg, flexShrink: 0, cursor: onClick ? 'pointer' : 'default',
        border: selected ? `2.5px solid ${T.color.primary}` : `2px solid ${c.edge}`,
      }}
    />
  );
}

function AddTagForm({ onAdd, onCancel }: { onAdd: (name: string, color: string) => void; onCancel: () => void }) {
  const [name, setName]   = useState('');
  const [color, setColor] = useState(TAG_COLOR_KEYS[0]);

  return (
    <div style={{ padding: '14px 16px', background: T.color.surfaceAlt, borderRadius: T.radius.tile, marginTop: 6 }}>
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="שם התגית"
        style={{
          width: '100%', boxSizing: 'border-box', background: T.color.surface,
          border: '1.5px solid ' + T.color.line, borderRadius: T.radius.tile,
          padding: '9px 12px', fontSize: 15, fontFamily: T.fonts.body,
          color: T.color.text, outline: 'none', marginBottom: 12,
          direction: 'rtl',
        }}
      />
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
        {TAG_COLOR_KEYS.map(k => (
          <ColorDot key={k} colorKey={k} selected={color === k} onClick={() => setColor(k)} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCancel} style={{
          flex: 1, border: '1.5px solid ' + T.color.line, borderRadius: 99,
          padding: '9px 0', background: T.color.surface, color: T.color.text,
          fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: T.fonts.body,
        }}>ביטול</button>
        <button
          onClick={() => { if (name.trim()) onAdd(name.trim(), color); }}
          disabled={!name.trim()}
          style={{
            flex: 2, border: 'none', borderRadius: 99,
            padding: '9px 0', background: name.trim() ? T.color.primary : T.color.surfaceAlt,
            color: name.trim() ? T.color.onPrimary : T.color.textMuted,
            fontSize: 14, fontWeight: 700, cursor: name.trim() ? 'pointer' : 'default',
            fontFamily: T.fonts.body,
          }}
        >הוסף תגית</button>
      </div>
    </div>
  );
}

function EditTagForm({ tag, onSave, onCancel }: { tag: Tag; onSave: (t: Tag) => void; onCancel: () => void }) {
  const [name, setName]   = useState(tag.name);
  const [color, setColor] = useState(tag.color);

  return (
    <div style={{ padding: '10px 0 4px' }}>
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box', background: T.color.surface,
          border: '1.5px solid ' + T.color.line, borderRadius: T.radius.tile,
          padding: '8px 12px', fontSize: 14, fontFamily: T.fonts.body,
          color: T.color.text, outline: 'none', marginBottom: 10, direction: 'rtl',
        }}
      />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {TAG_COLOR_KEYS.map(k => (
          <ColorDot key={k} colorKey={k} selected={color === k} size={22} onClick={() => setColor(k)} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCancel} style={{
          flex: 1, border: '1.5px solid ' + T.color.line, borderRadius: 99,
          padding: '7px 0', background: 'transparent', color: T.color.text,
          fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: T.fonts.body,
        }}>ביטול</button>
        <button
          onClick={() => { if (name.trim()) onSave({ ...tag, name: name.trim(), color }); }}
          disabled={!name.trim()}
          style={{
            flex: 2, border: 'none', borderRadius: 99, padding: '7px 0',
            background: name.trim() ? T.color.primary : T.color.surfaceAlt,
            color: name.trim() ? T.color.onPrimary : T.color.textMuted,
            fontSize: 13, fontWeight: 700, cursor: name.trim() ? 'pointer' : 'default',
            fontFamily: T.fonts.body,
          }}
        >שמור</button>
      </div>
    </div>
  );
}

export function TagPanel({ noteTags, allTags, onToggleTag, onSaveTag, onDeleteTag, onClose }: Props) {
  const [view, setView]           = useState<'select' | 'manage'>('select');
  const [addOpen, setAddOpen]     = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const sep = { height: 1, background: T.color.line, margin: '0 16px' };
  const rowBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '13px 16px', cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  };

  // ── Select view ──
  if (view === 'select') return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.color.bg, fontFamily: T.fonts.body }} dir="rtl">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', flexShrink: 0 }}>
        <button onClick={() => setView('manage')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: T.color.primary, fontSize: 13.5, fontWeight: 600,
          fontFamily: T.fonts.body, padding: 0,
        }}>ערוך תגיות</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: T.color.text }}>תגיות</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 4, display: 'flex', alignItems: 'center',
        }}>
          <Icon.x size={20} color={T.color.textMuted} />
        </button>
      </div>
      <div style={sep} />

      {/* Tag list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {allTags.length === 0 && !addOpen && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: T.color.textMuted, fontSize: 14 }}>
            אין תגיות עדיין
          </div>
        )}
        {allTags.map((tag, i) => {
          const selected = noteTags.includes(tag.id);
          const c = colorForKey(tag.color);
          return (
            <div key={tag.id}>
              <div onClick={() => onToggleTag(tag.id)} style={rowBase}>
                <span style={{ width: 18, height: 18, borderRadius: 99, background: c.bg, border: `2px solid ${c.edge}`, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: T.color.text }}>{tag.name}</span>
                {selected && <Icon.check size={18} color={T.color.primary} sw={2.5} />}
              </div>
              {i < allTags.length - 1 && <div style={sep} />}
            </div>
          );
        })}

        {/* Add tag */}
        <div style={sep} />
        {addOpen ? (
          <div style={{ padding: '0 16px' }}>
            <AddTagForm
              onAdd={(name, color) => {
                const tag: Tag = { id: 'tag' + Date.now(), name, color };
                onSaveTag(tag);
                onToggleTag(tag.id);
                setAddOpen(false);
              }}
              onCancel={() => setAddOpen(false)}
            />
          </div>
        ) : (
          <div onClick={() => setAddOpen(true)} style={{ ...rowBase, color: T.color.primary }}>
            <Icon.plus size={17} color={T.color.primary} sw={2.2} />
            <span style={{ fontSize: 14.5, fontWeight: 600 }}>הוסף תגית חדשה</span>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        message="האם למחוק את התגית? היא תוסר מכל הפתקים."
        onConfirm={() => { if (confirmDelete) { onDeleteTag(confirmDelete); setConfirmDelete(null); } }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );

  // ── Manage view ──
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.color.bg, fontFamily: T.fonts.body }} dir="rtl">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', flexShrink: 0 }}>
        <div />
        <span style={{ fontSize: 16, fontWeight: 700, color: T.color.text }}>ניהול תגיות</span>
        <button onClick={() => { setEditingTag(null); setView('select'); }} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 4, display: 'flex', alignItems: 'center',
        }}>
          <Icon.chevR size={20} color={T.color.textMuted} />
        </button>
      </div>
      <div style={sep} />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {allTags.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: T.color.textMuted, fontSize: 14 }}>
            אין תגיות עדיין
          </div>
        )}
        {allTags.map((tag, i) => {
          const c = colorForKey(tag.color);
          const isEditing = editingTag?.id === tag.id;
          return (
            <div key={tag.id}>
              <div style={{ padding: '10px 16px' }}>
                {isEditing ? (
                  <EditTagForm
                    tag={tag}
                    onSave={updated => { onSaveTag(updated); setEditingTag(null); }}
                    onCancel={() => setEditingTag(null)}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 99, background: c.bg, border: `2px solid ${c.edge}`, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: T.color.text }}>{tag.name}</span>
                    <button onClick={() => { setEditingTag(tag); }} style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 6,
                      display: 'flex', alignItems: 'center',
                    }}>
                      <Icon.edit size={16} color={T.color.textMuted} />
                    </button>
                    <button onClick={() => setConfirmDelete(tag.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 6,
                      display: 'flex', alignItems: 'center',
                    }}>
                      <Icon.trash size={16} color="#e05c5c" />
                    </button>
                  </div>
                )}
              </div>
              {i < allTags.length - 1 && <div style={sep} />}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        message="האם למחוק את התגית? היא תוסר מכל הפתקים."
        onConfirm={() => { if (confirmDelete) { onDeleteTag(confirmDelete); setConfirmDelete(null); } }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
