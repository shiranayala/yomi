import { useState, useEffect, useRef } from 'react';
import { theme } from './theme';
import { TabBar, type TabId } from './components/TabBar';
import { BottomSheet } from './components/BottomSheet';
import { EventForm } from './components/EventForm';
import { TaskForm } from './components/TaskForm';
import { TodayScreen } from './screens/TodayScreen';
import { TasksScreen } from './screens/TasksScreen';
import { ShoppingScreen } from './screens/ShoppingScreen';
import { NotesScreen } from './screens/NotesScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { sampleTasks, sampleShopping, sampleNotes, sampleEvents } from './lib/data';
import { db, collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from './lib/firebase';
import type { Task, ShoppingItem, Note, CalEvent } from './lib/types';

const T = theme;

type FormState =
  | { kind: 'none' }
  | { kind: 'addTask' }
  | { kind: 'addEvent' }
  | { kind: 'editTask'; task: Task }
  | { kind: 'editEvent'; event: CalEvent };

// Firestore helpers
function fsSet(col: string, id: string, data: object) {
  if (!db) return;
  setDoc(doc(db, col, id), data);
}
function fsUpdate(col: string, id: string, data: object) {
  if (!db) return;
  updateDoc(doc(db, col, id), data);
}
function fsDel(col: string, id: string) {
  if (!db) return;
  deleteDoc(doc(db, col, id));
}

export default function App() {
  const [tab, setTab]           = useState<TabId>('today');
  const [tasks, setTasks]       = useState<Task[]>(sampleTasks.map(t => ({ ...t })));
  const [shopping, setShopping] = useState<ShoppingItem[]>(sampleShopping.map(s => ({ ...s })));
  const [notes, setNotes]       = useState<Note[]>(sampleNotes.map(n => ({ ...n })));
  const [events, setEvents]     = useState<CalEvent[]>(sampleEvents.map(e => ({ ...e })));
  const [form, setForm]         = useState<FormState>({ kind: 'none' });
  const idc = useRef(300);

  // Load from Firestore on mount; seed collection if empty
  useEffect(() => {
    if (!db) return;

    async function loadOrSeed<T extends { id: string }>(
      col: string,
      seed: T[],
      setter: (v: T[]) => void,
    ) {
      const snap = await getDocs(collection(db!, col));
      if (snap.empty) {
        await Promise.all(seed.map(item => setDoc(doc(db!, col, item.id), item)));
        setter(seed);
      } else {
        setter(snap.docs.map(d => d.data() as T));
      }
    }

    loadOrSeed('tasks',    sampleTasks.map(t => ({ ...t })),    setTasks);
    loadOrSeed('shopping', sampleShopping.map(s => ({ ...s })), setShopping);
    loadOrSeed('notes',    sampleNotes.map(n => ({ ...n })),    setNotes);
    loadOrSeed('events',   sampleEvents.map(e => ({ ...e })),   setEvents);
  }, []);

  // ── Task operations ──────────────────────────────────────────────
  const toggleTask = (id: string) => {
    setTasks(ts => {
      const next = ts.map(t => t.id === id ? { ...t, done: !t.done } : t);
      const t = next.find(t => t.id === id);
      if (t) fsUpdate('tasks', id, { done: t.done });
      return next;
    });
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
  const addNote = (title: string) => {
    const note: Note = { id: 'nn' + (++idc.current), title, body: '', tone: 'plain', pinned: false };
    setNotes(ns => [note, ...ns]);
    fsSet('notes', note.id, note);
  };

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
          <ShoppingScreen shopping={shopping} onToggle={toggleShop} onAdd={addShop} />
        )}
        {tab === 'notes' && (
          <NotesScreen notes={notes} onAdd={addNote} />
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

      <BottomSheet
        open={isTaskForm}
        onClose={closeForm}
        title={form.kind === 'editTask' ? 'עריכת משימה' : 'משימה חדשה'}
      >
        {isTaskForm && (
          <TaskForm
            initial={form.kind === 'editTask' ? form.task : undefined}
            onSave={saveTask}
            onDelete={form.kind === 'editTask' ? deleteTask : undefined}
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
            onSave={saveEvent}
            onDelete={form.kind === 'editEvent' ? deleteEvent : undefined}
            onClose={closeForm}
          />
        )}
      </BottomSheet>
    </div>
  );
}
