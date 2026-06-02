import { useMemo } from 'react';
import { theme, softLine } from '../theme';
import type { ShoppingItem } from '../lib/types';
import { Check, AddRow, PageHeader } from '../components/atoms';
import { Icon } from '../icons';

const T = theme;


export function ShoppingScreen({ shopping, onToggle, onAdd }: {
  shopping: ShoppingItem[];
  onToggle: (id: string) => void;
  onAdd: (title: string) => void;
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
        sub={shopLeft > 0 ? `נשארו ${shopLeft} פריטים לקנות` : 'הכל קנוי!'}
      />

      <div style={{ padding: '0 18px' }}>
      {shopLeft === 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '10px 16px', marginBottom: 16,
          background: T.color.primarySoft, borderRadius: T.radius.tile,
          fontSize: 13, fontWeight: 700, color: T.color.primaryDeep,
        }}>✓ הכל קנוי!</div>
      )}

      {aisles.map(aisle => (
        <div key={aisle} style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: T.color.textMuted,
            margin: '0 2px 7px', letterSpacing: 0.3, textTransform: 'uppercase',
          }}>{aisle}</div>
          <div style={{
            background: T.color.surface, borderRadius: T.radius.tile,
            boxShadow: T.cardShadow, overflow: 'hidden',
          }}>
            {shopping.filter(s => s.aisle === aisle).map((s, i, arr) => (
              <div key={s.id} onClick={() => onToggle(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                cursor: 'pointer', opacity: s.done ? 0.5 : 1,
                borderBottom: i < arr.length - 1 ? '1px solid ' + T.color.line : 'none',
                transition: 'opacity .2s',
              }}>
                <Check checked={s.done} onToggle={() => onToggle(s.id)} />
                <span style={{
                  flex: 1, fontSize: 15.5, fontWeight: 500, color: T.color.text,
                  textDecoration: s.done ? 'line-through' : 'none',
                  textDecorationColor: T.color.textMuted,
                }}>{s.title}</span>
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
