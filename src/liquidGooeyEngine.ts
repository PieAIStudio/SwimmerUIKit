import {
  measureRadius,
  normalizeRadius,
  offsetTo,
  roundedRectPath,
  type BlobBox,
  type CornerRadii,
} from './liquidGooeyGeometry';
import {
  getLiquidGooeyBudget,
  releaseLiquidGooeyAnimation,
  tryAcquireLiquidGooeyAnimation,
} from './liquidGooeyBudget';
import {
  advanceMove,
  createMoveState,
  resolveMoveOptions,
  snapMoveState,
  type MoveState,
  type MoveTailFrame,
  type MoveTarget,
} from './liquidGooeyMove';
import { easingFunction, resolveTransition, type Transition } from './liquidGooeySpring';

export type LiquidGooeyMotionMode = 'static' | 'animated' | 'reduced';

export interface LiquidGooeyItemConfig {
  x?: number;
  y?: number;
  scale?: number;
  transition?: Transition;
  delay?: number;
  radius?: number | CornerRadii;
}

export interface LiquidGooeyItemRegistration {
  id: string;
  host: HTMLDivElement;
  blob: SVGPathElement;
  config: LiquidGooeyItemConfig;
}

interface NormalizedConfig {
  x: number;
  y: number;
  scale: number;
  transition?: Transition;
  delay?: number;
  radius?: number | CornerRadii;
}

interface Point {
  x: number;
  y: number;
  scale: number;
}

interface Motion {
  from: Point;
  to: Point;
  start: number;
  duration: number;
  ease: (progress: number) => number;
}

interface TailElements {
  lead: SVGCircleElement;
  midA: SVGCircleElement;
  midB: SVGCircleElement;
  lastPaint: string | null;
}

interface Entry extends LiquidGooeyItemRegistration {
  config: NormalizedConfig;
  target: Point;
  current: Point;
  motion: Motion | null;
  lastBox: BlobBox | null;
  lastPaint: string | null;
  ownTransform: string;
  resizeObserver: ResizeObserver | null;
  move: MoveState | null;
  tail: TailElements | null;
}

function finite(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

function normalizeConfig(config: LiquidGooeyItemConfig): NormalizedConfig {
  const normalized: NormalizedConfig = {
    x: finite(config.x, 0),
    y: finite(config.y, 0),
    scale: Math.max(0.01, finite(config.scale, 1)),
  };
  if (config.transition !== undefined) normalized.transition = config.transition;
  if (config.delay !== undefined) normalized.delay = Math.max(0, finite(config.delay, 0));
  if (config.radius !== undefined) normalized.radius = config.radius;
  return normalized;
}

function pointFrom(config: NormalizedConfig): Point {
  return { x: config.x, y: config.y, scale: config.scale };
}

function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y && a.scale === b.scale;
}

function radiusKey(radius: number | CornerRadii | undefined): string {
  return radius === undefined ? '' : JSON.stringify(radius);
}

function sameBox(a: BlobBox | null, b: BlobBox): boolean {
  return Boolean(
    a &&
    Math.abs(a.x - b.x) < 0.01 &&
    Math.abs(a.y - b.y) < 0.01 &&
    Math.abs(a.w - b.w) < 0.01 &&
    Math.abs(a.h - b.h) < 0.01 &&
    a.r.every((value, index) => Math.abs(value - (b.r[index] ?? 0)) < 0.01),
  );
}

function format(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

/**
 * One per-group clock for component-driven morph motion.
 *
 * It writes the real DOM wrapper and its SVG path in the same tick. This is
 * intentionally smaller than a general measurement engine: this kit's first
 * version supports fixed morph occasions and the adopted Move follow surface,
 * not arbitrary image melt, bend, dissolve, or image-melt behaviors.
 */
export class LiquidGooeyEngine {
  private readonly getGroup: () => HTMLElement | null;

  private readonly getFilterArea: () => number;

  private readonly onModeChange: ((mode: LiquidGooeyMotionMode) => void) | undefined;

  private readonly nowFn: () => number;

  private readonly requestFrame: (callback: FrameRequestCallback) => number;

  private readonly cancelFrame: (handle: number) => void;

  private readonly follow: boolean;

  private readonly items = new Map<string, Entry>();

  private readonly removeListeners: Array<() => void> = [];

  private mutationObserver: MutationObserver | null = null;

  private awake = false;

  private raf = 0;

  private needsPaint = false;

  private lastActivity = 0;

  private claimed = false;

  private budgetWarningEmitted = false;

  private reducedMotion: boolean;

  private filterArea = 0;

  private mode: LiquidGooeyMotionMode = 'static';

  private lastFrameTime: number | null = null;

  private moveOptions: ReturnType<typeof resolveMoveOptions> | null = null;

  private disposed = false;

  constructor(options: {
    getGroup: () => HTMLElement | null;
    getFilterArea: () => number;
    reducedMotion?: boolean;
    onModeChange?: (mode: LiquidGooeyMotionMode) => void;
    follow?: boolean;
    now?: () => number;
    requestFrame?: (callback: FrameRequestCallback) => number;
    cancelFrame?: (handle: number) => void;
  }) {
    this.getGroup = options.getGroup;
    this.getFilterArea = options.getFilterArea;
    this.reducedMotion = options.reducedMotion ?? false;
    this.onModeChange = options.onModeChange;
    this.follow = options.follow ?? false;
    this.nowFn = options.now ?? (() => performance.now());
    this.requestFrame = options.requestFrame ?? ((callback) => requestAnimationFrame(callback));
    this.cancelFrame = options.cancelFrame ?? ((handle) => cancelAnimationFrame(handle));
  }

  register(registration: LiquidGooeyItemRegistration): () => void {
    this.revive();
    this.unregister(registration.id);
    const config = normalizeConfig(registration.config);
    const entry: Entry = {
      ...registration,
      config,
      target: pointFrom(config),
      current: pointFrom(config),
      motion: null,
      lastBox: null,
      lastPaint: null,
      ownTransform: '',
      resizeObserver: null,
      move: null,
      tail: this.follow ? this.createTailElements(registration.blob) : null,
    };
    entry.host.style.transformOrigin = 'center';
    this.applyHost(entry);
    if (typeof ResizeObserver !== 'undefined') {
      entry.resizeObserver = new ResizeObserver(() => {
        this.touch();
        this.wake();
      });
      entry.resizeObserver.observe(entry.host);
    }
    this.items.set(entry.id, entry);
    this.ensureSources();
    this.touch();
    this.wake();
    return () => this.unregister(entry.id);
  }

  update(id: string, configInput: LiquidGooeyItemConfig): void {
    const entry = this.items.get(id);
    if (!entry) return;
    const config = normalizeConfig(configInput);
    const target = pointFrom(config);
    const targetChanged = !samePoint(entry.target, target);
    const shapeChanged = radiusKey(entry.config.radius) !== radiusKey(config.radius);
    entry.config = config;
    if (!targetChanged) {
      if (shapeChanged) {
        entry.lastPaint = null;
        this.touch();
        this.wake();
      }
      return;
    }

    const now = this.now();
    this.advanceEntry(entry, now);
    entry.target = target;

    if (this.reducedMotion) {
      this.snapEntry(entry);
      this.resetMoveEntry(entry);
      this.setMode('reduced');
    } else {
      const transition = resolveTransition(config.transition);
      const contentShouldAnimate = transition.duration > 0;
      const shouldAnimate = contentShouldAnimate || this.follow;
      if (!shouldAnimate || !this.ensureClaim()) {
        this.snapEntry(entry);
        if (this.follow) this.resetMoveEntry(entry);
        this.setMode('static');
      } else if (!contentShouldAnimate) {
        // A follow surface may still animate when the content has no explicit
        // transition: the host jumps, while the filtered silhouette catches up.
        entry.current = { ...target };
        entry.motion = null;
        entry.host.style.willChange = '';
        this.applyHost(entry);
        this.setMode('animated');
      } else {
        entry.motion = {
          from: { ...entry.current },
          to: { ...target },
          start: now + (config.delay ?? 0),
          duration: transition.duration,
          ease: easingFunction(transition.easing),
        };
        entry.host.style.willChange = 'transform';
        this.setMode('animated');
      }
    }
    this.touch(now);
    this.needsPaint = true;
    this.wake();
  }

  setReducedMotion(reduced: boolean): void {
    if (this.reducedMotion === reduced) return;
    this.reducedMotion = reduced;
    if (reduced) {
      const now = this.now();
      for (const entry of this.items.values()) {
        this.advanceEntry(entry, now);
        this.snapEntry(entry);
        this.resetMoveEntry(entry);
      }
      this.releaseClaim();
      this.setMode('reduced');
    } else if (!this.claimed) {
      this.setMode('static');
    }
    this.touch();
    this.needsPaint = true;
    this.wake();
  }

  setFilterArea(areaInput: number): void {
    const area = Number.isFinite(areaInput) ? Math.max(0, areaInput) : Infinity;
    if (Math.abs(area - this.filterArea) < 0.5) return;
    this.filterArea = area;
    if (this.claimed && area > getLiquidGooeyBudget().maxFilterArea) {
      for (const entry of this.items.values()) {
        this.snapEntry(entry);
        if (this.follow) this.resetMoveEntry(entry);
      }
      this.releaseClaim();
      this.setMode(this.reducedMotion ? 'reduced' : 'static');
    }
    this.needsPaint = true;
    this.wake();
  }

  wake(): void {
    if (this.disposed || this.items.size === 0) return;
    this.needsPaint = true;
    if (this.awake) return;
    this.awake = true;
    this.raf = this.requestFrame(this.loop);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.raf) this.cancelFrame(this.raf);
    this.mutationObserver?.disconnect();
    this.removeListeners.forEach((remove) => remove());
    for (const entry of this.items.values()) {
      entry.resizeObserver?.disconnect();
      entry.host.style.willChange = '';
      this.removeTailElements(entry);
    }
    this.items.clear();
    this.releaseClaim();
    this.awake = false;
    this.lastFrameTime = null;
  }

  /** Test/debug evidence without exposing the internals of an item. */
  getDebugState(): {
    awake: boolean;
    mode: LiquidGooeyMotionMode;
    itemCount: number;
    claimed: boolean;
    filterArea: number;
  } {
    return {
      awake: this.awake,
      mode: this.mode,
      itemCount: this.items.size,
      claimed: this.claimed,
      filterArea: this.filterArea,
    };
  }

  private now(): number {
    return this.nowFn();
  }

  private touch(now = this.now()): void {
    this.lastActivity = now;
  }

  private setMode(mode: LiquidGooeyMotionMode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.onModeChange?.(mode);
  }

  private ensureClaim(): boolean {
    if (this.claimed) return true;
    const areaFromHost = this.getFilterArea();
    if (Number.isFinite(areaFromHost)) this.filterArea = Math.max(0, areaFromHost);
    if (!tryAcquireLiquidGooeyAnimation(this.filterArea)) {
      this.warnBudgetFallback();
      return false;
    }
    this.claimed = true;
    this.moveOptions = resolveMoveOptions(this.getGroup());
    return true;
  }

  private warnBudgetFallback(): void {
    if (this.budgetWarningEmitted || import.meta.env?.DEV === false) return;
    this.budgetWarningEmitted = true;
    const budget = getLiquidGooeyBudget();
    const reason =
      budget.activeGroups >= budget.maxAnimatedGroups
        ? 'the active-group limit is reached'
        : 'the filter-area limit is exceeded';
    console.warn(
      `LiquidGroup: the liquid animation budget is insufficient (${reason}); ` +
        'degrading to static rendering for this group.',
    );
  }

  private revive(): void {
    if (!this.disposed) return;
    this.disposed = false;
    this.mutationObserver = null;
    this.removeListeners.length = 0;
    this.lastFrameTime = null;
    this.budgetWarningEmitted = false;
  }

  private releaseClaim(): void {
    if (!this.claimed) return;
    releaseLiquidGooeyAnimation();
    this.claimed = false;
  }

  private snapEntry(entry: Entry): void {
    entry.current = { ...entry.target };
    entry.motion = null;
    entry.host.style.willChange = '';
    this.applyHost(entry);
  }

  private resetMoveEntry(entry: Entry): void {
    entry.move = null;
    entry.lastPaint = null;
    this.hideTail(entry);
  }

  private advanceEntry(entry: Entry, now: number): boolean {
    const motion = entry.motion;
    if (!motion) return false;
    const progress = Math.min(1, Math.max(0, (now - motion.start) / motion.duration));
    const eased = motion.ease(progress);
    entry.current = {
      x: motion.from.x + (motion.to.x - motion.from.x) * eased,
      y: motion.from.y + (motion.to.y - motion.from.y) * eased,
      scale: motion.from.scale + (motion.to.scale - motion.from.scale) * eased,
    };
    this.applyHost(entry);
    if (progress >= 1) {
      entry.current = { ...motion.to };
      entry.motion = null;
      entry.host.style.willChange = '';
      this.applyHost(entry);
      return false;
    }
    return true;
  }

  private applyHost(entry: Entry): void {
    const transform =
      `translate(${format(entry.current.x)}px, ${format(entry.current.y)}px) ` +
      `scale(${format(entry.current.scale)})`;
    if (entry.ownTransform === transform) return;
    entry.ownTransform = transform;
    entry.host.style.transform = transform;
  }

  private createTailElements(blob: SVGPathElement): TailElements | null {
    const parent = blob.parentElement;
    if (!parent) return null;
    const document = blob.ownerDocument;
    const makeCircle = (name: string): SVGCircleElement => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('data-liquid-gooey-move-tail', name);
      circle.setAttribute('r', '0');
      return circle;
    };
    const lead = makeCircle('lead');
    const midA = makeCircle('mid-a');
    const midB = makeCircle('mid-b');
    parent.insertBefore(lead, blob);
    parent.insertBefore(midA, blob);
    parent.insertBefore(midB, blob);
    return { lead, midA, midB, lastPaint: null };
  }

  private removeTailElements(entry: Entry): void {
    entry.tail?.lead.remove();
    entry.tail?.midA.remove();
    entry.tail?.midB.remove();
    entry.tail = null;
  }

  private hideTail(entry: Entry): void {
    const tail = entry.tail;
    if (!tail || tail.lastPaint === 'hidden') return;
    tail.lead.setAttribute('r', '0');
    tail.midA.setAttribute('r', '0');
    tail.midB.setAttribute('r', '0');
    tail.lastPaint = 'hidden';
  }

  private paintTail(entry: Entry, frame: MoveTailFrame): boolean {
    const tail = entry.tail;
    if (!tail || tail.lastPaint === frame.fingerprint) return false;
    if (!frame.visible) {
      this.hideTail(entry);
      return true;
    }
    tail.lead.setAttribute('cx', String(frame.cx));
    tail.lead.setAttribute('cy', String(frame.cy));
    tail.lead.setAttribute('r', String(frame.radius));
    tail.midA.setAttribute('cx', String(frame.midACx));
    tail.midA.setAttribute('cy', String(frame.midACy));
    tail.midA.setAttribute('r', String(frame.midARadius));
    tail.midB.setAttribute('cx', String(frame.midBCx));
    tail.midB.setAttribute('cy', String(frame.midBCy));
    tail.midB.setAttribute('r', String(frame.midBRadius));
    tail.lastPaint = frame.fingerprint;
    return true;
  }

  private moveTarget(entry: Entry, box: BlobBox): MoveTarget {
    return {
      cx: box.x + box.w / 2 + entry.current.x,
      cy: box.y + box.h / 2 + entry.current.y,
      scale: entry.current.scale,
    };
  }

  private readBox(entry: Entry, group: HTMLElement): BlobBox {
    const offset = offsetTo(entry.host, group);
    const width = entry.host.offsetWidth;
    const height = entry.host.offsetHeight;
    const target = (entry.host.firstElementChild as HTMLElement | null) ?? entry.host;
    const radii =
      entry.config.radius === undefined
        ? measureRadius(target, width, height)
        : normalizeRadius(entry.config.radius);
    return { x: offset.x, y: offset.y, w: width, h: height, r: radii };
  }

  private paintFollowEntry(
    entry: Entry,
    box: BlobBox,
    dt: number,
    boxChanged: boolean,
    isFirstBox: boolean,
  ): { changed: boolean; moving: boolean } {
    const target = this.moveTarget(entry, box);
    if (!isFirstBox && boxChanged && !this.reducedMotion && !this.claimed) {
      if (!this.ensureClaim()) {
        this.resetMoveEntry(entry);
        entry.move = createMoveState(target);
      } else {
        this.setMode('animated');
      }
    }
    if (!entry.move) entry.move = createMoveState(target);
    if (this.reducedMotion) {
      // Reduced motion keeps the same crisp filtered silhouette, but never
      // spends a process-wide animation slot or leaves a tail behind.
      snapMoveState(entry.move, target);
    }
    const options = this.moveOptions ?? (this.moveOptions = resolveMoveOptions(this.getGroup()));
    const frame = advanceMove(entry.move, target, box, this.reducedMotion ? 0 : dt, options);
    const fingerprint = `${frame.path}|${frame.transform}`;
    let changed = false;
    if (entry.lastPaint !== fingerprint) {
      entry.lastPaint = fingerprint;
      entry.blob.setAttribute('d', frame.path);
      entry.blob.setAttribute('transform', frame.transform);
      changed = true;
    }
    if (this.paintTail(entry, frame.tail)) changed = true;
    return { changed, moving: !this.reducedMotion && frame.moving && this.claimed };
  }

  private paintEntry(entry: Entry, box: BlobBox): boolean {
    const translateX = box.x + entry.current.x + (box.w * (1 - entry.current.scale)) / 2;
    const translateY = box.y + entry.current.y + (box.h * (1 - entry.current.scale)) / 2;
    const transform = `translate(${format(translateX)} ${format(translateY)}) scale(${format(entry.current.scale)})`;
    const path = roundedRectPath(0, 0, box.w, box.h, box.r);
    const fingerprint = `${path}|${transform}`;
    if (entry.lastPaint === fingerprint) return false;
    entry.lastPaint = fingerprint;
    entry.blob.setAttribute('d', path);
    entry.blob.setAttribute('transform', transform);
    return true;
  }

  private loop = (now: number): void => {
    this.raf = 0;
    if (this.disposed || this.items.size === 0) {
      this.awake = false;
      return;
    }

    const dt =
      this.lastFrameTime === null ? 1 / 60 : Math.max(0, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    let moving = false;
    for (const entry of this.items.values()) {
      if (this.advanceEntry(entry, now)) moving = true;
    }

    const group = this.getGroup();
    let geometryChanged = false;
    if (group) {
      const boxes = new Map<string, BlobBox>();
      for (const entry of this.items.values()) boxes.set(entry.id, this.readBox(entry, group));
      for (const entry of this.items.values()) {
        const box = boxes.get(entry.id);
        if (!box) continue;
        const isFirstBox = entry.lastBox === null;
        const boxChanged = !sameBox(entry.lastBox, box);
        if (boxChanged) {
          entry.lastBox = box;
          entry.lastPaint = null;
          geometryChanged = true;
        }
        const paint = this.follow
          ? this.paintFollowEntry(entry, box, dt, boxChanged, isFirstBox)
          : { changed: this.paintEntry(entry, box), moving: false };
        if (paint.changed) geometryChanged = true;
        if (paint.moving) moving = true;
      }
    }

    this.needsPaint = false;
    if (moving || geometryChanged) this.touch(now);
    const stillWithinSettleWindow = now - this.lastActivity < 500;
    if (moving || this.needsPaint || stillWithinSettleWindow) {
      this.raf = this.requestFrame(this.loop);
      return;
    }

    this.awake = false;
    this.releaseClaim();
    this.setMode(this.reducedMotion ? 'reduced' : 'static');
    this.lastFrameTime = null;
  };

  private ensureSources(): void {
    if (this.mutationObserver) return;
    const group = this.getGroup();
    if (!group || typeof MutationObserver === 'undefined') return;
    this.mutationObserver = new MutationObserver((mutations) => {
      let externalChange = false;
      for (const mutation of mutations) {
        const target = mutation.target;
        if (target instanceof Element && target.closest('[data-liquid-gooey-silhouette]')) {
          continue;
        }
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const entry = [...this.items.values()].find((item) => item.host === target);
          if (entry && entry.ownTransform === entry.host.style.transform) continue;
        }
        externalChange = true;
        break;
      }
      if (externalChange) {
        this.touch();
        this.wake();
      }
    });
    this.mutationObserver.observe(group, {
      attributes: true,
      attributeFilter: ['class', 'style'],
      childList: true,
      subtree: true,
    });

    const wake = (): void => {
      this.touch();
      this.wake();
    };
    for (const event of ['transitionrun', 'animationstart', 'pointerdown']) {
      group.addEventListener(event, wake, true);
      this.removeListeners.push(() => group.removeEventListener(event, wake, true));
    }
    window.addEventListener('scroll', wake, { capture: true, passive: true });
    this.removeListeners.push(() => window.removeEventListener('scroll', wake, true));
  }

  private unregister(id: string): void {
    const entry = this.items.get(id);
    if (!entry) return;
    entry.resizeObserver?.disconnect();
    entry.host.style.willChange = '';
    this.removeTailElements(entry);
    this.items.delete(id);
    if (this.items.size === 0) {
      if (this.raf) this.cancelFrame(this.raf);
      this.raf = 0;
      this.awake = false;
      this.releaseClaim();
      this.lastFrameTime = null;
    }
  }
}
