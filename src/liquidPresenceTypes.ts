import type { LiquidPresenceRect } from './liquidPresenceGeometry';
import type { ReactNode } from 'react';

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
  /** Explicit host opt-in. A quiet living contour, never an audio observation.
   * The ordinary component stays still when omitted. */
  idleMotion?: 'still' | 'breathe';
  /** Material flow only, not task or guidance duration. Clamped to 0.5..1.5. */
  motionSpeed?: number;
  /** Contour/speech detail, clamped to 0.25..1.25. Hit targets never change. */
  motionIntensity?: number;
  /** Small liquid satellites during observed speech; never during idle. */
  splashes?: boolean;
  /** Actual amplitude only. Null/invalid values mean unavailable, not mock audio. */
  levelRef?: { readonly current: number | null };
  colorFrom?: string;
  colorTo?: string;
  className?: string;
  /** Human-paced explanation at the destination. The host owns its controls;
   * this stays until explicit dismissal/target loss, not a reading deadline. */
  guideContent?: ReactNode;
  /** Expanded for review/editing content; still bounded to the visible viewport. */
  guideSize?: 'compact' | 'expanded';
  /** Pointing at a button dismisses by default. Editor-attached assistance may
   * opt out so selecting/typing never discards the user's comparison draft. */
  dismissOnTargetClick?: boolean;
  /** Visual dismissal only; never wire this to task cancellation. */
  onDismiss?(reason: 'dismissed' | 'unavailable' | 'expired'): void;
}
