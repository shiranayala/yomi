import { useState, useEffect, useRef } from 'react';
import { theme } from './theme';
import { TabBar, type TabId } from './components/TabBar';
import { TodayScreen } from './screens/TodayScreen';
import { TasksScreen } from './screens/TasksScreen';
import { ShoppingScreen } from './screens/ShoppingScreen';
import { NotesScreen } from './screens/NotesScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { sampleTasks, sampleShopping, sampleNotes } from './lib/data';
import { supabase } from './lib/supabase';
import type { Task, ShoppingItem, Note } from './lib/types';

const T = theme;

export default function App() {
  const [tab, setTab] = useState<TabId>('today');
  const [tasks, setTasks] = useState<Task[]>(sampleTasks.map(t => ({ ...t })));
  const [shopping, setShopping] = useState<ShoppingItem[]>(sampleShopping.map(s => ({ ...s })));
  const [notes, setNotes] = useState<Note[]>(sampleNotes.map(n => ({ ...n })));
  const idc = useRef(200);

  // Load from Supabase on mount
  useEffect(() => {
    if (!supabase) return;
    supabase.from('tasks').select('*').then(({ data }) => {
      if (data && data.length) setTasks(data as Task[]);
    });
    supabase.from('shopping').select('*').then(({ data }) => {
      if (data && data.length) setShopping(data as ShoppingItem[]);
    });
    supabase.from('notes').select('*').then(({ data }) => {
      if (data && data.length) setNotes(data as Note[]);
    });
  }, []);

  // Task operations
  const toggleTask = (id: string) => {
    setTasks(ts => {
      const next = ts.map(t => t.id === id ? { ...t, done: !t.done } : t);
      const t = next.find(t => t.id === id);
      if (supabase && t) supabase.from('tasks').update({ done: t.done }).eq('id', id);
      return next;
    });
  };

  const addTask = (title: string) => {
    const newTask: Task = {
      id: 'nt' + (++idc.current),
      title, cat: 'personal', done: false, time: null, today: true,
    };
    setTasks(ts => [...ts, newTask]);
    if (supabase) supabase.from('tasks').insert(newTask);
  };

  // Shopping operations
  const toggleShop = (id: string) => {
    setShopping(ss => {
      const next = ss.map(s => s.id === id ? { ...s, done: !s.done } : s);
      const s = next.find(s => s.id === id);
      if (supabase && s) supabase.from('shopping').update({ done: s.done }).eq('id', id);
      return next;
    });
  };

  const addShop = (title: string) => {
    const newItem: ShoppingItem = {
      id: 'ns' + (++idc.current),
      title, done: false, aisle: 'אחר',
    };
    setShopping(ss => [...ss, newItem]);
    if (supabase) supabase.from('shopping').insert(newItem);
  };

  // Note operations
  const addNote = (title: string) => {
    const newNote: Note = {
      id: 'nn' + (++idc.current),
      title, body: '', tone: 'plain', pinned: false,
    };
    setNotes(ns => [newNote, ...ns]);
    if (supabase) supabase.from('notes').insert(newNote);
  };

  return (
    <div dir="rtl" style={{
      height: '100dvh',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: T.color.bg, color: T.color.text,
      fontFamily: T.fonts.body, WebkitFontSmoothing: 'antialiased',
      maxWidth: 480, margin: '0 auto',
    }}>
      <div style={{ flex: 1, overflowY: 'auto' as const, overflowX: 'hidden' as const }}>
        {tab === 'today'    && <TodayScreen tasks={tasks} onToggleTask={toggleTask} onAddTask={addTask} />}
        {tab === 'tasks'    && <TasksScreen tasks={tasks} onToggleTask={toggleTask} onAddTask={addTask} />}
        {tab === 'shopping' && <ShoppingScreen shopping={shopping} onToggle={toggleShop} onAdd={addShop} />}
        {tab === 'notes'    && <NotesScreen notes={notes} onAdd={addNote} />}
        {tab === 'calendar' && <CalendarScreen />}
      </div>
      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
}
