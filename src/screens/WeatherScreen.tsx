import { theme } from '../theme';
import { Icon } from '../icons';
import { useDetailedWeather, windDirToHebrew } from '../lib/useDetailedWeather';
import type { WeatherIconKey } from '../lib/useWeather';

const T = theme;

const WEATHER_ICONS: Record<WeatherIconKey, (size: number, color: string) => React.ReactNode> = {
  sun:            (s, c) => <Icon.sun            size={s} color={c} />,
  cloudSun:       (s, c) => <Icon.cloudSun       size={s} color={c} />,
  cloud:          (s, c) => <Icon.cloud          size={s} color={c} />,
  cloudRain:      (s, c) => <Icon.cloudRain      size={s} color={c} />,
  cloudSnow:      (s, c) => <Icon.cloudSnow      size={s} color={c} />,
  fog:            (s, c) => <Icon.fog            size={s} color={c} />,
  cloudLightning: (s, c) => <Icon.cloudLightning size={s} color={c} />,
};

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(18px) saturate(140%)',
  WebkitBackdropFilter: 'blur(18px) saturate(140%)',
  borderRadius: T.radius.tile,
  boxShadow: '0 1px 0 rgba(255,255,255,0.65) inset, 0 4px 14px rgba(155,125,212,0.08), 0 12px 26px rgba(155,125,212,0.09)',
};

// ── Bathing status logic ──────────────────────────────────────────

type BathingStatus = 'calm' | 'wavy' | 'rough';
const STATUS_RANK: Record<BathingStatus, number> = { calm: 0, wavy: 1, rough: 2 };

function waveStatus(h: number): BathingStatus {
  if (h < 0.5)  return 'calm';
  if (h <= 1.2) return 'wavy';
  return 'rough';
}

function windStatus(speed: number): BathingStatus {
  if (speed < 15)  return 'calm';
  if (speed <= 25) return 'wavy';
  return 'rough';
}

const UPGRADE: Record<BathingStatus, BathingStatus> = { calm: 'wavy', wavy: 'rough', rough: 'rough' };

function combinedStatus(waveHeight: number, windSpeed: number, swellPeriod: number): BathingStatus {
  const ws = waveStatus(waveHeight);
  const wi = windStatus(windSpeed);
  const base: BathingStatus = STATUS_RANK[ws] >= STATUS_RANK[wi] ? ws : wi;
  return swellPeriod > 10 ? UPGRADE[base] : base;
}

const BATHING_CONFIG: Record<BathingStatus, {
  dot: string; dotBorder: string; textColor: string;
  label: string; guidance: string;
}> = {
  calm:  {
    dot: '#ffffff', dotBorder: '#aaaaaa', textColor: '#2a7a3a',
    label: 'שקט',
    guidance: 'מתאים לשחייה, ים נעים',
  },
  wavy:  {
    dot: '#e53935', dotBorder: '#c62828', textColor: '#b71c1c',
    label: 'גלי',
    guidance: 'להיכנס בזהירות, גלים בינוניים',
  },
  rough: {
    dot: '#1a1a1a', dotBorder: '#000000', textColor: '#1a1a1a',
    label: 'סוער',
    guidance: 'מומלץ להימנע מהים היום',
  },
};

// ── Shared sub-components ─────────────────────────────────────────

function Stat({ label, value, unit, sub }: { label: string; value: string | number; unit?: string; sub?: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '10px 4px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.color.textMuted, marginBottom: 6, letterSpacing: 0.3 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: T.color.text, lineHeight: 1.1 }}>
        {value}
        {unit && (
          <span style={{ fontSize: 12, fontWeight: 600, color: T.color.textMuted, marginInlineStart: 2 }}>
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: T.color.primary, fontWeight: 600, marginTop: 3 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function StatDivider() {
  return <div style={{ width: 1, background: T.color.line, alignSelf: 'stretch', margin: '8px 0' }} />;
}

function WindArrow({ deg }: { deg: number }) {
  return (
    <svg
      width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke={T.color.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: `rotate(${deg}deg)`, display: 'inline-block' }}
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="6 11 12 5 18 11" />
    </svg>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 800, color: T.color.textMuted,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginBottom: 8, paddingInlineStart: 2,
    }}>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: `3px solid ${T.color.primarySoft}`,
        borderTopColor: T.color.primary,
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function SunBlock({ sunrise, sunset }: { sunrise: string; sunset: string }) {
  if (!sunrise && !sunset) return null;
  return (
    <div style={{ ...glass, padding: '16px 20px', marginBottom: 14, display: 'flex', alignItems: 'center' }}>
      {sunrise && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none"
            stroke={T.color.heroFrom} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M4.9 7.4l2.1 2.1M19.1 7.4l-2.1 2.1M2 17h20M5 17a7 7 0 0 1 14 0"/>
            <path d="M9 17l3-3 3 3" strokeWidth={1.5}/>
          </svg>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.color.textMuted, marginBottom: 2 }}>זריחה</div>
            <div style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 20, fontWeight: 800, color: T.color.heroFrom,
              direction: 'ltr', letterSpacing: '-0.5px',
            }}>{sunrise}</div>
          </div>
        </div>
      )}
      {sunrise && sunset && <div style={{ width: 1, background: T.color.line, height: 36, flexShrink: 0 }} />}
      {sunset && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'end' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.color.textMuted, marginBottom: 2 }}>שקיעה</div>
            <div style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 20, fontWeight: 800, color: T.color.primaryDeep,
              direction: 'ltr', letterSpacing: '-0.5px',
            }}>{sunset}</div>
          </div>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none"
            stroke={T.color.primaryDeep} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M4.9 7.4l2.1 2.1M19.1 7.4l-2.1 2.1M2 17h20M5 17a7 7 0 0 1 14 0"/>
            <path d="M9 14l3 3 3-3" strokeWidth={1.5}/>
          </svg>
        </div>
      )}
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────

export function WeatherScreen({ onClose }: { onClose: () => void }) {
  const { weather, marine, loading, locating, locationName, error, fetchedAt, refresh } = useDetailedWeather();

  const fetchedTime = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    : null;

  const bathing = marine && weather
    ? combinedStatus(marine.waveHeight, weather.windSpeed, marine.swellPeriod)
    : null;

  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 4px' }}>
        <div style={{
          ...glass,
          padding: '20px 20px 18px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <button onClick={onClose} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 8px',
                display: 'flex', alignItems: 'center', gap: 4,
                color: T.color.textMuted, fontSize: 13, fontWeight: 600,
                fontFamily: T.fonts.body, WebkitTapHighlightColor: 'transparent',
              }}>
                <Icon.chevR size={15} color={T.color.textMuted} />
                חזרה
              </button>
              <div style={{
                fontFamily: T.fonts.heading, fontWeight: 800,
                fontSize: 26, lineHeight: 1.1, letterSpacing: '-0.5px',
                background: `linear-gradient(120deg, ${T.color.primaryDeep} 0%, ${T.color.heroFrom} 100%)`,
                WebkitBackgroundClip: 'text', backgroundClip: 'text',
                WebkitTextFillColor: 'transparent', color: 'transparent',
              }}>
                מזג אוויר
              </div>
              <div style={{ fontSize: 13, color: T.color.textMuted, fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                {locating ? (
                  <>
                    <Icon.mapPin size={12} color={T.color.primary} />
                    <span style={{ color: T.color.primary }}>מאתר מיקום…</span>
                  </>
                ) : (
                  <>
                    <Icon.mapPin size={12} color={T.color.textMuted} />
                    {locationName}
                  </>
                )}
              </div>
            </div>
            <button onClick={refresh} style={{
              background: 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer',
              padding: '8px', borderRadius: 12, display: 'flex',
              WebkitTapHighlightColor: 'transparent',
              opacity: loading ? 0.4 : 1,
              boxShadow: '0 2px 8px rgba(155,125,212,0.12)',
              marginTop: 28,
            }}>
              <Icon.repeat size={18} color={T.color.primaryDeep} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 16px 0' }}>
        {/* Locating */}
        {locating && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 0 20px', gap: 12 }}>
            <Icon.mapPin size={28} color={T.color.primary} />
            <div style={{ fontSize: 14, fontWeight: 600, color: T.color.textMuted }}>מאתרת מיקום…</div>
          </div>
        )}

        {/* Loading weather after location found */}
        {loading && !locating && !weather && <Spinner />}

        {/* Error */}
        {error && !weather && (
          <div style={{ ...glass, padding: '24px 20px', textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.color.text, marginBottom: 6 }}>
              שגיאה בטעינת הנתונים
            </div>
            <div style={{ fontSize: 13, color: T.color.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
              {error}
            </div>
            <button onClick={refresh} style={{
              background: T.color.primarySoft, border: 'none', cursor: 'pointer',
              borderRadius: 12, padding: '10px 20px',
              fontSize: 14, fontWeight: 700, color: T.color.primaryDeep,
              fontFamily: T.fonts.body, WebkitTapHighlightColor: 'transparent',
            }}>
              נסי שוב
            </button>
          </div>
        )}

        {weather && (
          <>
            {/* ── Main weather card ── */}
            <div style={{ ...glass, padding: '22px 20px 18px', marginBottom: 14 }}>
              {/* Big temp + icon */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 16, marginBottom: 18,
              }}>
                <div>{WEATHER_ICONS[weather.icon](52, T.color.primaryDeep)}</div>
                <div>
                  <div style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 64, fontWeight: 800, lineHeight: 1,
                    background: `linear-gradient(120deg, ${T.color.primaryDeep} 0%, ${T.color.heroFrom} 100%)`,
                    WebkitBackgroundClip: 'text', backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent', color: 'transparent',
                    letterSpacing: '-2px', direction: 'ltr',
                  }}>
                    {weather.temp}°
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.color.primaryDeep, marginTop: 2 }}>
                    {weather.label}
                  </div>
                </div>
              </div>

              <SectionTitle>תנאי אוויר</SectionTitle>
              <div style={{ ...glass, display: 'flex', alignItems: 'stretch' }}>
                <Stat label="תחושה" value={`${weather.feelsLike}°`} />
                <StatDivider />
                <Stat label="לחות" value={weather.humidity} unit="%" />
                <StatDivider />
                <Stat label="UV" value={weather.uvIndex} sub={uvLabel(weather.uvIndex)} />
              </div>

              <div style={{ marginTop: 10 }}>
                <SectionTitle>רוח</SectionTitle>
                <div style={{ ...glass, display: 'flex', alignItems: 'stretch' }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '10px 4px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.color.textMuted, marginBottom: 6, letterSpacing: 0.3 }}>
                      כיוון
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <WindArrow deg={weather.windDirection} />
                      <span style={{ fontSize: 16, fontWeight: 800, color: T.color.text }}>
                        {windDirToHebrew(weather.windDirection)}
                      </span>
                    </div>
                  </div>
                  <StatDivider />
                  <Stat label='מהירות' value={weather.windSpeed} unit='קמ"ש' sub={windSpeedLabel(weather.windSpeed)} />
                </div>
              </div>
            </div>

            {/* ── Sunrise / Sunset ── */}
            {(weather.sunrise || weather.sunset) && (
              <SunBlock sunrise={weather.sunrise} sunset={weather.sunset} />
            )}

            {/* ── Marine card ── */}
            {marine && bathing && (
              <div style={{ ...glass, padding: '20px 20px 16px', marginBottom: 14 }}>
                {/* Header row: title + badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 2 }}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                      stroke={T.color.primaryDeep} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5s2.5 2 5 2 2.5-2 5-2 2.5 1 2.5 1"/>
                      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 1 2.5 1"/>
                      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 1 2.5 1"/>
                    </svg>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.color.primaryDeep }}>מצב הים</span>
                  </div>

                  {/* Bathing badge */}
                  <div style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: '50%',
                      background: BATHING_CONFIG[bathing].dot,
                      border: `2px solid ${BATHING_CONFIG[bathing].dotBorder}`,
                      boxShadow: bathing === 'calm' ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
                      display: 'inline-block', flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 15, fontWeight: 800, color: BATHING_CONFIG[bathing].textColor }}>
                      {BATHING_CONFIG[bathing].label}
                    </span>
                  </div>
                </div>

                {/* Guidance message */}
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: BATHING_CONFIG[bathing].textColor,
                  marginBottom: 4,
                  opacity: 0.85,
                }}>
                  {BATHING_CONFIG[bathing].guidance}
                </div>

                {/* Disclaimer */}
                <div style={{
                  fontSize: 10.5, color: T.color.textMuted, fontWeight: 500,
                  marginBottom: 14, lineHeight: 1.4,
                }}>
                  הערכה בלבד — תמיד יש לציית לדגל המציל בחוף בפועל
                </div>

                {/* Wave stats */}
                <div style={{ ...glass, display: 'flex', alignItems: 'stretch' }}>
                  <Stat label="גובה גלים" value={`${marine.waveHeight} מ'`} sub={waveLabel(marine.waveHeight)} />
                  <StatDivider />
                  <div style={{ flex: 1, textAlign: 'center', padding: '10px 4px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.color.textMuted, marginBottom: 6, letterSpacing: 0.3 }}>
                      כיוון גלים
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <WindArrow deg={marine.waveDirection} />
                      <span style={{ fontSize: 15, fontWeight: 800, color: T.color.text }}>
                        {windDirToHebrew(marine.waveDirection)}
                      </span>
                    </div>
                  </div>
                  <StatDivider />
                  <Stat label="טמפ. מים" value={`${marine.seaTemp}°`} />
                </div>

                {marine.swellPeriod > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ ...glass, display: 'flex', justifyContent: 'center' }}>
                      <Stat label="תקופת גל" value={marine.swellPeriod} unit="שנ'" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {!marine && (
              <div style={{ ...glass, padding: '14px 16px', color: T.color.textMuted, fontSize: 13, textAlign: 'center', marginBottom: 14 }}>
                נתוני הים אינם זמינים כרגע
              </div>
            )}

            {fetchedTime && (
              <div style={{
                textAlign: 'center', fontSize: 11.5, color: T.color.textMuted,
                fontWeight: 500, marginTop: 4,
              }}>
                עודכן בשעה {fetchedTime}{loading ? ' · מרענן…' : ''}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function windSpeedLabel(s: number): string {
  if (s < 15)  return 'קלה';
  if (s <= 25) return 'מתונה';
  return 'חזקה';
}

function uvLabel(uv: number): string {
  if (uv <= 2)  return 'נמוך';
  if (uv <= 5)  return 'בינוני';
  if (uv <= 7)  return 'גבוה';
  if (uv <= 10) return 'גבוה מאוד';
  return 'קיצוני';
}

function waveLabel(h: number): string {
  if (h < 0.3) return 'שקט';
  if (h < 1.0) return 'קל';
  if (h < 2.0) return 'בינוני';
  if (h < 3.5) return 'גבוה';
  return 'סוער';
}
