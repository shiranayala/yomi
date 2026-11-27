import { useState } from 'react';
import { theme } from '../theme';
import { Icon } from '../icons';
import { Check } from './atoms';
import { BottomSheet } from './BottomSheet';
import type { ShoppingItem, ShoppingList } from '../lib/types';

const T = theme;

interface Props {
  shopping: ShoppingItem[];
  shoppingLists: ShoppingList[];
  onToggle: (id: string) => void;
  onTogglePinItem: (id: string) => void;
  onTogglePinList: (id: string) => void;
  onOpenShopping: () => void;
}

/**
 * "To buy" reminder on the Today screen.
 * A pinned list shows as its name only; its items appear when the card is opened.
 * A pinned item (from a list that isn't pinned) shows by its own name.
 */
export function ShoppingPins({ shopping, shoppingLists, onToggle, onTogglePinItem, onTogglePinList, onOpenShopping }: Props) {
  const [open, setOpen] = useState(false);
  const listById = new Map(shoppingLists.map(l => [l.id, l]));
  const left = (listId: string) => shopping.filter(s => s.listId === listId && !s.done);

  const lists = shoppingLists.filter(l => l.pinned && left(l.id).length > 0);
  const items = shopping.filter(s =>
    s.pinned && !s.done && s.listId && listById.has(s.listId) && !listById.get(s.listId)!.pinned,
  );
  const names = [...lists.map(l => l.title), ...items.map(s => s.title)];
  if (names.length === 0 && !open) return null;

  const shown = names.slice(0, 3).join(', ');
  const more = names.length > 3 ? ` +${names.length - 3}` : '';

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', border: 'none', cursor: 'pointer', textAlign: 'right',
        background: T.color.surface, borderRadius: T.radius.tile, boxShadow: T.cardShadow,
        fontFamily: T.fonts.body,
      }}>
        <span style={{
          width: 34, height: 34, borderRadius: 11, flexShrink: 0,
          background: 'linear-gradient(135deg, #f3e3f7, #e6ecfb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon.cart size={18} color={T.color.primaryDeep} sw={1.9} />
        </span>
        <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: T.color.text, flexShrink: 0 }}>לקנות:</span>
          <span style={{
            fontSize: 14.5, fontWeight: 500, color: T.color.textMuted,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{shown}{more}</span>
        </span>
        <Icon.chevL size={15} color={T.color.textMuted} />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="לקנות" compact>
        {lists.map(l => {
          const color = l.color || T.color.primary;
          return (
            <div key={l.id} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: 99, background: color }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 800, color: T.color.text }}>{l.title}</span>
                <UnpinButton color={color} onClick={() => onTogglePinList(l.id)} />
              </div>
              {left(l.id).map(s => (
                <ItemRow key={s.id} item={s} color={color} onToggle={() => onToggle(s.id)} />
              ))}
            </div>
          );
        })}

        {items.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            {lists.length > 0 && (
              <div style={{ fontSize: 14, fontWeight: 800, color: T.color.text, marginBottom: 6 }}>פריטים</div>
            )}
            {items.map(s => {
              const list = listById.get(s.listId!)!;
              const color = list.color || T.color.primary;
              return (
                <ItemRow key={s.id} item={s} color={color} sub={list.title} onToggle={() => onToggle(s.id)}
                  extra={<UnpinButton color={color} onClick={() => onTogglePinItem(s.id)} />} />
              );
            })}
          </div>
        )}

        {names.length === 0 && (
          <div style={{ textAlign: 'center', padding: '12px 0 20px', color: T.color.textMuted, fontSize: 15 }}>
            אין כרגע מה לקנות 🎉
          </div>
        )}

        <button onClick={() => { setOpen(false); onOpenShopping(); }} style={{
          width: '100%', border: 'none', background: 'transparent', cursor: 'pointer',
          padding: '8px 0', color: T.color.primaryDeep, fontSize: 14, fontWeight: 700,
          fontFamily: T.fonts.body, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          לעמוד הקניות <Icon.chevL size={13} color={T.color.primaryDeep} />
        </button>
      </BottomSheet>
    </>
  );
}

function ItemRow({ item, color, sub, onToggle, extra }: {
  item: ShoppingItem; color: string; sub?: string; onToggle: () => void; extra?: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 2px',
      borderBottom: '1px solid ' + T.color.line,
    }}>
      <Check checked={item.done} onToggle={onToggle} color={color} />
      <span onClick={onToggle} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <span style={{ fontSize: 15.5, fontWeight: 500, color: T.color.text }}>{item.title}</span>
        {sub && <span style={{ fontSize: 12.5, color: T.color.textMuted, marginInlineStart: 8 }}>{sub}</span>}
      </span>
      {extra}
    </div>
  );
}

function UnpinButton({ color, onClick }: { color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="הסרה מהעמוד הראשי" title="הסרה מהעמוד הראשי" style={{
      border: 'none', background: color + '1f', cursor: 'pointer', borderRadius: 99,
      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon.pin size={13} color={color} />
    </button>
  );
}
