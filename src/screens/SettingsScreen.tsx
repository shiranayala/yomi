import { useState } from 'react';
import { theme, softLine } from '../theme';
import {
  auth, authSignOut, updateProfile,
  verifyBeforeUpdateEmail, sendPasswordResetEmail,
} from '../lib/firebase';
import type { User } from '../lib/firebase';
import type { Category } from '../lib/types';
import type { DateFormat } from '../lib/dateFormat';
import { Icon } from '../icons';
import { NavBtn } from '../components/atoms';

const CAT_PALETTE = [
  '#5b8fc4', '#6aa890', '#d98a6a', '#b585c0', '#d4a23f',
  '#e88080', '#6bbad4', '#7ec880', '#c86090', '#a09820',
  '#d080a0', '#80c0c8', '#c08040', '#8060c8', '#909090',
];

const T = theme;

const inputStyle: React.CSSProperties = {
  flex: 1, border: 'none', outline: 'none', background: 'transparent',
  fontSize: 15, color: T.color.text, fontFamily: T.fonts.body,
  minWidth: 0,
};

function RowDivider() {
  return <div style={{ height: 1, background: softLine('0.07'), marginInlineStart: 18 }} />;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, color: T.color.textMuted,
      padding: '18px 4px 8px', textTransform: 'uppercase', letterSpacing: 0.6,
    }}>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: T.color.surface, borderRadius: T.radius.card,
      boxShadow: T.cardShadow, overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

function CatRow({ cat, onSave, onDelete }: {
  cat: Category;
  onSave: (c: Category) => void;
  onDelete?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(cat.label);
  const [color, setColor] = useState(cat.color);
  const [confirmDel, setConfirmDel] = useState(false);

  const save = () => {
    onSave({ ...cat, label: label.trim() || cat.label, color });
    setEditing(false);
    setConfirmDel(false);
  };

  if (editing) {
    return (
      <div style={{ padding: '12px 18px', borderBottom: '1px solid ' + softLine('0.07') }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ width: 18, height: 18, borderRadius: 99, background: color, flexShrink: 0 }} />
          <input
            autoFocus
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 15, fontWeight: 600, color: T.color.text, fontFamily: T.fonts.body,
              borderBottom: '1.5px solid ' + T.color.primary, paddingBottom: 2,
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {CAT_PALETTE.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{
              width: 26, height: 26, borderRadius: 99, border: color === c ? '3px solid ' + T.color.text : '2px solid transparent',
              background: c, cursor: 'pointer', padding: 0,
              boxShadow: color === c ? '0 0 0 1px ' + c : 'none',
              transition: 'transform .1s', transform: color === c ? 'scale(1.15)' : 'none',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} style={{
            border: 'none', borderRadius: 99, padding: '7px 18px',
            background: `linear-gradient(135deg, ${T.color.primary}, ${T.color.heroFrom})`,
            color: T.color.onPrimary,
            boxShadow: `0 4px 12px ${T.color.primary}55`,
            fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.fonts.body,
          }}>שמור</button>
          <button onClick={() => { setEditing(false); setLabel(cat.label); setColor(cat.color); }} style={{
            border: 'none', borderRadius: 99, padding: '7px 14px',
            background: T.color.surfaceAlt, color: T.color.textMuted,
            fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.fonts.body,
          }}>ביטול</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: '1px solid ' + softLine('0.07') }}>
      <span style={{ width: 14, height: 14, borderRadius: 99, background: cat.color, flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: T.color.text }}>{cat.label}</div>
      {confirmDel ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12.5, color: '#e05c5c', fontWeight: 600 }}>למחוק?</span>
          <button onClick={() => { onDelete?.(); setConfirmDel(false); }} style={{
            border: 'none', cursor: 'pointer', borderRadius: 8, padding: '4px 10px',
            background: '#e05c5c', color: '#fff', fontSize: 12.5, fontWeight: 700, fontFamily: T.fonts.body,
          }}>כן</button>
          <button onClick={() => setConfirmDel(false)} style={{
            border: 'none', cursor: 'pointer', borderRadius: 8, padding: '4px 10px',
            background: T.color.surfaceAlt, color: T.color.text, fontSize: 12.5, fontWeight: 700, fontFamily: T.fonts.body,
          }}>לא</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 7, borderRadius: 8 }}>
            <Icon.edit size={15} color={T.color.textMuted} />
          </button>
          {!cat.builtin && onDelete && (
            <button onClick={() => setConfirmDel(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 7, borderRadius: 8 }}>
              <Icon.trash size={15} color="#e05c5c" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function SettingsScreen({ user, dateFormat, allCategories, onDateFormatChange, onSaveCategory, onAddCategory, onDeleteCategory, onClose, onUserUpdated }: {
  user: User;
  dateFormat: DateFormat;
  allCategories: Record<string, Category>;
  onDateFormatChange: (f: DateFormat) => void;
  onSaveCategory: (cat: Category) => void;
  onAddCategory: (label: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  onClose: () => void;
  onUserUpdated: () => void;
}) {
  const isGoogle = user.providerData.some(p => p.providerId === 'google.com');

  const [name, setName]           = useState(user.displayName ?? '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg]     = useState('');

  const [newEmail, setNewEmail]     = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg]     = useState('');

  const [resetSending, setResetSending] = useState(false);
  const [resetMsg, setResetMsg]     = useState('');

  async function saveName() {
    if (!auth?.currentUser || !name.trim()) return;
    setNameSaving(true); setNameMsg('');
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      onUserUpdated();
      setNameMsg('השם עודכן בהצלחה');
    } catch {
      setNameMsg('שגיאה בעדכון');
    } finally {
      setNameSaving(false);
      setTimeout(() => setNameMsg(''), 3000);
    }
  }

  async function changeEmail() {
    if (!auth?.currentUser || !newEmail.trim()) return;
    setEmailSaving(true); setEmailMsg('');
    try {
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail.trim());
      setEmailMsg(`נשלח מייל אימות ל-${newEmail.trim()}`);
      setNewEmail('');
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? '';
      if (code === 'auth/requires-recent-login') {
        setEmailMsg('נדרשת התחברות מחדש לפני שינוי מייל');
      } else if (code === 'auth/email-already-in-use') {
        setEmailMsg('כתובת המייל כבר בשימוש');
      } else if (code === 'auth/invalid-email') {
        setEmailMsg('כתובת מייל לא תקינה');
      } else {
        setEmailMsg('שגיאה בעדכון');
      }
    } finally {
      setEmailSaving(false);
    }
  }

  async function sendReset() {
    if (!auth || !user.email) return;
    setResetSending(true); setResetMsg('');
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetMsg('נשלח מייל לאיפוס סיסמה');
    } catch {
      setResetMsg('שגיאה בשליחה');
    } finally {
      setResetSending(false);
    }
  }

  async function signOut() {
    if (auth) await authSignOut(auth);
  }

  const DATE_OPTIONS: { value: DateFormat; label: string }[] = [
    { value: 'gregorian', label: 'לועזי' },
    { value: 'hebrew',    label: 'עברי' },
    { value: 'both',      label: 'שניהם' },
  ];

  return (
    <div dir="rtl" style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: T.color.bg, overflowY: 'auto',
      fontFamily: T.fonts.body,
    }}>
      {/* Header */}
      <div style={{ padding: '22px 18px 16px', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 0, right: 18, left: 18, height: 3,
          background: `linear-gradient(90deg, ${T.color.heroFrom} 0%, ${T.color.primaryDeep} 100%)`,
          borderRadius: '0 0 4px 4px', opacity: 0.7,
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 16, flexShrink: 0,
            background: `linear-gradient(135deg, ${T.color.heroFrom} 0%, ${T.color.primaryDeep} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 14px ${T.color.primary}40`,
          }}>
            <Icon.settings size={24} color="#fff" sw={1.6} />
          </div>
          <h1 style={{
            flex: 1, margin: 0, fontFamily: T.fonts.heading, fontWeight: 700,
            fontSize: 30, color: T.color.text, lineHeight: 1.1,
          }}>
            הגדרות
          </h1>
          <NavBtn onClick={onClose}>
            <Icon.chevR size={18} color={T.color.text} />
          </NavBtn>
        </div>
      </div>

      <div style={{ padding: '4px 16px 100px' }}>

        {/* User card */}
        <div style={{
          background: T.color.surface, borderRadius: T.radius.card,
          boxShadow: T.cardShadow, padding: '18px 20px',
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4,
        }}>
          <div style={{
            width: 54, height: 54, borderRadius: 99,
            background: T.color.primarySoft, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: T.color.primaryDeep,
          }}>
            {((user.displayName ?? user.email ?? '?')[0] ?? '?').toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: T.color.text }}>
              {user.displayName || 'משתמשת'}
            </div>
            <div style={{ fontSize: 13.5, color: T.color.textMuted, marginTop: 2 }}>
              {user.email}
            </div>
          </div>
        </div>

        {/* Account section */}
        <SectionLabel>חשבון</SectionLabel>
        <Card>
          {/* Name */}
          <div style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: T.color.textMuted, marginBottom: 6, fontWeight: 600 }}>שם תצוגה</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                placeholder="שם מלא"
                style={inputStyle}
              />
              <button
                onClick={saveName}
                disabled={nameSaving || !name.trim()}
                style={{
                  border: 'none', borderRadius: 99, padding: '7px 14px',
                  background: name.trim() ? T.color.primary : T.color.surfaceAlt,
                  color: name.trim() ? T.color.onPrimary : T.color.textMuted,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  fontFamily: T.fonts.body, flexShrink: 0,
                }}
              >
                {nameSaving ? '...' : 'שמור'}
              </button>
            </div>
            {nameMsg && (
              <div style={{ fontSize: 13, marginTop: 6, color: nameMsg.includes('שגיאה') ? '#e05c5c' : '#33564a' }}>
                {nameMsg}
              </div>
            )}
          </div>

          {isGoogle ? (
            <>
              <RowDivider />
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <div style={{ fontSize: 13.5, color: T.color.textMuted }}>
                  מייל וסיסמה מנוהלים על ידי Google
                </div>
              </div>
            </>
          ) : (
            <>
              <RowDivider />
              {/* Change email */}
              <div style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: 12, color: T.color.textMuted, marginBottom: 6, fontWeight: 600 }}>שינוי מייל</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="כתובת מייל חדשה"
                    style={inputStyle}
                  />
                  <button
                    onClick={changeEmail}
                    disabled={emailSaving || !newEmail.trim()}
                    style={{
                      border: 'none', borderRadius: 99, padding: '7px 14px',
                      background: newEmail.trim() ? T.color.primary : T.color.surfaceAlt,
                      color: newEmail.trim() ? T.color.onPrimary : T.color.textMuted,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      fontFamily: T.fonts.body, flexShrink: 0,
                    }}
                  >
                    {emailSaving ? '...' : 'שנה'}
                  </button>
                </div>
                {emailMsg && (
                  <div style={{ fontSize: 13, marginTop: 6, color: emailMsg.includes('נשלח') ? '#33564a' : '#e05c5c' }}>
                    {emailMsg}
                  </div>
                )}
              </div>

              <RowDivider />
              {/* Reset password */}
              <div style={{ padding: '14px 18px' }}>
                <button
                  onClick={sendReset}
                  disabled={resetSending}
                  style={{
                    border: 'none', background: 'none', cursor: 'pointer',
                    padding: 0, fontFamily: T.fonts.body,
                    fontSize: 15, color: T.color.primary, fontWeight: 600,
                  }}
                >
                  {resetSending ? '...' : 'שלחי לי מייל לאיפוס סיסמה'}
                </button>
                {resetMsg && (
                  <div style={{ fontSize: 13, marginTop: 6, color: '#33564a' }}>{resetMsg}</div>
                )}
              </div>
            </>
          )}
        </Card>

        {/* Display section */}
        <SectionLabel>תצוגה</SectionLabel>
        <Card>
          <div style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 14, color: T.color.text, fontWeight: 600, marginBottom: 12 }}>
              תצוגת תאריך
            </div>
            <div style={{
              display: 'flex', background: T.color.surfaceAlt,
              borderRadius: 99, padding: 4,
            }}>
              {DATE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onDateFormatChange(opt.value)}
                  style={{
                    flex: 1, border: 'none', borderRadius: 99, cursor: 'pointer',
                    padding: '10px 0', fontFamily: T.fonts.body, fontSize: 14, fontWeight: 700,
                    background: dateFormat === opt.value ? T.color.surface : 'transparent',
                    color: dateFormat === opt.value ? T.color.primaryDeep : T.color.textMuted,
                    boxShadow: dateFormat === opt.value ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                    transition: 'all .18s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Categories section */}
        <SectionLabel>קטגוריות</SectionLabel>
        <Card>
          {Object.values(allCategories).map(cat => (
            <CatRow
              key={cat.id}
              cat={cat}
              onSave={onSaveCategory}
              onDelete={!cat.builtin ? () => onDeleteCategory(cat.id) : undefined}
            />
          ))}
          <div style={{ padding: '12px 18px' }}>
            <button
              onClick={() => onAddCategory('קטגוריה חדשה', CAT_PALETTE[Math.floor(Math.random() * CAT_PALETTE.length)])}
              style={{
                border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: 8,
                color: T.color.primary, fontSize: 14, fontWeight: 600, fontFamily: T.fonts.body,
              }}
            >
              <Icon.plus size={16} color={T.color.primary} />
              הוסף קטגוריה
            </button>
          </div>
        </Card>

        {/* Sign out */}
        <div style={{ marginTop: 28 }}>
          <button
            onClick={signOut}
            style={{
              width: '100%', border: '1.5px solid #e05c5c33',
              borderRadius: T.radius.card, padding: '16px 0',
              background: '#fff0f0', cursor: 'pointer',
              fontFamily: T.fonts.body, fontSize: 16, fontWeight: 700,
              color: '#e05c5c',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <Icon.logout size={18} color="#e05c5c" />
            התנתקות
          </button>
        </div>
      </div>
    </div>
  );
}
