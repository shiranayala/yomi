import { useState, useEffect, useRef, useMemo } from 'react';
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
import { RoutineScreen } from './screens/RoutineScreen';
import { AuthScreen } from './screens/AuthScreen';
import { VerifyEmailScreen } from './screens/VerifyEmailScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { WeatherScreen } from './screens/WeatherScreen';
import {
  db, auth, collection, doc, getDocs, setDoc, updateDoc, deleteDoc,
  onAuthStateChanged, authSignOut, getRedirectResult,
  type User,
} from './lib/firebase';
import type { Task, ShoppingItem, ShoppingList, Note, CalEvent, Tag, Habit, HabitLog, Category, Routine, RoutineLog } from './lib/types';
import { todayStr } from './lib/recurrence';
import { weekStartStr, todayStrLocal } from './lib/routineIcons';
import { CategoriesCtx, DEFAULT_CATEGORIES, pastelForCategoryId } from './lib/CategoriesContext';
import type { DateFormat } from './lib/dateFormat';

const T = theme;

type FormState =
  | { kind: 'none' }
  | { kind: 'addTask'; date?: string }
  | { kind: 'addEvent'; date?: string }
  | { kind: 'editTask'; task: Task }
  | { kind: 'editEvent'; event: CalEvent; occurrenceDate?: string };

type PendingEventOp =
  | { kind: 'save';   ev: CalEvent; occurrenceDate: string }
  | { kind: 'delete'; id: string;   occurrenceDate: string };

function clean(data: object): object {
  return JSON.parse(JSON.stringify(data));
}

export default function App() {
  // ── Auth ──────────────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined);
  const [reloadCount, setReloadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showWeather, setShowWeather]   = useState(false);

  const [dateFormat, setDateFormat] = useState<DateFormat>(
    () => (localStorage.getItem('dateFormat') as DateFormat) ?? 'gregorian'
  );

  useEffect(() => {
    if (!auth) return;
    // Complete any pending Google redirect sign-in
    getRedirectResult(auth)
      .then(result => { if (result?.user) setAuthUser(result.user); })
      .catch(e => console.error('redirect result:', e));
    return onAuthStateChanged(auth, u => setAuthUser(u));
  }, []);

  // ── App state ─────────────────────────────────────────────────────
  const [tab, setTab]           = useState<TabId>('today');
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [notes, setNotes]       = useState<Note[]>([]);
  const [events, setEvents]     = useState<CalEvent[]>([]);
  const [tags, setTags]         = useState<Tag[]>([]);
  const [habits, setHabits]         = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs]   = useState<HabitLog[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [userCategories, setUserCategories] = useState<Category[]>([]);
  const [routines, setRoutines]         = useState<Routine[]>([]);
  const [routineLogs, setRoutineLogs]   = useState<RoutineLog[]>([]);
  const [form, setForm]         = useState<FormState>({ kind: 'none' });
  const [pendingEventOp, setPendingEventOp] = useState<PendingEventOp | null>(null);
  const [fabOpen, setFabOpen]   = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

  const uid = authUser?.uid ?? null;

  // ── Firestore helpers (user-scoped) ──────────────────────────────
  function fsSet(col: string, id: string, data: object) {
    if (!db || !uid) return;
    setDoc(doc(db, 'users', uid, col, id), clean(data)).catch(console.error);
  }
  function fsUpdate(col: string, id: string, data: object) {
    if (!db || !uid) return;
    updateDoc(doc(db, 'users', uid, col, id), clean(data)).catch(console.error);
  }
  function fsDel(col: string, id: string) {
    if (!db || !uid) return;
    deleteDoc(doc(db, 'users', uid, col, id));
  }

  // ── Load data when user changes ───────────────────────────────────
  useEffect(() => {
    if (!uid || !db) {
      setTasks([]); setEvents([]); setNotes([]); setShopping([]); setTags([]);
      return;
    }
    async function load<T>(col: string, setter: (v: T[]) => void) {
      const snap = await getDocs(collection(db!, 'users', uid!, col));
      setter(snap.docs.map(d => d.data() as T));
    }
    load<Task>('tasks', setTasks);
    load<ShoppingItem>('shopping', setShopping);
    load<Note>('notes', setNotes);
    load<CalEvent>('events', setEvents);
    load<Tag>('tags', setTags);
    load<Habit>('habits', setHabits);
    load<HabitLog>('habitLogs', setHabitLogs);
    load<ShoppingList>('shoppingLists', setShoppingLists);
    load<Category>('categories', setUserCategories);
    load<Routine>('routines', setRoutines);
    load<RoutineLog>('routineLogs', setRoutineLogs);
  }, [uid]);

  // ── Task operations ───────────────────────────────────────────────
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
      id: 'nt' + genId(),
      title, cat: 'personal', done: false,
      time: null, today: true, todayDate: todayStr(), type: 'general', recurrence: 'once',
    });
  };

  const quickAddLaterTask = (title: string) => {
    saveTask({
      id: 'nt' + genId(),
      title, cat: 'personal', done: false,
      time: null, today: false, type: 'general', recurrence: 'once',
    });
  };

  const quickAddTomorrowTask = (title: string) => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    saveTask({
      id: 'nt' + genId(),
      title, cat: 'personal', done: false,
      time: null, today: false, type: 'general', recurrence: 'once',
      date: dateStr,
    });
  };

  const deferTask = (id: string) => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    setTasks(ts => ts.map(t => t.id === id ? { ...t, today: false, date: dateStr } : t));
    fsUpdate('tasks', id, { today: false, date: dateStr });
  };

  // ── Event operations ──────────────────────────────────────────────
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

  const handleEventSave = (ev: CalEvent) => {
    const original = events.find(x => x.id === ev.id);
    const isRecurring = original?.recurrence && original.recurrence !== 'once';
    if (original && isRecurring && form.kind === 'editEvent' && form.occurrenceDate) {
      setPendingEventOp({ kind: 'save', ev, occurrenceDate: form.occurrenceDate });
      closeForm();
      return;
    }
    saveEvent(ev);
    closeForm();
  };

  const handleEventDelete = (id: string) => {
    const ev = events.find(e => e.id === id);
    const isRecurring = ev?.recurrence && ev.recurrence !== 'once';
    if (ev && isRecurring && form.kind === 'editEvent' && form.occurrenceDate) {
      setPendingEventOp({ kind: 'delete', id, occurrenceDate: form.occurrenceDate });
      closeForm();
      return;
    }
    deleteEvent(id);
    closeForm();
  };

  const applyEventScopeThis = () => {
    if (!pendingEventOp) return;
    if (pendingEventOp.kind === 'save') {
      const { ev, occurrenceDate } = pendingEventOp;
      const original = events.find(x => x.id === ev.id);
      if (original) {
        const updated = { ...original, excludeDates: [...(original.excludeDates ?? []), occurrenceDate] };
        setEvents(evs => evs.map(e => e.id === original.id ? updated : e));
        fsSet('events', original.id, updated);
      }
      const newId = 'ev' + Date.now();
      const { excludeDates: _ex, ...evBase } = ev;
      const newEv: CalEvent = { ...evBase, id: newId, date: occurrenceDate, recurrence: 'once' };
      setEvents(evs => [...evs, newEv]);
      fsSet('events', newId, newEv);
    } else {
      const original = events.find(x => x.id === pendingEventOp.id);
      if (original) {
        const updated = { ...original, excludeDates: [...(original.excludeDates ?? []), pendingEventOp.occurrenceDate] };
        setEvents(evs => evs.map(e => e.id === original.id ? updated : e));
        fsSet('events', original.id, updated);
      }
    }
    setPendingEventOp(null);
  };

  const applyEventScopeSeries = () => {
    if (!pendingEventOp) return;
    if (pendingEventOp.kind === 'save') {
      saveEvent(pendingEventOp.ev);
    } else {
      deleteEvent(pendingEventOp.id);
    }
    setPendingEventOp(null);
  };

  // ── Shopping operations ───────────────────────────────────────────
  const toggleShop = (id: string) => {
    setShopping(ss => {
      const next = ss.map(s => s.id === id ? { ...s, done: !s.done } : s);
      const s = next.find(s => s.id === id);
      if (s) fsUpdate('shopping', id, { done: s.done });
      return next;
    });
  };

  const addShop = (title: string, listId: string) => {
    const item: ShoppingItem = { id: 'ns' + genId(), title, done: false, aisle: '', listId };
    setShopping(ss => [...ss, item]);
    fsSet('shopping', item.id, item);
  };

  const addShopList = (title: string, color: string): string => {
    const list: ShoppingList = { id: 'sl' + genId(), title, color };
    setShoppingLists(ls => [...ls, list]);
    fsSet('shoppingLists', list.id, list);
    return list.id;
  };

  const editShopList = (id: string, title: string, color?: string) => {
    setShoppingLists(ls => ls.map(l => l.id === id ? { ...l, title, ...(color ? { color } : {}) } : l));
    fsUpdate('shoppingLists', id, { title, ...(color ? { color } : {}) });
  };

  const deleteShopList = (id: string) => {
    setShoppingLists(ls => ls.filter(l => l.id !== id));
    fsDel('shoppingLists', id);
    const toDelete = shopping.filter(s => s.listId === id);
    setShopping(ss => ss.filter(s => s.listId !== id));
    toDelete.forEach(s => fsDel('shopping', s.id));
  };

  const deleteShop = (id: string) => {
    setShopping(ss => ss.filter(s => s.id !== id));
    fsDel('shopping', id);
  };

  // One-time cleanup of orphaned shopping items (items whose list was deleted)
  // Daily rollover: stale "today" tasks → done ones deleted, pending ones → overdue
  const taskRolloverDone = useRef(false);
  useEffect(() => {
    if (taskRolloverDone.current || !tasks.length) return;
    taskRolloverDone.current = true;
    const tStr = todayStr();
    const yesterday = (() => {
      const d = new Date(); d.setDate(d.getDate() - 1);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    })();
    tasks.forEach(t => {
      if (!t.today) return;
      const td = t.todayDate;
      if (!td) {
        // Legacy task with no stamp: done → delete, not done → treat as yesterday's
        if (t.done) { deleteTask(t.id); }
        else { saveTask({ ...t, today: false, date: yesterday }); }
        return;
      }
      if (td < tStr) {
        if (t.done) { deleteTask(t.id); }
        else { saveTask({ ...t, today: false, date: td }); }
      }
    });
  }, [tasks]); // eslint-disable-line react-hooks/exhaustive-deps

  const shopCleanupDone = useRef(false);
  useEffect(() => {
    if (shopCleanupDone.current || !shoppingLists.length) return;
    shopCleanupDone.current = true;
    const validIds = new Set(shoppingLists.map(l => l.id));
    const orphans = shopping.filter(s => s.listId && !validIds.has(s.listId));
    if (!orphans.length) return;
    setShopping(ss => ss.filter(s => !s.listId || validIds.has(s.listId)));
    orphans.forEach(s => fsDel('shopping', s.id));
  }, [shopping, shoppingLists]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Note operations ───────────────────────────────────────────────
  const saveNote = (note: Note) => {
    setNotes(ns => {
      const isNew = !ns.find(x => x.id === note.id);
      return isNew ? [note, ...ns] : ns.map(x => x.id === note.id ? note : x);
    });
    fsSet('notes', note.id, note);
  };

  const openNewNote = () => {
    const newNote: Note = {
      id: 'nn' + genId(),
      title: '', body: '', tone: 'plain', pinned: false,
    };
    saveNote(newNote);
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

  // ── Habit operations ─────────────────────────────────────────────
  const toggleHabit = (habitId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const logId = `${habitId}_${today}`;
    const existing = habitLogs.find(l => l.id === logId);
    if (existing) {
      setHabitLogs(ls => ls.filter(l => l.id !== logId));
      fsDel('habitLogs', logId);
    } else {
      const log: HabitLog = { id: logId, habitId, date: today };
      setHabitLogs(ls => [...ls, log]);
      fsSet('habitLogs', logId, log);
    }
  };

  const addHabit = (title: string) => {
    const habit: Habit = {
      id: 'hb' + Date.now(),
      title,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setHabits(hs => [...hs, habit]);
    fsSet('habits', habit.id, habit);
  };

  const editHabit = (id: string, title: string) => {
    setHabits(hs => hs.map(h => h.id === id ? { ...h, title } : h));
    fsUpdate('habits', id, { title });
  };

  const deleteHabit = (id: string) => {
    setHabits(hs => hs.filter(h => h.id !== id));
    fsDel('habits', id);
    const toDelete = habitLogs.filter(l => l.habitId === id);
    setHabitLogs(ls => ls.filter(l => l.habitId !== id));
    toDelete.forEach(l => fsDel('habitLogs', l.id));
  };

  // ── Category operations ───────────────────────────────────────────
  // Force the Aurora pastel palette on every category — builtin uses its
  // canonical pastel, custom categories get a deterministic pastel from the
  // shared 8-color palette. Saved labels are preserved.
  const allCategories = useMemo(() => {
    const merged: Record<string, Category> = { ...DEFAULT_CATEGORIES };
    userCategories.forEach(cat => {
      const def = DEFAULT_CATEGORIES[cat.id];
      if (def) {
        merged[cat.id] = { ...def, label: cat.label || def.label };
      } else {
        merged[cat.id] = { ...cat, color: pastelForCategoryId(cat.id) };
      }
    });
    return merged;
  }, [userCategories]);

  const saveCategory = (cat: Category) => {
    setUserCategories(cs => {
      const isNew = !cs.find(c => c.id === cat.id);
      return isNew ? [...cs, cat] : cs.map(c => c.id === cat.id ? cat : c);
    });
    fsSet('categories', cat.id, cat);
  };

  const addCategory = (label: string, color: string) => {
    const cat: Category = { id: 'cat' + genId(), label, color };
    setUserCategories(cs => [...cs, cat]);
    fsSet('categories', cat.id, cat);
  };

  const deleteCategory = (id: string) => {
    setUserCategories(cs => cs.filter(c => c.id !== id));
    fsDel('categories', id);
    const fallback = 'personal';
    const tasksToFix = tasks.filter(t => t.cat === id);
    if (tasksToFix.length) {
      setTasks(ts => ts.map(t => t.cat === id ? { ...t, cat: fallback } : t));
      tasksToFix.forEach(t => fsUpdate('tasks', t.id, { cat: fallback }));
    }
    const eventsToFix = events.filter(ev => ev.cat === id);
    if (eventsToFix.length) {
      setEvents(evs => evs.map(ev => ev.cat === id ? { ...ev, cat: fallback } : ev));
      eventsToFix.forEach(ev => fsUpdate('events', ev.id, { cat: fallback }));
    }
  };

  // ── Routine operations ────────────────────────────────────────────
  const createRoutine = (r: Omit<Routine, 'id' | 'createdAt'>) => {
    const routine: Routine = {
      ...r,
      id: 'rt' + Date.now() + Math.floor(Math.random() * 100),
      createdAt: todayStrLocal(),
    };
    setRoutines(rs => [...rs, routine]);
    fsSet('routines', routine.id, routine);
  };

  const deleteRoutine = (id: string) => {
    setRoutines(rs => rs.filter(r => r.id !== id));
    fsDel('routines', id);
    // Also drop its logs
    const orphanLogs = routineLogs.filter(l => l.routineId === id);
    if (orphanLogs.length) {
      setRoutineLogs(ls => ls.filter(l => l.routineId !== id));
      orphanLogs.forEach(l => fsDel('routineLogs', l.id));
    }
  };

  /** Increment (or decrement) the counter for a routine on today/this-week.
   *  delta = +1 to tap, -1 to undo. Daily uses today's date; weekly uses week start. */
  const logRoutineTap = (routineId: string, delta: number) => {
    const r = routines.find(x => x.id === routineId);
    if (!r) return;
    const periodDate = r.kind === 'daily' ? todayStrLocal() : weekStartStr();
    const logId = `${routineId}_${periodDate}`;
    const existing = routineLogs.find(l => l.id === logId);
    const nextCount = Math.max(0, (existing?.count ?? 0) + delta);
    if (nextCount === 0 && existing) {
      setRoutineLogs(ls => ls.filter(l => l.id !== logId));
      fsDel('routineLogs', logId);
      return;
    }
    const log: RoutineLog = {
      id: logId,
      routineId,
      date: periodDate,
      count: nextCount,
    };
    if (existing) {
      setRoutineLogs(ls => ls.map(l => l.id === logId ? log : l));
    } else {
      setRoutineLogs(ls => [...ls, log]);
    }
    fsSet('routineLogs', logId, log);
  };

  /** Create a calendar event prefilled from a weekly routine. */
  const scheduleWeeklyRoutine = (routine: Routine, date: string, time: string) => {
    let end: string | undefined;
    if (routine.duration) {
      const [hh, mm] = time.split(':').map(Number);
      const total = hh * 60 + mm + routine.duration;
      const eh = Math.floor(total / 60) % 24;
      const em = total % 60;
      end = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
    }
    const ev: CalEvent = {
      id: 'ev' + Date.now(),
      title: routine.title,
      date, time,
      ...(end ? { end } : {}),
      cat: 'personal',
      recurrence: 'once',
      routineId: routine.id,
    };
    saveEvent(ev);
  };

  // ── Sign out ──────────────────────────────────────────────────────
  const handleSignOut = async () => {
    if (auth) await authSignOut(auth);
  };

  // ── Email verification ────────────────────────────────────────────
  function isGoogleUser(u: User) {
    return u.providerData.some(p => p.providerId === 'google.com');
  }
  const handleVerified = () => setReloadCount(c => c + 1);
  const handleUserUpdated = () => setReloadCount(c => c + 1);

  // ── Date format ───────────────────────────────────────────────────
  const handleDateFormatChange = (f: DateFormat) => {
    setDateFormat(f);
    localStorage.setItem('dateFormat', f);
  };

  useEffect(() => { setFabOpen(false); }, [tab]);

  // ── Back button (Android / PWA) ───────────────────────────────────
  useEffect(() => {
    history.pushState(null, '', location.href);
    const onPop = () => {
      let handled = false;
      if (editingNote) {
        handled = true;
        history.pushState(null, '', location.href);
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

  // ── Form helpers ──────────────────────────────────────────────────
  const closeForm = () => setForm({ kind: 'none' });
  const isTaskForm  = form.kind === 'addTask'  || form.kind === 'editTask';
  const isEventForm = form.kind === 'addEvent' || form.kind === 'editEvent';

  // ── Loading ───────────────────────────────────────────────────────
  if (authUser === undefined) {
    return (
      <div style={{
        height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(155deg, ${T.color.heroFrom} 0%, ${T.color.primaryDeep} 90%)`,
        maxWidth: 480, margin: '0 auto',
      }}>
        <img src="/yomi-logo-horizontal-white.svg" alt="יומי" style={{ height: 56, opacity: 0.92 }} />
      </div>
    );
  }

  // ── Not authenticated ─────────────────────────────────────────────
  if (!authUser) return <AuthScreen />;

  // ── Email not verified (skip for Google users) ────────────────────
  // reloadCount triggers re-render so auth.currentUser.emailVerified is re-read after reload()
  const emailVerified = reloadCount >= 0 && (isGoogleUser(authUser)
    || (auth?.currentUser?.emailVerified ?? authUser.emailVerified));
  if (!emailVerified) {
    return <VerifyEmailScreen user={authUser} onVerified={handleVerified} />;
  }

  // ── Authenticated ─────────────────────────────────────────────────
  const displayName = auth?.currentUser?.displayName ?? authUser.displayName ?? '';
  const firstName = displayName.split(' ')[0];
  const userEmail = auth?.currentUser?.email ?? authUser.email ?? '';

  if (showWeather) {
    return (
      <CategoriesCtx.Provider value={allCategories}>
      <div dir="rtl" style={{
        height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: 'transparent', color: T.color.text,
        fontFamily: T.fonts.body, WebkitFontSmoothing: 'antialiased',
        maxWidth: 480, margin: '0 auto', position: 'relative',
      }}>
        <WeatherScreen onClose={() => setShowWeather(false)} />
      </div>
      </CategoriesCtx.Provider>
    );
  }

  return (
    <CategoriesCtx.Provider value={allCategories}>
    <div dir="rtl" style={{
      height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: 'transparent', color: T.color.text,
      fontFamily: T.fonts.body, WebkitFontSmoothing: 'antialiased',
      maxWidth: 480, margin: '0 auto', position: 'relative',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'today' && (
          <TodayScreen
            tasks={tasks} events={events}
            userName={firstName}
            userEmail={userEmail}
            dateFormat={dateFormat}
            onToggleTask={toggleTask}
            onAddTask={quickAddTask}
            onEditTask={t => setForm({ kind: 'editTask', task: t })}
            onEditEvent={(ev, date) => setForm({ kind: 'editEvent', event: ev, occurrenceDate: date })}
            onOpenSettings={() => setShowSettings(true)}
            onOpenWeather={() => setShowWeather(true)}
            onSignOut={handleSignOut}
          />
        )}
        {tab === 'routine' && (
          <RoutineScreen
            routines={routines}
            routineLogs={routineLogs}
            events={events}
            onCreateRoutine={createRoutine}
            onDeleteRoutine={deleteRoutine}
            onLogTap={logRoutineTap}
            onScheduleWeekly={scheduleWeeklyRoutine}
          />
        )}
        {tab === 'tasks' && (
          <TasksScreen
            tasks={tasks}
            onToggleTask={toggleTask}
            onAddTask={quickAddTask}
            onAddTomorrowTask={quickAddTomorrowTask}
            onAddLaterTask={quickAddLaterTask}
            onEditTask={t => setForm({ kind: 'editTask', task: t })}
            onDeferTask={deferTask}
          />
        )}
        {tab === 'shopping' && (
          <ShoppingScreen
            shopping={shopping}
            shoppingLists={shoppingLists}
            onToggle={toggleShop}
            onAdd={addShop}
            onDelete={deleteShop}
            onAddList={addShopList}
            onEditList={editShopList}
            onDeleteList={deleteShopList}
          />
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
            dateFormat={dateFormat}
            onEditEvent={(ev, date) => setForm({ kind: 'editEvent', event: ev, occurrenceDate: date })}
            onEditTask={t => setForm({ kind: 'editTask', task: t })}
            onAddEvent={date => setForm({ kind: 'addEvent', date })}
            onAddTask={date => setForm({ kind: 'addTask', date })}
          />
        )}
      </div>

      <TabBar tab={tab} setTab={setTab} />

      {/* FAB */}
      {(tab === 'today' || tab === 'tasks') && (
        <>
          {fabOpen && (
            <div onClick={() => setFabOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 38 }} />
          )}
          {fabOpen && (
            <div style={{
              position: 'absolute', bottom: 150, insetInlineEnd: 18, zIndex: 39,
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              borderRadius: 20, padding: '8px 0',
              boxShadow: `0 1px 0 rgba(255,255,255,0.7) inset, 0 12px 32px ${T.color.primary}33`,
              minWidth: 168,
              display: 'flex', flexDirection: 'column',
            }}>
              <button onClick={() => { setFabOpen(false); setForm({ kind: 'addTask' }); }} style={{
                border: 'none', background: 'none', cursor: 'pointer',
                padding: '12px 20px', fontSize: 15, fontWeight: 700,
                fontFamily: T.fonts.body, color: T.color.text, textAlign: 'right',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>✓</span> משימה חדשה
              </button>
              <div style={{ height: 1, background: T.color.line, margin: '0 12px' }} />
              <button onClick={() => { setFabOpen(false); setForm({ kind: 'addEvent' }); }} style={{
                border: 'none', background: 'none', cursor: 'pointer',
                padding: '12px 20px', fontSize: 15, fontWeight: 700,
                fontFamily: T.fonts.body, color: T.color.text, textAlign: 'right',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>📅</span> אירוע חדש
              </button>
            </div>
          )}
          <button
            onClick={() => setFabOpen(o => !o)}
            style={{
              position: 'absolute', bottom: 90, insetInlineEnd: 18, zIndex: 40,
              width: 58, height: 58, borderRadius: 99,
              background: `linear-gradient(135deg, ${T.color.primary} 0%, ${T.color.heroFrom} 100%)`,
              border: 'none', cursor: 'pointer',
              boxShadow:
                `0 1px 0 rgba(255,255,255,0.4) inset, 0 4px 12px ${T.color.primary}55, 0 14px 32px ${T.color.primary}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, color: '#fff', fontWeight: 300,
              transform: fabOpen ? 'rotate(45deg) scale(0.95)' : 'rotate(0) scale(1)',
              transition: 'transform .25s cubic-bezier(.34,1.56,.64,1)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            +
          </button>
        </>
      )}

      {/* Settings overlay */}
      {showSettings && (
        <SettingsScreen
          user={authUser}
          dateFormat={dateFormat}
          allCategories={allCategories}
          onDateFormatChange={handleDateFormatChange}
          onSaveCategory={saveCategory}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
          onClose={() => setShowSettings(false)}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {/* Note editor overlay */}
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
            defaultDate={form.kind === 'addTask' ? form.date : undefined}
            onSave={t => {
              saveTask(t.today ? { ...t, todayDate: todayStr() } : t);
              closeForm();
            }}
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
            defaultDate={form.kind === 'addEvent' ? form.date : undefined}
            onSave={handleEventSave}
            onDelete={form.kind === 'editEvent' ? handleEventDelete : undefined}
            onClose={closeForm}
          />
        )}
      </BottomSheet>

      {/* Recurring event scope dialog */}
      {pendingEventOp && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: '24px 24px 0 0',
            padding: '24px 20px 40px', width: '100%', maxWidth: 480,
            direction: 'rtl',
          }}>
            <h3 style={{ margin: '0 0 8px', fontFamily: T.fonts.heading, fontWeight: 700, fontSize: 18, color: T.color.text }}>
              {pendingEventOp.kind === 'save' ? 'עריכת אירוע חוזר' : 'מחיקת אירוע חוזר'}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: T.color.textMuted }}>
              האירוע הזה הוא חלק מסדרה חוזרת. מה ברצונך לשנות?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={applyEventScopeThis} style={{
                border: 'none', borderRadius: 99, padding: '13px 0',
                background: T.color.primarySoft, color: T.color.primaryDeep,
                fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.fonts.body,
              }}>רק האירוע הזה</button>
              <button onClick={applyEventScopeSeries} style={{
                border: 'none', borderRadius: 99, padding: '13px 0',
                background: `linear-gradient(135deg, ${T.color.primary}, ${T.color.heroFrom})`,
                color: '#fff', boxShadow: `0 4px 14px ${T.color.primary}55`,
                fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.fonts.body,
              }}>{pendingEventOp.kind === 'save' ? 'עדכן את כל הסדרה' : 'מחק את כל הסדרה'}</button>
              <button onClick={() => setPendingEventOp(null)} style={{
                border: 'none', borderRadius: 99, padding: '11px 0',
                background: 'transparent', color: T.color.textMuted,
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: T.fonts.body,
              }}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </CategoriesCtx.Provider>
  );
}
