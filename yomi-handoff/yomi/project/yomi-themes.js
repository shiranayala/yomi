/* yomi-themes.js — three design directions for the yomi planner.
   Each theme drives colors, fonts, radii, and a few layout flavor flags.
   The shared category palette lives in YOMI.categories. */

(function () {
  const noteTones = {
    amber:  { bg: '#fbf3df', edge: '#e7d3a0', text: '#6e5a2a' },
    green:  { bg: '#e6f0ea', edge: '#bcd6c8', text: '#33564a' },
    blue:   { bg: '#e6eef7', edge: '#bcd0e6', text: '#33506e' },
    purple: { bg: '#efe6f3', edge: '#d4bfdd', text: '#553a63' },
    plain:  { bg: '#f4f3ef', edge: '#dcdad2', text: '#55524a' },
  };

  // ── A · Serene / Clean ───────────────────────────────────────
  const serene = {
    id: 'serene',
    name: '\u05e9\u05dc\u05d5\u05d5\u05d4',
    subtitle: '\u05e0\u05e7\u05d9 \u00b7 \u05d0\u05d5\u05d5\u05d9\u05e8 \u00b7 \u05de\u05e8\u05d5\u05d5\u05d7',
    fonts: {
      hand: '"Gveret Levin AlefAlefAlef", cursive',
      body: '"Assistant", system-ui, sans-serif',
    },
    color: {
      bg: '#f4f6f5', surface: '#ffffff', surfaceAlt: '#eef2f0',
      text: '#2b332f', textMuted: '#7c8983', line: 'rgba(43,51,47,0.08)',
      primary: '#5a9e87', primaryDeep: '#3f7a64', primarySoft: '#e6f0eb',
      onPrimary: '#ffffff',
    },
    radius: { card: 22, chip: 999, tile: 16 },
    cardShadow: '0 1px 2px rgba(43,51,47,0.04), 0 6px 18px rgba(43,51,47,0.05)',
    heroStyle: 'soft',      // light surface hero
    headingScale: 1,
    density: 'airy',
    noteTones,
  };

  // ── B · Warm Editorial ──────────────────────────────────────
  const warm = {
    id: 'warm',
    name: '\u05d7\u05de\u05d9\u05dd',
    subtitle: '\u05d0\u05d3\u05d9\u05d8\u05d5\u05e8\u05d9\u05d0\u05dc\u05d9 \u00b7 \u05e1\u05e8\u05d9\u05e3 \u00b7 \u05e8\u05da',
    fonts: {
      hand: '"Gveret Levin AlefAlefAlef", cursive',
      body: '"Frank Ruhl Libre", Georgia, serif',
    },
    color: {
      bg: '#f3f1ea', surface: '#fbfaf5', surfaceAlt: '#ece8dc',
      text: '#39362d', textMuted: '#8c8678', line: 'rgba(57,54,45,0.10)',
      primary: '#5f8f76', primaryDeep: '#4a7560', primarySoft: '#e7ede4',
      onPrimary: '#ffffff',
    },
    radius: { card: 14, chip: 999, tile: 12 },
    cardShadow: '0 1px 2px rgba(57,54,45,0.05), 0 8px 22px rgba(57,54,45,0.06)',
    heroStyle: 'editorial', // big handwritten headline, cream surface
    headingScale: 1.18,
    density: 'airy',
    noteTones,
  };

  // ── C · Lively / Bold ───────────────────────────────────────
  const lively = {
    id: 'lively',
    name: '\u05d7\u05d9',
    subtitle: '\u05d2\u05e8\u05e4\u05d9 \u00b7 \u05d1\u05dc\u05d5\u05e7\u05d9 \u05e6\u05d1\u05e2 \u00b7 \u05e2\u05d2\u05d5\u05dc',
    fonts: {
      hand: '"Gveret Levin AlefAlefAlef", cursive',
      body: '"Rubik", system-ui, sans-serif',
    },
    color: {
      bg: '#eef3f0', surface: '#ffffff', surfaceAlt: '#e4ede8',
      text: '#22302a', textMuted: '#6f827a', line: 'rgba(34,48,42,0.08)',
      primary: '#3f7a64', primaryDeep: '#2f5e4d', primarySoft: '#dcebe4',
      onPrimary: '#ffffff',
    },
    radius: { card: 26, chip: 999, tile: 20 },
    cardShadow: '0 2px 4px rgba(34,48,42,0.05), 0 10px 26px rgba(34,48,42,0.07)',
    heroStyle: 'block',     // solid green hero block, cards float on top
    headingScale: 1.05,
    density: 'cozy',
    noteTones,
  };

  window.YOMI_THEMES = { serene, warm, lively };
  window.YOMI_THEME_ORDER = ['serene', 'warm', 'lively'];
})();
