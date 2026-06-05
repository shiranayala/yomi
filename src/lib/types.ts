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
}

export interface Task {
  id: string;
  title: string;
  cat: CatId;
  done: boolean;
  time: string | null;
  today: boolean;
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
  notes?: string;
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
