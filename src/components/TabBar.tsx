import { Icon } from '../icons';
import { theme } from '../theme';

export type TabId = 'today' | 'routine' | 'tasks' | 'shopping' | 'notes' | 'calendar';

const T = theme;

const TABS: { id: TabId; label: string; icon: (p: { size: number; color: string; sw: number }) => JSX.Element }[] = [
  { id: 'today',    label: 'היום',   icon: Icon.today },
  { id: 'routine',  label: 'שגרה',   icon: Icon.sparkle },
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
      alignItems: 'flex-start',
      padding: '10px 4px env(safe-area-inset-bottom, 18px)',
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      borderTop: '1px solid rgba(155,125,212,0.10)',
      boxShadow: '0 -6px 22px rgba(155,125,212,0.08)',
    }}>
      {TABS.map(({ id, label, icon: Ic }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)} style={{
            border: 'none', background: 'transparent', cursor: 'pointer', flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: active ? T.color.primaryDeep : T.color.textMuted,
            WebkitTapHighlightColor: 'transparent', padding: '6px 0 2px',
            position: 'relative',
            transition: 'color .2s',
            minWidth: 0,
          }}>
            {/* Accent line at top when active */}
            {active && (
              <span style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 24, height: 3, borderRadius: 99,
                background: `linear-gradient(90deg, ${T.color.primary}, ${T.color.heroFrom})`,
              }} />
            )}
            <Ic
              size={21}
              color={active ? T.color.primaryDeep : T.color.textMuted}
              sw={active ? 2.2 : 1.7}
            />
            <span style={{
              fontSize: 10, fontWeight: active ? 800 : 600,
              fontFamily: T.fonts.body,
              color: active ? T.color.primaryDeep : T.color.textMuted,
              letterSpacing: '-0.2px',
            }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
