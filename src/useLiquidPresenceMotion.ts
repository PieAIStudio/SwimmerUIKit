import { useEffect, useRef, type RefObject } from 'react';
import { computePosition, flip, offset, shift, type VirtualElement } from '@floating-ui/react';
import {
  getLiquidGooeyBudget,
  releaseLiquidGooeyAnimation,
  tryAcquireLiquidGooeyAnimation,
} from './liquidGooeyBudget';
import {
  clampPresence,
  clipPresenceRect,
  presenceLanding,
  rectCenter,
  visiblePresenceRect,
  type LiquidPoint,
} from './liquidPresenceGeometry';
import { samplePresenceMotion, type LiquidPresenceFrame } from './liquidPresenceMotion';
import {
  paintPresenceFrame,
  paintPresenceSatellites,
  presenceViewport,
  showPresenceNode,
  type PresenceElements,
} from './liquidPresencePaint';
import type { LiquidPresenceProps } from './liquidPresenceTypes';
import { readPresenceTarget, trackPresenceGeometry } from './liquidPresenceTracking';

/** Single visual clock. The existing Kit budget arbitrates with liquid controls;
 * a denied lease falls back to a static, fully readable target indication. */
export function useLiquidPresenceMotion(
  sourceRef: RefObject<HTMLSpanElement | null>,
  overlayRef: RefObject<HTMLDivElement | null>,
  props: LiquidPresenceProps,
  portalRoot: Element | null,
) {
  const latest = useRef(props);
  latest.current = props;
  const previous = useRef<LiquidPresenceFrame | null>(null);
  const rejected = useRef<string | null>(null);
  const delivered = useRef<string | null>(null);
  const materialPhase = useRef(0);
  const wakeRef = useRef(() => {});
  useEffect(() => {
    const source = sourceRef.current;
    const overlay = overlayRef.current;
    if (!source || !overlay) return;
    const nodes: PresenceElements = {
      source,
      overlay,
      body: source.querySelector('[data-presence-body]')!,
      bud: source.querySelector('[data-presence-bud]')!,
      satellites: [...source.querySelectorAll<SVGCircleElement>('[data-presence-satellite]')],
      flight: overlay.querySelector('.game-ui-liquid-presence-flight')!,
      flightBody: overlay.querySelector('[data-presence-flight-body]')!,
      trail: overlay.querySelector('[data-presence-trail]')!,
      seat: overlay.querySelector('.game-ui-liquid-presence-seat')!,
      seatBody: overlay.querySelector('[data-presence-seat-body]')!,
      label: overlay.querySelector('.game-ui-liquid-presence-label')!,
    };
    let target = latest.current.target ?? null;
    if (!target) rejected.current = null;
    if (target?.key === rejected.current) target = null;
    const old = previous.current;
    let returning = !target && Boolean(old && old.phase !== 'still');
    let from =
      old && ['flight', 'dock', 'land', 'gather', 'return'].includes(old.phase)
        ? old.point
        : undefined;
    let destination: LiquidPoint = old?.point ?? rectCenter(source.getBoundingClientRect());
    let seatWidth = old?.seatWidth ?? 48;
    let origin = old ?? undefined;
    const departure = source.getBoundingClientRect();
    let begin = performance.now();
    let frameId: number | null = null;
    let active = true;
    let leased = false;
    let onScreen = true;
    let lastPaint = 0;
    let bodyPhase = materialPhase.current;
    let lastMaterialTime = performance.now();
    let level = 0;
    let positionTicket = 0;
    let stopPosition = () => {};
    let timer: ReturnType<typeof setTimeout> | undefined;
    const release = () => {
      if (leased) releaseLiquidGooeyAnimation();
      leased = false;
    };
    const end = (reason: 'dismissed' | 'unavailable' | 'expired') => {
      if (!target) return;
      rejected.current = target.key;
      target = null;
      returning = Boolean(previous.current && previous.current.phase !== 'still');
      origin = previous.current ?? undefined;
      from = previous.current?.point;
      destination = from ?? destination;
      begin = performance.now();
      stopPosition();
      clearTimeout(timer);
      positionTicket++;
      showPresenceNode(nodes.label, false);
      try {
        latest.current.onDismiss?.(reason);
      } catch {
        /* An observer has no control authority. */
      }
      wake();
    };
    const getTarget = () =>
      target
        ? readPresenceTarget(
            latest.current.target?.key === target.key ? latest.current.target : target,
          )
        : null;
    const positionLabel = () => {
      if (!target) return;
      const rect = getTarget();
      if (!rect) {
        end('unavailable');
        return;
      }
      const landing = presenceLanding(rect, presenceViewport());
      const visible = clipPresenceRect(rect, presenceViewport());
      destination = landing;
      seatWidth = landing.width;
      const virtual: VirtualElement = {
        ...(target.contextElement ? { contextElement: target.contextElement } : {}),
        getBoundingClientRect: () => ({
          ...visible,
          top: visible.y,
          left: visible.x,
          bottom: visible.y + visible.height,
          right: visible.x + visible.width,
        }),
      };
      const ticket = ++positionTicket;
      void computePosition(virtual, nodes.label, {
        strategy: 'absolute',
        placement: landing.side,
        middleware: [offset(26), flip(), shift({ padding: 16, crossAxis: true })],
      })
        .then(({ x, y }) => {
          if (active && ticket === positionTicket)
            nodes.label.style.transform = `translate(${x}px, ${y}px)`;
        })
        .catch(() => {});
    };
    const bodyActive = () =>
      ['connecting', 'listening', 'thinking', 'speaking', 'working'].includes(
        latest.current.activity ?? 'idle',
      );
    const canAnimate = () => {
      if (
        latest.current.reducedMotion ||
        latest.current.activity === 'disabled' ||
        document.hidden ||
        !onScreen
      )
        return false;
      if (!visiblePresenceRect(source.getBoundingClientRect(), presenceViewport())) return false;
      const modal = document.querySelector('dialog:modal');
      if (modal && !modal.contains(source)) return false;
      const targetDialog = target?.contextElement?.closest('dialog') ?? null;
      if (target && source.closest('dialog') !== targetDialog) return false;
      const area = 112 * 56 + 96 * 72 + (source.getBoundingClientRect().width * 2) ** 2;
      const budget = getLiquidGooeyBudget();
      if (budget.maxAnimatedGroups === 0 || area > budget.maxFilterArea) {
        release();
        return false;
      }
      if (!leased) leased = tryAcquireLiquidGooeyAnimation(area);
      return leased;
    };
    function paint(now: number) {
      if (!active || document.hidden) return;
      const sourceRect = nodes.source.getBoundingClientRect();
      if (
        !nodes.source.isConnected ||
        nodes.source.closest('[hidden], [inert]') ||
        sourceRect.width <= 0 ||
        sourceRect.height <= 0
      ) {
        returning = false;
        previous.current = null;
        end('unavailable');
        showPresenceNode(nodes.label, false);
        showPresenceNode(nodes.flight, false);
        showPresenceNode(nodes.seat, false);
        release();
        return;
      }
      if (target && !getTarget()) {
        end('unavailable');
        return;
      }
      const animated = canAnimate();
      let frame = samplePresenceMotion({
        elapsed: now - begin,
        source: returning ? sourceRect : departure,
        destination,
        viewport: presenceViewport(),
        returning,
        ...(from ? { from } : {}),
        ...(origin ? { origin } : {}),
      });
      if (!target && !returning)
        frame = { ...frame, phase: 'still', separation: 0, bud: null, seat: null };
      if (!animated || (target && delivered.current === target.key))
        frame = {
          ...frame,
          phase: target ? 'dock' : 'still',
          point: destination,
          bud: null,
          seat: target ? 1 : null,
          separation: target ? 1 : 0,
        };
      if (returning && frame.phase === 'still') returning = false;
      if (target && frame.phase === 'dock') delivered.current = target.key;
      const moving = !['still', 'dock'].includes(frame.phase);
      const raw = latest.current.levelRef?.current;
      const elapsed = Math.max(0, Math.min(64, now - lastMaterialTime));
      lastMaterialTime = now;
      const amplitude = typeof raw === 'number' ? clampPresence(raw, 0, 1) : 0;
      level += (amplitude - level) * (1 - Math.exp(-elapsed / (amplitude > level ? 65 : 140)));
      if (animated && (moving || bodyActive())) bodyPhase += elapsed * 0.00105;
      materialPhase.current = bodyPhase;
      const energy = animated && bodyActive() && !moving ? 0.14 + level * 0.75 : moving ? 0.2 : 0;
      const wasHidden = nodes.label.hasAttribute('hidden');
      paintPresenceFrame(nodes, frame, seatWidth, bodyPhase, energy);
      paintPresenceSatellites(
        nodes,
        bodyPhase,
        animated && latest.current.activity === 'speaking' && frame.phase === 'still',
        level,
      );
      const motion = animated && (moving || bodyActive()) ? 'animated' : 'static';
      if (nodes.source.dataset.liquidMotion !== motion) nodes.source.dataset.liquidMotion = motion;
      previous.current = {
        ...frame,
        seatWidth: frame.phase === 'gather' ? (origin?.seatWidth ?? seatWidth) : seatWidth,
      };
      if (target && wasHidden && !nodes.label.hasAttribute('hidden')) positionLabel();
      if (animated && (moving || bodyActive())) frameId = requestAnimationFrame(tick);
      else release();
    }
    function tick(now: number) {
      frameId = null;
      if (!active || document.hidden) {
        release();
        return;
      }
      const resting = previous.current?.phase === 'still' || previous.current?.phase === 'dock';
      if (resting && now - lastPaint < 32) {
        frameId = requestAnimationFrame(tick);
        return;
      }
      lastPaint = now;
      paint(now);
    }
    function wake() {
      if (!active || frameId !== null || document.hidden) return;
      paint(performance.now());
    }
    wakeRef.current = wake;
    const startPosition = () => {
      stopPosition();
      stopPosition = () => {};
      if (!target || document.hidden) return;
      const stop = trackPresenceGeometry(nodes.source, target, nodes.label, () => {
        positionLabel();
        wake();
      });
      stopPosition = stop;
      if (!target) stop();
    };
    if (target) {
      nodes.label.textContent = target.label.slice(0, 240);
      positionLabel();
      if (target) {
        startPosition();
        if (target) timer = setTimeout(() => end('expired'), 12_000);
      }
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') end('dismissed');
    };
    const click = (event: MouseEvent) => {
      if (
        target?.contextElement &&
        event.target instanceof Node &&
        target.contextElement.contains(event.target)
      )
        end('dismissed');
    };
    const visibility = () => {
      if (document.hidden) {
        if (frameId !== null) cancelAnimationFrame(frameId);
        frameId = null;
        stopPosition();
        positionTicket++;
        release();
      } else {
        lastMaterialTime = performance.now();
        startPosition();
        wake();
      }
    };
    const intersection =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver((entries) => {
            onScreen = entries[0]?.isIntersecting ?? true;
            if (!onScreen) {
              if (frameId !== null) cancelAnimationFrame(frameId);
              frameId = null;
              release();
            }
            wake();
          });
    intersection?.observe(source);
    document.addEventListener('keydown', key);
    document.addEventListener('click', click);
    document.addEventListener('visibilitychange', visibility);
    wake();
    return () => {
      active = false;
      wakeRef.current = () => {};
      positionTicket++;
      if (frameId !== null) cancelAnimationFrame(frameId);
      clearTimeout(timer);
      stopPosition();
      intersection?.disconnect();
      release();
      document.removeEventListener('keydown', key);
      document.removeEventListener('click', click);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [sourceRef, overlayRef, portalRoot, props.target?.key, props.reducedMotion, props.size]);
  useEffect(() => wakeRef.current(), [props.activity]);
}
