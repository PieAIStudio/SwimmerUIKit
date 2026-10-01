import {
  getLiquidGooeyBudget,
  releaseLiquidGooeyAnimation,
  tryAcquireLiquidGooeyAnimation,
} from '../../liquid/budget';
import {
  type ImageMeltRegistry,
  restoreMask,
  findImage,
  type ImageMeltEntry,
  sourceOf,
  type DissolveEntry,
} from './registry';
import {
  type ImageMeltRenderState,
  type DissolveMotion,
  EMPTY_RENDER_STATE,
  type Rect,
  type DissolveRenderState,
} from './types';
import { type ImageMeltOptions, type ResolvedDissolveOptions, clamp } from './options';
import {
  imageMeltFilterArea,
  groupRectOf,
  relativeRect,
  radiusOf,
  smoothstep,
  rectGap,
  maxDissolveOptions,
  round,
  geomKey,
  contactPoint,
  imageGeomOf,
  maskForImage,
} from './geometry';
import {
  MELT_PROXIMITY_RATE,
  IMAGE_MELT_SLEEP_MS,
  DISSOLVE_ATTACK_RATE,
  DISSOLVE_RETREAT_RATE,
} from './constants';

interface RuntimeOptions {
  registry: ImageMeltRegistry;
  getGroup: () => HTMLElement | null;
  onState: (state: ImageMeltRenderState) => void;
}

export class ImageMeltRuntime {
  private readonly registry: ImageMeltRegistry;

  private readonly getGroup: () => HTMLElement | null;

  private readonly onState: (state: ImageMeltRenderState) => void;

  private readonly motions = new Map<string, DissolveMotion>();

  private readonly observed = new Set<Element>();

  private readonly removeListeners: Array<() => void> = [];

  private resizeObserver: ResizeObserver | null = null;

  private mutationObserver: MutationObserver | null = null;

  private awake = false;

  private raf = 0;

  private disposed = false;

  private lastNow = 0;

  private lastActivity = 0;

  private lastStateKey = '';

  private meltProximity = 0;

  private meltPairKey = '';

  private claimed = false;

  private budgetWarningEmitted = false;

  constructor(options: RuntimeOptions) {
    this.registry = options.registry;
    this.getGroup = options.getGroup;
    this.onState = options.onState;
  }

  invalidate = (): void => {
    if (this.disposed) return;
    this.lastActivity = this.now();
    this.ensureObservers();
    this.wake();
  };

  wake(): void {
    if (this.disposed || this.awake) return;
    if (this.registry.entries().length === 0 && this.registry.dissolveEntries().length === 0)
      return;
    this.awake = true;
    this.raf = requestAnimationFrame(this.loop);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.awake = false;
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.removeListeners.forEach((remove) => remove());
    this.removeListeners.length = 0;
    for (const entry of this.registry.entries()) this.setMeltPainted(entry, false);
    for (const entry of this.registry.dissolveEntries()) restoreMask(entry);
    this.releaseClaim();
    this.observed.clear();
  }

  private now(): number {
    return performance.now();
  }

  private ensureObservers(): void {
    const group = this.getGroup();
    if (!group) return;
    if (!this.resizeObserver && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.invalidate());
      this.resizeObserver.observe(group);
    }
    const nextObserved = new Set<Element>();
    const addObserved = (element: Element | null): void => {
      if (!element) return;
      nextObserved.add(element);
      if (!this.observed.has(element)) this.resizeObserver?.observe(element);
    };
    for (const entry of this.registry.entries()) {
      addObserved(entry.el);
      addObserved(entry.target);
      addObserved(findImage(entry.target));
    }
    for (const entry of this.registry.dissolveEntries()) {
      addObserved(entry.el);
      addObserved(entry.image);
    }
    for (const element of this.observed) {
      if (!nextObserved.has(element)) this.resizeObserver?.unobserve(element);
    }
    this.observed.clear();
    nextObserved.forEach((element) => this.observed.add(element));

    if (!this.mutationObserver && typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver((mutations) => {
        if (
          mutations.some(
            (mutation) => mutation.attributeName === 'src' || !this.isOwnMutation(mutation.target),
          )
        ) {
          this.invalidate();
        }
      });
      this.mutationObserver.observe(group, {
        attributes: true,
        attributeFilter: ['class', 'style', 'src'],
        childList: true,
        subtree: true,
      });
    }
    const view = group.ownerDocument.defaultView;
    if (view && this.removeListeners.length === 0) {
      const wake = (): void => this.invalidate();
      view.addEventListener('scroll', wake, { capture: true, passive: true });
      this.removeListeners.push(() => view.removeEventListener('scroll', wake, true));
      for (const event of ['transitionrun', 'animationstart', 'pointerdown']) {
        group.addEventListener(event, wake, true);
        this.removeListeners.push(() => group.removeEventListener(event, wake, true));
      }
    }
  }

  private isOwnMutation(target: Node): boolean {
    if (!(target instanceof Element)) return false;
    if (target.closest('[data-liquid-gooey-image-melt]')) return true;
    if (
      target instanceof HTMLImageElement &&
      this.registry.dissolveEntries().some((entry) => entry.image === target)
    ) {
      return true;
    }
    if (this.registry.entries().some((entry) => entry.target === target)) return true;
    return false;
  }

  private setMeltPainted(entry: ImageMeltEntry, painted: boolean): void {
    if (entry.painted === painted) return;
    entry.painted = painted;
    entry.target.style.opacity = painted ? '0' : entry.previousOpacity;
  }

  private releaseClaim(): void {
    if (!this.claimed) return;
    releaseLiquidGooeyAnimation();
    this.claimed = false;
  }

  private ensureClaim(
    group: HTMLElement,
    melt: Required<ImageMeltOptions> | null,
    dissolve: ResolvedDissolveOptions | null,
  ): boolean {
    if (this.claimed) return true;
    const area = imageMeltFilterArea(group, melt, dissolve);
    if (!tryAcquireLiquidGooeyAnimation(area)) {
      // Not gated on a build-mode flag: see `warnBudgetFallback` in liquidGooeyEngine.ts.
      if (!this.budgetWarningEmitted) {
        this.budgetWarningEmitted = true;
        const budget = getLiquidGooeyBudget();
        const reason =
          budget.activeGroups >= budget.maxAnimatedGroups
            ? 'the active-group limit is reached'
            : 'the filter-area limit is exceeded';
        console.warn(
          `LiquidGroup: the Melt/dissolve image filter budget is insufficient (${reason}); ` +
            'degrading to crisp imagery for this group.',
        );
      }
      return false;
    }
    this.claimed = true;
    return true;
  }

  private loop = (now: number): void => {
    this.raf = 0;
    if (this.disposed) return;
    const meltEntries = this.registry.entries();
    const dissolveEntries = this.registry.dissolveEntries();
    if (meltEntries.length === 0 && dissolveEntries.length === 0) {
      this.awake = false;
      this.lastNow = 0;
      this.lastActivity = 0;
      this.meltPairKey = '';
      this.meltProximity = 0;
      if (this.lastStateKey) {
        this.lastStateKey = '';
        this.onState(EMPTY_RENDER_STATE);
      }
      this.releaseClaim();
      return;
    }
    const group = this.getGroup();
    if (!group) {
      this.raf = requestAnimationFrame(this.loop);
      return;
    }
    const dt = this.lastNow
      ? Math.min(0.25, Math.max(1 / 240, (now - this.lastNow) / 1000))
      : 1 / 60;
    this.lastNow = now;
    const groupRect = groupRectOf(group);
    const itemRects = new Map<HTMLElement, Rect>();
    for (const item of group.querySelectorAll<HTMLElement>('.game-ui-liquid-item')) {
      if (item.closest('.game-ui-liquid-group') !== group) continue;
      itemRects.set(item, relativeRect(item, groupRect));
    }

    const pair = meltEntries.slice(0, 2);
    const pairGeoms = pair.map((entry) => {
      const rect = itemRects.get(entry.el) ?? relativeRect(entry.el, groupRect);
      const image = findImage(entry.target);
      const currentSrc = sourceOf(image);
      if (currentSrc) entry.src = currentSrc;
      return { ...rect, r: radiusOf(entry.target, rect.w, rect.h) };
    });
    const validPair = pair.length === 2 && pairGeoms.every((geom) => geom.w > 0 && geom.h > 0);
    const meltOptions = validPair ? (pair[0]?.opts ?? null) : null;
    const pairKey = validPair ? `${pair[0]?.id}|${pair[1]?.id}` : '';
    if (pairKey !== this.meltPairKey) {
      this.meltPairKey = pairKey;
      this.meltProximity = 0;
    }
    const meltTarget =
      validPair && pairGeoms[0] && pairGeoms[1]
        ? smoothstep(1 - rectGap(pairGeoms[0], pairGeoms[1]) / Math.max(8, meltOptions!.blur * 2.6))
        : 0;
    this.meltProximity +=
      (meltTarget - this.meltProximity) * (1 - Math.exp(-MELT_PROXIMITY_RATE * dt));
    if (Math.abs(this.meltProximity - meltTarget) < 0.004) this.meltProximity = meltTarget;

    const dissolveResult = this.computeDissolves(dissolveEntries, itemRects, groupRect, dt);
    const needsMelt = validPair;
    const needsDissolve = dissolveResult.visuals.length > 0;
    const needsBudget = needsMelt || needsDissolve;
    const dissolveOptions = maxDissolveOptions(dissolveEntries);
    if (needsBudget && !this.ensureClaim(group, meltOptions, dissolveOptions)) {
      for (const entry of meltEntries) this.setMeltPainted(entry, false);
      for (const entry of dissolveEntries) restoreMask(entry);
      this.onState(EMPTY_RENDER_STATE);
      this.lastStateKey = '';
      this.awake = false;
      this.lastNow = 0;
      return;
    }

    if (needsMelt) {
      for (const [index, entry] of meltEntries.entries()) {
        this.setMeltPainted(entry, index < 2);
      }
    } else {
      for (const entry of meltEntries) this.setMeltPainted(entry, false);
      this.releaseClaim();
    }

    const state: ImageMeltRenderState = {
      width: Math.max(1, Math.round(group.offsetWidth || groupRect.width)),
      height: Math.max(1, Math.round(group.offsetHeight || groupRect.height)),
      melt:
        needsMelt && pairGeoms[0] && pairGeoms[1] && pair[0] && pair[1]
          ? {
              a: pairGeoms[0],
              b: pairGeoms[1],
              srcA: pair[0].src,
              srcB: pair[1].src,
              opts: pair[0].opts,
              prox: clamp(this.meltProximity),
            }
          : null,
      dissolves: dissolveResult.visuals,
    };
    const stateKey = this.renderStateKey(state);
    const changed = stateKey !== this.lastStateKey;
    if (changed) {
      this.lastStateKey = stateKey;
      this.onState(state);
      this.lastActivity = now;
    }

    const stillActive =
      changed || dissolveResult.pending || now - this.lastActivity < IMAGE_MELT_SLEEP_MS;
    if (stillActive) {
      this.awake = true;
      this.raf = requestAnimationFrame(this.loop);
    } else {
      this.awake = false;
      this.lastNow = 0;
      // A settled Melt/dissolve remains painted, but its shared clock sleeps.
      // The budget lease stays with the visible SVG until the pair/contact is
      // removed, so another expensive filter cannot silently overcommit the
      // process-wide ceiling.
    }
  };

  private renderStateKey(state: ImageMeltRenderState): string {
    const melt = state.melt
      ? `${state.melt.srcA}|${state.melt.srcB}|${geomKey(state.melt.a)}|${geomKey(state.melt.b)}|${round(state.melt.prox, 3)}`
      : '';
    const dissolve = state.dissolves
      .map(
        (visual) =>
          `${visual.id}|${visual.src}|${visual.neighborSrc ?? ''}|${geomKey(visual.image)}|${round(visual.cx)}|${round(visual.cy)}|${round(visual.d, 2)}|${round(visual.opacity, 3)}|${round(visual.phase, 3)}|${visual.mask ?? ''}`,
      )
      .join(';');
    return `${state.width}x${state.height}|${melt}|${dissolve}`;
  }

  private computeDissolves(
    entries: DissolveEntry[],
    itemRects: Map<HTMLElement, Rect>,
    groupRect: DOMRect,
    dt: number,
  ): { visuals: DissolveRenderState[]; pending: boolean } {
    const visuals: DissolveRenderState[] = [];
    let pending = false;
    const all = [...itemRects.entries()];
    for (const entry of entries) {
      const item = itemRects.get(entry.el);
      const image = entry.image;
      if (!item || !image) {
        if (entry.image) restoreMask(entry);
        continue;
      }
      const motion =
        this.motions.get(entry.id) ??
        ({
          fade: 0,
          release: null,
          opacity: 1,
          phase: 0,
          previous: null,
          contact: null,
          axis: null,
        } satisfies DissolveMotion);
      this.motions.set(entry.id, motion);
      let bestGap = Infinity;
      let bestOther: Rect | null = null;
      let bestOtherElement: HTMLElement | null = null;
      for (const [element, rect] of all) {
        if (element === entry.el) continue;
        const gap = rectGap(item, rect);
        if (gap < bestGap) {
          bestGap = gap;
          bestOther = rect;
          bestOtherElement = element;
        }
      }
      let embed = 0;
      let contactSpan = 0;
      if (bestOther && bestGap === 0) {
        const overlapX =
          Math.min(item.x + item.w, bestOther.x + bestOther.w) - Math.max(item.x, bestOther.x);
        const overlapY =
          Math.min(item.y + item.h, bestOther.y + bestOther.h) - Math.max(item.y, bestOther.y);
        const span = Math.max(1, Math.min(item.w, item.h, bestOther.w, bestOther.h));
        embed = Math.max(0, Math.min(overlapX, overlapY)) / span;
        contactSpan = Math.max(0, Math.max(overlapX, overlapY));
      }
      let target = 0;
      if (bestOther && bestGap < entry.opts.range && entry.opts.active) {
        const raw = smoothstep((1 - bestGap / entry.opts.range) / 0.65);
        const sunk = smoothstep(
          (embed - entry.opts.sink * 0.2) / Math.max(0.01, entry.opts.sink * 0.8),
        );
        target = raw ** 1.25 * entry.opts.strength * (1 - sunk);
      }
      if (target >= motion.fade) {
        motion.fade += (target - motion.fade) * Math.min(1, dt * DISSOLVE_ATTACK_RATE);
        motion.release = null;
      } else if (target > 0.02) {
        motion.fade += (target - motion.fade) * Math.min(1, dt * DISSOLVE_RETREAT_RATE);
        motion.release = null;
      } else if (motion.fade > 0.001 || motion.release) {
        if (!motion.release) motion.release = { from: motion.fade, elapsed: 0 };
        motion.release.elapsed += dt * 1000;
        const releaseDuration = Math.max(entry.opts.releaseMs, entry.opts.fadeMs);
        const progress = Math.min(1, motion.release.elapsed / releaseDuration);
        motion.fade = motion.release.from * (1 - progress) ** 2;
      } else {
        motion.fade = 0;
      }
      if (motion.fade <= 0.001) {
        motion.fade = 0;
        restoreMask(entry);
        continue;
      }
      const other = bestOther ?? motion.contact;
      if (!other) continue;
      const contact = contactPoint(item, other);
      motion.contact = { ...other };
      const structureFade = motion.release
        ? motion.release.from *
          (0.55 +
            0.45 * (1 - Math.min(1, motion.release.elapsed / Math.max(40, entry.opts.fadeMs))))
        : motion.fade;
      const structure = smoothstep(structureFade);
      const fadeProgress = motion.release
        ? Math.min(1, motion.release.elapsed / Math.max(40, entry.opts.fadeMs))
        : 0;
      motion.opacity = motion.release
        ? (1 - fadeProgress) ** 2
        : motion.opacity + (1 - motion.opacity) * Math.min(1, dt * DISSOLVE_ATTACK_RATE);
      const d = Math.min(Math.min(item.w, item.h) * 0.9, entry.opts.zone * (0.7 + 0.6 * structure));
      const previous = motion.previous;
      const speed = previous
        ? Math.hypot(item.x - previous.x, item.y - previous.y) / Math.max(1e-3, dt)
        : 0;
      motion.previous = { x: item.x, y: item.y };
      motion.phase += Math.min(dt, 1 / 24) * entry.opts.flowSpeed * 0.12 * Math.min(1, speed / 40);
      const gravityX =
        (other.x + other.w / 2 - contact.x) /
        Math.max(
          1e-3,
          Math.hypot(other.x + other.w / 2 - contact.x, other.y + other.h / 2 - contact.y),
        );
      const gravityY =
        (other.y + other.h / 2 - contact.y) /
        Math.max(
          1e-3,
          Math.hypot(other.x + other.w / 2 - contact.x, other.y + other.h / 2 - contact.y),
        );
      const elongation = 1 + Math.min(1.8, bestGap / Math.max(8, 2 * d));
      const imageGeom = imageGeomOf(image, groupRect);
      const bridge =
        bestOther && bestGap < Math.max(10, entry.opts.blur * 2.5)
          ? smoothstep(1 - bestGap / Math.max(10, entry.opts.blur * 2.5))
          : motion.fade;
      const mask = maskForImage(
        imageGeom,
        contact.x,
        contact.y,
        d,
        motion.fade,
        Math.max(bridge, contactSpan * 0.75),
      );
      if (mask) {
        image.style.setProperty('mask-image', mask);
        image.style.setProperty('-webkit-mask-image', mask);
      } else {
        restoreMask(entry);
      }
      const angle = (Math.atan2(gravityY, gravityX) * 180) / Math.PI;
      const visual: DissolveRenderState = {
        id: entry.id,
        src: sourceOf(image) ?? image.src,
        neighborSrc: bestOtherElement ? sourceOf(findImage(bestOtherElement)) : null,
        image: imageGeom,
        cx: contact.x,
        cy: contact.y,
        d,
        opacity: motion.opacity,
        phase: motion.phase,
        structure,
        angle,
        gravityX,
        gravityY,
        elongation,
        mix: entry.opts.mix,
        seamBlur: entry.opts.seamBlur,
        options: entry.opts,
        mask,
      };
      visuals.push(visual);
      pending =
        pending ||
        Boolean(motion.release) ||
        Math.abs(target - motion.fade) > 0.004 ||
        motion.previous === null;
    }
    return { visuals, pending };
  }
}
