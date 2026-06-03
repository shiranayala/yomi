import type { Tag } from './types';

export const TAG_COLORS: Record<string, { bg: string; edge: string; text: string }> = {
  amber:  { bg: '#fbf3df', edge: '#e7d3a0', text: '#6e5a2a' },
  green:  { bg: '#e6f0ea', edge: '#bcd6c8', text: '#33564a' },
  blue:   { bg: '#e6eef7', edge: '#bcd0e6', text: '#33506e' },
  purple: { bg: '#efe6f3', edge: '#d4bfdd', text: '#553a63' },
  red:    { bg: '#fce8e8', edge: '#f0bcbc', text: '#6e3333' },
  teal:   { bg: '#e0f4f2', edge: '#a8d8d5', text: '#2a5855' },
  pink:   { bg: '#f9e6f0', edge: '#e8b8d8', text: '#63355a' },
  orange: { bg: '#fef0e4', edge: '#f0d0a8', text: '#7a4e28' },
  indigo: { bg: '#eaecf8', edge: '#c4c8ee', text: '#353a6e' },
  lime:   { bg: '#eef5e0', edge: '#cce0a0', text: '#456e2a' },
};

export const TAG_COLOR_KEYS = Object.keys(TAG_COLORS);

export const NEUTRAL_STYLE = { bg: '#f4f3ef', edge: '#dcdad2', text: '#55524a' };

export function colorForKey(key: string) {
  return TAG_COLORS[key] ?? NEUTRAL_STYLE;
}

export function noteColorStyle(noteTags: string[], allTags: Tag[]) {
  if (noteTags.length > 0) {
    const first = allTags.find(t => t.id === noteTags[0]);
    if (first) return colorForKey(first.color);
  }
  return NEUTRAL_STYLE;
}
