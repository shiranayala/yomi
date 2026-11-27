import { useEffect, useRef, useState } from 'react';

const CLOSE_PX = 110;       // drag this far down to close…
const CLOSE_VELOCITY = 0.5; // …or flick faster than this (px/ms)
export const SHEET_EXIT_MS = 220;

/**
 * Drag-down-to-close for bottom sheets.
 * Attach `sheetRef` to the sheet and `scrollRef` to the element that scrolls
 * inside it (may be the sheet itself). Dragging works from anywhere on the
 * sheet while that scroller is at the top, like native sheets.
 * Use `close()` for the X button / backdrop so they animate out too.
 */
export function useSheetDrag(onClose: () => void, active = true) {
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closingRef = useRef(false);

  useEffect(() => {
    if (active) { setDy(0); setClosing(false); closingRef.current = false; }
  }, [active]);

  function close() {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    setTimeout(() => onCloseRef.current(), SHEET_EXIT_MS);
  }

  useEffect(() => {
    const el = sheetRef.current;
    if (!active || !el) return;
    let s: { y0: number; t0: number; lastY: number; lastT: number; active: boolean | null } | null = null;
    const scrollTop = () => (scrollRef.current ?? el).scrollTop;

    const start = (e: TouchEvent) => {
      if (closingRef.current || e.touches.length !== 1) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"], [data-no-sheet-drag]')) return;
      if (scrollTop() > 0) return;
      const y = e.touches[0].clientY, t = performance.now();
      s = { y0: y, t0: t, lastY: y, lastT: t, active: null };
    };
    const move = (e: TouchEvent) => {
      if (!s) return;
      const y = e.touches[0].clientY;
      const d = y - s.y0;
      if (s.active === null) {
        if (Math.abs(d) < 6) return;
        // Pulling up means "scroll", not "drag the sheet"
        s.active = d > 0 && scrollTop() <= 0;
        if (!s.active) { s = null; return; }
        setDragging(true);
      }
      e.preventDefault();
      s.lastT = performance.now(); s.lastY = y;
      setDy(Math.max(0, d));
    };
    const end = () => {
      if (!s) return;
      const st = s; s = null;
      if (!st.active) return;
      setDragging(false);
      const d = st.lastY - st.y0;
      const v = d / Math.max(1, st.lastT - st.t0);
      if (d > CLOSE_PX || (d > 30 && v > CLOSE_VELOCITY)) close();
      else setDy(0);
    };

    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
      el.removeEventListener('touchcancel', end);
    };
  }, [active]);

  const h = sheetRef.current?.offsetHeight ?? 600;
  const ease = 'cubic-bezier(0.32,0.72,0,1)';
  return {
    sheetRef, scrollRef, close, dragging,
    /** translateY for the sheet (combine with any transform the sheet already has) */
    offset: closing ? '105%' : `${dy}px`,
    transition: dragging ? 'none' : `transform ${SHEET_EXIT_MS}ms ${ease}`,
    backdropOpacity: closing ? 0 : 1 - Math.min(1, dy / h) * 0.8,
    backdropTransition: dragging ? 'none' : `opacity ${SHEET_EXIT_MS}ms ease`,
  };
}
