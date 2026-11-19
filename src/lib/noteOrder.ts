import type { Note } from './types';

/** Display order: pinned first, then by `order` (older notes without it keep their list position). */
export function sortNotes(notes: Note[]): Note[] {
  return notes
    .map((n, i) => ({ n, key: n.order ?? i }))
    .sort((a, b) => {
      if (a.n.pinned !== b.n.pinned) return a.n.pinned ? -1 : 1;
      return a.key - b.key;
    })
    .map(x => x.n);
}

/** An `order` value that puts a new note at the top. */
export function topNoteOrder(notes: Note[]): number {
  if (!notes.length) return 0;
  return Math.min(...notes.map((n, i) => n.order ?? i)) - 1;
}
