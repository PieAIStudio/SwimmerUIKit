import { useCallback, useEffect, useRef, useState } from 'react';

import { useSystemReducedMotion } from './reducedMotion';

/** Normalized card tilt; zero is level, -1 and 1 are the bounded extremes. */
export interface GameCardTilt {
  readonly x: number;
  readonly y: number;
}

export type GameCardOrientationStatus = 'unavailable' | 'off' | 'requesting' | 'enabled' | 'denied';

type OrientationPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

function capability(): OrientationPermission | null {
  if (typeof window === 'undefined' || !window.isSecureContext || !window.DeviceOrientationEvent)
    return null;
  return window.DeviceOrientationEvent as OrientationPermission;
}

const pageHidden = () => document.visibilityState === 'hidden';

/** Rotation is relative to the position in which this page was enabled, not
 * an absolute compass heading. Invalid sensor readings have no visual effect. */
export function relativeCardTilt(
  beta: number | null,
  gamma: number | null,
  centre: { readonly beta: number; readonly gamma: number },
  screenAngle: number,
): GameCardTilt | null {
  if (
    beta === null ||
    gamma === null ||
    ![beta, gamma, centre.beta, centre.gamma, screenAngle].every(Number.isFinite)
  )
    return null;
  const radians = (screenAngle * Math.PI) / 180;
  // A small comfortable movement reaches the card's visual limit. Keep the
  // same control direction after rotating the screen between portrait/landscape.
  const dx = (gamma - centre.gamma) / 20;
  const dy = (beta - centre.beta) / 20;
  const clamp = (value: number) => Math.round(Math.min(1, Math.max(-1, value)) * 100) / 100;
  return {
    x: clamp(dx * Math.cos(radians) + dy * Math.sin(radians)),
    y: clamp(dy * Math.cos(radians) - dx * Math.sin(radians)),
  };
}

/** One optional sensor owner for an album or preview, NOT one per card.
 * Call enable from a real user action, then pass tilt only to the active card.
 * No permission, storage, microphone, motion sensor or network request occurs
 * on mount. Reduced motion cancels consent in flight and requires a new action;
 * hiding the page pauses samples and recalibrates on return. */
export function useGameCardOrientation() {
  const reduced = useSystemReducedMotion();
  const [status, setStatus] = useState<GameCardOrientationStatus>('off');
  const [tilt, setTilt] = useState<GameCardTilt | null>(null);
  const alive = useRef(false);
  const generation = useRef(0);
  const requesting = useRef(false);
  const reducedNow = useRef(reduced);
  reducedNow.current = reduced;
  const retireRequests = useCallback(() => {
    generation.current++;
    requesting.current = false;
  }, []);

  useEffect(() => {
    alive.current = true;
    if (!capability()) setStatus('unavailable');
    const abandonHiddenRequest = () => {
      if (document.visibilityState !== 'hidden' || !requesting.current) return;
      retireRequests();
      setStatus('off');
      setTilt(null);
    };
    document.addEventListener('visibilitychange', abandonHiddenRequest);
    return () => {
      document.removeEventListener('visibilitychange', abandonHiddenRequest);
      alive.current = false;
      retireRequests();
    };
  }, [retireRequests]);

  const disable = useCallback(() => {
    retireRequests();
    setTilt(null);
    setStatus(capability() ? 'off' : 'unavailable');
  }, [retireRequests]);

  useEffect(() => {
    if (reduced) disable();
  }, [reduced, disable]);

  const enable = useCallback(async (): Promise<boolean> => {
    const sensor = capability();
    if (!alive.current || requesting.current || reducedNow.current || pageHidden()) return false;
    if (!sensor) {
      setStatus('unavailable');
      return false;
    }
    const request = ++generation.current;
    requesting.current = true;
    setStatus('requesting');
    setTilt(null);
    try {
      // Keep the browser permission invocation in this synchronous user-action
      // stack, before the first await. No effect or automatic retry requests it.
      const permission = sensor.requestPermission ? await sensor.requestPermission() : 'granted';
      if (!alive.current || request !== generation.current || reducedNow.current) return false;
      if (pageHidden()) {
        disable();
        return false;
      }
      const allowed = permission === 'granted';
      setStatus(allowed ? 'enabled' : 'denied');
      return allowed;
    } catch {
      if (alive.current && request === generation.current) setStatus('denied');
      return false;
    } finally {
      if (request === generation.current) requesting.current = false;
    }
  }, [disable]);

  useEffect(() => {
    if (status !== 'enabled' || reduced) return;
    let centre: { beta: number; gamma: number; angle: number } | null = null;
    let attached = false;
    let last = -Infinity;
    const sample = (event: DeviceOrientationEvent) => {
      if (document.visibilityState === 'hidden') return;
      if (
        event.beta === null ||
        event.gamma === null ||
        !Number.isFinite(event.beta) ||
        !Number.isFinite(event.gamma)
      )
        return;
      const angle = window.screen.orientation?.angle ?? 0;
      if (!Number.isFinite(angle)) return;
      if (!centre || centre.angle !== angle)
        centre = { beta: event.beta, gamma: event.gamma, angle };
      // Sensor events can be much faster than a gentle tilt needs. This is an
      // input-driven cap, not another animation loop or an ambient timer.
      const now = performance.now();
      if (now - last < 50) return;
      last = now;
      const next = relativeCardTilt(event.beta, event.gamma, centre, angle);
      if (next)
        setTilt((previous) => (previous?.x === next.x && previous.y === next.y ? previous : next));
    };
    const visibility = () => {
      const visible = document.visibilityState !== 'hidden';
      centre = null;
      last = -Infinity;
      setTilt(null);
      if (visible && !attached) {
        window.addEventListener('deviceorientation', sample);
        attached = true;
      }
      if (!visible && attached) {
        window.removeEventListener('deviceorientation', sample);
        attached = false;
      }
    };
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      if (attached) window.removeEventListener('deviceorientation', sample);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [status, reduced]);

  return {
    status,
    tilt: reduced || status !== 'enabled' ? null : tilt,
    enable,
    disable,
    reducedMotion: reduced,
  };
}
