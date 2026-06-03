import { useState } from 'react';
import { theme } from '../theme';
import {
  auth,
  GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, updateProfile,
} from '../lib/firebase';

const T = theme;

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1.5px solid ' + T.color.line,
  borderRadius: 14, padding: '13px 16px',
  fontSize: 15, color: T.color.text,
  background: T.color.surface, outline: 'none',
  fontFamily: T.fonts.body, direction: 'rtl',
};

function hebrewError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':    return 'המייל או הסיסמה שגויים';
    case 'auth/wrong-password':        return 'סיסמה שגויה';
    case 'auth/email-already-in-use':  return 'כתובת המייל כבר בשימוש';
    case 'auth/weak-password':         return 'הסיסמה חייבת להכיל לפחות 6 תווים';
    case 'auth/invalid-email':         return 'כתובת מייל לא תקינה';
    case 'auth/too-many-requests':     return 'יותר מדי ניסיונות, נסי שוב מאוחר יותר';
    case 'auth/popup-closed-by-user':  return '';
    default:                           return 'שגיאה, נסי שוב';
  }
}

type Mode = 'login' | 'register' | 'reset';

export function AuthScreen() {
  const [mode, setMode]       = useState<Mode>('login');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState('');
  const [loading, setLoading] = useState(false);

  function reset() { setError(''); setInfo(''); }

  async function handleSubmit() {
    if (!auth) return;
    reset();
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else if (mode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
      } else {
        await sendPasswordResetEmail(auth, email.trim());
        setInfo('נשלח מייל לאיפוס סיסמה');
      }
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? '';
      const msg = hebrewError(code);
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!auth) return;
    reset();
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? '';
      const msg = hebrewError(code);
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === 'register';
  const isReset    = mode === 'reset';
  const submitLabel = isReset ? 'שלחי מייל לאיפוס' : (isRegister ? 'הירשמי' : 'התחברי');
  const valid = email.trim().length > 0 && (isReset || password.length >= 1) && (!isRegister || name.trim().length > 0);

  return (
    <div dir="rtl" style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: T.color.bg, fontFamily: T.fonts.body,
      maxWidth: 480, margin: '0 auto',
    }}>
      {/* Header gradient */}
      <div style={{
        padding: '52px 24px 40px',
        background: `linear-gradient(155deg, ${T.color.heroFrom} 0%, ${T.color.primaryDeep} 90%)`,
        color: '#fff', textAlign: 'center',
      }}>
        <div style={{ fontFamily: T.fonts.hand, fontSize: 52, lineHeight: 1, marginBottom: 6 }}>יומי</div>
        <div style={{ fontSize: 15, opacity: 0.88 }}>המתכנן היומי שלך</div>
      </div>

      {/* Card */}
      <div style={{
        flex: 1, background: T.color.bg,
        borderRadius: '26px 26px 0 0', marginTop: -20,
        padding: '28px 24px 40px',
      }}>
        {/* Mode tabs (login / register) */}
        {!isReset && (
          <div style={{
            display: 'flex', background: T.color.surfaceAlt,
            borderRadius: 99, padding: 4, marginBottom: 24,
          }}>
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); reset(); }} style={{
                flex: 1, border: 'none', borderRadius: 99, cursor: 'pointer',
                padding: '10px 0', fontFamily: T.fonts.body, fontSize: 14, fontWeight: 700,
                background: mode === m ? T.color.surface : 'transparent',
                color: mode === m ? T.color.primaryDeep : T.color.textMuted,
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                transition: 'all .18s',
              }}>
                {m === 'login' ? 'התחברות' : 'הרשמה'}
              </button>
            ))}
          </div>
        )}

        {isReset && (
          <div style={{ marginBottom: 20 }}>
            <button onClick={() => { setMode('login'); reset(); }} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: T.color.textMuted, fontSize: 13.5, fontFamily: T.fonts.body,
              padding: 0, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              ← חזרה להתחברות
            </button>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.color.text, marginTop: 10 }}>איפוס סיסמה</div>
          </div>
        )}

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isRegister && (
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="שם מלא"
              style={inputStyle}
            />
          )}
          <input
            type="email"
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="כתובת מייל"
            style={inputStyle}
          />
          {!isReset && (
            <input
              type="password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="סיסמה"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={inputStyle}
            />
          )}
        </div>

        {/* Forgot password */}
        {mode === 'login' && (
          <button onClick={() => { setMode('reset'); reset(); }} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.color.textMuted, fontSize: 13, fontFamily: T.fonts.body,
            padding: '8px 0 0', display: 'block',
          }}>
            שכחת סיסמה?
          </button>
        )}

        {/* Error / info */}
        {error && <div style={{ color: '#e05c5c', fontSize: 13.5, marginTop: 10, textAlign: 'center' }}>{error}</div>}
        {info  && <div style={{ color: '#33564a', fontSize: 13.5, marginTop: 10, textAlign: 'center' }}>{info}</div>}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!valid || loading}
          style={{
            width: '100%', border: 'none', borderRadius: 99, marginTop: 20,
            padding: '14px 0', fontSize: 16, fontWeight: 700, cursor: valid ? 'pointer' : 'default',
            fontFamily: T.fonts.body, transition: 'all .18s',
            background: valid && !loading ? T.color.primary : T.color.surfaceAlt,
            color: valid && !loading ? T.color.onPrimary : T.color.textMuted,
          }}
        >
          {loading ? '...' : submitLabel}
        </button>

        {/* Google sign-in */}
        {!isReset && (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: T.color.line }} />
              <span style={{ fontSize: 13, color: T.color.textMuted }}>או</span>
              <div style={{ flex: 1, height: 1, background: T.color.line }} />
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: '100%', border: '1.5px solid ' + T.color.line,
                borderRadius: 99, padding: '13px 0',
                background: T.color.surface, cursor: 'pointer',
                fontFamily: T.fonts.body, fontSize: 15, fontWeight: 600,
                color: T.color.text, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, transition: 'border-color .15s',
              }}
            >
              {/* Google G */}
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              המשיכי עם Google
            </button>
          </>
        )}

        {/* Switch mode link */}
        {!isReset && (
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: T.color.textMuted }}>
            {isRegister ? 'כבר יש לך חשבון? ' : 'אין לך חשבון עדיין? '}
            <button
              onClick={() => { setMode(isRegister ? 'login' : 'register'); reset(); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: T.color.primary, fontWeight: 700, fontSize: 14,
                fontFamily: T.fonts.body, padding: 0,
              }}
            >
              {isRegister ? 'התחברי כאן' : 'הירשמי כאן'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
