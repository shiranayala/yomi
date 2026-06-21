import { createContext, useContext } from 'react';
import type { Category } from './types';

export const DEFAULT_CATEGORIES: Record<string, Category> = {
  work:     { id: 'work',     label: 'עבודה',   color: '#8ba4d4', builtin: true },
  home:     { id: 'home',     label: 'בית',      color: '#87c9a0', builtin: true },
  health:   { id: 'health',   label: 'בריאות',  color: '#d4a18b', builtin: true },
  family:   { id: 'family',   label: 'משפחה',   color: '#c89cd4', builtin: true },
  personal: { id: 'personal', label: 'אישי',     color: '#d4bc8b', builtin: true },
};

/**
 * Aurora pastel palette — every category in the app pulls from here, so
 * categories saved in Firebase with old saturated colors display in the new
 * soft palette without rewriting any data.
 */
export const AURORA_PASTELS = [
  '#d4a18b', // soft peach
  '#8ba4d4', // soft blue
  '#c89cd4', // lavender
  '#87c9a0', // mint
  '#d4bc8b', // butter
  '#d99090', // dusty rose
  '#a3b8c9', // dusty blue
  '#e8a87c', // soft orange
];

/** Deterministic pastel for any category id (builtin uses its canonical color). */
export function pastelForCategoryId(id: string): string {
  const def = DEFAULT_CATEGORIES[id];
  if (def) return def.color;
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AURORA_PASTELS[Math.abs(hash) % AURORA_PASTELS.length];
}

export const CategoriesCtx = createContext<Record<string, Category>>(DEFAULT_CATEGORIES);
export function useCats() { return useContext(CategoriesCtx); }
