import { Icon } from '../icons';
import { theme } from '../theme';

export type TabId = 'today' | 'tasks' | 'shopping' | 'notes' | 'calendar';

const T = theme;

const TABS: { id: TabId; label: string; icon: (p: { size: number; color: string; sw: number }) => JSX.Element }[] = [
  { id: 'today',    label: 'היום',   icon: Icon.today },
  { id: 'calendar', label: 'יומן',   icon: Icon.calendar },
  { id: 'tasks',    label: 'משימות', icon: Icon.checkCircle },
  { id: 'shopping', label: 'קניות',  icon: Icon.cart },
  { id: 'notes',    label: 'פתקים',  icon: Icon.note },
];

export function TabBar({ tab, setTab }: { tab: TabId; setTab: (t: TabId) => void }) {
  return (
    <div style={{
      flexShrink: 0,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 4px env(safe-area-inset-bottom, 18px)',
      background: T.color.surface,
      borderTop: '1px solid ' + T.color.line,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
    }}>
      {TABS.map(({ id, label, icon: Ic }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)} style={{
            border: 'none', background: 'transparent', cursor: 'pointer', flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: active ? T.color.primary : T.color.textMuted,
            WebkitTapHighlightColor: 'transparent', padding: '4px 0',
          }}>
            <Ic size={22} color={active ? T.color.primary : T.color.textMuted} sw={active ? 2.1 : 1.7} />
            <span style={{
              fontSize: 10.5, fontWeight: active ? 700 : 500,
              fontFamily: T.fonts.body, color: active ? T.color.primary : T.color.textMuted,
            }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
