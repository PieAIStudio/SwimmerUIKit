import { useEffect, useRef, type RefObject } from 'react';
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type VirtualElement,
} from '@floating-ui/react';
import {
  getLiquidGooeyBudget,
  releaseLiquidGooeyAnimation,
  tryAcquireLiquidGooeyAnimation,
} from './liquidGooeyBudget';
import {
  clampPresence,
  presenceLanding,
  rectCenter,
  validPresenceRect,
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
      old && ['flight', 'dock', 'land', 'return'].includes(old.phase) ? old.point : undefined;
    let destination: LiquidPoint = old?.point ?? rectCenter(source.getBoundingClientRect());
    let seatWidth = 48;
    let begin = performance.now();
    let frameId = 0;
    let active = true;
    let leased = false;
    let onScreen = true;
    let lastPaint = 0;
    let bodyPhase = 0;
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
      from = previous.current?.point;
      destination = from ?? destination;
      begin = performance.now();
      stopPosition();
      clearTimeout(timer);
      positionTicket++;
      showPresenceNode(nodes.label, false);
      latest.current.onDismiss?.(reason);
      wake();
    };
    const getTarget = () => {
      if (!target) return null;
      try {
        const element = target.contextElement;
        if (element && (!element.isConnected || element.closest('[hidden], [inert]'))) return null;
        const modal = document.querySelector('dialog:modal');
        if (modal && (!element || !modal.contains(element))) return null;
        const rect = target.getRect();
        return validPresenceRect(rect) && visiblePresenceRect(rect, presenceViewport())
          ? rect
          : null;
      } catch {
        return null;
      }
    };
    const positionLabel = () => {
      if (!target) return;
      const rect = getTarget();
      if (!rect) {
        end('unavailable');
        return;
      }
      const landing = presenceLanding(rect, presenceViewport());
      destination = landing;
      seatWidth = landing.width;
      const virtual: VirtualElement = {
        ...(target.contextElement ? { contextElement: target.contextElement } : {}),
        getBoundingClientRect: () => ({
          ...rect,
          top: rect.y,
          left: rect.x,
          bottom: rect.y + rect.height,
          right: rect.x + rect.width,
        }),
      };
      const ticket = ++positionTicket;
      void computePosition(virtual, nodes.label, {
        strategy: 'absolute',
        placement: landing.side,
        middleware: [offset(26), flip(), shift({ padding: 16 })],
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
      if (latest.current.reducedMotion || document.hidden || !onScreen) return false;
      if (!visiblePresenceRect(source.getBoundingClientRect(), presenceViewport())) return false;
      const targetDialog = target?.contextElement?.closest('dialog') ?? null;
      if (target && source.closest('dialog') !== targetDialog) return false;
      const area = Math.max(112 * 56, (source.getBoundingClientRect().width * 2) ** 2);
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
      if (target && !getTarget()) {
        end('unavailable');
        return;
      }
      const animated = canAnimate();
      let frame = samplePresenceMotion({
        elapsed: now - begin,
        source: sourceRect,
        destination,
        viewport: presenceViewport(),
        returning,
        ...(from ? { from } : {}),
      });
      if (!target && !returning)
        frame = { ...frame, phase: 'still', separation: 0, bud: null, seat: null };
      if (!animated)
        frame = {
          ...frame,
          phase: target ? 'dock' : 'still',
          point: destination,
          bud: null,
          seat: target ? 1 : null,
          separation: 0,
        };
      if (returning && frame.phase === 'still') returning = false;
      const moving = !['still', 'dock'].includes(frame.phase);
      const raw = latest.current.levelRef?.current;
      const level = typeof raw === 'number' ? clampPresence(raw, 0, 1) : 0;
      if (animated && (moving || bodyActive())) bodyPhase += 0.035;
      const energy = animated && bodyActive() && !moving ? 0.14 + level * 0.75 : moving ? 0.2 : 0;
      const wasHidden = nodes.label.hasAttribute('hidden');
      paintPresenceFrame(nodes, frame, seatWidth, bodyPhase, energy);
      paintPresenceSatellites(
        nodes,
        bodyPhase,
        animated && latest.current.activity === 'speaking' && frame.phase === 'still',
        level,
      );
      nodes.source.dataset.liquidMotion =
        animated && (moving || bodyActive()) ? 'animated' : 'static';
      previous.current = frame;
      if (target && wasHidden && !nodes.label.hasAttribute('hidden')) positionLabel();
      if (animated && (moving || bodyActive())) frameId = requestAnimationFrame(tick);
      else release();
    }
    function tick(now: number) {
      frameId = 0;
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
      if (!active || frameId || document.hidden) return;
      paint(performance.now());
    }
    wakeRef.current = wake;
    if (target) {
      nodes.label.textContent = target.label.slice(0, 240);
      positionLabel();
      if (target) {
        const virtual: VirtualElement = {
          ...(target.contextElement ? { contextElement: target.contextElement } : {}),
          getBoundingClientRect: () => {
            const rect = getTarget() ?? { x: 0, y: 0, width: 0, height: 0 };
            return {
              ...rect,
              top: rect.y,
              left: rect.x,
              right: rect.x + rect.width,
              bottom: rect.y + rect.height,
            };
          },
        };
        const stop = autoUpdate(
          virtual,
          nodes.label,
          () => {
            positionLabel();
            wake();
          },
          { animationFrame: true },
        );
        stopPosition = stop;
        if (!target) stop();
        else timer = setTimeout(() => end('expired'), 12_000);
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
        cancelAnimationFrame(frameId);
        frameId = 0;
        release();
      } else wake();
    };
    const intersection =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver((entries) => {
            onScreen = entries[0]?.isIntersecting ?? true;
            if (!onScreen) {
              cancelAnimationFrame(frameId);
              frameId = 0;
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
      cancelAnimationFrame(frameId);
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
