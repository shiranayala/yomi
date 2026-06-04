import { useState } from 'react';
import { theme } from '../theme';
import { auth, sendEmailVerification, authSignOut } from '../lib/firebase';
import type { User } from '../lib/firebase';

const T = theme;

export function VerifyEmailScreen({ user, onVerified }: {
  user: User;
  onVerified: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function resend() {
    setSending(true); setSent(false); setError('');
    try {
      await sendEmailVerification(user);
      setSent(true);
    } catch {
      setError('שגיאה בשליחה, נסי שוב מאוחר יותר');
    } finally {
      setSending(false);
    }
  }

  async function checkVerified() {
    setChecking(true); setError('');
    try {
      await user.reload();
      if (auth?.currentUser?.emailVerified) {
        onVerified();
      } else {
        setError('המייל טרם אומת — אנא לחצי על הקישור במייל תחילה');
      }
    } catch {
      setError('שגיאה, נסי שוב');
    } finally {
      setChecking(false);
    }
  }

  async function signOut() {
    if (auth) await authSignOut(auth);
  }

  return (
    <div dir="rtl" style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: T.color.bg, fontFamily: T.fonts.body,
      maxWidth: 480, margin: '0 auto',
    }}>
      <div style={{
        padding: '52px 24px 40px',
        background: `linear-gradient(155deg, ${T.color.heroFrom} 0%, ${T.color.primaryDeep} 90%)`,
        color: '#fff', textAlign: 'center',
      }}>
        <div style={{ fontFamily: T.fonts.hand, fontSize: 52, lineHeight: 1, marginBottom: 6 }}>יומי</div>
      </div>

      <div style={{
        flex: 1, background: T.color.bg,
        borderRadius: '26px 26px 0 0', marginTop: -20,
        padding: '40px 24px 40px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        <div style={{
          width: 76, height: 76, borderRadius: 99,
          background: T.color.surfaceAlt,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 38, marginBottom: 24,
        }}>
          ✉️
        </div>

        <div style={{ fontSize: 20, fontWeight: 700, color: T.color.text, marginBottom: 10 }}>
          אמתי את כתובת המייל שלך
        </div>
        <div style={{ fontSize: 14.5, color: T.color.textMuted, lineHeight: 1.65, marginBottom: 20 }}>
          שלחנו מייל אימות לכתובת<br />
          <strong style={{ color: T.color.text }}>{user.email}</strong><br />
          לחצי על הקישור במייל כדי להמשיך
        </div>

        <div style={{
          width: '100%', background: '#fffbeb', borderRadius: 14,
          border: '1px solid #f5d97a', padding: '12px 16px',
          marginBottom: 28, textAlign: 'start',
        }}>
          <div style={{ fontSize: 13.5, color: '#7a5c00', lineHeight: 1.6 }}>
            💡 לא קיבלת את המייל? בדקי בתיקיית <strong>ספאם</strong> או <strong>קידום מכירות</strong>
          </div>
        </div>

        <button
          onClick={checkVerified}
          disabled={checking}
          style={{
            width: '100%', border: 'none', borderRadius: 99, marginBottom: 12,
            padding: '14px 0', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            fontFamily: T.fonts.body,
            background: T.color.primary, color: T.color.onPrimary,
            opacity: checking ? 0.7 : 1,
          }}
        >
          {checking ? '...' : 'אימתתי — כניסה לאפליקציה'}
        </button>

        <button
          onClick={resend}
          disabled={sending}
          style={{
            width: '100%', border: '1.5px solid ' + T.color.line, borderRadius: 99, marginBottom: 20,
            padding: '13px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            fontFamily: T.fonts.body, background: T.color.surface, color: T.color.text,
            opacity: sending ? 0.7 : 1,
          }}
        >
          {sending ? '...' : sent ? '✓ נשלח!' : 'שלחי מייל אימות מחדש'}
        </button>

        {error && (
          <div style={{ color: '#e05c5c', fontSize: 13.5, marginBottom: 16 }}>{error}</div>
        )}

        <button
          onClick={signOut}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.color.textMuted, fontSize: 13.5, fontFamily: T.fonts.body, padding: 0,
          }}
        >
          חזרה — שימוש בחשבון אחר
        </button>
      </div>
    </div>
  );
}
