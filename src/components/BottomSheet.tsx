import { useEffect } from 'react';
import { theme } from '../theme';
import { Icon } from '../icons';
import { useSheetDrag } from '../lib/useSheetDrag';

const T = theme;

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** short menus: size to content instead of half the screen */
  compact?: boolean;
}

export function BottomSheet({ open, onClose, title, children, compact }: Props) {
  const drag = useSheetDrag(onClose, open);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      alignItems: 'center',
    }}>
      {/* Backdrop */}
      <div
        onClick={drag.close}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          animation: 'fadeIn 0.2s ease',
          opacity: drag.backdropOpacity,
          transition: drag.backdropTransition,
        }}
      />

      {/* Sheet */}
      <div ref={drag.sheetRef} style={{
        position: 'relative', width: '100%', maxWidth: 480,
        maxHeight: '92dvh', minHeight: compact ? undefined : '50dvh',
        background: T.color.surface,
        borderRadius: '24px 24px 0 0',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
        transform: `translateY(${drag.offset})`,
        transition: drag.transition,
        zIndex: 1,
      }}>
        {/* Drag handle */}
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: drag.dragging ? 48 : 40, height: 5, borderRadius: 99,
            background: drag.dragging ? T.color.textMuted : 'rgba(155,125,212,0.30)',
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
          <button onClick={drag.close} aria-label="סגירה" style={{
            width: 32, height: 32, borderRadius: 99, border: 'none',
            background: T.color.surfaceAlt, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
          }}>
            <Icon.x size={16} color={T.color.textMuted} />
          </button>
        </div>

        {/* Scrollable content */}
        <div ref={drag.scrollRef} style={{
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
