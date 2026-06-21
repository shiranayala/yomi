/**
 * Icon + color registry for the "שגרה" page.
 *
 * Three logical sets — no overlap between them:
 *  - DAILY templates (11 predefined routines)
 *  - DAILY_CUSTOM_ICON_KEYS (15 universal icons for custom daily routines)
 *  - WEEKLY_CUSTOM_ICON_KEYS (15 popular activity icons for custom weekly goals)
 */

import type { RoutineKind } from './types';

type SVGProps = { size?: number; sw?: number };

type IconEntry = {
  key: string;
  icon: (p: SVGProps) => JSX.Element;
  gradient: string;
  solid: string;
};

function wrap(children: React.ReactNode, p: SVGProps = {}) {
  const { size = 56, sw = 2.2 } = p;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

// ── Pastel gradients ─────────────────────────────────────────────────
const G = {
  blue:       'linear-gradient(160deg, #8bc6e8 0%, #b8d8ec 100%)',
  peach:      'linear-gradient(160deg, #e8a87c 0%, #f0c4a8 100%)',
  mint:       'linear-gradient(160deg, #87c9a0 0%, #b8dcc4 100%)',
  lavender:   'linear-gradient(160deg, #c89cd4 0%, #ddc0e2 100%)',
  pink:       'linear-gradient(160deg, #f0a8c1 0%, #f5c8d6 100%)',
  sage:       'linear-gradient(160deg, #a8d495 0%, #c8e3b8 100%)',
  butter:     'linear-gradient(160deg, #e8c87c 0%, #f0d8a8 100%)',
  periwinkle: 'linear-gradient(160deg, #9c9cc8 0%, #b8b8d8 100%)',
  coral:      'linear-gradient(160deg, #d99090 0%, #e8b8b8 100%)',
  teal:       'linear-gradient(160deg, #8bd0c8 0%, #b8e0d8 100%)',
  rose:       'linear-gradient(160deg, #d4889c 0%, #e3b0c0 100%)',
  sky:        'linear-gradient(160deg, #9cb8e0 0%, #c0d0e8 100%)',
  apricot:    'linear-gradient(160deg, #e8b88b 0%, #f0d0b0 100%)',
  olive:      'linear-gradient(160deg, #b0c08b 0%, #c8d4a8 100%)',
  plum:       'linear-gradient(160deg, #b08bc4 0%, #c8a8d4 100%)',
  steel:      'linear-gradient(160deg, #a8b0bc 0%, #c4ccd6 100%)',
};

const S = {
  blue: '#5b9fd0', peach: '#c47d50', mint: '#5da37e', lavender: '#a070b8',
  pink: '#c66d8d', sage: '#7ba85e', butter: '#c4a050', periwinkle: '#6b6ba0',
  coral: '#a85c5c', teal: '#5ba099', rose: '#a05c70', sky: '#6b88b8',
  apricot: '#b07850', olive: '#788c5b', plum: '#80588f', steel: '#6b7382',
};

// ────────────────────────────────────────────────────────────────────
// SET A: 11 DAILY TEMPLATE icons (one per template, all unique)
// ────────────────────────────────────────────────────────────────────

const dailyIcons: Record<string, IconEntry> = {
  // 1. שתיית מים — water drop
  water: {
    key: 'water', gradient: G.blue, solid: S.blue,
    icon: (p) => wrap(
      <path d="M12 3 C 8 9 5.5 13 5.5 16 a 6.5 6.5 0 0 0 13 0 c 0 -3 -2.5 -7 -6.5 -13 z" />, p
    ),
  },

  // 2. מיץ ירוק — glass with straw + leaf
  juice: {
    key: 'juice', gradient: G.sage, solid: S.sage,
    icon: (p) => wrap(
      <>
        <path d="M6.5 7 h 11 l -1 13 a 1 1 0 0 1 -1 .9 h -7 a 1 1 0 0 1 -1 -.9 z" />
        <path d="M6.5 7 q 5.5 -2 11 0" />
        <line x1="14" y1="3" x2="11" y2="9" />
        <path d="M9 4 q 1 -2 3 -1" />
      </>, p
    ),
  },

  // 3. שייק ירוק — blender (distinct from juice)
  shake: {
    key: 'shake', gradient: G.mint, solid: S.mint,
    icon: (p) => wrap(
      <>
        <path d="M7 3 h 10 v 13 h -10 z" />
        <path d="M5 16 h 14 v 3 a 2 2 0 0 1 -2 2 h -10 a 2 2 0 0 1 -2 -2 z" />
        <line x1="7" y1="8" x2="17" y2="8" />
        <line x1="10" y1="11" x2="14" y2="12" />
        <line x1="14" y1="11" x2="10" y2="12" />
      </>, p
    ),
  },

  // 4. נטילת ברזל — capsule (iron pill)
  iron: {
    key: 'iron', gradient: G.steel, solid: S.steel,
    icon: (p) => wrap(
      <g transform="rotate(-30 12 12)">
        <rect x="3" y="9" width="18" height="6" rx="3" />
        <line x1="12" y1="9" x2="12" y2="15" />
      </g>, p
    ),
  },

  // 5. נטילת ויטמין B12 — round tablet
  b12: {
    key: 'b12', gradient: G.coral, solid: S.coral,
    icon: (p) => wrap(
      <>
        <circle cx="12" cy="12" r="7" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>, p
    ),
  },

  // 6. נטילת ויטמין C — citrus segment (orange/lemon slice)
  vitc: {
    key: 'vitc', gradient: G.apricot, solid: S.apricot,
    icon: (p) => wrap(
      <>
        <circle cx="12" cy="12" r="8" />
        <line x1="12" y1="4" x2="12" y2="20" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="6.3" y1="6.3" x2="17.7" y2="17.7" />
        <line x1="17.7" y1="6.3" x2="6.3" y2="17.7" />
      </>, p
    ),
  },

  // 7. נטילת ויטמין D — sun
  vitd: {
    key: 'vitd', gradient: G.butter, solid: S.butter,
    icon: (p) => wrap(
      <>
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4.5" />
        <line x1="12" y1="19.5" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4.5" y2="12" />
        <line x1="19.5" y1="12" x2="22" y2="12" />
        <line x1="5" y1="5" x2="6.8" y2="6.8" />
        <line x1="17.2" y1="17.2" x2="19" y2="19" />
        <line x1="5" y1="19" x2="6.8" y2="17.2" />
        <line x1="17.2" y1="6.8" x2="19" y2="5" />
      </>, p
    ),
  },

  // 8. תרגילי פנים — smiley face
  face: {
    key: 'face', gradient: G.pink, solid: S.pink,
    icon: (p) => wrap(
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="9" cy="10" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="15" cy="10" r="0.9" fill="currentColor" stroke="none" />
        <path d="M8 14.5 q 4 3.5 8 0" />
      </>, p
    ),
  },

  // 9. התבודדות — person sitting alone, hugging knees
  solitude: {
    key: 'solitude', gradient: G.periwinkle, solid: S.periwinkle,
    icon: (p) => wrap(
      <>
        <circle cx="12" cy="5" r="1.8" />
        <path d="M12 7 v 5.5" />
        <path d="M7 21 L 12 12.5 L 17 21" />
        <path d="M8.5 13.5 q 3.5 -1 7 0" />
      </>, p
    ),
  },

  // 10. מתיחות ותרגילי כושר — active stretching figure
  workout: {
    key: 'workout', gradient: G.peach, solid: S.peach,
    icon: (p) => wrap(
      <>
        <circle cx="12" cy="4.5" r="1.7" />
        <path d="M12 6.5 v 6.5" />
        <path d="M5 9 L 12 7" />
        <path d="M19 9 L 12 7" />
        <path d="M7 21 L 12 13 L 17 21" />
      </>, p
    ),
  },

  // 11. הפחתת מסכים — phone with diagonal slash (less screen time)
  noScreens: {
    key: 'noScreens', gradient: G.lavender, solid: S.lavender,
    icon: (p) => wrap(
      <>
        <rect x="6.5" y="3" width="11" height="18" rx="2.2" />
        <line x1="10" y1="6" x2="14" y2="6" />
        <circle cx="12" cy="18.5" r="0.7" fill="currentColor" stroke="none" />
        <line x1="3.5" y1="3.5" x2="20.5" y2="20.5" strokeWidth={3} />
      </>, p
    ),
  },
};

// ────────────────────────────────────────────────────────────────────
// SET B: 15 universal icons for CUSTOM DAILY routines
// (none overlap with daily template icons above)
// ────────────────────────────────────────────────────────────────────

const dailyCustomIcons: Record<string, IconEntry> = {
  star: {
    key: 'star', gradient: G.butter, solid: S.butter,
    icon: (p) => wrap(
      <path d="M12 3 L 14.6 9 L 21 9.5 L 16 13.7 L 17.6 20 L 12 16.7 L 6.4 20 L 8 13.7 L 3 9.5 L 9.4 9 z" />, p
    ),
  },
  heart: {
    key: 'heart', gradient: G.coral, solid: S.coral,
    icon: (p) => wrap(
      <path d="M12 21 s -8 -5 -8 -11 a 4 4 0 0 1 8 -2 a 4 4 0 0 1 8 2 c 0 6 -8 11 -8 11 z" />, p
    ),
  },
  target: {
    key: 'target', gradient: G.rose, solid: S.rose,
    icon: (p) => wrap(
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      </>, p
    ),
  },
  flag: {
    key: 'flag', gradient: G.apricot, solid: S.apricot,
    icon: (p) => wrap(
      <>
        <path d="M5 3 v 18" />
        <path d="M5 4 q 5 -3 10 0 q 5 3 7 -1 v 9 q -3 4 -7 1 q -5 -3 -10 0 z" />
      </>, p
    ),
  },
  bolt: {
    key: 'bolt', gradient: G.butter, solid: S.butter,
    icon: (p) => wrap(
      <path d="M13 2 L 4 13 H 11 L 9 22 L 20 11 H 13 z" />, p
    ),
  },
  leaf: {
    key: 'leaf', gradient: G.mint, solid: S.mint,
    icon: (p) => wrap(
      <>
        <path d="M5 19 C 5 10 10 5 19 5 C 19 14 14 19 5 19 z" />
        <path d="M5 19 L 19 5" />
      </>, p
    ),
  },
  fire: {
    key: 'fire', gradient: G.peach, solid: S.peach,
    icon: (p) => wrap(
      <>
        <path d="M12 3 c 0 4 -4 5 -4 10 a 4 4 0 0 0 8 0 c 0 -2 -1 -3 -2 -4 c 2 -3 -1 -5 -2 -6 z" />
        <path d="M10 15 a 2 2 0 0 0 4 0" />
      </>, p
    ),
  },
  music: {
    key: 'music', gradient: G.lavender, solid: S.lavender,
    icon: (p) => wrap(
      <>
        <line x1="9" y1="18" x2="9" y2="5" />
        <line x1="18" y1="16" x2="18" y2="3" />
        <line x1="9" y1="5" x2="18" y2="3" />
        <ellipse cx="7" cy="18" rx="2" ry="1.6" />
        <ellipse cx="16" cy="16" rx="2" ry="1.6" />
      </>, p
    ),
  },
  paint: {
    key: 'paint', gradient: G.pink, solid: S.pink,
    icon: (p) => wrap(
      <>
        <path d="M16 3 l 5 5 l -9 9 l -5 -5 z" />
        <path d="M7 12 l -4 6 q 0 2 2 2 l 4 -4" />
      </>, p
    ),
  },
  cloud: {
    key: 'cloud', gradient: G.sky, solid: S.sky,
    icon: (p) => wrap(
      <path d="M17.5 18 H 8 a 5 5 0 1 1 4.8 -6.4 h 0.7 a 3.5 3.5 0 1 1 4 6.4 z" />, p
    ),
  },
  moon: {
    key: 'moon', gradient: G.periwinkle, solid: S.periwinkle,
    icon: (p) => wrap(
      <path d="M20 14 a 8 8 0 1 1 -10 -10 a 6 6 0 0 0 10 10 z" />, p
    ),
  },
  gift: {
    key: 'gift', gradient: G.rose, solid: S.rose,
    icon: (p) => wrap(
      <>
        <rect x="3" y="11" width="18" height="10" rx="1" />
        <line x1="3" y1="8" x2="21" y2="8" />
        <line x1="3" y1="11" x2="21" y2="11" />
        <line x1="12" y1="8" x2="12" y2="21" />
        <path d="M12 8 c -2.5 -2 -5 -2 -5 0 c 0 2 3 1.5 5 0" />
        <path d="M12 8 c 2.5 -2 5 -2 5 0 c 0 2 -3 1.5 -5 0" />
      </>, p
    ),
  },
  sparkle: {
    key: 'sparkle', gradient: G.plum, solid: S.plum,
    icon: (p) => wrap(
      <>
        <path d="M12 3 L 13.2 9.2 L 19 11 L 13.2 12.8 L 12 19 L 10.8 12.8 L 5 11 L 10.8 9.2 z" />
        <path d="M19 4 L 19.5 5.7 L 21 6.3 L 19.5 6.9 L 19 8.6 L 18.5 6.9 L 17 6.3 L 18.5 5.7 z" />
      </>, p
    ),
  },
  trophy: {
    key: 'trophy', gradient: G.butter, solid: S.butter,
    icon: (p) => wrap(
      <>
        <path d="M7 4 h 10 v 7 a 5 5 0 0 1 -10 0 z" />
        <path d="M7 6 H 4 a 1 1 0 0 0 -1 1 v 1 a 3 3 0 0 0 3 3" />
        <path d="M17 6 h 3 a 1 1 0 0 1 1 1 v 1 a 3 3 0 0 1 -3 3" />
        <line x1="12" y1="16" x2="12" y2="20" />
        <line x1="8" y1="20" x2="16" y2="20" />
      </>, p
    ),
  },
  tree: {
    key: 'tree', gradient: G.sage, solid: S.sage,
    icon: (p) => wrap(
      <>
        <circle cx="12" cy="9" r="5.5" />
        <line x1="12" y1="14.5" x2="12" y2="21" />
        <line x1="9" y1="21" x2="15" y2="21" />
      </>, p
    ),
  },
};

// ────────────────────────────────────────────────────────────────────
// SET C: 15 popular activity icons for WEEKLY routines
// ────────────────────────────────────────────────────────────────────

const weeklyIcons: Record<string, IconEntry> = {
  beach: {
    key: 'beach', gradient: G.blue, solid: S.blue,
    icon: (p) => wrap(
      <>
        <path d="M2 12 q 10 -12 20 0 z" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <line x1="3" y1="21" x2="21" y2="21" />
        <line x1="7" y1="11" x2="7" y2="12.5" opacity="0.5" />
        <line x1="12" y1="9" x2="12" y2="12" opacity="0.5" />
        <line x1="17" y1="11" x2="17" y2="12.5" opacity="0.5" />
      </>, p
    ),
  },
  car: {
    key: 'car', gradient: G.coral, solid: S.coral,
    icon: (p) => wrap(
      <>
        <path d="M3 14 l 1.5 -4.5 q 0.5 -1.5 2 -1.5 h 11 q 1.5 0 2 1.5 l 1.5 4.5 v 4 H 3 z" />
        <line x1="5" y1="14" x2="19" y2="14" />
        <circle cx="7.5" cy="18" r="1.6" />
        <circle cx="16.5" cy="18" r="1.6" />
      </>, p
    ),
  },
  cook: {
    key: 'cook', gradient: G.peach, solid: S.peach,
    icon: (p) => wrap(
      <>
        <line x1="2" y1="11" x2="22" y2="11" />
        <path d="M3 11 v 5 a 4 4 0 0 0 4 4 h 10 a 4 4 0 0 0 4 -4 v -5" />
        <path d="M22 12 l 2 2" />
        <path d="M8 8 q 1 -2 -1 -3 M12 8 q 1 -2 -1 -3 M16 8 q 1 -2 -1 -3" />
      </>, p
    ),
  },
  gym: {
    key: 'gym', gradient: G.apricot, solid: S.apricot,
    icon: (p) => wrap(
      <>
        <rect x="2" y="9.5" width="3" height="5" rx="0.6" />
        <rect x="19" y="9.5" width="3" height="5" rx="0.6" />
        <rect x="5" y="11" width="2" height="2" rx="0.4" />
        <rect x="17" y="11" width="2" height="2" rx="0.4" />
        <line x1="7" y1="12" x2="17" y2="12" />
      </>, p
    ),
  },
  shop: {
    key: 'shop', gradient: G.mint, solid: S.mint,
    icon: (p) => wrap(
      <>
        <path d="M3 4 h 2 l 2.2 11.2 a 1.5 1.5 0 0 0 1.5 1.2 h 8.4 a 1.5 1.5 0 0 0 1.5 -1.2 L 21 7 H 6" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
      </>, p
    ),
  },
  swim: {
    key: 'swim', gradient: G.teal, solid: S.teal,
    icon: (p) => wrap(
      <>
        <circle cx="6" cy="6" r="1.6" />
        <path d="M3 11 l 4 -2.5 l 4 2 l 5 -1 l 5 0" />
        <path d="M3 15 q 2.5 -2 5 0 t 5 0 t 5 0 t 5 0" />
        <path d="M3 19 q 2.5 -2 5 0 t 5 0 t 5 0 t 5 0" />
      </>, p
    ),
  },
  hike: {
    key: 'hike', gradient: G.sage, solid: S.sage,
    icon: (p) => wrap(
      <>
        <path d="M3 20 L 9 10 L 13 15 L 17 7 L 21 20 z" />
        <circle cx="15" cy="5" r="1.3" />
      </>, p
    ),
  },
  cinema: {
    key: 'cinema', gradient: G.lavender, solid: S.lavender,
    icon: (p) => wrap(
      <>
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <circle cx="6" cy="7" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="12" cy="7" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="18" cy="7" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="6" cy="17" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="18" cy="17" r="0.5" fill="currentColor" stroke="none" />
      </>, p
    ),
  },
  friends: {
    key: 'friends', gradient: G.rose, solid: S.rose,
    icon: (p) => wrap(
      <>
        <circle cx="8" cy="8" r="2.5" />
        <path d="M3 19 q 0 -5 5 -5 q 5 0 5 5" />
        <circle cx="17" cy="9" r="2" />
        <path d="M13 19 q 0 -4 4 -4 q 4 0 4 4" />
      </>, p
    ),
  },
  restaurant: {
    key: 'restaurant', gradient: G.peach, solid: S.peach,
    icon: (p) => wrap(
      <>
        <circle cx="12" cy="13" r="7" />
        <path d="M5 4 v 6 l -1 1" />
        <path d="M19 4 v 6 a 2 2 0 0 1 -2 2 v 1" />
      </>, p
    ),
  },
  yoga: {
    key: 'yoga', gradient: G.plum, solid: S.plum,
    icon: (p) => wrap(
      <>
        <circle cx="12" cy="5" r="1.8" />
        <path d="M12 7 v 4" />
        <path d="M4 18 q 4 -6 8 -6 q 4 0 8 6 z" />
        <path d="M5 14 q 3 0 5 -1.5" />
        <path d="M19 14 q -3 0 -5 -1.5" />
      </>, p
    ),
  },
  dance: {
    key: 'dance', gradient: G.pink, solid: S.pink,
    icon: (p) => wrap(
      <>
        <circle cx="11" cy="4" r="1.6" />
        <path d="M11 6 L 9 13 L 13 13 L 11 6" />
        <path d="M9 13 l -3 8" />
        <path d="M13 13 l 4 7" />
        <path d="M11 8 l -5 -3" />
        <path d="M11 8 l 6 -2" />
      </>, p
    ),
  },
  bike: {
    key: 'bike', gradient: G.olive, solid: S.olive,
    icon: (p) => wrap(
      <>
        <circle cx="6" cy="17" r="3" />
        <circle cx="18" cy="17" r="3" />
        <line x1="6" y1="17" x2="11" y2="9" />
        <line x1="11" y1="9" x2="18" y2="17" />
        <line x1="11" y1="9" x2="14" y2="9" />
      </>, p
    ),
  },
  garden: {
    key: 'garden', gradient: G.sage, solid: S.sage,
    icon: (p) => wrap(
      <>
        <circle cx="12" cy="9" r="2" />
        <circle cx="8" cy="11" r="2" />
        <circle cx="16" cy="11" r="2" />
        <circle cx="12" cy="13" r="2" />
        <line x1="12" y1="15" x2="12" y2="21" />
        <path d="M9 18 q 3 -1 6 0" />
      </>, p
    ),
  },
  spa: {
    key: 'spa', gradient: G.periwinkle, solid: S.periwinkle,
    icon: (p) => wrap(
      <>
        <path d="M12 4 q -2 4 -2 7 a 2 2 0 0 0 4 0 q 0 -3 -2 -7 z" />
        <path d="M5 14 q 3 0 4 3 q 0 -5 -4 -7" />
        <path d="M19 14 q -3 0 -4 3 q 0 -5 4 -7" />
        <ellipse cx="12" cy="19" rx="9" ry="2" />
      </>, p
    ),
  },
};

// ────────────────────────────────────────────────────────────────────
// Combined registry + lookups
// ────────────────────────────────────────────────────────────────────

export const ROUTINE_ICONS: Record<string, IconEntry> = {
  ...dailyIcons,
  ...dailyCustomIcons,
  ...weeklyIcons,
};

export const DAILY_CUSTOM_ICON_KEYS: string[] = Object.keys(dailyCustomIcons);
export const WEEKLY_CUSTOM_ICON_KEYS: string[] = Object.keys(weeklyIcons);

export type RoutineIconKey = keyof typeof ROUTINE_ICONS;

export function getRoutineIcon(key: string): IconEntry {
  return ROUTINE_ICONS[key] ?? ROUTINE_ICONS.heart;
}

// ────────────────────────────────────────────────────────────────────
// Predefined DAILY templates (11 — exactly what the user requested)
// ────────────────────────────────────────────────────────────────────

export type RoutineTemplate = {
  iconKey: string;
  title: string;
  kind: RoutineKind;
  defaultTarget: number;
  duration?: number;
};

export const ROUTINE_TEMPLATES_DAILY: RoutineTemplate[] = [
  { iconKey: 'water',     title: 'שתיית מים',            kind: 'daily', defaultTarget: 10 },
  { iconKey: 'juice',     title: 'מיץ ירוק',              kind: 'daily', defaultTarget: 1 },
  { iconKey: 'shake',     title: 'שייק ירוק',             kind: 'daily', defaultTarget: 1 },
  { iconKey: 'iron',      title: 'נטילת ברזל',            kind: 'daily', defaultTarget: 1 },
  { iconKey: 'b12',       title: 'נטילת ויטמין B12',     kind: 'daily', defaultTarget: 1 },
  { iconKey: 'vitc',      title: 'נטילת ויטמין C',       kind: 'daily', defaultTarget: 1 },
  { iconKey: 'vitd',      title: 'נטילת ויטמין D',       kind: 'daily', defaultTarget: 1 },
  { iconKey: 'face',      title: 'תרגילי פנים',          kind: 'daily', defaultTarget: 1 },
  { iconKey: 'solitude',  title: 'התבודדות',             kind: 'daily', defaultTarget: 1 },
  { iconKey: 'workout',   title: 'מתיחות ותרגילי כושר',  kind: 'daily', defaultTarget: 1 },
  { iconKey: 'noScreens', title: 'הפחתת מסכים',          kind: 'daily', defaultTarget: 1 },
];

// ────────────────────────────────────────────────────────────────────
// Date helpers
// ────────────────────────────────────────────────────────────────────

export function weekStartStr(d: Date = new Date()): string {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  c.setDate(c.getDate() - c.getDay());
  return `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, '0')}-${String(c.getDate()).padStart(2, '0')}`;
}

export function todayStrLocal(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
