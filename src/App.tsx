import { useState, useEffect, useRef } from 'react';
import { theme } from './theme';
import { TabBar, type TabId } from './components/TabBar';
import { FAB } from './components/FAB';
import { BottomSheet } from './components/BottomSheet';
import { EventForm } from './components/EventForm';
import { TaskForm } from './components/TaskForm';
import { TodayScreen } from './screens/TodayScreen';
import { TasksScreen } from './screens/TasksScreen';
import { ShoppingScreen } from './screens/ShoppingScreen';
import { NotesScreen } from './screens/NotesScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { sampleTasks, sampleShopping, sampleNotes, sampleEvents } from './lib/data';
import { supabase } from './lib/supabase';
import { todayStr } from './lib/recurrence';
import type { Task, ShoppingItem, Note, CalEvent } from './lib/types';

const T = theme;

type FormState =
  | { kind: 'none' }
  | { kind: 'addTask' }
  | { kind: 'addEvent' }
  | { kind: 'editTask'; task: Task }
  | { kind: 'editEvent'; event: CalEvent };

export default function App() {
  const [tab, setTab]         = useState<TabId>('today');
  const [tasks, setTasks]     = useState<Task[]>(sampleTasks.map(t => ({ ...t })));
  const [shopping, setShopping] = useState<ShoppingItem[]>(sampleShopping.map(s => ({ ...s })));
  const [notes, setNotes]     = useState<Note[]>(sampleNotes.map(n => ({ ...n })));
  const [events, setEvents]   = useState<CalEvent[]>(sampleEvents.map(e => ({ ...e })));
  const [form, setForm]       = useState<FormState>({ kind: 'none' });
  const idc = useRef(300);

  // Load from Supabase on mount
  useEffect(() => {
    if (!supabase) return;
    supabase.from('tasks').select('*').then(({ data }) => { if (data?.length) setTasks(data as Task[]); });
    supabase.from('shopping').select('*').then(({ data }) => { if (data?.length) setShopping(data as ShoppingItem[]); });
    supabase.from('notes').select('*').then(({ data }) => { if (data?.length) setNotes(data as Note[]); });
    supabase.from('events').select('*').then(({ data }) => { if (data?.length) setEvents(data as CalEvent[]); });
  }, []);

  // ── Task operations ──────────────────────────────────────────────
  const toggleTask = (id: string) => {
    setTasks(ts => {
      const next = ts.map(t => t.id === id ? { ...t, done: !t.done } : t);
      const t = next.find(t => t.id === id);
      if (supabase && t) supabase.from('tasks').update({ done: t.done }).eq('id', id);
      return next;
    });
  };

  const saveTask = (t: Task) => {
    const isNew = !tasks.find(x => x.id === t.id);
    setTasks(ts => isNew ? [...ts, t] : ts.map(x => x.id === t.id ? t : x));
    if (supabase) {
      isNew
        ? supabase.from('tasks').insert(t)
        : supabase.from('tasks').update(t).eq('id', t.id);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(ts => ts.filter(t => t.id !== id));
    if (supabase) supabase.from('tasks').delete().eq('id', id);
  };

  // Quick-add from AddRow (general, today)
  const quickAddTask = (title: string) => {
    saveTask({
      id: 'nt' + (++idc.current),
      title, cat: 'personal', done: false,
      time: null, today: true, type: 'general', recurrence: 'once',
    });
  };

  // ── Event operations ─────────────────────────────────────────────
  const saveEvent = (ev: CalEvent) => {
    const isNew = !events.find(x => x.id === ev.id);
    setEvents(evs => isNew ? [...evs, ev] : evs.map(x => x.id === ev.id ? ev : x));
    if (supabase) {
      isNew
        ? supabase.from('events').insert(ev)
        : supabase.from('events').update(ev).eq('id', ev.id);
    }
  };

  const deleteEvent = (id: string) => {
    setEvents(evs => evs.filter(e => e.id !== id));
    if (supabase) supabase.from('events').delete().eq('id', id);
  };

  // ── Shopping operations ──────────────────────────────────────────
  const toggleShop = (id: string) => {
    setShopping(ss => {
      const next = ss.map(s => s.id === id ? { ...s, done: !s.done } : s);
      const s = next.find(s => s.id === id);
      if (supabase && s) supabase.from('shopping').update({ done: s.done }).eq('id', id);
      return next;
    });
  };

  const addShop = (title: string) => {
    const item: ShoppingItem = { id: 'ns' + (++idc.current), title, done: false, aisle: 'אחר' };
    setShopping(ss => [...ss, item]);
    if (supabase) supabase.from('shopping').insert(item);
  };

  // ── Note operations ──────────────────────────────────────────────
  const addNote = (title: string) => {
    const note: Note = { id: 'nn' + (++idc.current), title, body: '', tone: 'plain', pinned: false };
    setNotes(ns => [note, ...ns]);
    if (supabase) supabase.from('notes').insert(note);
  };

  // ── Form helpers ─────────────────────────────────────────────────
  const closeForm = () => setForm({ kind: 'none' });

  const formOpen = form.kind !== 'none';
  const isTaskForm  = form.kind === 'addTask'  || form.kind === 'editTask';
  const isEventForm = form.kind === 'addEvent' || form.kind === 'editEvent';

  return (
    <div dir="rtl" style={{
      height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: T.color.bg, color: T.color.text,
      fontFamily: T.fonts.body, WebkitFontSmoothing: 'antialiased',
      maxWidth: 480, margin: '0 auto', position: 'relative',
    }}>
      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'today' && (
          <TodayScreen
            tasks={tasks} events={events}
            onToggleTask={toggleTask}
            onAddTask={quickAddTask}
            onEditTask={t => setForm({ kind: 'editTask', task: t })}
            onEditEvent={ev => setForm({ kind: 'editEvent', event: ev })}
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
            onEditEvent={ev => setForm({ kind: 'editEvent', event: ev })}
          />
        )}
      </div>

      {/* FAB */}
      <FAB
        onAddTask={() => setForm({ kind: 'addTask' })}
        onAddEvent={() => setForm({ kind: 'addEvent' })}
      />

      <TabBar tab={tab} setTab={setTab} />

      {/* Task form sheet */}
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

      {/* Event form sheet */}
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
