/**
 * Short vibrations for touch feedback. Works on Android browsers / PWAs;
 * iOS Safari ignores navigator.vibrate, so there it is a silent no-op.
 */
const PATTERNS = {
  tap: 8,
  select: 12,
  success: [10, 40, 18],
  warning: [20, 60, 20],
} as const;

export type HapticKind = keyof typeof PATTERNS;

export function haptic(kind: HapticKind = 'tap') {
  try {
    const p = PATTERNS[kind];
    navigator.vibrate?.(typeof p === 'number' ? p : [...p]);
  } catch { /* not supported */ }
}
