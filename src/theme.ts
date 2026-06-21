export const theme = {
  fonts: {
    // Unified Heebo across the app. `hand` kept as alias so existing
    // references compile; nothing renders as handwriting anymore.
    hand: '"Heebo", system-ui, sans-serif',
    heading: '"Heebo", system-ui, sans-serif',
    body: '"Heebo", system-ui, sans-serif',
  },
  color: {
    bg: '#fdf5fa',
    surface: '#ffffff',
    surfaceAlt: '#f5edf5',
    text: '#2a2438',
    textMuted: 'rgba(42,36,56,0.55)',
    line: 'rgba(155,125,212,0.12)',
    primary: '#8b7bc8',
    primaryDeep: '#6b5bc4',
    primarySoft: '#ece1f5',
    heroFrom: '#d4956b',
    onPrimary: '#ffffff',
  },
  radius: { card: 24, tile: 18, chip: 999 },
  cardShadow:
    '0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 14px rgba(155,125,212,0.08), 0 14px 32px rgba(155,125,212,0.10)',
  heroStyle: 'block' as const,
  headingScale: 1.0,
  greeting: 'בוקר טוב',
  noteTones: {
    amber:  { bg: '#fdf3df', edge: '#e7d3a0', text: '#6e5a2a' },
    green:  { bg: '#e8f1ec', edge: '#bcd6c8', text: '#33564a' },
    blue:   { bg: '#e8eff9', edge: '#bcd0e6', text: '#33506e' },
    purple: { bg: '#f1e8f5', edge: '#d4bfdd', text: '#553a63' },
    plain:  { bg: '#faf6f8', edge: '#e5d8e5', text: '#55524a' },
  },
} as const;

export type Theme = typeof theme;

export function softLine(a = '0.25') {
  return `rgba(155,125,212,${a})`;
}

export function catColor(id: string, cats?: Record<string, { color: string }>): string {
  if (cats?.[id]) return cats[id].color;
  const defaults: Record<string, string> = {
    work: '#8ba4d4', home: '#87c9a0', health: '#d4a18b',
    family: '#c89cd4', personal: '#d4bc8b',
  };
  return defaults[id] ?? '#9aa39e';
}
