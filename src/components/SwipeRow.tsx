import { useRef, useState } from 'react';
import { theme } from '../theme';

const T = theme;

export interface SwipeAction {
  label: string;
  icon: React.ReactNode;
  color: string;
  onTrigger: () => void;
  /** The row slides away (delete / move elsewhere) instead of snapping back. */
  leaves?: boolean;
}

const COMMIT_RATIO = 0.32; // share of the row width needed to trigger
const COMMIT_MAX_PX = 110; // …or this many pixels, whichever is smaller

function vibrate(ms: number) {
  try { navigator.vibrate?.(ms); } catch { /* not supported */ }
}

/**
 * A row that can be dragged sideways to reveal an action.
 * onSwipeLeft fires when the finger moves left, onSwipeRight when it moves right.
 * Vertical scrolling keeps working (touch-action: pan-y).
 */
export function SwipeRow({ children, onSwipeLeft, onSwipeRight, radius = T.radius.tile, rowBg, listGap = 0 }: {
  children: React.ReactNode;
  onSwipeLeft?: SwipeAction;
  onSwipeRight?: SwipeAction;
  radius?: number;
  /** Background for the moving part while dragging (for rows that are transparent on their own). */
  rowBg?: string;
  /** Gap between rows in the parent flex list, closed together with the row. */
  listGap?: number;
}) {
  const [dx, setDx] = useState(0);
  const [anim, setAnim] = useState(false);
  const [gone, setGone] = useState(false);
  const [height, setHeight] = useState<number | null>(null); // for the collapse after leaving
  const wrap = useRef<HTMLDivElement>(null);
  const g = useRef<{ id: number; x0: number; y0: number; horizontal: boolean | null; armed: boolean } | null>(null);
  const suppressClick = useRef(false);

  const threshold = () => Math.min((wrap.current?.offsetWidth ?? 320) * COMMIT_RATIO, COMMIT_MAX_PX);
  const actionFor = (d: number) => (d < 0 ? onSwipeLeft : d > 0 ? onSwipeRight : undefined);

  function down(e: React.PointerEvent) {
    if (anim || gone || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (!onSwipeLeft && !onSwipeRight) return;
    suppressClick.current = false;
    g.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, horizontal: null, armed: false };
  }

  function move(e: React.PointerEvent) {
    const s = g.current;
    if (!s || s.id !== e.pointerId) return;
    const rawX = e.clientX - s.x0, rawY = e.clientY - s.y0;
    if (s.horizontal === null) {
      if (Math.abs(rawX) < 8 && Math.abs(rawY) < 8) return;
      s.horizontal = Math.abs(rawX) > Math.abs(rawY) * 1.2;
      // Not sideways, or sideways in a direction with no action: leave it to
      // the page (scrolling / swiping between tabs)
      if (!s.horizontal || !actionFor(rawX)) { g.current = null; return; }
      suppressClick.current = true;
      try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    }
    // Resist in a direction with no action
    let d = rawX;
    if (!actionFor(d)) d = d * 0.15;
    const armed = !!actionFor(d) && Math.abs(d) >= threshold();
    if (armed !== s.armed) { s.armed = armed; if (armed) vibrate(10); }
    setDx(d);
  }

  function up(e: React.PointerEvent) {
    const s = g.current;
    if (!s || s.id !== e.pointerId) return;
    g.current = null;
    if (!s.horizontal) return;
    const action = actionFor(dx);
    setAnim(true);
    if (action && Math.abs(dx) >= threshold()) {
      if (action.leaves) {
        const w = wrap.current?.offsetWidth ?? 400;
        setDx(dx < 0 ? -w : w);
        setGone(true);
        // Slide out, then close the gap, then actually remove the item
        setHeight(wrap.current?.offsetHeight ?? 0);
        setTimeout(() => setHeight(0), 200);
        setTimeout(() => action.onTrigger(), 400);
        return;
      }
      action.onTrigger();
    }
    setDx(0);
    setTimeout(() => setAnim(false), 260);
  }

  function cancel() {
    if (!g.current) return;
    g.current = null;
    setAnim(true);
    setDx(0);
    setTimeout(() => setAnim(false), 260);
  }

  const action = actionFor(dx);
  const armed = !!action && Math.abs(dx) >= threshold();
  const revealed = Math.abs(dx);

  return (
    <div
      ref={wrap}
      // Tell the tab swipe which finger directions this row uses
      data-swipe-lock={onSwipeLeft && onSwipeRight ? 'both' : onSwipeLeft ? 'left' : onSwipeRight ? 'right' : undefined}
      style={{
        position: 'relative', touchAction: 'pan-y',
        // Collapse smoothly once the row has slid away
        ...(height !== null ? {
          height, overflow: 'hidden', opacity: height ? 1 : 0,
          marginBottom: height ? undefined : -listGap, // close the list gap too
          transition: 'height .2s ease-in, opacity .2s, margin .2s',
        } : null),
      }}
    >
      {/* Action revealed behind the row */}
      {action && revealed > 2 && (
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          ...(dx < 0 ? { right: 0 } : { left: 0 }),
          width: revealed + radius, // tuck under the row's rounded corner
          borderRadius: radius,
          background: armed ? action.color : `${action.color}55`,
          transition: 'background .15s',
          display: 'flex', alignItems: 'center',
          direction: 'ltr', // so flex-end really means the right edge
          justifyContent: dx < 0 ? 'flex-end' : 'flex-start',
          padding: '0 18px', overflow: 'hidden',
          color: '#fff', fontSize: 13.5, fontWeight: 800, fontFamily: T.fonts.body,
          gap: 6, whiteSpace: 'nowrap',
        }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 6,
            transform: armed ? 'scale(1.12)' : 'scale(0.9)',
            opacity: revealed > 40 ? 1 : revealed / 40,
            transition: 'transform .18s cubic-bezier(.34,1.56,.64,1)',
          }}>
            {action.icon}{action.label}
          </span>
        </div>
      )}

      {/* The row itself */}
      <div
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={cancel}
        onClickCapture={e => {
          if (suppressClick.current) { e.stopPropagation(); e.preventDefault(); suppressClick.current = false; }
        }}
        style={{
          position: 'relative',
          transform: `translateX(${dx}px)`,
          transition: anim ? 'transform .26s cubic-bezier(.2,.8,.2,1)' : 'none',
          background: rowBg && dx !== 0 ? rowBg : undefined,
          borderRadius: rowBg ? radius : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
