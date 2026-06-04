interface IconProps {
  size?: number;
  color?: string;
  sw?: number;
}

function svg(children: React.ReactNode, { size = 22, color = 'currentColor', sw = 1.7 }: IconProps = {}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export const Icon = {
  sun:         (p: IconProps) => svg(<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>, p),
  today:       (p: IconProps) => svg(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>, p),
  calendar:    (p: IconProps) => svg(<><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></>, p),
  check:       (p: IconProps) => svg(<path d="M4 12.5l5 5L20 6.5"/>, p),
  checkCircle: (p: IconProps) => svg(<><circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.6 2.6L16 9"/></>, p),
  note:        (p: IconProps) => svg(<><path d="M5 3.5h14a1 1 0 0 1 1 1V15l-5 5.5H6a1 1 0 0 1-1-1z"/><path d="M20 15h-4a1 1 0 0 0-1 1v4"/></>, p),
  cart:        (p: IconProps) => svg(<><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3.5h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/></>, p),
  plus:        (p: IconProps) => svg(<path d="M12 5v14M5 12h14"/>, p),
  clock:       (p: IconProps) => svg(<><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></>, p),
  pin:         (p: IconProps) => svg(<><path d="M9 3.5h6l-1 5 3 3v2H7v-2l3-3z"/><path d="M12 13.5V21"/></>, p),
  mapPin:      (p: IconProps) => svg(<><path d="M12 21s7-5.7 7-11a7 7 0 0 0-14 0c0 5.3 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></>, p),
  chevR:       (p: IconProps) => svg(<path d="M9 5l7 7-7 7"/>, p),
  chevL:       (p: IconProps) => svg(<path d="M15 5l-7 7 7 7"/>, p),
  trash:       (p: IconProps) => svg(<><path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13"/></>, p),
  repeat:      (p: IconProps) => svg(<><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></>, p),
  x:           (p: IconProps) => svg(<path d="M18 6 6 18M6 6l12 12"/>, p),
  edit:        (p: IconProps) => svg(<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></>, p),
  more:        (p: IconProps) => svg(<><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></>, p),
  logout:      (p: IconProps) => svg(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>, p),
  user:        (p: IconProps) => svg(<><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/></>, p),
  settings:    (p: IconProps) => svg(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>, p),
};
