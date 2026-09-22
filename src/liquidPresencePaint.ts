import { presenceBody, presenceSeat, type LiquidPresenceRect } from './liquidPresenceGeometry';
import type { LiquidPresenceFrame } from './liquidPresenceMotion';

export interface PresenceElements {
  source: HTMLSpanElement;
  body: SVGPathElement;
  bud: SVGCircleElement;
  satellites: SVGCircleElement[];
  overlay: HTMLDivElement;
  flight: SVGSVGElement;
  flightBody: SVGGElement;
  trail: SVGGElement;
  seat: SVGSVGElement;
  seatBody: SVGPathElement;
  label: HTMLSpanElement;
}
export function showPresenceNode(element: Element, show: boolean): void {
  element.toggleAttribute('hidden', !show);
  const style = (element as HTMLElement | SVGElement).style;
  const display = show ? '' : 'none';
  if (style.display !== display) style.display = display;
}
const set = (element: Element, key: string, value: number | string) => {
  const text = String(value);
  if (element.getAttribute(key) !== text) element.setAttribute(key, text);
};

/** The overlay may live inside a transformed native dialog. Coordinates still
 * originate in the viewport, then convert into that actual containing block. */
export function overlayPoint(nodes: PresenceElements, x: number, y: number) {
  const box = nodes.overlay.getBoundingClientRect();
  const sx = box.width / (nodes.overlay.clientWidth || box.width || 1) || 1;
  const sy = box.height / (nodes.overlay.clientHeight || box.height || 1) || 1;
  return { x: (x - box.x) / sx, y: (y - box.y) / sy };
}

export function paintPresenceFrame(
  nodes: PresenceElements,
  frame: LiquidPresenceFrame,
  seatWidth: number,
  bodyPhase: number,
  energy = 0,
  intensity = 1,
) {
  set(nodes.source, 'data-liquid-phase', frame.phase);
  set(nodes.overlay, 'data-liquid-phase', frame.phase);
  set(nodes.body, 'd', presenceBody(bodyPhase, energy, frame.separation, intensity));
  // A little directional give makes the neck belong to the body; the native
  // button never moves. The two endpoints are exactly neutral.
  const pull = frame.bud ? Math.sin(frame.separation * Math.PI) * 0.045 : 0;
  set(
    nodes.body,
    'transform',
    `translate(${((frame.bud?.x ?? 80) - 80) * pull} ${((frame.bud?.y ?? 80) - 80) * pull})`,
  );
  showPresenceNode(nodes.bud, Boolean(frame.bud));
  if (frame.bud) {
    set(nodes.bud, 'cx', frame.bud.x);
    set(nodes.bud, 'cy', frame.bud.y);
    set(nodes.bud, 'r', frame.bud.radius);
  }
  const flying = frame.phase === 'flight' || frame.phase === 'return';
  showPresenceNode(nodes.flight, flying);
  const point = overlayPoint(nodes, frame.point.x, frame.point.y);
  if (flying) {
    const scale = frame.diameter / 32;
    nodes.flight.style.transform = `translate(${point.x - 48}px, ${point.y - 36}px)`;
    set(
      nodes.flightBody,
      'transform',
      `rotate(${frame.angle}) scale(${scale * frame.stretch} ${scale / Math.sqrt(frame.stretch)})`,
    );
    set(nodes.trail, 'opacity', Math.min(0.8, (frame.stretch - 1) * 3));
  }
  showPresenceNode(nodes.seat, frame.seat !== null);
  if (frame.seat !== null) {
    nodes.seat.style.transform = `translate(${point.x - 56}px, ${point.y - 28}px)`;
    set(
      nodes.seatBody,
      'd',
      presenceSeat(frame.seatWidth ?? seatWidth, frame.seat, frame.diameter),
    );
  }
  showPresenceNode(
    nodes.label,
    frame.phase !== 'gather' && frame.seat !== null && frame.seat > 0.45,
  );
}

export function paintPresenceSatellites(
  nodes: PresenceElements,
  phase: number,
  enabled: boolean,
  level: number,
) {
  nodes.satellites.forEach((circle, index) => {
    showPresenceNode(circle, enabled);
    if (!enabled) return;
    const angle = phase * 0.7 + (index * Math.PI * 2) / 3;
    const reach = 63 + Math.max(0, Math.sin(phase * 1.6 + index * 2)) * (16 + level * 12);
    set(circle, 'cx', 80 + Math.cos(angle) * reach);
    set(circle, 'cy', 80 + Math.sin(angle) * reach);
    set(circle, 'r', 7 + index * 1.5);
  });
}

export function presenceViewport(): LiquidPresenceRect {
  const visual = window.visualViewport;
  return {
    x: visual?.offsetLeft ?? 0,
    y: visual?.offsetTop ?? 0,
    width: visual?.width ?? innerWidth,
    height: visual?.height ?? innerHeight,
  };
}
