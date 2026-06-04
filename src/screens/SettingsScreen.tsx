import { useState } from 'react';
import { theme, softLine } from '../theme';
import {
  auth, authSignOut, updateProfile,
  verifyBeforeUpdateEmail, sendPasswordResetEmail,
} from '../lib/firebase';
import type { User } from '../lib/firebase';
import type { DateFormat } from '../lib/dateFormat';
import { Icon } from '../icons';
import { NavBtn } from '../components/atoms';

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

export function SettingsScreen({ user, dateFormat, onDateFormatChange, onClose, onUserUpdated }: {
  user: User;
  dateFormat: DateFormat;
  onDateFormatChange: (f: DateFormat) => void;
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
            flex: 1, margin: 0, fontFamily: T.fonts.hand, fontWeight: 400,
            fontSize: 34, color: T.color.text, lineHeight: 1.1,
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
