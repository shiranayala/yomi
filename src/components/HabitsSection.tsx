import { useState } from 'react';
import { theme, softLine } from '../theme';
import { Icon } from '../icons';
import type { Habit, HabitLog } from '../lib/types';
import { calcStreak } from '../lib/habitStreak';

const T = theme;

function HabitRow({ habit, done, streak, onToggle }: {
  habit: Habit; done: boolean; streak: number; onToggle: () => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      background: T.color.surface, borderRadius: T.radius.tile,
      boxShadow: T.cardShadow, opacity: done ? 0.65 : 1, transition: 'opacity .2s',
    }}>
      <button onClick={onToggle} style={{
        width: 26, height: 26, borderRadius: 99, flexShrink: 0, cursor: 'pointer',
        border: '2px solid ' + (done ? T.color.primary : softLine('0.3')),
        background: done ? T.color.primary : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 0, transition: 'all .18s', WebkitTapHighlightColor: 'transparent',
      }}>
        {done && <Icon.check size={13} color={T.color.onPrimary} sw={3} />}
      </button>
      <div style={{
        flex: 1, fontSize: 15, fontWeight: 500, color: T.color.text,
        textDecoration: done ? 'line-through' : 'none',
        textDecorationColor: T.color.textMuted,
      }}>
        {habit.title}
      </div>
      {streak > 0 && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 12.5, fontWeight: 700, color: '#c9622a',
          background: '#fff3ed', borderRadius: 99, padding: '3px 9px',
          flexShrink: 0,
        }}>
          🔥 {streak}
        </span>
      )}
    </div>
  );
}

function ManagerOverlay({ habits, onClose, onAdd, onEdit, onDelete }: {
  habits: Habit[];
  onClose: () => void;
  onAdd: (title: string) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const submitNew = () => {
    const t = newTitle.trim();
    if (t) { onAdd(t); setNewTitle(''); }
  };

  const startEdit = (h: Habit) => {
    setEditingId(h.id);
    setEditingTitle(h.title);
    setConfirmDelete(null);
  };

  const submitEdit = (id: string) => {
    const t = editingTitle.trim();
    if (t) onEdit(id, t);
    setEditingId(null);
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.35)',
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 61,
        background: T.color.bg, borderRadius: '24px 24px 0 0',
        padding: '16px 18px 40px', maxHeight: '80dvh', overflowY: 'auto',
        direction: 'rtl',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 99,
          background: softLine('0.18'), margin: '0 auto 18px',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontFamily: T.fonts.hand, fontSize: 22, color: T.color.text }}>
            ניהול הרגלים
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.color.textMuted, fontSize: 20, padding: 4, lineHeight: 1,
          }}>✕</button>
        </div>

        {/* Add new */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
          background: T.color.surface, borderRadius: T.radius.tile,
          border: '1px dashed ' + softLine('0.25'), marginBottom: 14,
        }}>
          <Icon.plus size={18} color={T.color.primary} />
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitNew()}
            placeholder="הרגל חדש…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 15, color: T.color.text, fontFamily: T.fonts.body,
            }}
          />
          {newTitle.trim() && (
            <button onClick={submitNew} style={{
              border: 'none', cursor: 'pointer', borderRadius: 99, padding: '5px 12px',
              background: T.color.primary, color: T.color.onPrimary,
              fontSize: 13, fontWeight: 700, fontFamily: T.fonts.body,
            }}>הוסף</button>
          )}
        </div>

        {/* Habit list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {habits.map(h => (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
              background: T.color.surface, borderRadius: T.radius.tile, boxShadow: T.cardShadow,
            }}>
              {editingId === h.id ? (
                <input
                  autoFocus
                  value={editingTitle}
                  onChange={e => setEditingTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') submitEdit(h.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onBlur={() => submitEdit(h.id)}
                  style={{
                    flex: 1, border: 'none', outline: 'none', background: 'transparent',
                    fontSize: 15, fontWeight: 500, color: T.color.text, fontFamily: T.fonts.body,
                    borderBottom: '1.5px solid ' + T.color.primary, paddingBottom: 2,
                  }}
                />
              ) : (
                <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: T.color.text }}>
                  {h.title}
                </div>
              )}

              {confirmDelete === h.id ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12.5, color: '#e05c5c', fontWeight: 600 }}>למחוק?</span>
                  <button onClick={() => { onDelete(h.id); setConfirmDelete(null); }} style={{
                    border: 'none', cursor: 'pointer', borderRadius: 8, padding: '4px 10px',
                    background: '#e05c5c', color: '#fff', fontSize: 12.5, fontWeight: 700,
                    fontFamily: T.fonts.body,
                  }}>כן</button>
                  <button onClick={() => setConfirmDelete(null)} style={{
                    border: 'none', cursor: 'pointer', borderRadius: 8, padding: '4px 10px',
                    background: T.color.surfaceAlt, color: T.color.text, fontSize: 12.5, fontWeight: 700,
                    fontFamily: T.fonts.body,
                  }}>לא</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <button onClick={() => startEdit(h)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 7, borderRadius: 8,
                  }}>
                    <Icon.edit size={15} color={T.color.textMuted} />
                  </button>
                  <button onClick={() => setConfirmDelete(h.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 7, borderRadius: 8,
                  }}>
                    <Icon.trash size={15} color="#e05c5c" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {habits.length === 0 && (
            <div style={{
              textAlign: 'center', color: T.color.textMuted,
              fontSize: 14, padding: '20px 0',
            }}>
              עדיין אין הרגלים — הוסיפי את הראשון למעלה
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function HabitsSection({ habits, logs, onToggle, onAdd, onEdit, onDelete }: {
  habits: Habit[];
  logs: HabitLog[];
  onToggle: (habitId: string) => void;
  onAdd: (title: string) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  const [managing, setManaging] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const doneTodayIds = new Set(logs.filter(l => l.date === today).map(l => l.habitId));

  return (
    <div>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '6px 2px 13px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <h2 style={{
            margin: 0, fontFamily: T.fonts.heading, fontWeight: 400,
            fontSize: Math.round(23 * T.headingScale), color: T.color.text, lineHeight: 1.15,
          }}>
            משימות יומיות
          </h2>
          {habits.length > 0 && (
            <span style={{ fontSize: 12.5, color: T.color.textMuted, paddingBottom: 3 }}>
              {doneTodayIds.size}/{habits.length} הושלמו
            </span>
          )}
        </div>
        <button onClick={() => setManaging(true)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 6, borderRadius: 10, WebkitTapHighlightColor: 'transparent',
          marginBottom: 2,
        }}>
          <Icon.settings size={17} color={T.color.textMuted} />
        </button>
      </div>

      {/* Habit rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {habits.map(h => (
          <HabitRow
            key={h.id}
            habit={h}
            done={doneTodayIds.has(h.id)}
            streak={calcStreak(logs, h.id)}
            onToggle={() => onToggle(h.id)}
          />
        ))}
        {habits.length === 0 && (
          <button onClick={() => setManaging(true)} style={{
            background: T.color.surface, border: '1px dashed ' + softLine('0.25'),
            borderRadius: T.radius.tile, padding: '14px', cursor: 'pointer',
            color: T.color.textMuted, fontSize: 14, fontFamily: T.fonts.body,
            boxShadow: T.cardShadow, width: '100%', textAlign: 'center',
          }}>
            + הוסיפי הרגל ראשון
          </button>
        )}
      </div>

      {managing && (
        <ManagerOverlay
          habits={habits}
          onClose={() => setManaging(false)}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
