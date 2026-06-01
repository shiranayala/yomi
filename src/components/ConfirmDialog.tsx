import { theme } from '../theme';

const T = theme;

interface Props {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, message, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
    }}>
      <div onClick={onCancel} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.45)',
      }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 320,
        background: T.color.surface, borderRadius: T.radius.card,
        padding: '24px 20px 20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        zIndex: 1,
      }}>
        <p style={{
          margin: '0 0 20px', fontSize: 16, fontWeight: 500,
          color: T.color.text, textAlign: 'center', lineHeight: 1.5,
        }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, border: '1.5px solid ' + T.color.line,
            borderRadius: 99, padding: '11px 0', background: T.color.surface,
            color: T.color.text, fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: T.fonts.body,
          }}>ביטול</button>
          <button onClick={onConfirm} style={{
            flex: 1, border: 'none', borderRadius: 99,
            padding: '11px 0', background: '#e05c5c',
            color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: T.fonts.body,
          }}>מחק</button>
        </div>
      </div>
    </div>
  );
}
