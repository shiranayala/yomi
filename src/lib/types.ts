export type CatId = string;
export type NoteTone = 'amber' | 'green' | 'blue' | 'purple' | 'plain';
export type Reminder = 'none' | '15min' | '1hour' | '1day';
export type Recurrence = 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type TaskType = 'general' | 'scheduled';

export interface Category {
  id: string;
  label: string;
  color: string;
  builtin?: boolean;
}

export interface ShoppingList {
  id: string;
  title: string;
  color?: string;
}

export interface Task {
  id: string;
  title: string;
  cat: CatId;
  done: boolean;
  time: string | null;
  today: boolean;
  todayDate?: string;   // YYYY-MM-DD — the day 'today' was set; used for daily rollover
  type?: TaskType;
  date?: string;        // YYYY-MM-DD — for scheduled tasks
  reminder?: Reminder;
  recurrence?: Recurrence;
  notes?: string;
}

export interface ShoppingItem {
  id: string;
  title: string;
  done: boolean;
  aisle: string;    // legacy
  listId?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string; // palette key from TAG_COLORS
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tone?: NoteTone; // legacy
  tags?: string[]; // tag IDs
  pinned: boolean;
}

export interface CalEvent {
  id: string;
  title: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:MM
  end?: string;        // HH:MM
  cat: CatId;
  place?: string;
  reminder?: Reminder;
  recurrence?: Recurrence;
  excludeDates?: string[]; // YYYY-MM-DD dates excluded from recurrence
  notes?: string;
  routineId?: string;  // links a scheduled weekly goal back to its source routine
  done?: boolean;      // for routine-linked events: marks the goal as completed
}

export interface AgendaItem {
  time: string;
  title: string;
  cat: CatId;
}

export interface Habit {
  id: string;
  title: string;
  createdAt: string; // YYYY-MM-DD
}

export interface HabitLog {
  id: string;       // `${habitId}_${date}`
  habitId: string;
  date: string;     // YYYY-MM-DD
}

/** Daily routine: tap-to-count actions like water, supplements, face exercises.
 *  Weekly goal: scheduled actions like gym 3×/wk, beach 1×/wk. */
export type RoutineKind = 'daily' | 'weekly';

export interface Routine {
  id: string;
  title: string;
  iconKey: string;   // → ROUTINE_ICONS[iconKey]
  colorKey: string;  // → ROUTINE_COLORS[colorKey]
  kind: RoutineKind;
  target: number;    // daily: count per day (e.g., 10 cups); weekly: occurrences per week
  duration?: number; // weekly only: default event length in minutes
  createdAt: string; // YYYY-MM-DD
}

/** Each tap on a daily block, or each completion of a weekly goal, writes one log row.
 *  date for daily = YYYY-MM-DD of that day; date for weekly = YYYY-MM-DD of Sunday (week start). */
export interface RoutineLog {
  id: string;        // `${routineId}_${date}_${seq}` or `${routineId}_${date}`
  routineId: string;
  date: string;      // YYYY-MM-DD
  count: number;     // increments by 1 per tap; aggregated as total for that period
  eventId?: string;  // optional: links a weekly completion back to a calendar event
}
