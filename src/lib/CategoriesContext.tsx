import { createContext, useContext } from 'react';
import type { Category } from './types';

export const DEFAULT_CATEGORIES: Record<string, Category> = {
  work:     { id: 'work',     label: 'עבודה',   color: '#5b8fc4', builtin: true },
  home:     { id: 'home',     label: 'בית',      color: '#6aa890', builtin: true },
  health:   { id: 'health',   label: 'בריאות',  color: '#d98a6a', builtin: true },
  family:   { id: 'family',   label: 'משפחה',   color: '#b585c0', builtin: true },
  personal: { id: 'personal', label: 'אישי',     color: '#d4a23f', builtin: true },
};

export const CategoriesCtx = createContext<Record<string, Category>>(DEFAULT_CATEGORIES);
export function useCats() { return useContext(CategoriesCtx); }
