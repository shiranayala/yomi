import { useEffect } from 'react';
import { theme } from '../theme';

const T = theme;

export interface UndoToastState {
  key: number;
  message: string;
  undo: () => void;
}

/** Small bar above the tab bar: "<message> · בטל". Disappears on its own. */
export function UndoToast({ toast, onDismiss }: { toast: UndoToastState | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [toast?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!toast) return null;

  return (
    <div
      key={toast.key}
      role="status"
      style={{
        position: 'absolute', bottom: 96, left: 16, right: 16, zIndex: 250,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 10px 12px 16px',
        background: 'rgba(42,36,56,0.92)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        color: '#fff', borderRadius: 16,
        boxShadow: '0 10px 30px rgba(42,36,56,0.25)',
        animation: 'yomiToastIn .28s cubic-bezier(.34,1.56,.64,1)',
      }}
    >
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600 }}>{toast.message}</span>
      <button
        onClick={() => { toast.undo(); onDismiss(); }}
        style={{
          border: 'none', background: 'rgba(255,255,255,0.14)', color: '#e6dcff',
          borderRadius: 10, padding: '7px 14px', cursor: 'pointer',
          fontSize: 14, fontWeight: 800, fontFamily: T.fonts.body,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        בטל
      </button>
      <style>{`
        @keyframes yomiToastIn {
          from { opacity: 0; transform: translateY(16px) scale(.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
