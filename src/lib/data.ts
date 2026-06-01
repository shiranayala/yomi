import type { Category, Task, ShoppingItem, Note, Event, AgendaItem, CatId } from './types';

export const TODAY = new Date();

export const categories: Record<string, Category> = {
  work:     { id: 'work',     label: 'עבודה',   color: '#5b8fc4' },
  home:     { id: 'home',     label: 'בית',      color: '#6aa890' },
  health:   { id: 'health',   label: 'בריאות',  color: '#d98a6a' },
  family:   { id: 'family',   label: 'משפחה',   color: '#b585c0' },
  personal: { id: 'personal', label: 'אישי',     color: '#d4a23f' },
};

export const weekdaysShort = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
export const monthNames = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

export const sampleEvents: Event[] = [
  { id: 'e1', time: '08:00', end: '08:45', title: 'ריצת בוקר בפארק',        cat: 'health',   place: 'פארק הירקון' },
  { id: 'e2', time: '10:30', end: '11:30', title: 'פגישת צוות שבועית',   cat: 'work',     place: 'זום' },
  { id: 'e3', time: '13:00', end: '14:00', title: 'ארוחת צהריים עם מאיה', cat: 'personal', place: 'קפה לנדוור' },
  { id: 'e4', time: '17:00', end: '18:00', title: 'שיעור יוגה',          cat: 'health',   place: 'סטודיו נשימה' },
  { id: 'e5', time: '20:00', end: '21:30', title: 'ארוחת ערב משפחתית', cat: 'family',   place: 'אצל אמא' },
];

export const sampleTasks: Task[] = [
  { id: 't1', title: 'להתקשר לרופא שיניים',    cat: 'health',   done: false, time: '09:30', today: true },
  { id: 't2', title: 'לשלוח מייל ללקוח',       cat: 'work',     done: false, time: '12:00', today: true },
  { id: 't3', title: 'לסיים את המצגת',         cat: 'work',     done: false, time: null,   today: true },
  { id: 't4', title: 'לקנות מתנה ליום הולדת של נועה', cat: 'personal', done: true, time: null, today: true },
  { id: 't5', title: 'להזמין כביסה מהמכבסה',    cat: 'home',     done: false, time: null,   today: true },
  { id: 't6', title: 'לתאם טיפול לרכב',       cat: 'home',     done: false, time: null,   today: false },
  { id: 't7', title: 'לקרוא את הפרק למועדון הקריאה', cat: 'personal', done: false, time: null, today: false },
  { id: 't8', title: 'להחזיר ספרים לספרייה',   cat: 'personal', done: false, time: null,   today: false },
];

export const sampleShopping: ShoppingItem[] = [
  { id: 's1', title: 'חלב',        done: false, aisle: 'מוצרי חלב' },
  { id: 's2', title: 'לחם מלא',   done: false, aisle: 'מאפייה' },
  { id: 's3', title: 'ביצים',      done: true,  aisle: 'מוצרי חלב' },
  { id: 's4', title: 'עגבניות',    done: false, aisle: 'ירקות' },
  { id: 's5', title: 'אבוקדו',     done: false, aisle: 'ירקות' },
  { id: 's6', title: 'קפה טחון',  done: true,  aisle: 'מזון יבש' },
  { id: 's7', title: 'יוגורט',     done: false, aisle: 'מוצרי חלב' },
  { id: 's8', title: 'בננות',      done: false, aisle: 'פירות' },
  { id: 's9', title: 'נייר טואלט', done: false, aisle: 'אחר' },
];

export const sampleNotes: Note[] = [
  { id: 'n1', title: 'רעיונות למתנה', body: 'ספר בישול איטלקי, צמח למרפסת, כרטיס להצגה', tone: 'amber',  pinned: true },
  { id: 'n2', title: 'מתכון עוגת גזר', body: '3 גזרים, 2 ביצים, כוס קמח, כפית קינמון, חצי כוס שמן', tone: 'green', pinned: false },
  { id: 'n3', title: 'ספרים לקרוא', body: 'האלכימאי, מגדל הלילה, אנשים פשוטים', tone: 'blue', pinned: false },
  { id: 'n4', title: 'Wi-Fi אצל אמא', body: 'הרשת: Sahar_Home · סיסמה: bait2024', tone: 'plain', pinned: false },
  { id: 'n5', title: 'מחשבות לפני השינה', body: 'להגיד תודה על היום, לתכנן טיול לסוף החודש', tone: 'purple', pinned: false },
];

export const monthDots: Record<number, CatId[]> = {
  1:  ['work'],
  3:  ['work', 'health'],
  5:  ['family'],
  7:  ['work', 'personal'],
  8:  ['health'],
  11: ['work'],
  12: ['home', 'work'],
  14: ['family', 'personal'],
  15: ['health'],
  18: ['work'],
  19: ['work', 'health', 'personal'],
  21: ['family'],
  22: ['home'],
  25: ['work'],
  26: ['health', 'work'],
  28: ['personal'],
  29: ['health', 'work', 'personal', 'family'],
  31: ['family'],
};

export const dayAgenda: Record<number, AgendaItem[]> = {
  26: [
    { time: '09:00', title: 'בדיקה שנתית', cat: 'health' },
    { time: '15:00', title: 'סינוף רבעוני', cat: 'work' },
  ],
  29: sampleEvents.map(e => ({ time: e.time, title: e.title, cat: e.cat })),
  31: [
    { time: '11:00', title: "ברנץ' בגן", cat: 'family' },
  ],
  19: [
    { time: '08:30', title: 'יום עיון בעבודה', cat: 'work' },
    { time: '13:00', title: 'פיזיותרפיה', cat: 'health' },
    { time: '19:00', title: 'קולנוע עם דני', cat: 'personal' },
  ],
};

export const userName = 'יעל';
export const weather = { temp: 24, label: 'בהיר ונעים', icon: 'sun' };
