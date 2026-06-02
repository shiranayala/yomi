import { theme } from '../theme';
import { Icon } from '../icons';

const T = theme;

export function FAB({ onAddEvent }: { onAddEvent: () => void }) {
  return (
    <button
      onClick={onAddEvent}
      title="הוסף אירוע"
      style={{
        position: 'absolute', bottom: 80, insetInlineEnd: 18,
        width: 52, height: 52, borderRadius: 99, border: 'none',
        background: T.color.primary, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 4px 20px ${T.color.primary}66`,
        zIndex: 99,
        WebkitTapHighlightColor: 'transparent',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
    >
      <Icon.calendar size={22} color={T.color.onPrimary} sw={1.9} />
    </button>
  );
}
