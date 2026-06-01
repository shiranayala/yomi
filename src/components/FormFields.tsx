import { theme, catColor } from '../theme';
import { categories } from '../lib/data';
import type { CatId, Reminder, Recurrence } from '../lib/types';

const T = theme;

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid ' + T.color.line,
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

export function CatPicker({ value, onChange }: { value: CatId; onChange: (v: CatId) => void }) {
  return (
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
      {Object.values(categories).map(cat => {
        const active = cat.id === value;
        const c = catColor(cat.id);
        return (
          <button key={cat.id} onClick={() => onChange(cat.id as CatId)} type="button" style={{
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
  { value: 'once',    label: 'חד פעמי' },
  { value: 'daily',   label: 'כל יום' },
  { value: 'weekly',  label: 'כל שבוע' },
  { value: 'monthly', label: 'כל חודש' },
];

export function Divider() {
  return <div style={{ height: 1, background: T.color.line, margin: '4px 0 18px' }} />;
}
