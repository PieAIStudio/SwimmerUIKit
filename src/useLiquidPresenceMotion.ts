import { useEffect, useRef, type RefObject } from 'react';
import {
  computePosition,
  flip,
  offset,
  shift,
  size as fitFloatingSize,
  type VirtualElement,
} from '@floating-ui/react';
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
  const hasGuideContent = Boolean(props.guideContent);
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
    let ambientTimer: ReturnType<typeof setTimeout> | undefined;
    let active = true;
    let leased = false;
    let ambientDeferred = false;
    let onScreen = true;
    let lastPaint = 0;
    let bodyPhase = materialPhase.current;
    let lastMaterialTime = performance.now();
    let level = 0;
    let positionTicket = 0;
    let resolvedSide: 'top' | 'bottom' | null = null;
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
    const getTarget = () => {
      if (!target) return null;
      // A newly requested destination may be underneath our PREVIOUS caption.
      // Exclude only our own explanatory hit layer during host occlusion checks;
      // other dialogs/overlays still block. This never clicks through anything.
      const pointerEvents = nodes.label.style.pointerEvents;
      if (latest.current.guideContent) nodes.label.style.pointerEvents = 'none';
      try {
        return readPresenceTarget(
          latest.current.target?.key === target.key ? latest.current.target : target,
        );
      } finally {
        nodes.label.style.pointerEvents = pointerEvents;
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
      const visible = clipPresenceRect(rect, presenceViewport());
      const landingY = (side: 'top' | 'bottom') =>
        clampPresence(
          side === 'top' ? visible.y - 10 : visible.y + visible.height + 10,
          presenceViewport().y + 18,
          presenceViewport().y + presenceViewport().height - 18,
        );
      destination = { x: landing.x, y: landingY(resolvedSide ?? landing.side) };
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
      const expanded = latest.current.guideSize === 'expanded';
      if (!expanded) nodes.label.style.maxHeight = '';
      // Measure the real card without a one-frame flash/hitbox at (0, 0).
      // On retarget keep the mounted controls visible so keyboard focus survives.
      if (latest.current.guideContent && !nodes.label.style.transform) {
        nodes.label.style.visibility = 'hidden';
        showPresenceNode(nodes.label, true);
      }
      void computePosition(virtual, nodes.label, {
        strategy: 'absolute',
        placement: expanded && presenceViewport().width >= 900 ? 'right' : landing.side,
        middleware: [
          offset(26),
          flip({
            padding: 16,
            ...(expanded && presenceViewport().width >= 900
              ? { fallbackPlacements: ['left', 'bottom', 'top'] as const }
              : {}),
          }),
          shift({ padding: 16, crossAxis: !expanded }),
          ...(expanded
            ? [
                fitFloatingSize({
                  padding: 16,
                  apply({ availableHeight, elements }) {
                    // Fit the real available side; do not slide a tall review across the
                    // original selection. Scroll its contents rather than hide the source.
                    const height = `${Math.max(0, Math.min(560, presenceViewport().height * 0.65, availableHeight))}px`;
                    if (elements.floating.style.maxHeight !== height)
                      elements.floating.style.maxHeight = height;
                  },
                }),
              ]
            : []),
        ],
      })
        .then(({ x, y, placement }) => {
          if (active && ticket === positionTicket) {
            nodes.label.style.transform = `translate(${x}px, ${y}px)`;
            nodes.label.style.visibility = '';
            // A tall explanation can flip even when the small liquid marker
            // would fit below. Keep BOTH on the same side of the actual target.
            resolvedSide = placement.startsWith('top')
              ? 'top'
              : placement.startsWith('bottom')
                ? 'bottom'
                : landing.side;
            const nextY = landingY(resolvedSide);
            if (destination.y !== nextY) {
              destination = { x: landing.x, y: nextY };
              wake();
            }
          }
        })
        .catch(() => {});
    };
    const bodyActive = () =>
      ['connecting', 'listening', 'thinking', 'speaking', 'working'].includes(
        latest.current.activity ?? 'idle',
      );
    const wantsAmbient = () =>
      latest.current.idleMotion === 'breathe' && (latest.current.activity ?? 'idle') === 'idle';
    const canAnimate = () => {
      ambientDeferred = false;
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
      // Idle is courtesy work: do not reserve a slot that a real liquid control
      // or guidance gesture needs. Its lease is released after each paint.
      const moving = target || returning || bodyActive();
      if (!moving && wantsAmbient() && !leased && budget.activeGroups > 0) {
        ambientDeferred = true;
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
      const ambient = !moving && wantsAmbient();
      const elapsed = Math.max(0, Math.min(160, now - lastMaterialTime));
      lastMaterialTime = now;
      const amplitude = typeof raw === 'number' ? clampPresence(raw, 0, 1) : 0;
      level += (amplitude - level) * (1 - Math.exp(-elapsed / (amplitude > level ? 65 : 140)));
      const speed = clampPresence(latest.current.motionSpeed ?? 1, 0.5, 1.5);
      const intensity = clampPresence(latest.current.motionIntensity ?? 1, 0.25, 1.25);
      if (animated && (moving || bodyActive() || ambient))
        bodyPhase += elapsed * (ambient ? 0.00032 : 0.00105) * speed;
      materialPhase.current = bodyPhase;
      const energy = animated && bodyActive() && !moving ? 0.14 + level * 0.75 : moving ? 0.2 : 0;
      const wasHidden = nodes.label.hasAttribute('hidden');
      paintPresenceFrame(
        nodes,
        frame,
        seatWidth,
        bodyPhase,
        energy,
        intensity * (ambient ? 0.65 : 1),
        Boolean(latest.current.guideContent && target),
      );
      paintPresenceSatellites(
        nodes,
        bodyPhase,
        animated &&
          latest.current.splashes !== false &&
          latest.current.activity === 'speaking' &&
          frame.phase === 'still',
        level,
      );
      const motion =
        animated && (moving || bodyActive())
          ? 'animated'
          : animated && ambient
            ? 'ambient'
            : 'static';
      if (nodes.source.dataset.liquidMotion !== motion) nodes.source.dataset.liquidMotion = motion;
      previous.current = {
        ...frame,
        seatWidth: frame.phase === 'gather' ? (origin?.seatWidth ?? seatWidth) : seatWidth,
      };
      if (target && wasHidden && !nodes.label.hasAttribute('hidden')) positionLabel();
      if (animated && (moving || bodyActive())) frameId = requestAnimationFrame(tick);
      else {
        release();
        if (ambient && (animated || ambientDeferred)) {
          // No 60Hz polling just to throttle to 12Hz. One timed wake, one paint.
          ambientTimer = setTimeout(
            () => {
              ambientTimer = undefined;
              if (active && !document.hidden && onScreen) frameId = requestAnimationFrame(tick);
            },
            ambientDeferred ? 250 : 1000 / 12,
          );
        }
      }
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
      clearTimeout(ambientTimer);
      ambientTimer = undefined;
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
      positionLabel();
      if (target) {
        startPosition();
        if (target && !latest.current.guideContent)
          timer = setTimeout(() => end('expired'), 12_000);
      }
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.isComposing && target) {
        // Interactive content owns its own close/busy/IME decision. Its React
        // handler runs after this capture listener; do not dismiss it first.
        if (
          latest.current.guideContent &&
          event.target instanceof Node &&
          nodes.label.contains(event.target)
        )
          return;
        const modal = document.querySelector('dialog:modal');
        if (modal && !modal.contains(nodes.label)) return;
        if (latest.current.guideContent) event.preventDefault();
        end('dismissed');
      }
    };
    const click = (event: MouseEvent) => {
      if (
        latest.current.dismissOnTargetClick !== false &&
        target?.contextElement &&
        event.target instanceof Node &&
        target.contextElement.contains(event.target)
      )
        end('dismissed');
    };
    const visibility = () => {
      if (document.hidden) {
        clearTimeout(ambientTimer);
        ambientTimer = undefined;
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
              clearTimeout(ambientTimer);
              ambientTimer = undefined;
              if (frameId !== null) cancelAnimationFrame(frameId);
              frameId = null;
              release();
            }
            wake();
          });
    intersection?.observe(source);
    document.addEventListener('keydown', key, true);
    document.addEventListener('click', click);
    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('close', wake, true);
    document.addEventListener('toggle', wake, true);
    wake();
    return () => {
      active = false;
      wakeRef.current = () => {};
      positionTicket++;
      if (frameId !== null) cancelAnimationFrame(frameId);
      clearTimeout(timer);
      clearTimeout(ambientTimer);
      stopPosition();
      intersection?.disconnect();
      release();
      document.removeEventListener('keydown', key, true);
      document.removeEventListener('click', click);
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('close', wake, true);
      document.removeEventListener('toggle', wake, true);
    };
  }, [
    sourceRef,
    overlayRef,
    portalRoot,
    props.target?.key,
    props.reducedMotion,
    props.size,
    props.guideSize,
    hasGuideContent,
  ]);
  useEffect(
    () => wakeRef.current(),
    [props.activity, props.idleMotion, props.motionSpeed, props.motionIntensity, props.splashes],
  );
}
