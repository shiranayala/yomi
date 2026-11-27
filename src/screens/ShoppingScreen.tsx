import { useState, useEffect, useRef } from 'react';
import { theme, softLine } from '../theme';
import type { ShoppingItem, ShoppingList } from '../lib/types';
import { Check, PageHeader, glassCard } from '../components/atoms';
import { Icon } from '../icons';
import { SwipeRow } from '../components/SwipeRow';
import { BottomSheet } from '../components/BottomSheet';

const T = theme;

const LIST_COLORS = [
  '#d99090', '#e8a87c', '#d4bc8b', '#87c9a0',
  '#8ba4d4', '#c89cd4', '#d4a18b', '#a3b8c9',
];

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
      {LIST_COLORS.map(c => (
        <button key={c} onClick={() => onChange(c)} style={{
          width: 26, height: 26, borderRadius: 99, background: c, border: 'none',
          cursor: 'pointer', flexShrink: 0,
          boxShadow: c === value ? `0 0 0 2.5px #fff, 0 0 0 4.5px ${c}` : 'none',
          transition: 'box-shadow .15s',
          WebkitTapHighlightColor: 'transparent',
        }} />
      ))}
    </div>
  );
}

function ConfirmInline({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 12.5, color: '#e05c5c', fontWeight: 600 }}>{message}</span>
      <button onClick={onConfirm} style={{
        border: 'none', cursor: 'pointer', borderRadius: 8, padding: '4px 10px',
        background: '#e05c5c', color: '#fff', fontSize: 12.5, fontWeight: 700, fontFamily: T.fonts.body,
      }}>כן</button>
      <button onClick={onCancel} style={{
        border: 'none', cursor: 'pointer', borderRadius: 8, padding: '4px 10px',
        background: T.color.surfaceAlt, color: T.color.text, fontSize: 12.5, fontWeight: 700, fontFamily: T.fonts.body,
      }}>לא</button>
    </div>
  );
}

function ListHeader({ list, onRename, onChangeColor, onDelete, onTogglePin }: {
  list: ShoppingList;
  onRename: (title: string) => void;
  onChangeColor: (color: string) => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [confirmDel, setConfirmDel] = useState(false);
  const accentColor = list.color || T.color.primary;

  useEffect(() => { setTitle(list.title); }, [list.title]);

  const save = () => {
    const t = title.trim();
    if (t && t !== list.title) onRename(t);
    else setTitle(list.title);
    setEditing(false);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 32 }}>
        <span style={{
          width: 10, height: 10, borderRadius: 99,
          background: accentColor, flexShrink: 0,
        }} />

        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={save}
            onKeyDown={e => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') { setTitle(list.title); setEditing(false); }
            }}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13, fontWeight: 700, color: T.color.textMuted, fontFamily: T.fonts.body,
              borderBottom: '1.5px solid ' + accentColor, paddingBottom: 1,
              letterSpacing: 0.3,
            }}
          />
        ) : (
          <div style={{
            flex: 1, fontSize: 13, fontWeight: 700, color: T.color.textMuted,
            letterSpacing: 0.3,
          }}>
            {list.title}
          </div>
        )}

        {confirmDel ? (
          <ConfirmInline message="למחוק?" onConfirm={onDelete} onCancel={() => setConfirmDel(false)} />
        ) : (
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <button
              onClick={onTogglePin}
              aria-label={list.pinned ? 'הסרה מהעמוד הראשי' : 'הצגה בעמוד הראשי'}
              title={list.pinned ? 'הסרה מהעמוד הראשי' : 'הצגה בעמוד הראשי'}
              style={list.pinned ? {
                display: 'flex', alignItems: 'center', gap: 4,
                border: 'none', cursor: 'pointer', borderRadius: 99, padding: '4px 10px',
                background: accentColor + '22', color: accentColor,
                fontSize: 12, fontWeight: 700, fontFamily: T.fonts.body,
              } : {
                background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 8,
                display: 'flex',
              }}
            >
              <Icon.pin size={14} color={list.pinned ? accentColor : T.color.textMuted} />
              {list.pinned && 'בעמוד הראשי'}
            </button>
            <button onClick={() => setEditing(e => !e)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 8,
            }}>
              <Icon.edit size={14} color={T.color.textMuted} />
            </button>
            <button onClick={() => setConfirmDel(true)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 8,
            }}>
              <Icon.trash size={14} color="#e05c5c" />
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div style={{ paddingInlineStart: 18, marginTop: 10 }}>
          <ColorPicker value={accentColor} onChange={c => { onChangeColor(c); }} />
        </div>
      )}
    </div>
  );
}

function AddItemRow({ onAdd }: { onAdd: (title: string) => void }) {
  const [v, setV] = useState('');
  const submit = () => { const t = v.trim(); if (t) { onAdd(t); setV(''); } };
  return (
    <div style={{
      ...glassCard,
      background: 'rgba(255,255,255,0.5)',
      display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
    }}>
      <Icon.plus size={18} color={T.color.primary} />
      <input
        value={v} onChange={e => setV(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        placeholder="הוסף פריט…"
        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: T.color.text }}
      />
      {v.trim() && (
        <button onClick={submit} style={{
          border: 'none', cursor: 'pointer', borderRadius: 99, padding: '6px 14px',
          background: `linear-gradient(135deg, ${T.color.primary}, ${T.color.heroFrom})`,
          color: T.color.onPrimary,
          boxShadow: `0 4px 12px ${T.color.primary}55`,
          fontSize: 13, fontWeight: 700,
        }}>הוסף</button>
      )}
    </div>
  );
}

export function ShoppingScreen({ shopping, shoppingLists, onToggle, onAdd, onDelete, onTogglePinItem, onTogglePinList, onAddList, onEditList, onDeleteList }: {
  shopping: ShoppingItem[];
  shoppingLists: ShoppingList[];
  onToggle: (id: string) => void;
  onAdd: (title: string, listId: string) => void;
  onDelete: (ids: string[]) => void;
  onTogglePinItem: (id: string) => void;
  onTogglePinList: (id: string) => void;
  onAddList: (title: string, color: string) => string;
  onEditList: (id: string, title: string, color?: string) => void;
  onDeleteList: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(LIST_COLORS[0]);
  const [menuItem, setMenuItem] = useState<ShoppingItem | null>(null);

  // Long press on an item opens its menu (pin to Today / delete)
  const press = useRef<{ timer: number; x: number; y: number; fired: boolean } | null>(null);
  const pressStart = (e: React.PointerEvent, item: ShoppingItem) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const p = { timer: 0, x: e.clientX, y: e.clientY, fired: false };
    p.timer = window.setTimeout(() => {
      p.fired = true;
      try { navigator.vibrate?.(12); } catch { /* not supported */ }
      setMenuItem(item);
    }, 450);
    press.current = p;
  };
  const pressMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (p && !p.fired && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) {
      clearTimeout(p.timer); press.current = null;
    }
  };
  const pressEnd = () => { if (press.current && !press.current.fired) { clearTimeout(press.current.timer); press.current = null; } };
  /** After a long press, swallow the click that follows so the item isn't toggled. */
  const swallowClick = (e: React.MouseEvent) => {
    if (press.current?.fired) { e.stopPropagation(); e.preventDefault(); press.current = null; }
  };

  // Auto-select first list when lists load or change
  useEffect(() => {
    if (shoppingLists.length > 0) {
      setSelectedId(id => {
        if (id && shoppingLists.find(l => l.id === id)) return id;
        return shoppingLists[0].id;
      });
    } else {
      setSelectedId(null);
    }
  }, [shoppingLists]);

  const selectedList = shoppingLists.find(l => l.id === selectedId) ?? null;
  const listItems = selectedId ? shopping.filter(s => s.listId === selectedId) : [];
  const shopLeft = listItems.filter(s => !s.done).length;

  const validListIds = new Set(shoppingLists.map(l => l.id));
  const totalLeft = shopping.filter(s => !s.done && validListIds.has(s.listId ?? '')).length;

  function handleStartCreate() {
    setNewName('');
    setNewColor(LIST_COLORS[shoppingLists.length % LIST_COLORS.length]);
    setCreating(true);
  }

  function handleConfirmCreate() {
    const name = newName.trim() || 'רשימה חדשה';
    const id = onAddList(name, newColor);
    setSelectedId(id);
    setCreating(false);
  }

  function handleDeleteList(id: string) {
    const idx = shoppingLists.findIndex(l => l.id === id);
    onDeleteList(id);
    const remaining = shoppingLists.filter(l => l.id !== id);
    if (remaining.length > 0) {
      setSelectedId(remaining[Math.max(0, idx - 1)].id);
    } else {
      setSelectedId(null);
    }
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <PageHeader
        icon={<Icon.cart size={26} color="#fff" sw={1.8} />}
        title="קניות"
        sub={totalLeft > 0 ? `נשארו ${totalLeft} פריטים` : (shoppingLists.length > 0 ? 'הכל קנוי! 🎉' : undefined)}
      />

      {/* List tabs */}
      <div style={{
        overflowX: 'auto', display: 'flex', gap: 8, alignItems: 'center',
        padding: '4px 18px 16px', scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
      }}>
        {shoppingLists.map(list => {
          const count = shopping.filter(s => s.listId === list.id && !s.done).length;
          const isSelected = list.id === selectedId;
          const accent = list.color || T.color.primary;
          return (
            <button
              key={list.id}
              onClick={() => setSelectedId(list.id)}
              style={{
                flexShrink: 0, padding: '8px 16px', borderRadius: 99,
                background: isSelected ? accent : T.color.surface,
                color: isSelected ? '#fff' : T.color.text,
                border: isSelected ? 'none' : `2px solid ${accent}30`,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                boxShadow: T.cardShadow, WebkitTapHighlightColor: 'transparent',
                transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              {list.pinned && <Icon.pin size={12} color={isSelected ? '#fff' : accent} />}
              {list.title}
              {count > 0 && (
                <span style={{
                  minWidth: 20, height: 20, borderRadius: 99, padding: '0 5px',
                  background: isSelected ? 'rgba(255,255,255,0.3)' : accent + '22',
                  color: isSelected ? '#fff' : accent,
                  fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{count}</span>
              )}
            </button>
          );
        })}
        <button
          onClick={handleStartCreate}
          style={{
            flexShrink: 0, width: 36, height: 36, borderRadius: 99,
            background: T.color.surface, border: '1.5px dashed ' + softLine('0.25'),
            color: T.color.textMuted, fontSize: 20, fontWeight: 300, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: T.cardShadow, WebkitTapHighlightColor: 'transparent',
          }}
        >+</button>
      </div>

      {/* New list creation form */}
      {creating && (
        <div style={{ padding: '0 18px 16px' }}>
          <div style={{
            ...glassCard,
            padding: '16px',
          }}>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleConfirmCreate();
                if (e.key === 'Escape') setCreating(false);
              }}
              placeholder="שם הרשימה…"
              style={{
                width: '100%', border: 'none', outline: 'none', background: 'transparent',
                fontSize: 16, fontWeight: 600, color: T.color.text,
                fontFamily: T.fonts.body, marginBottom: 14,
              }}
            />
            <ColorPicker value={newColor} onChange={setNewColor} />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={handleConfirmCreate} style={{
                flex: 1, border: 'none', borderRadius: 99, padding: '11px 0',
                background: newColor, color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.fonts.body,
              }}>צרי רשימה</button>
              <button onClick={() => setCreating(false)} style={{
                border: 'none', borderRadius: 99, padding: '11px 16px',
                background: T.color.surfaceAlt, color: T.color.text,
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: T.fonts.body,
              }}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '0 18px' }}>
        {shoppingLists.length === 0 && !creating && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: T.color.textMuted, fontSize: 15 }}>
            <div style={{ fontFamily: T.fonts.heading, fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12 }}>אין רשימות עדיין</div>
            <button onClick={handleStartCreate} style={{
              border: 'none', borderRadius: 99, padding: '12px 24px',
              background: `linear-gradient(135deg, ${T.color.primary}, ${T.color.heroFrom})`,
              color: T.color.onPrimary,
              boxShadow: `0 4px 14px ${T.color.primary}55`,
              fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.fonts.body,
            }}>+ צרי רשימה ראשונה</button>
          </div>
        )}

        {selectedList && (
          <>
            <ListHeader
              list={selectedList}
              onRename={title => onEditList(selectedList.id, title)}
              onChangeColor={color => onEditList(selectedList.id, selectedList.title, color)}
              onDelete={() => handleDeleteList(selectedList.id)}
              onTogglePin={() => onTogglePinList(selectedList.id)}
            />

            {listItems.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '24px 20px',
                color: T.color.textMuted, fontSize: 14,
              }}>
                הרשימה ריקה — הוסיפי פריטים למטה
              </div>
            )}

            {listItems.length > 0 && (
              <div style={{
                ...glassCard,
                overflow: 'hidden', marginBottom: 10,
                borderInlineStart: `3px solid ${selectedList.color || T.color.primary}`,
              }}>
                {listItems.map((s, i) => (
                  <SwipeRow
                    key={s.id}
                    radius={0}
                    rowBg="rgba(255,255,255,0.95)"
                    onSwipeLeft={{
                      label: s.done ? 'החזר לרשימה' : 'נקנה',
                      icon: <Icon.check size={18} color="#fff" sw={2.6} />,
                      color: '#5bb88a',
                      onTrigger: () => onToggle(s.id),
                    }}
                    onSwipeRight={{
                      label: 'מחיקה',
                      icon: <Icon.trash size={17} color="#fff" sw={2.2} />,
                      color: '#d9667a',
                      onTrigger: () => onDelete([s.id]),
                      leaves: true,
                    }}
                  >
                  <div
                    onPointerDown={e => pressStart(e, s)}
                    onPointerMove={pressMove}
                    onPointerUp={pressEnd}
                    onPointerCancel={pressEnd}
                    onClickCapture={swallowClick}
                    onContextMenu={e => e.preventDefault()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
                      opacity: s.done ? 0.45 : 1, transition: 'opacity .2s',
                      borderBottom: i < listItems.length - 1 ? '1px solid ' + T.color.line : 'none',
                      WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none',
                    } as React.CSSProperties}>
                    <Check checked={s.done} onToggle={() => onToggle(s.id)} color={selectedList.color} />
                    <span
                      onClick={() => onToggle(s.id)}
                      style={{
                        flex: 1, fontSize: 15.5, fontWeight: 500, color: T.color.text,
                        textDecoration: s.done ? 'line-through' : 'none',
                        textDecorationColor: T.color.textMuted, cursor: 'pointer',
                      }}
                    >{s.title}</span>
                    {s.pinned && !s.done && (
                      <button
                        onClick={() => onTogglePinItem(s.id)}
                        aria-label="הסרה מהעמוד הראשי" title="הסרה מהעמוד הראשי"
                        style={{
                          border: 'none', background: 'transparent', cursor: 'pointer',
                          padding: 4, display: 'flex', alignItems: 'center',
                        }}
                      >
                        <Icon.pin size={14} color={selectedList.color || T.color.primary} />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete([s.id])}
                      style={{
                        border: 'none', background: 'transparent', cursor: 'pointer',
                        padding: 6, display: 'flex', alignItems: 'center',
                        opacity: 0.4, WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <Icon.x size={15} color={T.color.textMuted} />
                    </button>
                  </div>
                  </SwipeRow>
                ))}
              </div>
            )}

            {shopLeft > 0 && listItems.some(s => s.done) && (
              <button
                onClick={() => onDelete(listItems.filter(s => s.done).map(s => s.id))}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                  color: T.color.textMuted, fontSize: 13, fontFamily: T.fonts.body,
                  marginBottom: 10,
                }}
              >
                נקי פריטים שסומנו
              </button>
            )}

            <AddItemRow onAdd={title => onAdd(title, selectedList.id)} />
            {listItems.some(s => !s.done) && (
              <div style={{ textAlign: 'center', fontSize: 12, color: T.color.textMuted, marginTop: 12 }}>
                לחיצה ארוכה על פריט · הצגה בעמוד הראשי
              </div>
            )}
          </>
        )}
      </div>

      <BottomSheet open={!!menuItem} onClose={() => setMenuItem(null)} title={menuItem?.title ?? ''} compact>
        {menuItem && (() => {
          const cur = shopping.find(x => x.id === menuItem.id) ?? menuItem;
          const row = (icon: React.ReactNode, label: string, onClick: () => void, color: string = T.color.text) => (
            <button onClick={() => { onClick(); setMenuItem(null); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              border: 'none', background: 'transparent', cursor: 'pointer',
              padding: '13px 4px', fontSize: 15.5, fontWeight: 600, color,
              fontFamily: T.fonts.body, textAlign: 'right',
            }}>{icon}{label}</button>
          );
          return (
            <div>
              {!cur.done && row(
                <Icon.pin size={18} color={T.color.primaryDeep} />,
                cur.pinned ? 'הסרה מהעמוד הראשי' : 'הצגה בעמוד הראשי',
                () => onTogglePinItem(cur.id),
              )}
              {row(
                <Icon.check size={18} color="#5bb88a" sw={2.4} />,
                cur.done ? 'החזרה לרשימה' : 'סימון כנקנה',
                () => onToggle(cur.id),
              )}
              {row(
                <Icon.trash size={18} color="#d9667a" />,
                'מחיקה',
                () => onDelete([cur.id]),
                '#d9667a',
              )}
            </div>
          );
        })()}
      </BottomSheet>
    </div>
  );
}
