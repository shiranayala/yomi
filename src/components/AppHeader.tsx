import { theme, softLine } from '../theme';
import { monthNames, weather, userName } from '../lib/data';
import { ProgressRing } from './atoms';
import { Icon } from '../icons';

const T = theme;
const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

interface Props {
  done: number;
  total: number;
  onAddTask: () => void;
}

export function AppHeader({ done, total, onAddTask }: Props) {
  const now = new Date();
  const dateLabel = `יום ${DAY_NAMES[now.getDay()]} · ${now.getDate()} ב${monthNames[now.getMonth()]}`;

  return (
    <div style={{
      flexShrink: 0,
      padding: '20px 18px 18px',
      background: `linear-gradient(155deg, ${T.color.heroFrom} 0%, ${T.color.primaryDeep} 90%)`,
      color: T.color.onPrimary,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Right side (RTL): date + greeting */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>{dateLabel}</div>
          <div style={{ fontFamily: T.fonts.hand, fontSize: 40, lineHeight: 1.05, marginTop: 6 }}>
            {T.greeting}, {userName}
          </div>
          <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>מה על הפרק היום?</div>
        </div>

        {/* Left side (RTL): progress ring + add-task button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <ProgressRing done={done} total={total} size={50} onDark />
          <button
            onClick={onAddTask}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              borderRadius: 99, padding: '6px 12px',
              color: T.color.onPrimary, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: T.fonts.body,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon.plus size={13} color={T.color.onPrimary} sw={2.5} />
            משימה
          </button>
        </div>
      </div>

      {/* Weather */}
      <div style={{ marginTop: 18 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(255,255,255,0.16)', borderRadius: 99, padding: '7px 13px',
          fontSize: 13.5, fontWeight: 600,
        }}>
          <Icon.sun size={16} color={T.color.onPrimary} />{weather.temp}° {weather.label}
        </span>
      </div>
    </div>
  );
}
