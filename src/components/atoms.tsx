import { useState } from 'react';
import { Icon } from '../icons';
import { theme, catColor, softLine } from '../theme';
import { categories } from '../lib/data';

const T = theme;

export function CatDot({ id, size = 8 }: { id: string; size?: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: 99,
      background: catColor(id), flexShrink: 0, display: 'inline-block',
    }} />
  );
}

export function Chip({ id }: { id: string }) {
  const c = catColor(id);
  const cat = categories[id];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
      padding: '3px 9px', borderRadius: T.radius.chip,
      background: c + '1f', color: c, fontSize: 12, fontWeight: 600, lineHeight: 1.4,
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
      border: '2px solid ' + (checked ? c : softLine('0.3')),
      background: checked ? c : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 0, transition: 'all .18s ease', WebkitTapHighlightColor: 'transparent',
    }}>
      {checked && <Icon.check size={13} color={T.color.onPrimary} sw={3} />}
    </button>
  );
}

export function ProgressRing({ done, total, size = 50, onDark = true }: { done: number; total: number; size?: number; onDark?: boolean }) {
  const r = (size - 6) / 2, C = 2 * Math.PI * r;
  const pct = total ? done / total : 0;
  const trackColor = onDark ? 'rgba(255,255,255,0.3)' : T.color.surfaceAlt;
  const fillColor = onDark ? T.color.onPrimary : T.color.primary;
  const textColor = onDark ? T.color.onPrimary : T.color.primaryDeep;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={fillColor}
          strokeWidth="4" strokeLinecap="round" strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 12, fontWeight: 700, color: textColor, direction: 'ltr',
      }}>{done}/{total}</div>
    </div>
  );
}

export function AddRow({ placeholder, onAdd }: { placeholder: string; onAdd: (v: string) => void }) {
  const [v, setV] = useState('');
  const submit = () => { const t = v.trim(); if (t) { onAdd(t); setV(''); } };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
      background: T.color.surface, borderRadius: T.radius.tile,
      border: '1px dashed ' + softLine('0.25'),
    }}>
      <Icon.plus size={18} color={T.color.primary} />
      <input
        value={v} onChange={e => setV(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        placeholder={placeholder}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 15, color: T.color.text,
        }}
      />
      {v.trim() && (
        <button onClick={submit} style={{
          border: 'none', cursor: 'pointer', borderRadius: 99, padding: '5px 12px',
          background: T.color.primary, color: T.color.onPrimary, fontSize: 13, fontWeight: 700,
        }}>הוסף</button>
      )}
    </div>
  );
}

export function SectionHead({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, margin: '6px 2px 13px' }}>
      <h2 style={{
        margin: 0, fontFamily: T.fonts.hand, fontWeight: 400,
        fontSize: Math.round(25 * T.headingScale), color: T.color.text, lineHeight: 1.15,
      }}>{children}</h2>
      {sub && (
        <span style={{ fontSize: 12.5, color: T.color.textMuted, paddingBottom: 3 }}>{sub}</span>
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
    <div style={{ padding: '22px 18px 20px', position: 'relative' }}>
      {/* Accent bar */}
      <div style={{
        position: 'absolute', top: 0, right: 18, left: 18, height: 3,
        background: `linear-gradient(90deg, ${T.color.heroFrom} 0%, ${T.color.primaryDeep} 100%)`,
        borderRadius: '0 0 4px 4px', opacity: 0.7,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Icon badge */}
        <div style={{
          width: 50, height: 50, borderRadius: 16, flexShrink: 0,
          background: `linear-gradient(135deg, ${T.color.heroFrom} 0%, ${T.color.primaryDeep} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 14px ${T.color.primary}40`,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            margin: 0, fontFamily: T.fonts.hand, fontWeight: 400,
            fontSize: Math.round(32 * T.headingScale), color: T.color.text, lineHeight: 1.1,
          }}>{title}</h1>
          {titleSub && (
            <div style={{ fontSize: 12, color: T.color.textMuted, marginTop: 1 }}>{titleSub}</div>
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
      border: '1px solid ' + softLine('0.12'),
      background: T.color.surface, boxShadow: T.cardShadow,
      cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', WebkitTapHighlightColor: 'transparent',
    }}>{children}</button>
  );
}
