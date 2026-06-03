import { useMemo } from 'react';
import { theme, softLine } from '../theme';
import type { ShoppingItem } from '../lib/types';
import { Check, AddRow, PageHeader } from '../components/atoms';
import { Icon } from '../icons';

const T = theme;

export function ShoppingScreen({ shopping, onToggle, onAdd, onDelete }: {
  shopping: ShoppingItem[];
  onToggle: (id: string) => void;
  onAdd: (title: string) => void;
  onDelete: (id: string) => void;
}) {
  const shopLeft = shopping.filter(s => !s.done).length;

  const aisles = useMemo(() => {
    const order: string[] = [];
    shopping.forEach(s => { if (!order.includes(s.aisle)) order.push(s.aisle); });
    return order;
  }, [shopping]);

  return (
    <div style={{ paddingBottom: 100 }}>
      <PageHeader
        icon={<Icon.cart size={26} color="#fff" sw={1.8} />}
        title="קניות"
        sub={shopping.length > 0
          ? (shopLeft > 0 ? `נשארו ${shopLeft} מתוך ${shopping.length}` : 'הכל קנוי!')
          : undefined}
      />

      <div style={{ padding: '0 18px' }}>
        {shopping.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: T.color.textMuted, fontSize: 15 }}>
            <div style={{ fontFamily: T.fonts.hand, fontSize: 28, marginBottom: 8 }}>הרשימה ריקה</div>
            הוסיפי פריטים למטה
          </div>
        )}

        {aisles.map(aisle => (
          <div key={aisle} style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: T.color.textMuted,
              margin: '0 2px 7px', letterSpacing: 0.3,
            }}>{aisle}</div>
            <div style={{
              background: T.color.surface, borderRadius: T.radius.tile,
              boxShadow: T.cardShadow, overflow: 'hidden',
            }}>
              {shopping.filter(s => s.aisle === aisle).map((s, i, arr) => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
                  opacity: s.done ? 0.45 : 1,
                  borderBottom: i < arr.length - 1 ? '1px solid ' + T.color.line : 'none',
                  transition: 'opacity .2s',
                }}>
                  <Check checked={s.done} onToggle={() => onToggle(s.id)} />
                  <span
                    onClick={() => onToggle(s.id)}
                    style={{
                      flex: 1, fontSize: 15.5, fontWeight: 500, color: T.color.text,
                      textDecoration: s.done ? 'line-through' : 'none',
                      textDecorationColor: T.color.textMuted, cursor: 'pointer',
                    }}
                  >{s.title}</span>
                  <button
                    onClick={() => onDelete(s.id)}
                    style={{
                      border: 'none', background: 'transparent', cursor: 'pointer',
                      padding: 6, display: 'flex', alignItems: 'center',
                      opacity: 0.4, WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <Icon.x size={15} color={T.color.textMuted} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <AddRow placeholder="הוסף פריט לקנייה…" onAdd={onAdd} />
      </div>
    </div>
  );
}
