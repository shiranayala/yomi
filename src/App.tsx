import { useState, useEffect, useRef } from 'react';
import { theme } from './theme';
import { TabBar, type TabId } from './components/TabBar';
import { BottomSheet } from './components/BottomSheet';
import { EventForm } from './components/EventForm';
import { TaskForm } from './components/TaskForm';
import { NoteEditor } from './components/NoteEditor';
import { TodayScreen } from './screens/TodayScreen';

import { TasksScreen } from './screens/TasksScreen';
import { ShoppingScreen } from './screens/ShoppingScreen';
import { NotesScreen } from './screens/NotesScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { db, collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from './lib/firebase';
import type { Task, ShoppingItem, Note, CalEvent, Tag } from './lib/types';

const T = theme;

type FormState =
  | { kind: 'none' }
  | { kind: 'addTask' }
  | { kind: 'addEvent' }
  | { kind: 'editTask'; task: Task }
  | { kind: 'editEvent'; event: CalEvent };

// Strip undefined values — Firestore throws on undefined fields
function clean(data: object): object {
  return JSON.parse(JSON.stringify(data));
}

// Firestore helpers
function fsSet(col: string, id: string, data: object) {
  if (!db) return;
  setDoc(doc(db, col, id), clean(data)).catch(console.error);
}
function fsUpdate(col: string, id: string, data: object) {
  if (!db) return;
  updateDoc(doc(db, col, id), clean(data)).catch(console.error);
}
function fsDel(col: string, id: string) {
  if (!db) return;
  deleteDoc(doc(db, col, id));
}

export default function App() {
  const [tab, setTab]           = useState<TabId>('today');
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [notes, setNotes]       = useState<Note[]>([]);
  const [events, setEvents]     = useState<CalEvent[]>([]);
  const [form, setForm]         = useState<FormState>({ kind: 'none' });
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [tags, setTags]         = useState<Tag[]>([]);
  const idc = useRef(300);

  // Load from Firestore on mount — skip known sample-data IDs
  useEffect(() => {
    if (!db) return;
    const SAMPLE_IDS = new Set(['e1','e2','e3','e4','e5','t1','t2','t3','t4','t5','t6','t7','t8','s1','s2','s3','s4','s5','s6','s7','s8','s9','n1','n2','n3','n4','n5']);

    async function load<T extends { id: string }>(col: string, setter: (v: T[]) => void) {
      const snap = await getDocs(collection(db!, col));
      const real: T[] = [];
      await Promise.all(snap.docs.map(async d => {
        if (SAMPLE_IDS.has(d.id)) {
          await deleteDoc(doc(db!, col, d.id));
        } else {
          real.push(d.data() as T);
        }
      }));
      setter(real);
    }

    load<Task>('tasks', setTasks);
    load<ShoppingItem>('shopping', setShopping);
    load<Note>('notes', setNotes);
    load<CalEvent>('events', setEvents);
    load<Tag>('tags', setTags);
  }, []);

  // ── Task operations ──────────────────────────────────────────────
  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newDone = !task.done;
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: newDone } : t));
    fsUpdate('tasks', id, { done: newDone });
  };

  const saveTask = (t: Task) => {
    const isNew = !tasks.find(x => x.id === t.id);
    setTasks(ts => isNew ? [...ts, t] : ts.map(x => x.id === t.id ? t : x));
    fsSet('tasks', t.id, t);
  };

  const deleteTask = (id: string) => {
    setTasks(ts => ts.filter(t => t.id !== id));
    fsDel('tasks', id);
  };

  const quickAddTask = (title: string) => {
    saveTask({
      id: 'nt' + (++idc.current),
      title, cat: 'personal', done: false,
      time: null, today: true, type: 'general', recurrence: 'once',
    });
  };

  // ── Event operations ─────────────────────────────────────────────
  const saveEvent = (ev: CalEvent) => {
    setEvents(evs => {
      const isNew = !evs.find(x => x.id === ev.id);
      return isNew ? [...evs, ev] : evs.map(x => x.id === ev.id ? ev : x);
    });
    fsSet('events', ev.id, ev);
  };

  const deleteEvent = (id: string) => {
    setEvents(evs => evs.filter(e => e.id !== id));
    fsDel('events', id);
  };

  // ── Shopping operations ──────────────────────────────────────────
  const toggleShop = (id: string) => {
    setShopping(ss => {
      const next = ss.map(s => s.id === id ? { ...s, done: !s.done } : s);
      const s = next.find(s => s.id === id);
      if (s) fsUpdate('shopping', id, { done: s.done });
      return next;
    });
  };

  const addShop = (title: string) => {
    const item: ShoppingItem = { id: 'ns' + (++idc.current), title, done: false, aisle: 'אחר' };
    setShopping(ss => [...ss, item]);
    fsSet('shopping', item.id, item);
  };

  // ── Note operations ──────────────────────────────────────────────
  const saveNote = (note: Note) => {
    setNotes(ns => {
      const isNew = !ns.find(x => x.id === note.id);
      return isNew ? [note, ...ns] : ns.map(x => x.id === note.id ? note : x);
    });
    fsSet('notes', note.id, note);
  };

  const openNewNote = () => {
    const newNote: Note = {
      id: 'nn' + (++idc.current),
      title: '', body: '', tone: 'plain', pinned: false,
    };
    setNotes(ns => [newNote, ...ns]);
    fsSet('notes', newNote.id, newNote);
    setEditingNote(newNote);
  };

  const deleteNote = (id: string) => {
    setNotes(ns => ns.filter(n => n.id !== id));
    fsDel('notes', id);
  };

  // ── Tag operations ────────────────────────────────────────────────
  const saveTag = (tag: Tag) => {
    setTags(ts => {
      const isNew = !ts.find(t => t.id === tag.id);
      return isNew ? [...ts, tag] : ts.map(t => t.id === tag.id ? tag : t);
    });
    fsSet('tags', tag.id, tag);
  };

  const deleteTag = (tagId: string) => {
    setTags(ts => ts.filter(t => t.id !== tagId));
    fsDel('tags', tagId);
    setNotes(ns => ns.map(n => {
      if (!n.tags?.includes(tagId)) return n;
      const updated = { ...n, tags: n.tags.filter(id => id !== tagId) };
      fsUpdate('notes', n.id, { tags: updated.tags });
      return updated;
    }));
  };

  // ── Shopping delete ──────────────────────────────────────────────
  const deleteShop = (id: string) => {
    setShopping(ss => ss.filter(s => s.id !== id));
    fsDel('shopping', id);
  };

  // ── Back button (Android / PWA) ──────────────────────────────────
  useEffect(() => {
    history.pushState(null, '', location.href);
    const onPop = () => {
      let handled = false;
      if (editingNote) {
        handled = true;
        history.pushState(null, '', location.href);
        // NoteEditor handles its own save on close
        setEditingNote(null);
      }
      setForm(f => {
        if (!handled && f.kind !== 'none') {
          handled = true;
          history.pushState(null, '', location.href);
          return { kind: 'none' };
        }
        return f;
      });
      if (!handled) {
        setTab(t => {
          if (t !== 'today') { history.pushState(null, '', location.href); return 'today'; }
          return t;
        });
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [editingNote]);

  // ── Form helpers ─────────────────────────────────────────────────
  const closeForm = () => setForm({ kind: 'none' });
  const isTaskForm  = form.kind === 'addTask'  || form.kind === 'editTask';
  const isEventForm = form.kind === 'addEvent' || form.kind === 'editEvent';

  return (
    <div dir="rtl" style={{
      height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: T.color.bg, color: T.color.text,
      fontFamily: T.fonts.body, WebkitFontSmoothing: 'antialiased',
      maxWidth: 480, margin: '0 auto', position: 'relative',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'today' && (
          <TodayScreen
            tasks={tasks} events={events}
            onToggleTask={toggleTask}
            onAddTask={quickAddTask}
            onEditTask={t => setForm({ kind: 'editTask', task: t })}
            onEditEvent={ev => setForm({ kind: 'editEvent', event: ev })}
            onOpenAddTask={() => setForm({ kind: 'addTask' })}
            onOpenAddEvent={() => setForm({ kind: 'addEvent' })}
          />
        )}
        {tab === 'tasks' && (
          <TasksScreen
            tasks={tasks}
            onToggleTask={toggleTask}
            onAddTask={quickAddTask}
            onEditTask={t => setForm({ kind: 'editTask', task: t })}
          />
        )}
        {tab === 'shopping' && (
          <ShoppingScreen shopping={shopping} onToggle={toggleShop} onAdd={addShop} onDelete={deleteShop} />
        )}
        {tab === 'notes' && (
          <NotesScreen
            notes={notes}
            tags={tags}
            onAdd={openNewNote}
            onEdit={n => setEditingNote(n)}
          />
        )}
        {tab === 'calendar' && (
          <CalendarScreen
            events={events}
            tasks={tasks}
            onEditEvent={ev => setForm({ kind: 'editEvent', event: ev })}
          />
        )}
      </div>

      <TabBar tab={tab} setTab={setTab} />

      {/* Note editor — full-screen overlay */}
      {editingNote && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
          <NoteEditor
            note={editingNote}
            allTags={tags}
            onSave={saveNote}
            onSaveTag={saveTag}
            onDeleteTag={deleteTag}
            onDelete={id => { deleteNote(id); setEditingNote(null); }}
            onClose={() => setEditingNote(null)}
          />
        </div>
      )}

      <BottomSheet
        open={isTaskForm}
        onClose={closeForm}
        title={form.kind === 'editTask' ? 'עריכת משימה' : 'משימה חדשה'}
      >
        {isTaskForm && (
          <TaskForm
            initial={form.kind === 'editTask' ? form.task : undefined}
            onSave={t => { saveTask(t); closeForm(); }}
            onDelete={form.kind === 'editTask' ? (id => { deleteTask(id); closeForm(); }) : undefined}
            onClose={closeForm}
          />
        )}
      </BottomSheet>

      <BottomSheet
        open={isEventForm}
        onClose={closeForm}
        title={form.kind === 'editEvent' ? 'עריכת אירוע' : 'אירוע חדש'}
      >
        {isEventForm && (
          <EventForm
            initial={form.kind === 'editEvent' ? form.event : undefined}
            onSave={ev => { saveEvent(ev); closeForm(); }}
            onDelete={form.kind === 'editEvent' ? (id => { deleteEvent(id); closeForm(); }) : undefined}
            onClose={closeForm}
          />
        )}
      </BottomSheet>
    </div>
  );
}
