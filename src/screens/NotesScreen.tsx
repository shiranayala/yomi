import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { theme } from '../theme';
import type { Note, Tag } from '../lib/types';
import { noteColorStyle, colorForKey } from '../lib/tagColors';
import { sortNotes } from '../lib/noteOrder';
import { NavBtn, PageHeader } from '../components/atoms';
import { BottomSheet } from '../components/BottomSheet';
import { Icon } from '../icons';

const T = theme;

const LONG_PRESS_MS = 380;
const MOVE_CANCEL_PX = 8;   // finger moved this much before the long press → it's a scroll
const EDGE_SCROLL_PX = 70;  // auto-scroll zone near the top/bottom while dragging

function vibrate(ms: number) {
  try { navigator.vibrate?.(ms); } catch { /* not supported */ }
}

function NoteCard({ n, tags, lifted, placeholder }: {
  n: Note; tags: Tag[]; lifted?: boolean; placeholder?: boolean;
}) {
  const style = noteColorStyle(n.tags ?? [], tags);
  const noteTags = (n.tags ?? []).map(id => tags.find(t => t.id === id)).filter(Boolean) as Tag[];

  return (
    <div style={{
      background: style.bg,
      borderRadius: T.radius.tile, padding: '14px 14px',
      position: 'relative',
      boxShadow: lifted
        ? '0 1px 0 rgba(255,255,255,0.5) inset, 0 14px 30px rgba(107,91,196,0.22), 0 28px 50px rgba(107,91,196,0.18)'
        : '0 1px 0 rgba(255,255,255,0.5) inset, 0 4px 12px rgba(155,125,212,0.06), 0 12px 26px rgba(155,125,212,0.08)',
      opacity: placeholder ? 0.35 : 1,
      transition: 'box-shadow .2s, opacity .2s',
    }}>
      {n.pinned && (
        <span style={{ position: 'absolute', top: 10, insetInlineEnd: 12, opacity: 0.7 }}>
          <Icon.pin size={13} color={style.text} />
        </span>
      )}
      {n.title && (
        <div style={{
          fontFamily: T.fonts.heading, fontSize: 15, fontWeight: 800,
          letterSpacing: '-0.3px', color: style.text, lineHeight: 1.25,
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

type Gesture = {
  id: string;
  pointerId: number;
  startX: number; startY: number;
  x: number; y: number;
  offsetX: number; offsetY: number; // finger position inside the card
  width: number;
  timer: number;
  active: boolean;   // long press fired
  dragging: boolean; // moved after the long press
  lastTarget: string | null;
  scroller: HTMLElement | null;
};

function findScroller(el: HTMLElement | null): HTMLElement | null {
  while (el) {
    const oy = getComputedStyle(el).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) return el;
    el = el.parentElement;
  }
  return null;
}

export function NotesScreen({ notes, tags, onAdd, onEdit, onDelete, onTogglePin, onReorder }: {
  notes: Note[];
  tags: Tag[];
  onAdd: () => void;
  onEdit: (n: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}) {
  const [filterTagId, setFilterTagId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);   // lifted by long press
  const [dragOrder, setDragOrder] = useState<string[] | null>(null); // live order while dragging
  const [overlay, setOverlay] = useState<{ x: number; y: number; width: number } | null>(null);
  const [menuNote, setMenuNote] = useState<Note | null>(null);

  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);
  const cardEls = useRef(new Map<string, HTMLDivElement>());
  const prevRects = useRef<Map<string, DOMRect> | null>(null);
  const rafRef = useRef(0);
  const dragOrderRef = useRef<string[] | null>(null);

  const sorted = sortNotes(notes);
  const byId = new Map(notes.map(n => [n.id, n]));
  const ordered = dragOrder
    ? dragOrder.map(id => byId.get(id)).filter(Boolean) as Note[]
    : sorted;

  const visible = filterTagId ? ordered.filter(n => n.tags?.includes(filterTagId)) : ordered;
  const colA = visible.filter((_, i) => i % 2 === 0);
  const colB = visible.filter((_, i) => i % 2 === 1);

  // Smoothly slide cards to their new spots after a reorder (FLIP)
  useLayoutEffect(() => {
    const before = prevRects.current;
    if (!before) return;
    prevRects.current = null;
    cardEls.current.forEach((el, id) => {
      const old = before.get(id);
      if (!old) return;
      const now = el.getBoundingClientRect();
      const dx = old.left - now.left, dy = old.top - now.top;
      if (!dx && !dy) return;
      el.style.transition = 'none';
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      void el.offsetHeight;
      el.style.transition = 'transform .24s cubic-bezier(.2,.8,.2,1)';
      el.style.transform = '';
    });
  }, [dragOrder]);

  function captureRects() {
    const m = new Map<string, DOMRect>();
    cardEls.current.forEach((el, id) => m.set(id, el.getBoundingClientRect()));
    prevRects.current = m;
  }

  // Move the dragged note to the spot of the note under the finger
  function hitTest() {
    const g = gesture.current;
    if (!g?.dragging) return;
    const under = document.elementFromPoint(g.x, g.y)?.closest('[data-note-id]') as HTMLElement | null;
    const targetId = under?.dataset.noteId ?? null;
    if (!targetId || targetId === g.id || targetId === g.lastTarget) {
      if (targetId === g.id) g.lastTarget = null;
      return;
    }
    g.lastTarget = targetId;
    const list = dragOrderRef.current ?? sorted.map(n => n.id);
    const dragged = byId.get(g.id), target = byId.get(targetId);
    if (!dragged || !target || dragged.pinned !== target.pinned) return; // keep pinned on top
    const from = list.indexOf(g.id), to = list.indexOf(targetId);
    if (from < 0 || to < 0) return;
    captureRects();
    const next = list.slice();
    next.splice(from, 1);
    next.splice(to, 0, g.id);
    dragOrderRef.current = next;
    setDragOrder(next);
  }

  function autoScrollLoop() {
    const g = gesture.current;
    if (!g?.dragging || !g.scroller) return;
    const r = g.scroller.getBoundingClientRect();
    let dy = 0;
    if (g.y < r.top + EDGE_SCROLL_PX) dy = -Math.ceil((r.top + EDGE_SCROLL_PX - g.y) / 6);
    else if (g.y > r.bottom - EDGE_SCROLL_PX) dy = Math.ceil((g.y - (r.bottom - EDGE_SCROLL_PX)) / 6);
    if (dy) {
      g.scroller.scrollTop += dy;
      hitTest();
    }
    rafRef.current = requestAnimationFrame(autoScrollLoop);
  }

  function endGesture(commit: boolean) {
    const g = gesture.current;
    gesture.current = null;
    cancelAnimationFrame(rafRef.current);
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointercancel', onCancel);
    document.removeEventListener('touchmove', blockScroll);
    if (!g) return;
    clearTimeout(g.timer);
    if (g.active && !g.dragging && commit) {
      const n = byId.get(g.id);
      if (n) setMenuNote(n);
    }
    if (g.dragging && commit && dragOrderRef.current) onReorder(dragOrderRef.current);
    dragOrderRef.current = null;
    setDragOrder(null);
    setPressedId(null);
    setOverlay(null);
  }

  // Stable handler identities for add/removeEventListener
  const handlers = useRef<{ onMove: (e: PointerEvent) => void; onUp: (e: PointerEvent) => void; onCancel: () => void; blockScroll: (e: TouchEvent) => void } | null>(null);
  if (!handlers.current) {
    handlers.current = {
      onMove: e => handlersImpl.current.move(e),
      onUp: e => handlersImpl.current.up(e),
      onCancel: () => handlersImpl.current.cancel(),
      blockScroll: e => { if (gesture.current?.active && e.cancelable) e.preventDefault(); },
    };
  }
  const { onMove, onUp, onCancel, blockScroll } = handlers.current;
  const handlersImpl = useRef({ move: (_e: PointerEvent) => {}, up: (_e: PointerEvent) => {}, cancel: () => {} });
  handlersImpl.current = {
    move: e => {
      const g = gesture.current;
      if (!g || e.pointerId !== g.pointerId) return;
      g.x = e.clientX; g.y = e.clientY;
      const moved = Math.hypot(g.x - g.startX, g.y - g.startY);
      if (!g.active) {
        if (moved > MOVE_CANCEL_PX) endGesture(false); // user is scrolling
        return;
      }
      if (!g.dragging && moved > 6) {
        g.dragging = true;
        rafRef.current = requestAnimationFrame(autoScrollLoop);
      }
      if (g.dragging) {
        setOverlay({ x: g.x - g.offsetX, y: g.y - g.offsetY, width: g.width });
        hitTest();
      }
    },
    up: e => {
      if (gesture.current && e.pointerId === gesture.current.pointerId) endGesture(true);
    },
    cancel: () => endGesture(false),
  };

  useEffect(() => () => endGesture(false), []); // eslint-disable-line react-hooks/exhaustive-deps

  function onCardPointerDown(e: React.PointerEvent<HTMLDivElement>, n: Note) {
    if (e.button !== 0 || gesture.current) return;
    suppressClick.current = false;
    const rect = e.currentTarget.getBoundingClientRect();
    const g: Gesture = {
      id: n.id, pointerId: e.pointerId,
      startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY,
      offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top,
      width: rect.width,
      timer: 0, active: false, dragging: false, lastTarget: null,
      scroller: findScroller(e.currentTarget.parentElement),
    };
    g.timer = window.setTimeout(() => {
      if (gesture.current !== g) return;
      g.active = true;
      suppressClick.current = true;
      vibrate(12);
      setPressedId(n.id);
      setOverlay({ x: rect.left, y: rect.top, width: rect.width });
    }, LONG_PRESS_MS);
    gesture.current = g;
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onCancel);
    document.addEventListener('touchmove', blockScroll, { passive: false });
  }

  function renderCard(n: Note) {
    const isPressed = pressedId === n.id;
    return (
      <div
        key={n.id}
        data-note-id={n.id}
        ref={el => { if (el) cardEls.current.set(n.id, el); else cardEls.current.delete(n.id); }}
        onPointerDown={e => onCardPointerDown(e, n)}
        onClick={() => {
          if (suppressClick.current) { suppressClick.current = false; return; }
          onEdit(n);
        }}
        onContextMenu={e => e.preventDefault()}
        style={{
          marginBottom: 12, cursor: 'pointer',
          userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <NoteCard n={n} tags={tags} placeholder={isPressed} />
      </div>
    );
  }

  const pressedNote = pressedId ? byId.get(pressedId) : undefined;

  return (
    <div style={{ paddingBottom: 100 }}>
      <PageHeader
        icon={<Icon.note size={25} color="#fff" sw={1.8} />}
        title="פתקים"
        sub={notes.length > 0
          ? `${notes.length} פתקים${notes.length > 1 ? ' · לחיצה ארוכה להזזה' : ''}`
          : undefined}
        action={
          <NavBtn onClick={onAdd}>
            <Icon.plus size={18} color={T.color.text} />
          </NavBtn>
        }
      />

      <div style={{ padding: '0 18px' }}>
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
              ? <div style={{ fontFamily: T.fonts.heading, fontSize: 18, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 8 }}>אין פתקים בתגית זו</div>
              : <><div style={{ fontFamily: T.fonts.heading, fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>אין פתקים עדיין</div>לחצי על + כדי להוסיף</>
            }
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>{colA.map(renderCard)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>{colB.map(renderCard)}</div>
          </div>
        )}
      </div>

      {/* The note that follows the finger */}
      {pressedNote && overlay && (
        <div style={{
          position: 'fixed', left: overlay.x, top: overlay.y, width: overlay.width,
          zIndex: 200, pointerEvents: 'none',
          transform: 'scale(1.04) rotate(-1deg)',
          animation: 'yomiLift .18s ease-out',
        }}>
          <NoteCard n={pressedNote} tags={tags} lifted />
          <style>{`@keyframes yomiLift { from { transform: scale(1); } to { transform: scale(1.04) rotate(-1deg); } }`}</style>
        </div>
      )}

      {/* Long-press menu */}
      <BottomSheet
        open={!!menuNote}
        onClose={() => setMenuNote(null)}
        title={menuNote?.title?.trim() || 'פתק'}
        compact
      >
        {menuNote && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <MenuItem icon={<Icon.note size={18} color={T.color.primaryDeep} sw={1.8} />} label="פתיחה"
              onClick={() => { const n = menuNote; setMenuNote(null); onEdit(n); }} />
            <MenuItem icon={<Icon.pin size={18} color={T.color.primaryDeep} />}
              label={menuNote.pinned ? 'ביטול הצמדה' : 'הצמדה למעלה'}
              onClick={() => { onTogglePin(menuNote.id); setMenuNote(null); }} />
            <MenuItem icon={<Icon.x size={18} color="#c4566b" />} label="מחיקה" danger
              onClick={() => { onDelete(menuNote.id); setMenuNote(null); }} />
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
      border: 'none', borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
      background: danger ? '#fbeef1' : T.color.surfaceAlt,
      color: danger ? '#c4566b' : T.color.text,
      fontSize: 15.5, fontWeight: 700, fontFamily: T.fonts.body, textAlign: 'right',
      WebkitTapHighlightColor: 'transparent',
    }}>
      {icon}{label}
    </button>
  );
}
