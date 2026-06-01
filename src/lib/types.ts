export type CatId = 'work' | 'home' | 'health' | 'family' | 'personal';
export type NoteTone = 'amber' | 'green' | 'blue' | 'purple' | 'plain';

export interface Category {
  id: CatId;
  label: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  cat: CatId;
  done: boolean;
  time: string | null;
  today: boolean;
}

export interface ShoppingItem {
  id: string;
  title: string;
  done: boolean;
  aisle: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tone: NoteTone;
  pinned: boolean;
}

export interface Event {
  id: string;
  time: string;
  end: string;
  title: string;
  cat: CatId;
  place?: string;
}

export interface AgendaItem {
  time: string;
  title: string;
  cat: CatId;
}
