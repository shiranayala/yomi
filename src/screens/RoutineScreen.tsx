import { useState, useMemo } from 'react';
import { theme } from '../theme';
import type { Routine, RoutineLog, CalEvent } from '../lib/types';
import {
  ROUTINE_ICONS, getRoutineIcon,
  ROUTINE_TEMPLATES_DAILY,
  DAILY_CUSTOM_ICON_KEYS, WEEKLY_CUSTOM_ICON_KEYS,
  weekStartStr, todayStrLocal,
  type RoutineTemplate,
} from '../lib/routineIcons';
import { PageHeader, glassCardLarge } from '../components/atoms';
import { Icon } from '../icons';

const T = theme;
const DAY_NAMES_SHORT = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const DAY_NAMES_FULL  = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

// ── Helpers ──────────────────────────────────────────────────────────

function dailyCount(routineId: string, logs: RoutineLog[]): number {
  const today = todayStrLocal();
  return logs
    .filter(l => l.routineId === routineId && l.date === today)
    .reduce((s, l) => s + l.count, 0);
}

function weeklyCount(routine: Routine, events: CalEvent[]): number {
  const week = weekStartStr();
  const weekEnd = (() => {
    const [y, m, d] = week.split('-').map(Number);
    const end = new Date(y, m - 1, d);
    end.setDate(end.getDate() + 7);
    return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
  })();
  return events
    .filter(e => e.routineId === routine.id && e.date >= week && e.date < weekEnd)
    .length;
}

const DONE_GRADIENT = 'linear-gradient(135deg, #9e9ea8 0%, #bdbdc7 100%)';

// ── Daily routine block ──────────────────────────────────────────────

function DailyBlock({ routine, count, onTap, onMinus }: {
  routine: Routine; count: number; onTap: () => void; onMinus: () => void;
}) {
  const ic = getRoutineIcon(routine.iconKey);
  const done = count >= routine.target;
  const Icon_ = ic.icon;
  const [pulsing, setPulsing] = useState(false);
  const [popping, setPopping] = useState(0);

  const handleTap = () => {
    if (done) return;
    setPulsing(true);
    setPopping(p => p + 1);
    setTimeout(() => setPulsing(false), 280);
    onTap();
  };

  return (
    <div style={{ position: 'relative', aspectRatio: '1' }}>
      {/* Main tap area */}
      <button
        onClick={handleTap}
        style={{
          position: 'absolute', inset: 0,
          background: done ? DONE_GRADIENT : ic.gradient,
          borderRadius: 18,
          cursor: done ? 'default' : 'pointer',
          border: 'none', color: '#fff',
          boxShadow: done
            ? '0 1px 0 rgba(255,255,255,0.4) inset, 0 4px 10px rgba(0,0,0,0.08)'
            : '0 1px 0 rgba(255,255,255,0.5) inset, 0 4px 14px rgba(155,125,212,0.12), 0 10px 24px rgba(155,125,212,0.10)',
          transform: pulsing ? 'scale(0.94)' : 'scale(1)',
          transition: 'transform .22s cubic-bezier(.34,1.56,.64,1), background .35s',
          overflow: 'hidden',
          WebkitTapHighlightColor: 'transparent',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 5, padding: '10px 6px 28px',
        }}
      >
        <span style={{
          position: 'absolute', top: -14, right: -14, width: 56, height: 56,
          background: 'radial-gradient(circle, rgba(255,255,255,0.5), transparent 70%)',
          pointerEvents: 'none',
        }} />
        {popping > 0 && (
          <span key={popping} style={{
            position: 'absolute', top: 6, insetInlineEnd: 6,
            fontFamily: 'Inter, sans-serif',
            fontSize: 15, fontWeight: 800, color: '#fff',
            textShadow: '0 2px 4px rgba(0,0,0,0.18)',
            animation: 'routinePop 0.8s ease-out forwards',
            pointerEvents: 'none',
          }}>+1</span>
        )}
        <div style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))' }}>
          <Icon_ size={28} sw={2.2} />
        </div>
        <div style={{
          fontSize: 12, fontWeight: 800, color: '#fff', textAlign: 'center',
          textShadow: '0 1px 2px rgba(0,0,0,0.08)', letterSpacing: '-0.2px',
          lineHeight: 1.2, paddingInline: 4,
        }}>
          {routine.title}
        </div>
      </button>

      {/* Bottom: big ✓ when done, dots when in progress */}
      {done ? (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 0 7px', pointerEvents: 'none',
        }}>
          <span style={{
            width: 26, height: 26, borderRadius: 99,
            background: 'rgba(255,255,255,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
          }}>
            <Icon.check size={13} color="#7a7a88" sw={3} />
          </span>
        </div>
      ) : (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          padding: '0 8px 8px', pointerEvents: 'none',
        }}>
          {Array.from({ length: routine.target }).map((_, i) => (
            <span key={i} style={{
              width: i < count ? 14 : 6, height: 4, borderRadius: 99,
              background: i < count ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.30)',
              transition: 'width .25s, background .25s',
              flexShrink: 0,
            }} />
          ))}
        </div>
      )}

      {/* Minus button — bottom-left corner, visible when count > 0 and not done */}
      {count > 0 && !done && (
        <button
          onClick={e => { e.stopPropagation(); onMinus(); }}
          style={{
            position: 'absolute', bottom: 5, insetInlineStart: 5,
            width: 22, height: 22, borderRadius: 99, border: 'none',
            background: 'rgba(0,0,0,0.22)', color: '#fff',
            cursor: 'pointer', fontSize: 16, fontWeight: 700, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}
          aria-label="הפחת"
        >−</button>
      )}
    </div>
  );
}

// ── Weekly routine card ──────────────────────────────────────────────

function WeeklyCard({ routine, count, onSchedule }: {
  routine: Routine;
  count: number;
  onSchedule: () => void;
}) {
  const ic = getRoutineIcon(routine.iconKey);
  const Icon_ = ic.icon;
  const done = count >= routine.target;
  return (
    <div style={{
      position: 'relative',
      background: done ? DONE_GRADIENT : ic.gradient,
      borderRadius: 22,
      padding: '20px 14px 16px',
      color: '#fff',
      boxShadow: done
        ? '0 1px 0 rgba(255,255,255,0.4) inset, 0 4px 10px rgba(0,0,0,0.08)'
        : '0 1px 0 rgba(255,255,255,0.5) inset, 0 6px 18px rgba(155,125,212,0.12), 0 16px 36px rgba(155,125,212,0.12)',
      overflow: 'hidden',
      transition: 'background .35s',
    }}>
      <span style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        background: 'radial-gradient(circle, rgba(255,255,255,0.5), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon_ size={36} sw={2.2} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.2px' }}>
            {routine.title}
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
            marginTop: 1, direction: 'ltr',
          }}>
            {done ? '✓ הושלם' : `${count}/${routine.target} תוזמנו`}
          </div>
        </div>
        {done && (
          <span style={{
            width: 30, height: 30, borderRadius: 99, flexShrink: 0,
            background: 'rgba(255,255,255,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}>
            <Icon.check size={15} color="#7a7a88" sw={3} />
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 14, marginBottom: 14 }}>
        {Array.from({ length: routine.target }).map((_, i) => (
          <span key={i} style={{
            flex: 1, height: 8, borderRadius: 99,
            background: i < count
              ? 'rgba(255,255,255,0.95)'
              : 'rgba(255,255,255,0.25)',
            boxShadow: i < count ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'background .3s',
          }} />
        ))}
      </div>
      <button
        onClick={onSchedule}
        style={{
          width: '100%', border: 'none', cursor: 'pointer', borderRadius: 99,
          padding: '9px 0', fontSize: 13, fontWeight: 700,
          background: 'rgba(255,255,255,0.95)',
          color: done ? '#7a7a88' : ic.solid,
          fontFamily: T.fonts.body,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <Icon.plus size={13} color={done ? '#7a7a88' : ic.solid} sw={2.5} /> תזמני
      </button>
    </div>
  );
}

// ── Frequency stepper ────────────────────────────────────────────────

function Stepper({ value, onChange, min = 1, max = 99 }: {
  value: number; onChange: (n: number) => void; min?: number; max?: number;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(155,125,212,0.08)', borderRadius: 99,
      padding: '6px 8px', width: 'fit-content', margin: '0 auto',
    }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={{
          width: 36, height: 36, borderRadius: 99, border: 'none',
          background: '#fff', color: T.color.primary,
          fontSize: 22, fontWeight: 600, lineHeight: 1,
          cursor: value <= min ? 'default' : 'pointer',
          opacity: value <= min ? 0.4 : 1,
          boxShadow: `0 2px 8px ${T.color.primary}1f`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >−</button>
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 24, fontWeight: 800,
        color: T.color.text, minWidth: 40, textAlign: 'center',
        direction: 'ltr',
      }}>{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{
          width: 36, height: 36, borderRadius: 99, border: 'none',
          background: '#fff', color: T.color.primary,
          fontSize: 22, fontWeight: 600, lineHeight: 1,
          cursor: value >= max ? 'default' : 'pointer',
          opacity: value >= max ? 0.4 : 1,
          boxShadow: `0 2px 8px ${T.color.primary}1f`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >+</button>
    </div>
  );
}

// ── Sheet wrapper ────────────────────────────────────────────────────

function Sheet({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.35)',
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 61,
        background: T.color.surface, borderRadius: '24px 24px 0 0',
        padding: '14px 18px 36px', maxHeight: '88dvh', overflowY: 'auto',
        direction: 'rtl', boxShadow: `0 -8px 32px ${T.color.primary}33`,
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 99,
          background: 'rgba(155,125,212,0.18)', margin: '0 auto 16px',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{
            fontFamily: T.fonts.heading, fontSize: 20, fontWeight: 800,
            letterSpacing: '-0.4px', color: T.color.text,
          }}>{title}</div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.color.textMuted, fontSize: 22, padding: 4, lineHeight: 1,
          }}>✕</button>
        </div>
        {children}
      </div>
    </>
  );
}

// ── ADD DAILY: templates → frequency picker → save  OR  custom form ──

function AddDailyModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (r: Omit<Routine, 'id' | 'createdAt'>) => void;
}) {
  const [picked, setPicked] = useState<RoutineTemplate | null>(null);
  const [target, setTarget] = useState(1);
  const [customMode, setCustomMode] = useState(false);

  // custom state
  const [cTitle, setCTitle] = useState('');
  const [cIcon, setCIcon]   = useState<string>(DAILY_CUSTOM_ICON_KEYS[0]);
  const [cTarget, setCTarget] = useState(1);

  const pickTemplate = (tpl: RoutineTemplate) => {
    setPicked(tpl);
    setTarget(tpl.defaultTarget);
  };

  const confirmTemplate = () => {
    if (!picked) return;
    onCreate({
      title: picked.title,
      iconKey: picked.iconKey,
      colorKey: picked.iconKey,
      kind: 'daily',
      target,
    });
    onClose();
  };

  const confirmCustom = () => {
    const t = cTitle.trim();
    if (!t) return;
    onCreate({
      title: t,
      iconKey: cIcon,
      colorKey: cIcon,
      kind: 'daily',
      target: cTarget,
    });
    onClose();
  };

  // ── Template picker (initial view) ──
  if (!picked && !customMode) {
    return (
      <Sheet onClose={onClose} title="פעולה יומית חדשה">
        <div style={{
          fontSize: 13, color: T.color.textMuted, marginBottom: 14, paddingInlineStart: 2,
        }}>
          בחרי פעולה יומית חדשה
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
        }}>
          {ROUTINE_TEMPLATES_DAILY.map(tpl => {
            const ic = getRoutineIcon(tpl.iconKey);
            const Icon_ = ic.icon;
            return (
              <button
                key={tpl.iconKey}
                onClick={() => pickTemplate(tpl)}
                style={{
                  position: 'relative',
                  background: ic.gradient, borderRadius: 18,
                  padding: '18px 6px 12px', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 6px 14px rgba(155,125,212,0.12)',
                  WebkitTapHighlightColor: 'transparent',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  overflow: 'hidden',
                }}
              >
                <span style={{
                  position: 'absolute', top: -15, right: -15, width: 60, height: 60,
                  background: 'radial-gradient(circle, rgba(255,255,255,0.5), transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <Icon_ size={40} sw={2.2} />
                <div style={{
                  fontSize: 13, fontWeight: 700, marginTop: 8,
                  textShadow: '0 1px 2px rgba(0,0,0,0.08)',
                  lineHeight: 1.2, textAlign: 'center',
                }}>{tpl.title}</div>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setCustomMode(true)}
          style={{
            width: '100%', border: 'none', cursor: 'pointer',
            background: 'transparent', color: T.color.primary,
            fontSize: 14, fontWeight: 700, fontFamily: T.fonts.body,
            padding: '20px 0 4px',
          }}
        >
          ✨ צרי פעולה משלך
        </button>
      </Sheet>
    );
  }

  // ── Configure picked template (frequency) ──
  if (picked && !customMode) {
    const ic = getRoutineIcon(picked.iconKey);
    const Icon_ = ic.icon;
    return (
      <Sheet onClose={onClose} title="כמה פעמים ביום?">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: ic.gradient, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(155,125,212,0.18)',
          }}>
            <Icon_ size={36} sw={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: T.color.textMuted }}>פעולה</div>
            <div style={{
              fontFamily: T.fonts.heading, fontSize: 20, fontWeight: 800,
              letterSpacing: '-0.4px', color: T.color.text,
            }}>{picked.title}</div>
          </div>
        </div>

        <Stepper value={target} onChange={setTarget} />

        <div style={{
          textAlign: 'center', fontSize: 13, color: T.color.textMuted,
          marginTop: 14, marginBottom: 24,
        }}>
          {target === 1 ? 'פעם אחת ביום' : `${target} פעמים ביום`}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setPicked(null)}
            style={{
              flex: 1, border: 'none', borderRadius: 99, padding: '13px 0',
              background: T.color.surfaceAlt, color: T.color.textMuted,
              fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.fonts.body,
            }}
          >חזרה</button>
          <button
            onClick={confirmTemplate}
            style={{
              flex: 2, border: 'none', borderRadius: 99, padding: '13px 0',
              background: `linear-gradient(135deg, ${T.color.primary}, ${T.color.heroFrom})`,
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 4px 14px ${T.color.primary}55`,
              fontFamily: T.fonts.body,
            }}
          >הוסיפי לשגרה</button>
        </div>
      </Sheet>
    );
  }

  // ── Custom form ──
  return (
    <Sheet onClose={onClose} title="פעולה משלך">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.color.textMuted, paddingInlineStart: 4 }}>שם הפעולה</label>
          <input
            value={cTitle} onChange={e => setCTitle(e.target.value)}
            placeholder="למשל: כתיבה יצירתית"
            style={{
              width: '100%', boxSizing: 'border-box', marginTop: 6,
              border: '1.5px solid rgba(155,125,212,0.18)',
              borderRadius: 14, padding: '12px 14px',
              fontSize: 15, color: T.color.text,
              background: '#fff', outline: 'none',
              fontFamily: T.fonts.body, direction: 'rtl',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.color.textMuted, paddingInlineStart: 4 }}>אייקון</label>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 8, marginTop: 6,
          }}>
            {DAILY_CUSTOM_ICON_KEYS.map(key => {
              const ic = ROUTINE_ICONS[key];
              const Icon_ = ic.icon;
              const isSel = cIcon === key;
              return (
                <button
                  key={key}
                  onClick={() => setCIcon(key)}
                  style={{
                    background: ic.gradient, borderRadius: 14,
                    padding: '12px 0', border: 'none', cursor: 'pointer',
                    color: '#fff', position: 'relative',
                    outline: isSel ? '3px solid ' + T.color.primary : 'none',
                    outlineOffset: 2,
                    display: 'flex', justifyContent: 'center',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 4px 10px rgba(155,125,212,0.1)',
                  }}
                >
                  <Icon_ size={26} sw={2.2} />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.color.textMuted, paddingInlineStart: 4, display: 'block', textAlign: 'center', marginBottom: 10 }}>כמה פעמים ביום</label>
          <Stepper value={cTarget} onChange={setCTarget} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            onClick={() => setCustomMode(false)}
            style={{
              flex: 1, border: 'none', borderRadius: 99, padding: '13px 0',
              background: T.color.surfaceAlt, color: T.color.textMuted,
              fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.fonts.body,
            }}
          >חזרה</button>
          <button
            onClick={confirmCustom}
            disabled={!cTitle.trim()}
            style={{
              flex: 2, border: 'none', borderRadius: 99, padding: '13px 0',
              background: cTitle.trim()
                ? `linear-gradient(135deg, ${T.color.primary}, ${T.color.heroFrom})`
                : T.color.surfaceAlt,
              color: cTitle.trim() ? '#fff' : T.color.textMuted,
              boxShadow: cTitle.trim() ? `0 4px 14px ${T.color.primary}55` : 'none',
              fontSize: 15, fontWeight: 700,
              cursor: cTitle.trim() ? 'pointer' : 'default', fontFamily: T.fonts.body,
            }}
          >צרי פעולה</button>
        </div>
      </div>
    </Sheet>
  );
}

// ── ADD WEEKLY: direct custom form with weekly icons ─────────────────

function AddWeeklyModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (r: Omit<Routine, 'id' | 'createdAt'>) => void;
}) {
  const [title, setTitle]   = useState('');
  const [iconKey, setIconKey] = useState<string>(WEEKLY_CUSTOM_ICON_KEYS[0]);
  const [target, setTarget] = useState(1);

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    onCreate({
      title: t,
      iconKey,
      colorKey: iconKey,
      kind: 'weekly',
      target,
    });
    onClose();
  };

  return (
    <Sheet onClose={onClose} title="מטרה שבועית חדשה">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.color.textMuted, paddingInlineStart: 4 }}>שם המטרה</label>
          <input
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="למשל: חדר כושר, ים, בישול…"
            style={{
              width: '100%', boxSizing: 'border-box', marginTop: 6,
              border: '1.5px solid rgba(155,125,212,0.18)',
              borderRadius: 14, padding: '12px 14px',
              fontSize: 15, color: T.color.text,
              background: '#fff', outline: 'none',
              fontFamily: T.fonts.body, direction: 'rtl',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.color.textMuted, paddingInlineStart: 4 }}>אייקון</label>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 8, marginTop: 6,
          }}>
            {WEEKLY_CUSTOM_ICON_KEYS.map(key => {
              const ic = ROUTINE_ICONS[key];
              const Icon_ = ic.icon;
              const isSel = iconKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setIconKey(key)}
                  style={{
                    background: ic.gradient, borderRadius: 14,
                    padding: '12px 0', border: 'none', cursor: 'pointer',
                    color: '#fff', position: 'relative',
                    outline: isSel ? '3px solid ' + T.color.primary : 'none',
                    outlineOffset: 2,
                    display: 'flex', justifyContent: 'center',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 4px 10px rgba(155,125,212,0.1)',
                  }}
                >
                  <Icon_ size={26} sw={2.2} />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.color.textMuted, paddingInlineStart: 4, display: 'block', textAlign: 'center', marginBottom: 10 }}>כמה פעמים בשבוע</label>
          <Stepper value={target} onChange={setTarget} max={7} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, border: 'none', borderRadius: 99, padding: '13px 0',
              background: T.color.surfaceAlt, color: T.color.textMuted,
              fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.fonts.body,
            }}
          >ביטול</button>
          <button
            onClick={submit}
            disabled={!title.trim()}
            style={{
              flex: 2, border: 'none', borderRadius: 99, padding: '13px 0',
              background: title.trim()
                ? `linear-gradient(135deg, ${T.color.primary}, ${T.color.heroFrom})`
                : T.color.surfaceAlt,
              color: title.trim() ? '#fff' : T.color.textMuted,
              boxShadow: title.trim() ? `0 4px 14px ${T.color.primary}55` : 'none',
              fontSize: 15, fontWeight: 700,
              cursor: title.trim() ? 'pointer' : 'default', fontFamily: T.fonts.body,
            }}
          >צרי מטרה</button>
        </div>
      </div>
    </Sheet>
  );
}

// ── Quick scheduler for weekly goal ───────────────────────────────────

function ScheduleModal({ routine, onClose, onSchedule }: {
  routine: Routine;
  onClose: () => void;
  onSchedule: (date: string, time: string) => void;
}) {
  const days = useMemo(() => {
    const ws = weekStartStr();
    const [y, m, d] = ws.split('-').map(Number);
    return Array.from({ length: 7 }).map((_, i) => {
      const dt = new Date(y, m - 1, d + i);
      const today = new Date(); today.setHours(0,0,0,0);
      const isPast = dt < today;
      return {
        date: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`,
        label: DAY_NAMES_SHORT[dt.getDay()],
        fullLabel: DAY_NAMES_FULL[dt.getDay()],
        dayNum: dt.getDate(),
        isPast,
        isToday: dt.getTime() === today.getTime(),
      };
    });
  }, []);

  const [selDate, setSelDate] = useState<string>(days.find(d => !d.isPast)?.date ?? days[0].date);
  const [time, setTime] = useState('09:00');
  const ic = getRoutineIcon(routine.iconKey);
  const Icon_ = ic.icon;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.35)',
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 61,
        background: T.color.surface, borderRadius: '24px 24px 0 0',
        padding: '14px 18px 36px', direction: 'rtl',
        boxShadow: `0 -8px 32px ${T.color.primary}33`,
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 99,
          background: 'rgba(155,125,212,0.18)', margin: '0 auto 16px',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: ic.gradient, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(155,125,212,0.18)',
          }}>
            <Icon_ size={28} sw={2.2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: T.color.textMuted, fontWeight: 600 }}>תזמני</div>
            <div style={{
              fontFamily: T.fonts.heading, fontSize: 19, fontWeight: 800,
              letterSpacing: '-0.4px', color: T.color.text,
            }}>{routine.title}</div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.color.textMuted, fontSize: 22, padding: 4, lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.color.textMuted, marginBottom: 8, paddingInlineStart: 4 }}>
          איזה יום
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 18 }}>
          {days.map(d => {
            const sel = d.date === selDate;
            return (
              <button
                key={d.date}
                onClick={() => !d.isPast && setSelDate(d.date)}
                disabled={d.isPast}
                style={{
                  border: 'none', cursor: d.isPast ? 'default' : 'pointer',
                  borderRadius: 14, padding: '10px 0 8px',
                  background: sel ? `linear-gradient(135deg, ${T.color.primary}, ${T.color.heroFrom})` : 'rgba(155,125,212,0.06)',
                  color: sel ? '#fff' : (d.isPast ? 'rgba(42,36,56,0.3)' : T.color.text),
                  boxShadow: sel ? `0 4px 12px ${T.color.primary}55` : 'none',
                  opacity: d.isPast ? 0.5 : 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700 }}>{d.label}</span>
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 15, fontWeight: 800, direction: 'ltr',
                }}>{d.dayNum}</span>
                {d.isToday && (
                  <span style={{ width: 4, height: 4, borderRadius: 99, background: sel ? '#fff' : T.color.primary }} />
                )}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.color.textMuted, marginBottom: 8, paddingInlineStart: 4 }}>
          באיזו שעה
        </div>
        <input
          type="time" value={time}
          onChange={e => setTime(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            border: '1.5px solid rgba(155,125,212,0.18)',
            borderRadius: 14, padding: '12px 14px',
            fontSize: 17, color: T.color.text,
            background: '#fff', outline: 'none',
            fontFamily: 'Inter, sans-serif',
            direction: 'ltr', textAlign: 'right',
            marginBottom: 20,
          }}
        />

        <button
          onClick={() => { onSchedule(selDate, time); onClose(); }}
          style={{
            width: '100%', border: 'none', borderRadius: 99, padding: '14px 0',
            background: `linear-gradient(135deg, ${T.color.primary}, ${T.color.heroFrom})`,
            color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            fontFamily: T.fonts.body,
            boxShadow: `0 4px 14px ${T.color.primary}55`,
          }}
        >
          תזמני ביומן
        </button>
      </div>
    </>
  );
}

// ── Main screen ───────────────────────────────────────────────────────

export function RoutineScreen({ routines, routineLogs, events, onCreateRoutine, onDeleteRoutine, onLogTap, onScheduleWeekly }: {
  routines: Routine[];
  routineLogs: RoutineLog[];
  events: CalEvent[];
  onCreateRoutine: (r: Omit<Routine, 'id' | 'createdAt'>) => void;
  onDeleteRoutine: (id: string) => void;
  onLogTap: (routineId: string, delta: number) => void;
  onScheduleWeekly: (routine: Routine, date: string, time: string) => void;
}) {
  const [showAddDaily, setShowAddDaily]   = useState(false);
  const [showAddWeekly, setShowAddWeekly] = useState(false);
  const [scheduling, setScheduling] = useState<Routine | null>(null);
  const [editing, setEditing] = useState(false);

  const dailyRoutines  = routines.filter(r => r.kind === 'daily');
  const weeklyRoutines = routines.filter(r => r.kind === 'weekly');

  return (
    <div style={{ paddingBottom: 100 }}>
      <style>{`
        @keyframes routinePop {
          0%   { opacity: 0; transform: translateY(0) scale(0.7); }
          30%  { opacity: 1; transform: translateY(-6px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-28px) scale(1); }
        }
      `}</style>

      <PageHeader
        icon={<Icon.sparkle size={24} color="#fff" sw={2} />}
        title="שגרה"
        sub={routines.length > 0 ? `${routines.length} פעולות שאת רוצה להתמיד בהן` : undefined}
        action={
          <button
            onClick={() => setEditing(e => !e)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, color: editing ? T.color.primary : T.color.textMuted,
              fontFamily: T.fonts.body, padding: '6px 10px',
            }}
          >
            {editing ? 'סיום' : 'עריכה'}
          </button>
        }
      />

      <div style={{ padding: '0 18px' }}>

        {/* ── Daily section ── */}
        <div style={{
          fontFamily: T.fonts.heading, fontSize: 16, fontWeight: 800,
          letterSpacing: '-0.3px', color: T.color.text,
          margin: '8px 4px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 18 }}>🌅</span> שגרה יומית
          {dailyRoutines.length > 0 && (
            <span style={{
              fontSize: 11.5, fontWeight: 700, color: T.color.textMuted,
              background: 'rgba(155,125,212,0.10)',
              borderRadius: 99, padding: '2px 8px',
            }}>
              {dailyRoutines.filter(r => dailyCount(r.id, routineLogs) >= r.target).length}/{dailyRoutines.length}
            </span>
          )}
        </div>

        {dailyRoutines.length === 0 && !editing && (
          <div style={{
            ...glassCardLarge,
            padding: '22px 18px', textAlign: 'center',
            color: T.color.textMuted, fontSize: 14, marginBottom: 14,
          }}>
            עדיין לא הוספת פעולות יומיות. לחצי על "+" כדי להתחיל.
          </div>
        )}

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
          marginBottom: 18,
        }}>
          {dailyRoutines.map(r => (
            <div key={r.id} style={{ position: 'relative' }}>
              <DailyBlock
                routine={r}
                count={dailyCount(r.id, routineLogs)}
                onTap={() => onLogTap(r.id, 1)}
                onMinus={() => onLogTap(r.id, -1)}
              />
              {editing && (
                <button onClick={() => onDeleteRoutine(r.id)} style={{
                  position: 'absolute', top: -6, insetInlineEnd: -6,
                  width: 24, height: 24, borderRadius: 99,
                  background: '#e05c5c', color: '#fff', border: '2px solid #fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, lineHeight: 1,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
                }}>×</button>
              )}
            </div>
          ))}
          <div style={{ aspectRatio: '1' }}>
            <button
              onClick={() => setShowAddDaily(true)}
              style={{
                width: '100%', height: '100%',
                background: 'rgba(255,255,255,0.5)',
                border: '2px dashed rgba(155,125,212,0.32)',
                borderRadius: 18,
                cursor: 'pointer', color: T.color.primary,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all .2s', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon.plus size={30} color={T.color.primary} sw={2.2} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>הוסיפי</span>
            </button>
          </div>
        </div>

        {dailyRoutines.length > 0 && (
          <div style={{
            ...glassCardLarge,
            padding: '14px 16px', marginBottom: 26,
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: T.color.textMuted,
              letterSpacing: '0.3px', marginBottom: 10, paddingInlineStart: 2,
            }}>
              היום
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {dailyRoutines.map(r => {
                const c = dailyCount(r.id, routineLogs);
                const ic = getRoutineIcon(r.iconKey);
                const done = c >= r.target;
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: 99, flexShrink: 0,
                      background: ic.gradient, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(155,125,212,0.18)',
                    }}>
                      <ic.icon size={14} sw={2.4} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: 4,
                      }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: T.color.text }}>
                          {r.title}
                        </span>
                        <span style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 12, fontWeight: 700,
                          color: done ? ic.solid : T.color.textMuted,
                          direction: 'ltr',
                        }}>
                          {done ? '✓ הושלם' : `${c}/${r.target}`}
                        </span>
                      </div>
                      <div style={{
                        height: 6, borderRadius: 99,
                        background: 'rgba(155,125,212,0.10)', overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          width: `${Math.min(100, (c / r.target) * 100)}%`,
                          background: ic.gradient,
                          transition: 'width .4s',
                        }} />
                      </div>
                    </div>
                    {c > 0 && (
                      <button
                        onClick={() => onLogTap(r.id, -1)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: T.color.textMuted, fontSize: 16, lineHeight: 1,
                          padding: '4px 6px', flexShrink: 0,
                        }}
                        aria-label="הפחת"
                      >−</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Weekly section ── */}
        <div style={{
          fontFamily: T.fonts.heading, fontSize: 16, fontWeight: 800,
          letterSpacing: '-0.3px', color: T.color.text,
          margin: '8px 4px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 18 }}>🎯</span> מטרות שבועיות
          {weeklyRoutines.length > 0 && (
            <span style={{
              fontSize: 11.5, fontWeight: 700, color: T.color.textMuted,
              background: 'rgba(155,125,212,0.10)',
              borderRadius: 99, padding: '2px 8px',
            }}>
              {weeklyRoutines.filter(r => weeklyCount(r, events) >= r.target).length}/{weeklyRoutines.length}
            </span>
          )}
        </div>

        {weeklyRoutines.length === 0 && !editing && (
          <div style={{
            ...glassCardLarge,
            padding: '22px 18px', textAlign: 'center',
            color: T.color.textMuted, fontSize: 14, marginBottom: 14,
          }}>
            עדיין לא הוספת מטרות שבועיות. לחצי על "+" כדי להתחיל.
          </div>
        )}

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
          marginBottom: 14,
        }}>
          {weeklyRoutines.map(r => (
            <div key={r.id} style={{ position: 'relative' }}>
              <WeeklyCard
                routine={r}
                count={weeklyCount(r, events)}
                onSchedule={() => setScheduling(r)}
              />
              {editing && (
                <button onClick={() => onDeleteRoutine(r.id)} style={{
                  position: 'absolute', top: -6, insetInlineEnd: -6,
                  width: 24, height: 24, borderRadius: 99,
                  background: '#e05c5c', color: '#fff', border: '2px solid #fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, lineHeight: 1,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
                }}>×</button>
              )}
            </div>
          ))}
          <button
            onClick={() => setShowAddWeekly(true)}
            style={{
              background: 'rgba(255,255,255,0.5)',
              border: '2px dashed rgba(155,125,212,0.32)',
              borderRadius: 18, padding: '20px 10px',
              cursor: 'pointer', color: T.color.primary,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all .2s', WebkitTapHighlightColor: 'transparent',
              minHeight: 140,
            }}
          >
            <Icon.plus size={30} color={T.color.primary} sw={2.2} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>הוסיפי מטרה</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAddDaily && (
        <AddDailyModal
          onClose={() => setShowAddDaily(false)}
          onCreate={onCreateRoutine}
        />
      )}
      {showAddWeekly && (
        <AddWeeklyModal
          onClose={() => setShowAddWeekly(false)}
          onCreate={onCreateRoutine}
        />
      )}
      {scheduling && (
        <ScheduleModal
          routine={scheduling}
          onClose={() => setScheduling(null)}
          onSchedule={(date, time) => onScheduleWeekly(scheduling, date, time)}
        />
      )}
    </div>
  );
}
