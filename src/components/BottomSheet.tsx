import { useEffect, useRef, useState } from 'react';
import { theme } from '../theme';
import { Icon } from '../icons';

const T = theme;

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** short menus: size to content instead of half the screen */
  compact?: boolean;
}

const CLOSE_PX = 110;       // drag this far down to close…
const CLOSE_VELOCITY = 0.5; // …or flick faster than this (px/ms)
const EXIT_MS = 220;

export function BottomSheet({ open, onClose, title, children, compact }: Props) {
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closingRef = useRef(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setDy(0); setClosing(false); closingRef.current = false;
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /** Slide the sheet down, then tell the parent. */
  function animateClose() {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    setTimeout(() => onCloseRef.current(), EXIT_MS);
  }

  // Drag down to close. Works from the handle / header, and from the content
  // when it is scrolled to the top (like native sheets). Needs a non-passive
  // touchmove so the page doesn't scroll while the sheet follows the finger.
  useEffect(() => {
    const el = sheet.current;
    if (!open || !el) return;
    let s: { y0: number; t0: number; lastY: number; lastT: number; active: boolean | null; fromContent: boolean } | null = null;

    const start = (e: TouchEvent) => {
      if (closingRef.current || e.touches.length !== 1) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"], [data-no-sheet-drag]')) return;
      const fromContent = !!content.current?.contains(target);
      if (fromContent && (content.current?.scrollTop ?? 0) > 0) return;
      const y = e.touches[0].clientY, t = performance.now();
      s = { y0: y, t0: t, lastY: y, lastT: t, active: null, fromContent };
    };
    const move = (e: TouchEvent) => {
      if (!s) return;
      const y = e.touches[0].clientY;
      const d = y - s.y0;
      if (s.active === null) {
        if (Math.abs(d) < 6) return;
        // Pulling up from the content means "scroll", not "drag the sheet"
        s.active = d > 0 && (!s.fromContent || (content.current?.scrollTop ?? 0) <= 0);
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
      if (d > CLOSE_PX || (d > 30 && v > CLOSE_VELOCITY)) animateClose();
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
  }, [open]);

  if (!open) return null;

  const sheetH = sheet.current?.offsetHeight ?? 600;
  const backdropOpacity = closing ? 0 : 1 - Math.min(1, dy / sheetH) * 0.8;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      alignItems: 'center',
    }}>
      {/* Backdrop */}
      <div
        onClick={animateClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          animation: 'fadeIn 0.2s ease',
          opacity: backdropOpacity,
          transition: dragging ? 'none' : `opacity ${EXIT_MS}ms ease`,
        }}
      />

      {/* Sheet */}
      <div ref={sheet} style={{
        position: 'relative', width: '100%', maxWidth: 480,
        maxHeight: '92dvh', minHeight: compact ? undefined : '50dvh',
        background: T.color.surface,
        borderRadius: '24px 24px 0 0',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
        transform: closing ? 'translateY(105%)' : `translateY(${dy}px)`,
        transition: dragging ? 'none' : `transform ${EXIT_MS}ms cubic-bezier(0.32,0.72,0,1)`,
        zIndex: 1,
      }}>
        {/* Drag handle */}
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: dragging ? 48 : 40, height: 4, borderRadius: 99,
            background: dragging ? T.color.textMuted : T.color.surfaceAlt,
            transition: 'width .15s, background .15s',
          }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px 14px',
          borderBottom: '1px solid ' + T.color.line,
        }}>
          <h2 style={{
            margin: 0, fontSize: 18, fontWeight: 700, color: T.color.text,
            fontFamily: T.fonts.heading,
          }}>{title}</h2>
          <button onClick={animateClose} aria-label="סגירה" style={{
            width: 32, height: 32, borderRadius: 99, border: 'none',
            background: T.color.surfaceAlt, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
          }}>
            <Icon.x size={16} color={T.color.textMuted} />
          </button>
        </div>

        {/* Scrollable content */}
        <div ref={content} style={{
          flex: 1, overflowY: 'auto', overscrollBehavior: 'contain',
          padding: compact ? '16px 20px 32px' : '20px 20px 40px',
        }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  );
}
