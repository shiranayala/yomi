import { useState } from 'react';
import { Icon } from '../icons';
import { theme, softLine } from '../theme';
import { useCats } from '../lib/CategoriesContext';

const T = theme;

/**
 * Aurora glass card — shared base for every floating card in the app.
 * Spread first, then add layout/padding overrides:
 *   <div style={{ ...glassCard, padding: '12px 14px' }} />
 */
export const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(18px) saturate(140%)',
  WebkitBackdropFilter: 'blur(18px) saturate(140%)',
  borderRadius: T.radius.tile,
  boxShadow:
    '0 1px 0 rgba(255,255,255,0.65) inset, 0 4px 12px rgba(155,125,212,0.07), 0 12px 26px rgba(155,125,212,0.09)',
  transition: 'transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s',
};

/** Slightly more emphasized variant for big containers (calendar card, settings group) */
export const glassCardLarge: React.CSSProperties = {
  ...glassCard,
  borderRadius: T.radius.card,
  boxShadow:
    '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 14px rgba(155,125,212,0.08), 0 18px 38px rgba(155,125,212,0.10)',
};

export function CatDot({ id, size = 8 }: { id: string; size?: number }) {
  const cats = useCats();
  const c = cats[id]?.color ?? '#9aa39e';
  return (
    <span style={{
      width: size, height: size, borderRadius: 99,
      background: c, flexShrink: 0, display: 'inline-block',
    }} />
  );
}

export function Chip({ id }: { id: string }) {
  const cats = useCats();
  const cat = cats[id];
  const c = cat?.color ?? '#9aa39e';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
      padding: '3px 9px', borderRadius: T.radius.chip,
      background: c + '1a', color: c, fontSize: 12, fontWeight: 700, lineHeight: 1.4,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: c }} />
      {cat?.label ?? ''}
    </span>
  );
}

export function Check({ checked, onToggle, color }: { checked: boolean; onToggle: () => void; color?: string }) {
  const c = color ?? T.color.primary;
  return (
    <button onClick={onToggle} aria-label="סמן" style={{
      width: 24, height: 24, borderRadius: 99, flexShrink: 0, cursor: 'pointer',
      border: checked ? 'none' : '2px solid ' + softLine('0.32'),
      background: checked
        ? `linear-gradient(135deg, ${c} 0%, ${T.color.heroFrom} 130%)`
        : 'transparent',
      boxShadow: checked ? `0 4px 10px ${c}55` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 0,
      transition: 'all .22s cubic-bezier(.34,1.56,.64,1)',
      WebkitTapHighlightColor: 'transparent',
      transform: checked ? 'scale(1.04)' : 'scale(1)',
    }}>
      {checked && <Icon.check size={13} color={T.color.onPrimary} sw={3} />}
    </button>
  );
}

export function ProgressRing({ done, total, size = 50, onDark = true }: { done: number; total: number; size?: number; onDark?: boolean }) {
  const r = (size - 6) / 2, C = 2 * Math.PI * r;
  const pct = total ? done / total : 0;
  const trackColor = onDark ? 'rgba(255,255,255,0.3)' : T.color.surfaceAlt;
  const textColor = onDark ? T.color.onPrimary : T.color.primaryDeep;
  // Stable id so the same ring on the page (Hero) doesn't collide across mounts
  const gradId = `prgrad-${onDark ? 'd' : 'l'}-${size}`;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"  stopColor={onDark ? '#ffffff' : T.color.primary} />
            <stop offset="100%" stopColor={onDark ? '#ffe2cc' : T.color.heroFrom} />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${gradId})`}
          strokeWidth="4" strokeLinecap="round" strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 12, fontWeight: 800, color: textColor, direction: 'ltr',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>{done}/{total}</div>
    </div>
  );
}

export function AddRow({ placeholder, onAdd }: { placeholder: string; onAdd: (v: string) => void }) {
  const [v, setV] = useState('');
  const [focused, setFocused] = useState(false);
  const submit = () => { const t = v.trim(); if (t) { onAdd(t); setV(''); } };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
      background: focused || v ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)',
      backdropFilter: 'blur(14px) saturate(140%)',
      WebkitBackdropFilter: 'blur(14px) saturate(140%)',
      borderRadius: T.radius.tile,
      boxShadow: focused || v
        ? `0 4px 14px ${T.color.primary}1f, 0 10px 28px ${T.color.primary}14`
        : 'none',
      transition: 'background .25s, box-shadow .25s',
    }}>
      <Icon.plus size={18} color={T.color.primary} />
      <input
        value={v}
        onChange={e => setV(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 15, color: T.color.text, fontFamily: T.fonts.body,
        }}
      />
      {v.trim() && (
        <button onClick={submit} style={{
          border: 'none', cursor: 'pointer', borderRadius: 99, padding: '6px 14px',
          background: `linear-gradient(135deg, ${T.color.primary}, ${T.color.heroFrom})`,
          color: T.color.onPrimary, fontSize: 13, fontWeight: 700,
          boxShadow: `0 4px 12px ${T.color.primary}55`,
        }}>הוסף</button>
      )}
    </div>
  );
}

export function SectionHead({ children, sub, color }: { children: React.ReactNode; sub?: string; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '6px 2px 13px', paddingInlineStart: 8, paddingInlineEnd: 8 }}>
      <h2 style={{
        margin: 0, fontFamily: T.fonts.heading, fontWeight: 800,
        fontSize: Math.round(19 * T.headingScale),
        letterSpacing: '-0.4px',
        color: color ?? T.color.text, lineHeight: 1.15,
      }}>{children}</h2>
      {sub && (
        <span style={{
          fontSize: 11.5, fontWeight: 600,
          color: color ?? T.color.textMuted, paddingBottom: 1,
        }}>{sub}</span>
      )}
    </div>
  );
}

export function PageHeader({ icon, title, titleSub, sub, action }: {
  icon: React.ReactNode;
  title: string;
  titleSub?: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ padding: '22px 18px 16px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Icon badge — glass with gradient stroke */}
        <div style={{
          width: 48, height: 48, borderRadius: 16, flexShrink: 0,
          background: `linear-gradient(135deg, ${T.color.primary} 0%, ${T.color.heroFrom} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 14px ${T.color.primary}40, 0 12px 28px ${T.color.primary}24`,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            margin: 0, fontFamily: T.fonts.heading, fontWeight: 800,
            fontSize: Math.round(26 * T.headingScale),
            letterSpacing: '-0.6px',
            background: `linear-gradient(120deg, ${T.color.primaryDeep} 0%, ${T.color.heroFrom} 100%)`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent', color: 'transparent',
            lineHeight: 1.05,
          }}>{title}</h1>
          {titleSub && (
            <div style={{ fontSize: 12, color: T.color.textMuted, marginTop: 2 }}>{titleSub}</div>
          )}
          {sub && (
            <div style={{ fontSize: 12.5, color: T.color.textMuted, marginTop: 2 }}>{sub}</div>
          )}
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
    </div>
  );
}

export function NavBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 12,
      border: 'none',
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(14px) saturate(140%)',
      WebkitBackdropFilter: 'blur(14px) saturate(140%)',
      boxShadow: `0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 12px ${T.color.primary}20`,
      color: T.color.primaryDeep,
      cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', WebkitTapHighlightColor: 'transparent',
      transition: 'transform .2s',
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >{children}</button>
  );
}
