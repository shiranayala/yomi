/* yomi-data.js — sample content for the yomi daily planner prototype.
   Plain JS (no JSX). Exposes window.YOMI for the React app to consume.
   Dates anchored to "today" = Friday, 29 May 2026. */

(function () {
  const TODAY = new Date(2026, 4, 29); // 29 May 2026

  // ── Categories (colored labels) ──────────────────────────────
  // Harmonious muted set: same lightness/chroma feel, hue varied.
  const categories = {
    work:     { id: 'work',     label: '\u05e2\u05d1\u05d5\u05d3\u05d4',   color: '#5b8fc4' }, // blue
    home:     { id: 'home',     label: '\u05d1\u05d9\u05ea',      color: '#6aa890' }, // green
    health:   { id: 'health',   label: '\u05d1\u05e8\u05d9\u05d0\u05d5\u05ea',  color: '#d98a6a' }, // warm coral
    family:   { id: 'family',   label: '\u05de\u05e9\u05e4\u05d7\u05d4',   color: '#b585c0' }, // purple
    personal: { id: 'personal', label: '\u05d0\u05d9\u05e9\u05d9',     color: '#d4a23f' }, // amber
  };

  // ── Today's timed events (the "agenda") ──────────────────────
  const events = [
    { id: 'e1', time: '08:00', end: '08:45', title: '\u05e8\u05d9\u05e6\u05ea \u05d1\u05d5\u05e7\u05e8 \u05d1\u05e4\u05d0\u05e8\u05e7',        cat: 'health',   place: '\u05e4\u05d0\u05e8\u05e7 \u05d4\u05d9\u05e8\u05e7\u05d5\u05df' },
    { id: 'e2', time: '10:30', end: '11:30', title: '\u05e4\u05d2\u05d9\u05e9\u05ea \u05e6\u05d5\u05d5\u05ea \u05e9\u05d1\u05d5\u05e2\u05d9\u05ea',   cat: 'work',     place: '\u05d6\u05d5\u05dd' },
    { id: 'e3', time: '13:00', end: '14:00', title: '\u05d0\u05e8\u05d5\u05d7\u05ea \u05e6\u05d4\u05e8\u05d9\u05d9\u05dd \u05e2\u05dd \u05de\u05d0\u05d9\u05d4', cat: 'personal', place: '\u05e7\u05e4\u05d4 \u05dc\u05e0\u05d3\u05d5\u05d5\u05e8' },
    { id: 'e4', time: '17:00', end: '18:00', title: '\u05e9\u05d9\u05e2\u05d5\u05e8 \u05d9\u05d5\u05d2\u05d4',          cat: 'health',   place: '\u05e1\u05d8\u05d5\u05d3\u05d9\u05d5 \u05e0\u05e9\u05d9\u05de\u05d4' },
    { id: 'e5', time: '20:00', end: '21:30', title: '\u05d0\u05e8\u05d5\u05d7\u05ea \u05e2\u05e8\u05d1 \u05de\u05e9\u05e4\u05d7\u05ea\u05d9\u05ea', cat: 'family',   place: '\u05d0\u05e6\u05dc \u05d0\u05de\u05d0' },
  ];

  // ── To-do tasks ──────────────────────────────────────────────
  const tasks = [
    { id: 't1', title: '\u05dc\u05d4\u05ea\u05e7\u05e9\u05e8 \u05dc\u05e8\u05d5\u05e4\u05d0 \u05e9\u05d9\u05e0\u05d9\u05d9\u05dd',    cat: 'health',   done: false, time: '09:30', today: true },
    { id: 't2', title: '\u05dc\u05e9\u05dc\u05d5\u05d7 \u05de\u05d9\u05d9\u05dc \u05dc\u05dc\u05e7\u05d5\u05d7',       cat: 'work',     done: false, time: '12:00', today: true },
    { id: 't3', title: '\u05dc\u05e1\u05d9\u05d9\u05dd \u05d0\u05ea \u05d4\u05de\u05e6\u05d2\u05ea',         cat: 'work',     done: false, time: null,   today: true },
    { id: 't4', title: '\u05dc\u05e7\u05e0\u05d5\u05ea \u05de\u05ea\u05e0\u05d4 \u05dc\u05d9\u05d5\u05dd \u05d4\u05d5\u05dc\u05d3\u05ea \u05e9\u05dc \u05e0\u05d5\u05e2\u05d4', cat: 'personal', done: true,  time: null, today: true },
    { id: 't5', title: '\u05dc\u05d4\u05d6\u05de\u05d9\u05df \u05db\u05d1\u05d9\u05e1\u05d4 \u05de\u05d4\u05de\u05db\u05d1\u05e1\u05d4',    cat: 'home',     done: false, time: null,   today: true },
    { id: 't6', title: '\u05dc\u05ea\u05d0\u05dd \u05d8\u05d9\u05e4\u05d5\u05dc \u05dc\u05e8\u05db\u05d1',       cat: 'home',     done: false, time: null,   today: false },
    { id: 't7', title: '\u05dc\u05e7\u05e8\u05d5\u05d0 \u05d0\u05ea \u05d4\u05e4\u05e8\u05e7 \u05dc\u05de\u05d5\u05e2\u05d3\u05d5\u05df \u05d4\u05e7\u05e8\u05d9\u05d0\u05d4', cat: 'personal', done: false, time: null, today: false },
    { id: 't8', title: '\u05dc\u05d4\u05d7\u05d6\u05d9\u05e8 \u05e1\u05e4\u05e8\u05d9\u05dd \u05dc\u05e1\u05e4\u05e8\u05d9\u05d9\u05d4',   cat: 'personal', done: false, time: null,   today: false },
  ];

  // ── Shopping list ────────────────────────────────────────────
  const shopping = [
    { id: 's1', title: '\u05d7\u05dc\u05d1',        done: false, aisle: '\u05de\u05d5\u05e6\u05e8\u05d9 \u05d7\u05dc\u05d1' },
    { id: 's2', title: '\u05dc\u05d7\u05dd \u05de\u05dc\u05d0',   done: false, aisle: '\u05de\u05d0\u05e4\u05d9\u05d9\u05d4' },
    { id: 's3', title: '\u05d1\u05d9\u05e6\u05d9\u05dd',      done: true,  aisle: '\u05de\u05d5\u05e6\u05e8\u05d9 \u05d7\u05dc\u05d1' },
    { id: 's4', title: '\u05e2\u05d2\u05d1\u05e0\u05d9\u05d5\u05ea',    done: false, aisle: '\u05d9\u05e8\u05e7\u05d5\u05ea' },
    { id: 's5', title: '\u05d0\u05d1\u05d5\u05e7\u05d3\u05d5',     done: false, aisle: '\u05d9\u05e8\u05e7\u05d5\u05ea' },
    { id: 's6', title: '\u05e7\u05e4\u05d4 \u05d8\u05d7\u05d5\u05df',  done: true,  aisle: '\u05de\u05d6\u05d5\u05df \u05d9\u05d1\u05e9' },
    { id: 's7', title: '\u05d9\u05d5\u05d2\u05d5\u05e8\u05d8',     done: false, aisle: '\u05de\u05d5\u05e6\u05e8\u05d9 \u05d7\u05dc\u05d1' },
    { id: 's8', title: '\u05d1\u05e0\u05e0\u05d5\u05ea',      done: false, aisle: '\u05e4\u05d9\u05e8\u05d5\u05ea' },
    { id: 's9', title: '\u05e0\u05d9\u05d9\u05e8 \u05d8\u05d5\u05d0\u05dc\u05d8',done: false, aisle: '\u05d0\u05d7\u05e8' },
  ];

  // ── Notes ────────────────────────────────────────────────────
  const notes = [
    { id: 'n1', title: '\u05e8\u05e2\u05d9\u05d5\u05e0\u05d5\u05ea \u05dc\u05de\u05ea\u05e0\u05d4', body: '\u05e1\u05e4\u05e8 \u05d1\u05d9\u05e9\u05d5\u05dc \u05d0\u05d9\u05d8\u05dc\u05e7\u05d9, \u05e6\u05de\u05d7 \u05dc\u05de\u05e8\u05e4\u05e1\u05ea, \u05db\u05e8\u05d8\u05d9\u05e1 \u05dc\u05d4\u05e6\u05d2\u05d4', tone: 'amber',  pinned: true },
    { id: 'n2', title: '\u05de\u05ea\u05db\u05d5\u05df \u05e2\u05d5\u05d2\u05ea \u05d2\u05d6\u05e8', body: '3 \u05d2\u05d6\u05e8\u05d9\u05dd, 2 \u05d1\u05d9\u05e6\u05d9\u05dd, \u05db\u05d5\u05e1 \u05e7\u05de\u05d7, \u05db\u05e4\u05d9\u05ea \u05e7\u05d9\u05e0\u05de\u05d5\u05df, \u05d7\u05e6\u05d9 \u05db\u05d5\u05e1 \u05e9\u05de\u05df', tone: 'green', pinned: false },
    { id: 'n3', title: '\u05e1\u05e4\u05e8\u05d9\u05dd \u05dc\u05e7\u05e8\u05d5\u05d0', body: '\u05d4\u05d0\u05dc\u05db\u05d9\u05de\u05d0\u05d9, \u05de\u05d2\u05d3\u05dc \u05d4\u05dc\u05d9\u05dc\u05d4, \u05d0\u05e0\u05e9\u05d9\u05dd \u05e4\u05e9\u05d5\u05d8\u05d9\u05dd', tone: 'blue', pinned: false },
    { id: 'n4', title: '\u05d5\u05d0\u05d99-Fi \u05d0\u05e6\u05dc \u05d0\u05de\u05d0', body: '\u05d4\u05e8\u05e9\u05ea: Sahar_Home \u00b7 \u05e1\u05d9\u05e1\u05de\u05d4: bait2024', tone: 'plain', pinned: false },
    { id: 'n5', title: '\u05de\u05d7\u05e9\u05d1\u05d5\u05ea \u05dc\u05e4\u05e0\u05d9 \u05d4\u05e9\u05d9\u05e0\u05d4', body: '\u05dc\u05d4\u05d2\u05d9\u05d3 \u05ea\u05d5\u05d3\u05d4 \u05e2\u05dc \u05d4\u05d9\u05d5\u05dd, \u05dc\u05ea\u05db\u05e0\u05df \u05d8\u05d9\u05d5\u05dc \u05dc\u05e1\u05d5\u05e3 \u05d4\u05d7\u05d5\u05d3\u05e9', tone: 'purple', pinned: false },
  ];

  // ── Month calendar event-dots map (day-of-month -> [catIds]) ──
  // For May 2026. Used to render colored dots under each day.
  const monthDots = {
    1:  ['work'],
    3:  ['work', 'health'],
    5:  ['family'],
    7:  ['work', 'personal'],
    8:  ['health'],
    11: ['work'],
    12: ['home', 'work'],
    14: ['family', 'personal'],
    15: ['health'],
    18: ['work'],
    19: ['work', 'health', 'personal'],
    21: ['family'],
    22: ['home'],
    25: ['work'],
    26: ['health', 'work'],
    28: ['personal'],
    29: ['health', 'work', 'personal', 'family'], // today
    31: ['family'],
  };

  // Per-day agenda preview used when a calendar day is selected.
  const dayAgenda = {
    26: [
      { time: '09:00', title: '\u05d1\u05d3\u05d9\u05e7\u05d4 \u05e9\u05e0\u05ea\u05d9\u05ea', cat: 'health' },
      { time: '15:00', title: '\u05e1\u05d9\u05e0\u05d5\u05e3 \u05e8\u05d1\u05e2\u05d5\u05e0\u05d9', cat: 'work' },
    ],
    29: events.map(e => ({ time: e.time, title: e.title, cat: e.cat })),
    31: [
      { time: '11:00', title: '\u05d1\u05e8\u05d0\u05d9\u05e5\' \u05d1\u05d2\u05df', cat: 'family' },
    ],
    19: [
      { time: '08:30', title: '\u05d9\u05d5\u05dd \u05e2\u05d9\u05d5\u05df \u05d1\u05e2\u05d1\u05d5\u05d3\u05d4', cat: 'work' },
      { time: '13:00', title: '\u05e4\u05d9\u05d6\u05d9\u05d5\u05ea\u05e8\u05e4\u05d9\u05d4', cat: 'health' },
      { time: '19:00', title: '\u05e7\u05d5\u05dc\u05e0\u05d5\u05e2 \u05e2\u05dd \u05d3\u05e0\u05d9', cat: 'personal' },
    ],
  };

  const weekdaysShort = ['\u05d0\u05f3', '\u05d1\u05f3', '\u05d2\u05f3', '\u05d3\u05f3', '\u05d4\u05f3', '\u05d5\u05f3', '\u05e9\u05f3'];
  const monthNames = ['\u05d9\u05e0\u05d5\u05d0\u05e8','\u05e4\u05d1\u05e8\u05d5\u05d0\u05e8','\u05de\u05e8\u05e5','\u05d0\u05e4\u05e8\u05d9\u05dc','\u05de\u05d0\u05d9','\u05d9\u05d5\u05e0\u05d9','\u05d9\u05d5\u05dc\u05d9','\u05d0\u05d5\u05d2\u05d5\u05e1\u05d8','\u05e1\u05e4\u05d8\u05de\u05d1\u05e8','\u05d0\u05d5\u05e7\u05d8\u05d5\u05d1\u05e8','\u05e0\u05d5\u05d1\u05de\u05d1\u05e8','\u05d3\u05e6\u05de\u05d1\u05e8'];

  window.YOMI = {
    TODAY, categories, events, tasks, shopping, notes,
    monthDots, dayAgenda, weekdaysShort, monthNames,
    user: { name: '\u05d9\u05e2\u05dc' },
    weather: { temp: 24, label: '\u05d1\u05d4\u05d9\u05e8 \u05d5\u05e0\u05e2\u05d9\u05dd', icon: 'sun' },
  };
})();
