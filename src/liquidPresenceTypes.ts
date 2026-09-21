import type { LiquidPresenceRect } from './liquidPresenceGeometry';

/** Presentation observations, not a provider/session/task state machine. */
export type LiquidPresenceActivity =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'working'
  | 'error'
  | 'unknown'
  | 'disabled';

export interface LiquidPresenceTarget {
  /** A new key means a new gesture, even when the target stays the same. */
  key: string;
  label: string;
  getRect(): LiquidPresenceRect | null;
  /** Supplies clipping/scroll context and the correct native-dialog portal. */
  contextElement?: Element | null;
}

export interface LiquidPresenceProps {
  activity?: LiquidPresenceActivity;
  size?: number;
  target?: LiquidPresenceTarget | null;
  /** True disables travel but never removes the target explanation. */
  reducedMotion?: boolean;
  /** Actual amplitude only. Null/invalid values mean unavailable, not mock audio. */
  levelRef?: { readonly current: number | null };
  colorFrom?: string;
  colorTo?: string;
  className?: string;
  /** Visual dismissal only; never wire this to task cancellation. */
  onDismiss?(reason: 'dismissed' | 'unavailable' | 'expired'): void;
}
