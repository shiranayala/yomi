import { useState, useEffect } from 'react';

export type WeatherIconKey =
  | 'sun' | 'cloudSun' | 'cloud' | 'cloudRain' | 'cloudSnow' | 'fog' | 'cloudLightning';

export interface WeatherData {
  temp: number;
  label: string;
  icon: WeatherIconKey;
}

const CACHE_KEY = 'yomi_weather_v1';
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

const DEFAULT_LAT = 32.0853;
const DEFAULT_LON = 34.7818;

function wmoToInfo(code: number): { label: string; icon: WeatherIconKey } {
  if (code === 0)           return { label: 'בהיר',          icon: 'sun' };
  if (code <= 2)            return { label: 'בהיר חלקית',    icon: 'cloudSun' };
  if (code === 3)           return { label: 'מעונן',          icon: 'cloud' };
  if (code <= 48)           return { label: 'ערפל',           icon: 'fog' };
  if (code <= 57)           return { label: 'ממטר',           icon: 'cloudRain' };
  if (code <= 67)           return { label: 'גשם',            icon: 'cloudRain' };
  if (code <= 77)           return { label: 'שלג',            icon: 'cloudSnow' };
  if (code === 85 || code === 86) return { label: 'שלג',      icon: 'cloudSnow' };
  if (code <= 82)           return { label: 'גשם',            icon: 'cloudRain' };
  return                           { label: 'סופת רעמים',    icon: 'cloudLightning' };
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weathercode&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather fetch failed');
  const json = await res.json();
  const temp = Math.round(json.current.temperature_2m);
  const code: number = json.current.weathercode;
  const { label, icon } = wmoToInfo(code);
  return { temp, label, icon };
}

function getLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      ()  => resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON }),
      { timeout: 8000 },
    );
  });
}

function readCache(): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL) return data as WeatherData;
  } catch {}
  return null;
}

export function useWeather(): WeatherData | null {
  const [data, setData] = useState<WeatherData | null>(readCache);

  useEffect(() => {
    if (readCache()) return;

    let cancelled = false;
    (async () => {
      try {
        const { lat, lon } = await getLocation();
        const weather = await fetchWeather(lat, lon);
        if (cancelled) return;
        setData(weather);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: weather }));
      } catch {
        // silently fail — widget stays hidden
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return data;
}
