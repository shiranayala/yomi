import { useState, useEffect } from 'react';
import type { WeatherIconKey } from './useWeather';

const DEFAULT_LAT  = 32.0853;
const DEFAULT_LON  = 34.7818;
const DEFAULT_NAME = 'תל אביב';
const CACHE_KEY    = 'yomi_detailed_weather_v3';
const CACHE_TTL    = 30 * 60 * 1000; // 30 minutes

export interface DetailedWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  uvIndex: number;
  windSpeed: number;
  windDirection: number;
  label: string;
  icon: WeatherIconKey;
  sunrise: string; // HH:MM
  sunset: string;  // HH:MM
}

export interface MarineData {
  waveHeight: number;
  waveDirection: number;
  seaTemp: number;
  swellPeriod: number; // seconds
}

export interface DetailedWeatherState {
  weather: DetailedWeather | null;
  marine: MarineData | null;
  loading: boolean;
  locating: boolean;
  locationName: string;
  error: string | null;
  fetchedAt: number | null;
}

interface CacheEntry {
  weather: DetailedWeather;
  marine: MarineData | null;
  ts: number;
  lat: number;
  lon: number;
  locationName: string;
}

// ── Helpers ───────────────────────────────────────────────────────

function wmoLabel(code: number): { label: string; icon: WeatherIconKey } {
  if (code === 0)                  return { label: 'בהיר',        icon: 'sun' };
  if (code <= 2)                   return { label: 'בהיר חלקית',  icon: 'cloudSun' };
  if (code === 3)                  return { label: 'מעונן',        icon: 'cloud' };
  if (code <= 48)                  return { label: 'ערפל',         icon: 'fog' };
  if (code <= 57)                  return { label: 'ממטר',         icon: 'cloudRain' };
  if (code <= 67)                  return { label: 'גשם',          icon: 'cloudRain' };
  if (code <= 77)                  return { label: 'שלג',          icon: 'cloudSnow' };
  if (code === 85 || code === 86)  return { label: 'שלג',          icon: 'cloudSnow' };
  if (code <= 82)                  return { label: 'גשם',          icon: 'cloudRain' };
  return                                  { label: 'סופת רעמים',  icon: 'cloudLightning' };
}

export function windDirToHebrew(deg: number): string {
  const dirs = ['צפון', 'צפון-מזרח', 'מזרח', 'דרום-מזרח', 'דרום', 'דרום-מערב', 'מערב', 'צפון-מערב'];
  return dirs[Math.round(deg / 45) % 8];
}

function parseTime(iso: string): string {
  const t = iso.split('T')[1];
  return t ? t.slice(0, 5) : '';
}

function coordsMatch(a: { lat: number; lon: number }, b: { lat: number; lon: number }): boolean {
  return Math.abs(a.lat - b.lat) < 0.05 && Math.abs(a.lon - b.lon) < 0.05;
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (Date.now() - parsed.ts < CACHE_TTL) return parsed;
  } catch {}
  return null;
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=he`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return 'המיקום שלך';
    const j = await res.json();
    return j.city || j.locality || j.principalSubdivision || 'המיקום שלך';
  } catch {
    return 'המיקום שלך';
  }
}

interface LocationResult { lat: number; lon: number; name: string }

function getLocation(): Promise<LocationResult> {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON, name: DEFAULT_NAME });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const isDefault = coordsMatch({ lat, lon }, { lat: DEFAULT_LAT, lon: DEFAULT_LON });
        const name = isDefault ? DEFAULT_NAME : await reverseGeocode(lat, lon);
        resolve({ lat, lon, name });
      },
      () => resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON, name: DEFAULT_NAME }),
      { timeout: 5000, maximumAge: 5 * 60 * 1000 }
    );
  });
}

// ── Hook ──────────────────────────────────────────────────────────

export function useDetailedWeather(): DetailedWeatherState & { refresh: () => void } {
  const [state, setState] = useState<DetailedWeatherState>({
    weather: null, marine: null,
    loading: false, locating: true,
    locationName: DEFAULT_NAME,
    error: null, fetchedAt: null,
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setState(s => ({ ...s, locating: true, error: null }));

    (async () => {
      // Step 1 — resolve location (GPS or default)
      const loc = await getLocation();
      if (cancelled) return;

      // Step 2 — check cache for same location
      const cached = readCache();
      if (cached && tick === 0 && coordsMatch(cached, loc)) {
        setState({
          weather: cached.weather, marine: cached.marine,
          loading: false, locating: false,
          locationName: cached.locationName || loc.name,
          error: null, fetchedAt: cached.ts,
        });
        return;
      }

      // Step 3 — fetch fresh data
      setState(s => ({ ...s, locating: false, loading: true, locationName: loc.name }));

      try {
        const tz = 'Asia/Jerusalem';
        const [weatherRes, marineRes] = await Promise.all([
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}` +
            `&current=temperature_2m,apparent_temperature,relative_humidity_2m,uv_index,wind_speed_10m,wind_direction_10m,weathercode` +
            `&daily=sunrise,sunset&timezone=${tz}`
          ),
          fetch(
            `https://marine-api.open-meteo.com/v1/marine?latitude=${loc.lat}&longitude=${loc.lon}` +
            `&current=wave_height,wave_direction,sea_surface_temperature,swell_wave_period&timezone=${tz}`
          ),
        ]);

        if (cancelled) return;

        let weather: DetailedWeather | null = null;
        let marine: MarineData | null = null;
        let errorMsg: string | null = null;

        if (weatherRes.ok) {
          const j = await weatherRes.json();
          const cur = j.current;
          const { label, icon } = wmoLabel(cur.weathercode ?? 0);
          weather = {
            temp:          Math.round(cur.temperature_2m),
            feelsLike:     Math.round(cur.apparent_temperature),
            humidity:      Math.round(cur.relative_humidity_2m),
            uvIndex:       Math.round(cur.uv_index * 10) / 10,
            windSpeed:     Math.round(cur.wind_speed_10m),
            windDirection: Math.round(cur.wind_direction_10m),
            label, icon,
            sunrise: parseTime(j.daily?.sunrise?.[0] ?? ''),
            sunset:  parseTime(j.daily?.sunset?.[0]  ?? ''),
          };
        } else {
          errorMsg = 'לא ניתן לטעון את נתוני מזג האוויר. נסי שוב מאוחר יותר.';
        }

        if (marineRes.ok) {
          const j = await marineRes.json();
          const cur = j.current;
          marine = {
            waveHeight:    Math.round(cur.wave_height * 10) / 10,
            waveDirection: Math.round(cur.wave_direction),
            seaTemp:       Math.round(cur.sea_surface_temperature),
            swellPeriod:   Math.round(cur.swell_wave_period ?? 0),
          };
        }

        if (cancelled) return;

        const ts = Date.now();
        if (weather) {
          const entry: CacheEntry = { weather, marine, ts, lat: loc.lat, lon: loc.lon, locationName: loc.name };
          localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
        }
        setState({ weather, marine, loading: false, locating: false, locationName: loc.name, error: errorMsg, fetchedAt: ts });
      } catch {
        if (!cancelled) {
          setState(s => ({ ...s, loading: false, locating: false, error: 'אין חיבור לאינטרנט. בדקי את החיבור ונסי שוב.' }));
        }
      }
    })();

    return () => { cancelled = true; };
  }, [tick]); // eslint-disable-line

  return {
    ...state,
    refresh: () => { localStorage.removeItem(CACHE_KEY); setTick(t => t + 1); },
  };
}
