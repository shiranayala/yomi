import { useState } from 'react';
import { theme } from '../theme';
import { Icon } from '../icons';

const T = theme;

interface Props {
  onAddTask: () => void;
  onAddEvent: () => void;
}

function FabOption({ icon: Ic, label, onClick, delay }: {
  icon: (p: { size: number; color: string }) => JSX.Element;
  label: string;
  onClick: () => void;
  delay: number;
}) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      border: 'none', background: T.color.surface, cursor: 'pointer',
      borderRadius: 99, padding: '10px 16px 10px 12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      color: T.color.text, fontSize: 15, fontWeight: 600,
      fontFamily: T.fonts.body,
      animation: `fabItemUp 0.22s ${delay}ms cubic-bezier(0.32,0.72,0,1) both`,
      WebkitTapHighlightColor: 'transparent',
    }}>
      <span style={{
        width: 36, height: 36, borderRadius: 99,
        background: T.color.primarySoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Ic size={18} color={T.color.primary} />
      </span>
      {label}
    </button>
  );
}

export function FAB({ onAddTask, onAddEvent }: Props) {
  const [open, setOpen] = useState(false);

  function handleOption(fn: () => void) {
    setOpen(false);
    fn();
  }

  return (
    <>
      {/* Transparent backdrop to close menu */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 98 }}
        />
      )}

      <div style={{
        position: 'absolute', bottom: 80, insetInlineEnd: 18,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10,
        zIndex: 99,
      }}>
        {open && (
          <>
            <FabOption
              icon={Icon.calendar} label="אירוע"
              onClick={() => handleOption(onAddEvent)} delay={0}
            />
            <FabOption
              icon={Icon.checkCircle} label="משימה"
              onClick={() => handleOption(onAddTask)} delay={60}
            />
          </>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: 56, height: 56, borderRadius: 99, border: 'none',
            background: T.color.primary, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 20px ${T.color.primary}66`,
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(0.32,0.72,0,1), box-shadow 0.2s',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Icon.plus size={24} color={T.color.onPrimary} sw={2.2} />
        </button>
      </div>

      <style>{`
        @keyframes fabItemUp {
          from { opacity: 0; transform: translateY(16px) scale(0.9) }
          to   { opacity: 1; transform: translateY(0)   scale(1) }
        }
      `}</style>
    </>
  );
}
