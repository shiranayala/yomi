/* yomi-app.jsx — the yomi daily-planner app (single self-contained React tree).
   Exports window.YomiApp({ theme }). Each mounted instance keeps its own state,
   so the three directions on the canvas are independently interactive.
   Depends on: window.YOMI (data), window.YomiIcon (icons). */

const { useState, useMemo, useRef } = React;

(function () {
  const Y = window.YOMI;
  const Icon = window.YomiIcon;
  const CATS = Y.categories;
  const catColor = (id) => (CATS[id] ? CATS[id].color : '#9aa39e');
  const softLine = (t, a = '0.25') => t.color.line.replace(/0\.0?\d+/, a);

  const TOP_INSET = 60; // status-bar + dynamic-island clearance

  // ── Atoms ─────────────────────────────────────────────────────
  function CatDot({ id, size = 8 }) {
    return <span style={{ width: size, height: size, borderRadius: 99, background: catColor(id), flexShrink: 0, display: 'inline-block' }} />;
  }

  function Chip({ id, theme }) {
    const c = catColor(id);
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
        padding: '3px 9px', borderRadius: theme.radius.chip,
        background: c + '1f', color: c, fontSize: 12, fontWeight: 600, lineHeight: 1.4,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: c }} />
        {CATS[id] ? CATS[id].label : ''}
      </span>
    );
  }

  function Check({ checked, onToggle, color, theme }) {
    const c = color || theme.color.primary;
    return (
      <button onClick={onToggle} aria-label="toggle" style={{
        width: 24, height: 24, borderRadius: 99, flexShrink: 0, cursor: 'pointer',
        border: '2px solid ' + (checked ? c : softLine(theme, '0.3')),
        background: checked ? c : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 0, transition: 'all .18s ease', WebkitTapHighlightColor: 'transparent',
      }}>
        {checked && <Icon.check size={13} color={theme.color.onPrimary} sw={3} />}
      </button>
    );
  }

  function ProgressRing({ done, total, size = 50, theme }) {
    const r = (size - 6) / 2, C = 2 * Math.PI * r;
    const pct = total ? done / total : 0;
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.color.onPrimary}
            strokeWidth="4" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
            style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.4,0,.2,1)' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: theme.color.onPrimary, direction: 'ltr' }}>{done}/{total}</div>
      </div>
    );
  }

  function ProgressRingLight({ done, total, theme, size = 42 }) {
    const r = (size - 5) / 2, C = 2 * Math.PI * r;
    const pct = total ? done / total : 0;
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.color.surfaceAlt} strokeWidth="4" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.color.primary} strokeWidth="4" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: 'stroke-dashoffset .5s' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: theme.color.primaryDeep, direction: 'ltr' }}>{done}/{total}</div>
      </div>
    );
  }

  function AddRow({ placeholder, onAdd, theme }) {
    const [v, setV] = useState('');
    const submit = () => { const t = v.trim(); if (t) { onAdd(t); setV(''); } };
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
        background: theme.color.surface, borderRadius: theme.radius.tile,
        border: '1px dashed ' + softLine(theme, '0.25'),
      }}>
        <Icon.plus size={18} color={theme.color.primary} />
        <input value={v} onChange={e => setV(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }} placeholder={placeholder}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: theme.fonts.body, fontSize: 15, color: theme.color.text }} />
        {v.trim() && (
          <button onClick={submit} style={{ border: 'none', cursor: 'pointer', borderRadius: 99, padding: '5px 12px', background: theme.color.primary, color: theme.color.onPrimary, fontFamily: theme.fonts.body, fontSize: 13, fontWeight: 700 }}>הוסף</button>
        )}
      </div>
    );
  }

  function SectionHead({ children, theme, sub }) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, margin: '6px 2px 13px' }}>
        <h2 style={{ margin: 0, fontFamily: theme.fonts.hand, fontWeight: 400, fontSize: Math.round(25 * theme.headingScale), color: theme.color.text, lineHeight: 1.15 }}>{children}</h2>
        {sub && <span style={{ fontSize: 12.5, color: theme.color.textMuted, fontFamily: theme.fonts.body, paddingBottom: 3 }}>{sub}</span>}
      </div>
    );
  }

  // ── Rows ──────────────────────────────────────────────────────
  function TaskItem({ t, theme, onToggle }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
        background: theme.color.surface, borderRadius: theme.radius.tile,
        boxShadow: theme.cardShadow, transition: 'opacity .2s', opacity: t.done ? 0.55 : 1,
      }}>
        <Check checked={t.done} onToggle={() => onToggle(t.id)} color={catColor(t.cat)} theme={theme} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15.5, fontWeight: 500, color: theme.color.text, lineHeight: 1.35,
            textDecoration: t.done ? 'line-through' : 'none', textDecorationColor: theme.color.textMuted,
          }}>{t.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
            {t.time && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: theme.color.textMuted, fontSize: 12, fontWeight: 600 }}>
                <Icon.clock size={13} color={theme.color.textMuted} />{t.time}
              </span>
            )}
            <Chip id={t.cat} theme={theme} />
          </div>
        </div>
      </div>
    );
  }

  function EventItem({ ev, theme, last }) {
    const c = catColor(ev.cat);
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
        <div style={{ width: 46, flexShrink: 0, textAlign: 'center', paddingTop: 2 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.color.text, fontVariantNumeric: 'tabular-nums' }}>{ev.time}</div>
          <div style={{ fontSize: 11, color: theme.color.textMuted, fontVariantNumeric: 'tabular-nums' }}>{ev.end}</div>
        </div>
        <div style={{ width: 14, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ width: 11, height: 11, borderRadius: 99, background: c, marginTop: 4, boxShadow: '0 0 0 3px ' + c + '26' }} />
          {!last && <span style={{ flex: 1, width: 2, background: softLine(theme, '0.18'), marginTop: 2 }} />}
        </div>
        <div style={{
          flex: 1, marginBottom: 12, padding: '11px 14px', background: theme.color.surface,
          borderRadius: theme.radius.tile, boxShadow: theme.cardShadow, borderInlineStart: '3px solid ' + c,
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: theme.color.text }}>{ev.title}</div>
          {ev.place && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: theme.color.textMuted, fontSize: 12.5 }}>
              <Icon.mapPin size={13} color={theme.color.textMuted} />{ev.place}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Today screen ──────────────────────────────────────────────
  function TodayScreen({ theme, tasks, onToggleTask, onAddTask }) {
    const todayTasks = tasks.filter(t => t.today);
    const done = todayTasks.filter(t => t.done).length;
    const dateLabel = 'יום שישי · ' + Y.TODAY.getDate() + ' ב' + Y.monthNames[Y.TODAY.getMonth()];
    const greeting = theme.greeting || 'בוקר טוב';

    let hero;
    if (theme.heroStyle === 'block') {
      hero = (
        <div style={{ padding: (TOP_INSET + 12) + 'px 18px 60px', background: 'linear-gradient(155deg, ' + (theme.color.heroFrom || '#6aa890') + ' 0%, ' + theme.color.primaryDeep + ' 90%)', color: theme.color.onPrimary }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>{dateLabel}</div>
              <div style={{ fontFamily: theme.fonts.hand, fontSize: 40, lineHeight: 1.05, marginTop: 6 }}>{greeting}, {Y.user.name}</div>
              <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>מה על הפרק היום?</div>
            </div>
            <ProgressRing done={done} total={todayTasks.length} theme={theme} size={50} />
          </div>
          <div style={{ marginTop: 18 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.16)', borderRadius: 99, padding: '7px 13px', fontSize: 13.5, fontWeight: 600 }}>
              <Icon.sun size={16} color={theme.color.onPrimary} />{Y.weather.temp}° {Y.weather.label}
            </span>
          </div>
        </div>
      );
    } else if (theme.heroStyle === 'editorial') {
      hero = (
        <div style={{ padding: (TOP_INSET + 16) + 'px 20px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: theme.color.textMuted, fontSize: 12.5, letterSpacing: 0.5, fontWeight: 600 }}>
            <span>{dateLabel}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon.sun size={15} color={theme.color.primary} />{Y.weather.temp}°</span>
          </div>
          <div style={{ fontFamily: theme.fonts.hand, fontSize: 46, lineHeight: 1.02, color: theme.color.text, marginTop: 14 }}>{greeting},<br />{Y.user.name}</div>
          <div style={{ fontSize: 15, color: theme.color.textMuted, marginTop: 10, fontStyle: 'italic' }}>מה על הפרק היום?</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, padding: '12px 0', borderTop: '1px solid ' + theme.color.line, borderBottom: '1px solid ' + theme.color.line }}>
            <ProgressRingLight done={done} total={todayTasks.length} theme={theme} />
            <span style={{ fontSize: 14, color: theme.color.text }}>סיימת <b>{done}</b> מתוך <b>{todayTasks.length}</b> משימות — יום יפה מחכה לך</span>
          </div>
        </div>
      );
    } else {
      hero = (
        <div style={{ padding: (TOP_INSET + 12) + 'px 18px 6px' }}>
          <div style={{ background: theme.color.surface, borderRadius: theme.radius.card, boxShadow: theme.cardShadow, padding: '18px 18px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: theme.color.textMuted }}>{dateLabel}</div>
                <div style={{ fontFamily: theme.fonts.hand, fontSize: 34, lineHeight: 1.05, color: theme.color.text, marginTop: 4 }}>{greeting}, {Y.user.name}</div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: theme.color.primarySoft, color: theme.color.primaryDeep, borderRadius: 99, padding: '7px 12px', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                <Icon.sun size={15} color={theme.color.primaryDeep} />{Y.weather.temp}°
              </span>
            </div>
            <div style={{ fontSize: 14, color: theme.color.textMuted, marginTop: 8 }}>מה על הפרק היום?</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
              <div style={{ flex: 1, height: 7, borderRadius: 99, background: theme.color.surfaceAlt, overflow: 'hidden' }}>
                <div style={{ width: (todayTasks.length ? done / todayTasks.length * 100 : 0) + '%', height: '100%', background: theme.color.primary, borderRadius: 99, transition: 'width .5s' }} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: theme.color.primaryDeep, direction: 'ltr' }}>{done}/{todayTasks.length}</span>
            </div>
          </div>
        </div>
      );
    }

    const overlap = theme.heroStyle === 'block';

    return (
      <div>
        {hero}
        <div style={{ padding: '0 18px 24px', marginTop: overlap ? -42 : 0 }}>
          <div style={{ background: overlap ? theme.color.bg : 'transparent', borderRadius: overlap ? '26px 26px 0 0' : 0, paddingTop: overlap ? 20 : 8 }}>
            <SectionHead theme={theme} sub={Y.events.length + ' אירועים'}>היומן שלך</SectionHead>
            <div>{Y.events.map((ev, i) => <EventItem key={ev.id} ev={ev} theme={theme} last={i === Y.events.length - 1} />)}</div>

            <div style={{ height: 10 }} />
            <SectionHead theme={theme} sub={done + '/' + todayTasks.length + ' הושלמו'}>משימות היום</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {todayTasks.map(t => <TaskItem key={t.id} t={t} theme={theme} onToggle={onToggleTask} />)}
              <AddRow placeholder="הוסף משימה להיום…" theme={theme} onAdd={onAddTask} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Calendar screen ───────────────────────────────────────────
  function NavBtn({ children, onClick, theme }) {
    return (
      <button onClick={onClick} style={{
        width: 36, height: 36, borderRadius: 12, border: '1px solid ' + softLine(theme, '0.12'),
        background: theme.color.surface, boxShadow: theme.cardShadow, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent',
      }}>{children}</button>
    );
  }

  function CalendarScreen({ theme }) {
    const [month, setMonth] = useState(4);
    const year = 2026;
    const [sel, setSel] = useState(29);

    const grid = useMemo(() => {
      const first = new Date(year, month, 1).getDay();
      const days = new Date(year, month + 1, 0).getDate();
      const cells = [];
      for (let i = 0; i < first; i++) cells.push(null);
      for (let d = 1; d <= days; d++) cells.push(d);
      return cells;
    }, [month]);

    const dots = month === 4 ? Y.monthDots : {};
    const agenda = (month === 4 && Y.dayAgenda[sel]) ? Y.dayAgenda[sel] : [];

    return (
      <div style={{ padding: (TOP_INSET + 8) + 'px 16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, padding: '0 2px' }}>
          <h1 style={{ margin: 0, fontFamily: theme.fonts.hand, fontWeight: 400, fontSize: Math.round(34 * theme.headingScale), color: theme.color.text }}>{Y.monthNames[month]} {year}</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <NavBtn theme={theme} onClick={() => setMonth(m => (m + 11) % 12)}><Icon.chevR size={18} color={theme.color.text} /></NavBtn>
            <NavBtn theme={theme} onClick={() => setMonth(m => (m + 1) % 12)}><Icon.chevL size={18} color={theme.color.text} /></NavBtn>
          </div>
        </div>

        <div style={{ background: theme.color.surface, borderRadius: theme.radius.card, boxShadow: theme.cardShadow, padding: '14px 12px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
            {Y.weekdaysShort.map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: theme.color.textMuted, padding: '4px 0' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, rowGap: 4 }}>
            {grid.map((d, i) => {
              if (!d) return <div key={i} />;
              const isToday = month === 4 && d === 29;
              const isSel = d === sel;
              const dayDots = dots[d] || [];
              return (
                <button key={i} onClick={() => setSel(d)} style={{
                  border: 'none', cursor: 'pointer',
                  background: isSel ? theme.color.primary : (isToday ? theme.color.primarySoft : 'transparent'),
                  borderRadius: 13, padding: '7px 0 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  transition: 'background .15s', WebkitTapHighlightColor: 'transparent',
                }}>
                  <span style={{ fontSize: 14.5, fontWeight: (isToday || isSel) ? 700 : 500, color: isSel ? theme.color.onPrimary : (isToday ? theme.color.primaryDeep : theme.color.text), fontVariantNumeric: 'tabular-nums' }}>{d}</span>
                  <span style={{ display: 'flex', gap: 2.5, height: 6, alignItems: 'center' }}>
                    {dayDots.slice(0, 3).map((cid, k) => <span key={k} style={{ width: 5, height: 5, borderRadius: 99, background: isSel ? 'rgba(255,255,255,0.9)' : catColor(cid) }} />)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionHead theme={theme} sub={agenda.length ? agenda.length + ' אירועים' : ''}>{sel} ב{Y.monthNames[month]}</SectionHead>
          {agenda.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {agenda.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: theme.color.surface, borderRadius: theme.radius.tile, boxShadow: theme.cardShadow, borderInlineStart: '3px solid ' + catColor(a.cat) }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: theme.color.text, width: 44, fontVariantNumeric: 'tabular-nums' }}>{a.time}</span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: theme.color.text }}>{a.title}</span>
                  <CatDot id={a.cat} size={9} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '28px 16px', textAlign: 'center', background: theme.color.surface, borderRadius: theme.radius.card, boxShadow: theme.cardShadow }}>
              <div style={{ fontFamily: theme.fonts.hand, fontSize: 22, color: theme.color.text, marginBottom: 4 }}>יום פנוי לגמרי</div>
              <div style={{ fontSize: 13.5, color: theme.color.textMuted }}>אין אירועים מתוכננים ליום הזה</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Tasks + Shopping screen ───────────────────────────────────
  function TasksScreen({ theme, tasks, onToggleTask, onAddTask, shopping, onToggleShop, onAddShop }) {
    const [seg, setSeg] = useState('tasks');
    const todayTasks = tasks.filter(t => t.today);
    const laterTasks = tasks.filter(t => !t.today);
    const shopLeft = shopping.filter(s => !s.done).length;
    const aisles = useMemo(() => {
      const order = [];
      shopping.forEach(s => { if (!order.includes(s.aisle)) order.push(s.aisle); });
      return order;
    }, [shopping]);

    return (
      <div style={{ padding: (TOP_INSET + 8) + 'px 18px 24px' }}>
        <h1 style={{ margin: '0 2px 14px', fontFamily: theme.fonts.hand, fontWeight: 400, fontSize: Math.round(34 * theme.headingScale), color: theme.color.text }}>הרשימות שלך</h1>

        <div style={{ display: 'flex', gap: 4, background: theme.color.surfaceAlt, borderRadius: 99, padding: 4, marginBottom: 18 }}>
          {[['tasks', 'משימות'], ['shopping', 'קניות']].map(([k, label]) => (
            <button key={k} onClick={() => setSeg(k)} style={{
              flex: 1, border: 'none', cursor: 'pointer', borderRadius: 99, padding: '9px 0',
              background: seg === k ? theme.color.surface : 'transparent',
              color: seg === k ? theme.color.text : theme.color.textMuted,
              boxShadow: seg === k ? theme.cardShadow : 'none',
              fontFamily: theme.fonts.body, fontSize: 14.5, fontWeight: 700, transition: 'all .18s',
            }}>{label}</button>
          ))}
        </div>

        {seg === 'tasks' ? (
          <div>
            <SectionHead theme={theme} sub={todayTasks.filter(t => t.done).length + '/' + todayTasks.length}>היום</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {todayTasks.map(t => <TaskItem key={t.id} t={t} theme={theme} onToggle={onToggleTask} />)}
            </div>
            <div style={{ height: 18 }} />
            <SectionHead theme={theme}>בהמשך</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {laterTasks.map(t => <TaskItem key={t.id} t={t} theme={theme} onToggle={onToggleTask} />)}
              <AddRow placeholder="הוסף משימה חדשה…" theme={theme} onAdd={onAddTask} />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: theme.color.textMuted, fontSize: 13.5 }}>
              <Icon.cart size={17} color={theme.color.primary} />
              <span>נשארו <b style={{ color: theme.color.text }}>{shopLeft}</b> פריטים לקנות</span>
            </div>
            {aisles.map(aisle => (
              <div key={aisle} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.color.textMuted, margin: '0 2px 7px', letterSpacing: 0.3 }}>{aisle}</div>
                <div style={{ background: theme.color.surface, borderRadius: theme.radius.tile, boxShadow: theme.cardShadow, overflow: 'hidden' }}>
                  {shopping.filter(s => s.aisle === aisle).map((s, i, arr) => (
                    <div key={s.id} onClick={() => onToggleShop(s.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer',
                      borderBottom: i < arr.length - 1 ? '1px solid ' + theme.color.line : 'none', opacity: s.done ? 0.5 : 1,
                    }}>
                      <Check checked={s.done} onToggle={() => onToggleShop(s.id)} theme={theme} />
                      <span style={{ flex: 1, fontSize: 15.5, fontWeight: 500, color: theme.color.text, textDecoration: s.done ? 'line-through' : 'none' }}>{s.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <AddRow placeholder="הוסף פריט לקנייה…" theme={theme} onAdd={onAddShop} />
          </div>
        )}
      </div>
    );
  }

  // ── Notes screen ──────────────────────────────────────────────
  function NotesScreen({ theme, notes, onAddNote }) {
    const [adding, setAdding] = useState(false);
    const sorted = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    const colA = sorted.filter((_, i) => i % 2 === 0);
    const colB = sorted.filter((_, i) => i % 2 === 1);
    const Card = ({ n }) => {
      const tone = theme.noteTones[n.tone] || theme.noteTones.plain;
      return (
        <div style={{ background: tone.bg, border: '1px solid ' + tone.edge, borderRadius: theme.radius.tile, padding: '13px 14px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ fontFamily: theme.fonts.hand, fontSize: 20, color: tone.text, lineHeight: 1.15 }}>{n.title}</div>
            {n.pinned && <Icon.pin size={15} color={tone.text} />}
          </div>
          {n.body && <div style={{ fontSize: 13.5, color: tone.text, opacity: 0.82, marginTop: 7, lineHeight: 1.5 }}>{n.body}</div>}
        </div>
      );
    };
    return (
      <div style={{ padding: (TOP_INSET + 8) + 'px 18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 2px 16px' }}>
          <h1 style={{ margin: 0, fontFamily: theme.fonts.hand, fontWeight: 400, fontSize: Math.round(34 * theme.headingScale), color: theme.color.text }}>פתקים</h1>
          <NavBtn theme={theme} onClick={() => setAdding(a => !a)}><Icon.plus size={18} color={theme.color.text} /></NavBtn>
        </div>
        {adding && <div style={{ marginBottom: 14 }}><AddRow placeholder="כותרת לפתק חדש…" theme={theme} onAdd={(t) => { onAddNote(t); setAdding(false); }} /></div>}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>{colA.map(n => <Card key={n.id} n={n} />)}</div>
          <div style={{ flex: 1 }}>{colB.map(n => <Card key={n.id} n={n} />)}</div>
        </div>
      </div>
    );
  }

  // ── Tab bar ───────────────────────────────────────────────────
  function TabBar({ tab, setTab, theme }) {
    const items = [
      ['today', 'היום', Icon.today],
      ['calendar', 'יומן', Icon.calendar],
      ['tasks', 'רשימות', Icon.checkCircle],
      ['notes', 'פתקים', Icon.note],
    ];
    return (
      <div style={{
        flexShrink: 0, display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '8px 10px 26px', background: theme.color.surface,
        borderTop: '1px solid ' + theme.color.line, boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
      }}>
        {items.map(([k, label, Ic]) => {
          const active = tab === k;
          return (
            <button key={k} onClick={() => setTab(k)} style={{
              border: 'none', background: 'transparent', cursor: 'pointer', flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              color: active ? theme.color.primary : theme.color.textMuted, WebkitTapHighlightColor: 'transparent',
            }}>
              <Ic size={23} color={active ? theme.color.primary : theme.color.textMuted} sw={active ? 2.1 : 1.7} />
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, fontFamily: theme.fonts.body }}>{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── App shell ─────────────────────────────────────────────────
  function YomiApp({ theme }) {
    const [tab, setTab] = useState('today');
    const [tasks, setTasks] = useState(Y.tasks.map(t => ({ ...t })));
    const [shopping, setShopping] = useState(Y.shopping.map(s => ({ ...s })));
    const [notes, setNotes] = useState(Y.notes.map(n => ({ ...n })));
    const idc = useRef(100);

    const toggleTask = (id) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
    const addTask = (title) => setTasks(ts => [...ts, { id: 'nt' + (++idc.current), title, cat: 'personal', done: false, time: null, today: true }]);
    const toggleShop = (id) => setShopping(ss => ss.map(s => s.id === id ? { ...s, done: !s.done } : s));
    const addShop = (title) => setShopping(ss => [...ss, { id: 'ns' + (++idc.current), title, done: false, aisle: 'אחר' }]);
    const addNote = (title) => setNotes(ns => [{ id: 'nn' + (++idc.current), title, body: '', tone: 'plain', pinned: false }, ...ns]);

    return (
      <div dir="rtl" style={{
        height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: theme.color.bg, color: theme.color.text, fontFamily: theme.fonts.body, WebkitFontSmoothing: 'antialiased',
      }}>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {tab === 'today' && <TodayScreen theme={theme} tasks={tasks} onToggleTask={toggleTask} onAddTask={addTask} />}
          {tab === 'calendar' && <CalendarScreen theme={theme} />}
          {tab === 'tasks' && <TasksScreen theme={theme} tasks={tasks} onToggleTask={toggleTask} onAddTask={addTask} shopping={shopping} onToggleShop={toggleShop} onAddShop={addShop} />}
          {tab === 'notes' && <NotesScreen theme={theme} notes={notes} onAddNote={addNote} />}
        </div>
        <TabBar tab={tab} setTab={setTab} theme={theme} />
      </div>
    );
  }

  window.YomiApp = YomiApp;
})();
