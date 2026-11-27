import { Icon } from '../icons';
import { theme } from '../theme';
import { haptic } from '../lib/haptics';

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

export const TAB_ORDER: TabId[] = TABS.map(t => t.id);

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
      position: 'relative',
    }}>
      {/* One indicator that slides to the active tab (RTL: index 0 is on the right) */}
      <div aria-hidden style={{ position: 'absolute', top: 6, bottom: 0, left: 4, right: 4, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: 0, height: 50,
          width: `${100 / TABS.length}%`,
          right: `${(TAB_ORDER.indexOf(tab) * 100) / TABS.length}%`,
          transition: 'right .32s cubic-bezier(.34,1.3,.64,1)',
          display: 'flex', justifyContent: 'center',
        }}>
          <div style={{
            width: 52, height: '100%', borderRadius: 16,
            background: 'rgba(155,125,212,0.13)',
          }} />
        </div>
      </div>
      {TABS.map(({ id, label, icon: Ic }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => { if (!active) { haptic('select'); setTab(id); } }} style={{
            border: 'none', background: 'transparent', cursor: 'pointer', flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: active ? T.color.primaryDeep : T.color.textMuted,
            WebkitTapHighlightColor: 'transparent', padding: '6px 0 2px',
            position: 'relative',
            transition: 'color .2s',
            minWidth: 0,
          }}>
            <span style={{
              display: 'flex',
              transform: active ? 'translateY(-1px) scale(1.12)' : 'none',
              transition: 'transform .3s cubic-bezier(.34,1.56,.64,1)',
            }}>
              <Ic
                size={21}
                color={active ? T.color.primaryDeep : T.color.textMuted}
                sw={active ? 2.2 : 1.7}
              />
            </span>
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
