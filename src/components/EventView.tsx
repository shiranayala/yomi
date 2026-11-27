import { theme, catColor } from '../theme';
import { Icon } from '../icons';
import { Chip } from './atoms';
import { useCats } from '../lib/CategoriesContext';
import { RECURRENCE_OPTIONS } from './FormFields';
import type { CalEvent } from '../lib/types';
import { longDayLabel } from '../lib/taskDays';

const T = theme;

const pill: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '5px 11px', borderRadius: 99, background: T.color.surfaceAlt,
  color: T.color.text, fontSize: 13.5, fontWeight: 600,
};

/** Read-only look at an event. Edit / delete live in the sheet header. */
export function EventView({ event, date }: { event: CalEvent; date?: string }) {
  const cats = useCats();
  const day = date ?? event.date;
  const rec = event.recurrence && event.recurrence !== 'once'
    ? RECURRENCE_OPTIONS.find(o => o.value === event.recurrence)?.label
    : null;
  const hours = event.end ? `${event.time}–${event.end}` : event.time;

  return (
    <div dir="rtl" style={{ fontFamily: T.fonts.body }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{
          width: 5, alignSelf: 'stretch', minHeight: 26, borderRadius: 99, flexShrink: 0,
          background: catColor(event.cat, cats),
        }} />
        <div style={{
          flex: 1, minWidth: 0,
          fontFamily: T.fonts.heading, fontSize: 21, fontWeight: 800, lineHeight: 1.3,
          letterSpacing: '-0.3px', color: T.color.text, wordBreak: 'break-word',
        }}>{event.title}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
        <span style={pill}>
          <Icon.calendar size={14} color={T.color.textMuted} sw={1.8} />{longDayLabel(day)}
        </span>
        <span style={pill}>
          <Icon.clock size={14} color={T.color.textMuted} /><span dir="ltr">{hours}</span>
        </span>
        {rec && <span style={pill}><Icon.repeat size={14} color={T.color.textMuted} />{rec}</span>}
        <Chip id={event.cat} />
      </div>

      {event.place && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 14, fontSize: 15, color: T.color.text }}>
          <Icon.mapPin size={16} color={T.color.primaryDeep} />{event.place}
        </div>
      )}

      {event.notes && (
        <div style={{
          marginTop: 16, padding: '12px 14px', borderRadius: T.radius.tile,
          background: T.color.bg, color: T.color.text,
          fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>{event.notes}</div>
      )}
    </div>
  );
}
