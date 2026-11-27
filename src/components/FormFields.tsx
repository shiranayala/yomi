import { useState } from 'react';
import { theme } from '../theme';
import { useCats } from '../lib/CategoriesContext';
import { Icon } from '../icons';
import type { Reminder, Recurrence } from '../lib/types';

const T = theme;

const inputStyle: React.CSSProperties = {
  width: '100%', minWidth: 0, border: '1.5px solid ' + T.color.line,
  borderRadius: T.radius.tile, padding: '11px 14px',
  fontSize: 15, color: T.color.text, background: T.color.bg,
  outline: 'none', fontFamily: T.fonts.body,
  WebkitAppearance: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12.5, fontWeight: 600,
  color: T.color.textMuted, marginBottom: 7,
};

export function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#e05c5c', marginInlineStart: 2 }}>*</span>}</label>
      {children}
    </div>
  );
}

export function TextInput({
  value, onChange, placeholder, multiline,
}: { value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  if (multiline) {
    return (
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={3}
        style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
      />
    );
  }
  return (
    <input
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
    />
  );
}

export function DateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="date" value={value} onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }}
    />
  );
}

export function TimeInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="time" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }}
    />
  );
}

export function Pills<T extends string>({
  options, value, onChange,
}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)} type="button" style={{
            border: active ? `2px solid ${T.color.primary}` : '1.5px solid ' + T.color.line,
            borderRadius: 99, padding: '7px 14px',
            background: active ? T.color.primarySoft : T.color.surface,
            color: active ? T.color.primaryDeep : T.color.text,
            fontSize: 13.5, fontWeight: active ? 700 : 500,
            cursor: 'pointer', fontFamily: T.fonts.body,
            transition: 'all .15s',
          }}>{opt.label}</button>
        );
      })}
    </div>
  );
}

export function CatPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const cats = useCats();
  return (
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
      {Object.values(cats).map(cat => {
        const active = cat.id === value;
        const c = cat.color;
        return (
          <button key={cat.id} onClick={() => onChange(cat.id)} type="button" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 99,
            border: active ? `2px solid ${c}` : '1.5px solid transparent',
            background: active ? c + '26' : T.color.surfaceAlt,
            color: active ? c : T.color.textMuted,
            fontSize: 13, fontWeight: active ? 700 : 500,
            cursor: 'pointer', fontFamily: T.fonts.body,
            boxShadow: active ? `0 0 0 2px ${c}33` : 'none',
            transition: 'all .15s',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: c, flexShrink: 0 }} />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

export const REMINDER_OPTIONS: { value: Reminder; label: string }[] = [
  { value: 'none',  label: 'ללא' },
  { value: '15min', label: '15 דק׳' },
  { value: '1hour', label: 'שעה' },
  { value: '1day',  label: 'יום קודם' },
];

export const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: 'once',      label: 'חד פעמי' },
  { value: 'daily',     label: 'מדי יום' },
  { value: 'weekly',    label: 'מדי שבוע' },
  { value: 'biweekly',  label: 'מדי שבועיים' },
  { value: 'monthly',   label: 'מדי חודש' },
];

export function RecurrencePicker({ value, onChange }: { value: Recurrence; onChange: (v: Recurrence) => void }) {
  const [open, setOpen] = useState(false);
  const label = RECURRENCE_OPTIONS.find(o => o.value === value)?.label ?? 'חד פעמי';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          border: `2px solid ${T.color.primary}`,
          borderRadius: 99, padding: '7px 14px',
          background: T.color.primarySoft, color: T.color.primaryDeep,
          fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
          fontFamily: T.fonts.body, transition: 'all .15s',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {label}
        <span style={{
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform .2s', fontSize: 11, lineHeight: 1,
        }}>▾</span>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', insetInlineStart: 0,
            background: T.color.surface, borderRadius: T.radius.tile,
            boxShadow: T.cardShadow, zIndex: 101, minWidth: 170,
            overflow: 'hidden',
          }}>
            {RECURRENCE_OPTIONS.map(opt => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{
                    width: '100%', border: 'none', cursor: 'pointer',
                    background: active ? T.color.primarySoft : 'transparent',
                    color: active ? T.color.primaryDeep : T.color.text,
                    padding: '11px 16px', fontSize: 14,
                    fontWeight: active ? 700 : 500, fontFamily: T.fonts.body,
                    display: 'flex', alignItems: 'center', gap: 10,
                    textAlign: 'right', direction: 'rtl',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: 99, flexShrink: 0,
                    border: active ? `2px solid ${T.color.primary}` : `2px solid ${T.color.line}`,
                    background: active ? T.color.primary : 'transparent',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {active && <span style={{ width: 6, height: 6, borderRadius: 99, background: '#fff' }} />}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function Divider() {
  return <div style={{ height: 1, background: T.color.line, margin: '4px 0 18px' }} />;
}

// ── Category: one row that opens the choices ─────────────────────────

export function CategorySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const cats = useCats();
  const [open, setOpen] = useState(false);
  const current = cats[value];

  const choice = (id: string, label: string, color: string | null) => {
    const active = id === value;
    return (
      <button key={id || 'none'} type="button" onClick={() => { onChange(id); setOpen(false); }} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 99,
        border: active ? `2px solid ${color ?? T.color.primary}` : '1.5px solid transparent',
        background: active ? (color ?? T.color.primary) + '22' : T.color.surfaceAlt,
        color: active ? (color ?? T.color.primaryDeep) : T.color.textMuted,
        fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: 'pointer', fontFamily: T.fonts.body,
      }}>
        {color
          ? <span style={{ width: 8, height: 8, borderRadius: 99, background: color }} />
          : <span style={{ width: 8, height: 8, borderRadius: 99, border: '1.5px solid ' + T.color.textMuted }} />}
        {label}
      </button>
    );
  };

  return (
    <div>
      <button type="button" onClick={() => setOpen(o => !o)} style={rowButton}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {current
            ? <span style={{ width: 10, height: 10, borderRadius: 99, background: current.color }} />
            : <span style={{ width: 10, height: 10, borderRadius: 99, border: '1.5px solid ' + T.color.textMuted }} />}
          <span style={{ color: current ? T.color.text : T.color.textMuted }}>
            {current ? current.label : 'ללא קטגוריה'}
          </span>
        </span>
        <Chevron open={open} />
      </button>
      {open && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 10 }}>
          {choice('', 'ללא', null)}
          {Object.values(cats).map(c => choice(c.id, c.label, c.color))}
        </div>
      )}
    </div>
  );
}

export const rowButton: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  border: '1.5px solid ' + T.color.line, borderRadius: T.radius.tile,
  padding: '11px 14px', background: T.color.bg, cursor: 'pointer',
  fontSize: 15, fontFamily: T.fonts.body, textAlign: 'right',
};

export function Chevron({ open }: { open: boolean }) {
  return (
    <span style={{ display: 'inline-flex', transform: open ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform .2s' }}>
      <Icon.chevR size={14} color={T.color.textMuted} />
    </span>
  );
}

/** Compact save button that stays at the bottom of the sheet while scrolling. */
export function SaveBar({ valid, onSave, label }: { valid: boolean; onSave: () => void; label: string }) {
  return (
    <div style={{
      // bottom -40 cancels the sheet's bottom padding, which sticky positioning respects
      position: 'sticky', bottom: -40, margin: '8px -20px -40px', padding: '12px 20px 28px',
      background: `linear-gradient(to top, ${T.color.surface} 75%, ${T.color.surface}00)`,
      display: 'flex', justifyContent: 'center',
    }}>
      <button
        onClick={onSave}
        disabled={!valid}
        style={{
          border: 'none', borderRadius: 99, padding: '11px 34px', minWidth: 150,
          background: valid ? T.color.primary : T.color.surfaceAlt,
          color: valid ? T.color.onPrimary : T.color.textMuted,
          fontSize: 15, fontWeight: 700, cursor: valid ? 'pointer' : 'default',
          fontFamily: T.fonts.body,
          boxShadow: valid ? `0 6px 16px ${T.color.primary}40` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}
      >
        <Icon.check size={16} color={valid ? T.color.onPrimary : T.color.textMuted} sw={2.4} />
        {label}
      </button>
    </div>
  );
}
