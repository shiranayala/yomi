/* yomi-icons.jsx — minimal stroked line icons for the yomi app.
   Each icon takes { size, color, sw } and inherits currentColor by default. */

function _svg(children, { size = 22, color = 'currentColor', sw = 1.7, fill = 'none' } = {}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
         stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const Icon = {
  sun: (p) => _svg(<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>, p),
  cloudSun: (p) => _svg(<><path d="M7 8a4 4 0 0 1 7.7-1.5"/><path d="M16.5 19a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.3A3.5 3.5 0 0 0 7 19z"/></>, p),
  today: (p) => _svg(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>, p),
  calendar: (p) => _svg(<><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></>, p),
  check: (p) => _svg(<path d="M4 12.5l5 5L20 6.5"/>, p),
  checkCircle: (p) => _svg(<><circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.6 2.6L16 9"/></>, p),
  list: (p) => _svg(<><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="3.5" cy="6" r="1.2" fill={p && p.color || 'currentColor'} stroke="none"/><circle cx="3.5" cy="12" r="1.2" fill={p && p.color || 'currentColor'} stroke="none"/><circle cx="3.5" cy="18" r="1.2" fill={p && p.color || 'currentColor'} stroke="none"/></>, p),
  note: (p) => _svg(<><path d="M5 3.5h14a1 1 0 0 1 1 1V15l-5 5.5H6a1 1 0 0 1-1-1z"/><path d="M20 15h-4a1 1 0 0 0-1 1v4"/></>, p),
  cart: (p) => _svg(<><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3.5h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/></>, p),
  plus: (p) => _svg(<path d="M12 5v14M5 12h14"/>, p),
  clock: (p) => _svg(<><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></>, p),
  bell: (p) => _svg(<><path d="M18 8.5a6 6 0 1 0-12 0c0 5-2.2 6.5-2.2 6.5h16.4S18 13.5 18 8.5"/><path d="M10.3 19a2 2 0 0 0 3.4 0"/></>, p),
  pin: (p) => _svg(<><path d="M9 3.5h6l-1 5 3 3v2H7v-2l3-3z"/><path d="M12 13.5V21"/></>, p),
  mapPin: (p) => _svg(<><path d="M12 21s7-5.7 7-11a7 7 0 0 0-14 0c0 5.3 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></>, p),
  chevR: (p) => _svg(<path d="M9 5l7 7-7 7"/>, p),
  chevL: (p) => _svg(<path d="M15 5l-7 7 7 7"/>, p),
  chevDown: (p) => _svg(<path d="M5 9l7 7 7-7"/>, p),
  sparkle: (p) => _svg(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>, p),
  search: (p) => _svg(<><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>, p),
  trash: (p) => _svg(<><path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13"/></>, p),
  flame: (p) => _svg(<path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3 .5 2 2 2.5 2 2.5C9 9 12 3 12 3z"/>, p),
};

window.YomiIcon = Icon;
