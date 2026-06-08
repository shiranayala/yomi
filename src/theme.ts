export const theme = {
  fonts: {
    hand: '"Gveret Levin AlefAlefAlef", cursive',
    heading: '"Assistant", system-ui, sans-serif',
    body: '"Rubik", system-ui, sans-serif',
  },
  color: {
    bg: '#f4eef6',
    surface: '#ffffff',
    surfaceAlt: '#ece1ef',
    text: '#22302a',
    textMuted: '#6f827a',
    line: 'rgba(34,48,42,0.08)',
    primary: '#9c6ba8',
    primaryDeep: '#7a4d86',
    primarySoft: '#ecdff0',
    heroFrom: '#bd93c6',
    onPrimary: '#ffffff',
  },
  radius: { card: 26, tile: 20, chip: 999 },
  cardShadow: '0 2px 4px rgba(34,48,42,0.05), 0 10px 26px rgba(34,48,42,0.07)',
  heroStyle: 'block' as const,
  headingScale: 1.05,
  greeting: 'בוקר טוב',
  noteTones: {
    amber:  { bg: '#fbf3df', edge: '#e7d3a0', text: '#6e5a2a' },
    green:  { bg: '#e6f0ea', edge: '#bcd6c8', text: '#33564a' },
    blue:   { bg: '#e6eef7', edge: '#bcd0e6', text: '#33506e' },
    purple: { bg: '#efe6f3', edge: '#d4bfdd', text: '#553a63' },
    plain:  { bg: '#f4f3ef', edge: '#dcdad2', text: '#55524a' },
  },
} as const;

export type Theme = typeof theme;

export function softLine(a = '0.25') {
  return `rgba(34,48,42,${a})`;
}

export function catColor(id: string, cats?: Record<string, { color: string }>): string {
  if (cats?.[id]) return cats[id].color;
  const defaults: Record<string, string> = {
    work: '#5b8fc4', home: '#6aa890', health: '#d98a6a',
    family: '#b585c0', personal: '#d4a23f',
  };
  return defaults[id] ?? '#9aa39e';
}
