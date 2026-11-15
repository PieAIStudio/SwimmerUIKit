'use client';

import type { CSSProperties } from 'react';
import { useEffect, useInsertionEffect, useRef, useState } from 'react';
import { useSystemReducedMotion, watchMediaQuery } from '../../tokens/reducedMotion';
import type {
  SpriteIconClip,
  SpriteIconClipName,
  SpriteIconManifest,
  SpriteIconManifestFile,
  SpriteIconProps,
  SpriteIconRole,
  SpriteIconSource,
  SpriteIconState,
  SpriteIconTier,
  SpriteIconTierSources,
} from './types';
import { SPRITE_ICON_CLIPS, SPRITE_ICON_TIERS } from './types';

const INTERACTIVE_HOST_SELECTOR =
  'button, a[href], [role="button"], [role="tab"], [role="option"], [role="menuitem"]';

export interface SpriteIconKeyframes {
  name: string;
  cols: number;
  rows: number;
  frames: number;
  durationSeconds: number;
  css: string;
}

type KeyframeStyleElement = HTMLStyleElement & {
  __swimmerSpriteNames?: Set<string>;
};

/** Pick the smallest 96 / 192 / 512 frame tier that covers CSS size * DPR cleanly. */
export function pickSpriteIconTier(renderedCssPx: number, devicePixelRatio = 1): SpriteIconTier {
  const safeCssPx = Number.isFinite(renderedCssPx) && renderedCssPx > 0 ? renderedCssPx : 0;
  const safeDpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  const targetPx = safeCssPx * safeDpr;
  if (targetPx <= 96) return 96;
  if (targetPx <= 192) return 192;
  return 512;
}

export function resolveSpriteTierUrl(
  sources: SpriteIconTierSources,
  preferred: SpriteIconTier,
): { tier: SpriteIconTier; url: string } {
  const direct = sources[preferred];
  if (direct) return { tier: preferred, url: direct };
  for (const tier of SPRITE_ICON_TIERS) {
    if (tier > preferred && sources[tier]) return { tier, url: sources[tier] };
  }
  for (let i = SPRITE_ICON_TIERS.length - 1; i >= 0; i -= 1) {
    const tier = SPRITE_ICON_TIERS[i];
    if (tier !== undefined && sources[tier]) return { tier, url: sources[tier] };
  }
  return { tier: preferred, url: '' };
}

function formatManifestFileUrl(
  entry: SpriteIconManifestFile,
  resolveFile?: string | ((file: string) => string),
): string {
  const file = typeof entry === 'string' ? entry : entry.file;
  if (!file) return '';
  if (typeof resolveFile === 'function') return resolveFile(file);
  if (typeof resolveFile === 'string' && resolveFile.length > 0) {
    return `${resolveFile.replace(/\/+$/, '')}/${file.replace(/^\/+/, '')}`;
  }
  return file;
}

function extractManifestTierSources(
  raw: Readonly<Record<string, SpriteIconManifestFile | undefined>>,
  context: string,
  resolveFile?: string | ((file: string) => string),
): SpriteIconTierSources {
  const resolved: Partial<Record<SpriteIconTier, string>> = {};
  for (const tier of SPRITE_ICON_TIERS) {
    const entry = raw[String(tier)];
    if (entry === undefined) continue;
    const url = formatManifestFileUrl(entry, resolveFile);
    if (url.length > 0) resolved[tier] = url;
  }
  if (resolved[96] !== undefined) {
    return {
      96: resolved[96],
      ...(resolved[192] !== undefined ? { 192: resolved[192] } : {}),
      ...(resolved[512] !== undefined ? { 512: resolved[512] } : {}),
    };
  }
  if (resolved[192] !== undefined) {
    return {
      192: resolved[192],
      ...(resolved[512] !== undefined ? { 512: resolved[512] } : {}),
    };
  }
  if (resolved[512] !== undefined) {
    return { 512: resolved[512] };
  }
  throw new Error(`SpriteIcon manifest is missing a 96, 192, or 512 tier for ${context}.`);
}

/** Convert an icon generator `manifest.json` payload into a `SpriteIconSource` without per-icon code. */
export function spriteIconFromManifest(
  manifest: SpriteIconManifest,
  resolveFile?: string | ((file: string) => string),
): SpriteIconSource {
  const assetName = manifest.asset ?? 'icon';
  const still = extractManifestTierSources(manifest.still, `${assetName} still`, resolveFile);
  const role: SpriteIconRole | undefined =
    manifest.role === 'hero' ? 'hero' : manifest.role === 'ordinary' ? 'ordinary' : undefined;

  const clips: Partial<Record<SpriteIconClipName, SpriteIconClip>> = {};
  if (manifest.clips) {
    for (const clipName of SPRITE_ICON_CLIPS) {
      const clipSpec = manifest.clips[clipName];
      if (!clipSpec) continue;
      clips[clipName] = {
        sheets: extractManifestTierSources(
          clipSpec.sheets,
          `${assetName} clip "${clipName}"`,
          resolveFile,
        ),
        frames: clipSpec.frames,
        fps: clipSpec.fps,
        cols: clipSpec.cols,
        rows: clipSpec.rows,
        loop: clipSpec.loop,
        seconds: clipSpec.seconds,
      };
    }
  }

  return {
    role,
    still,
    clips: Object.keys(clips).length > 0 ? clips : undefined,
  };
}

function formatPct(value: number): string {
  const rounded = Math.round(value * 10000) / 10000;
  return `${rounded}%`;
}

/** Build size-independent percentage CSS `steps()` keyframes for 1D strips or 2D grids. */
export function buildSpriteIconKeyframes(clip: SpriteIconClip): SpriteIconKeyframes {
  const frames = Number.isFinite(clip.frames) ? Math.max(1, Math.floor(clip.frames)) : 1;
  const fps = Number.isFinite(clip.fps) && clip.fps > 0 ? clip.fps : 15;
  const cols =
    clip.cols !== undefined && Number.isFinite(clip.cols) && clip.cols >= 1
      ? Math.floor(clip.cols)
      : frames;
  const rows =
    clip.rows !== undefined && Number.isFinite(clip.rows) && clip.rows >= 1
      ? Math.floor(clip.rows)
      : Math.max(1, Math.ceil(frames / cols));
  const durationSeconds =
    clip.seconds !== undefined && Number.isFinite(clip.seconds) && clip.seconds > 0
      ? clip.seconds
      : frames / fps;
  const name = `swimmer-sprite-c${cols}-r${rows}-f${frames}`;

  if (frames <= 1) {
    return {
      name,
      cols,
      rows,
      frames,
      durationSeconds: 0,
      css: '',
    };
  }

  const stops: string[] = [];
  if (rows <= 1 || frames <= cols) {
    const xEnd = cols > 1 ? ((frames - 1) / (cols - 1)) * 100 : 0;
    const timing = `steps(${frames}, jump-none)`;
    stops.push(`0%{background-position:0% 0%;animation-timing-function:${timing}}`);
    stops.push(`100%{background-position:${formatPct(xEnd)} 0%}`);
  } else {
    for (let s0 = 0; s0 < frames; s0 += cols) {
      const rowIndex = Math.floor(s0 / cols);
      const count = Math.min(cols, frames - s0);
      const yPct = (rowIndex / (rows - 1)) * 100;
      const xEnd = cols > 1 && count > 1 ? ((count - 1) / (cols - 1)) * 100 : 0;
      const p0 = (s0 / frames) * 100;
      const isLast = s0 + count >= frames;
      const p1 = isLast ? 100 : ((s0 + count) / frames) * 100 - 0.001;
      const timing = count > 1 ? `steps(${count}, jump-none)` : 'steps(1, end)';
      stops.push(
        `${formatPct(p0)}{background-position:0% ${formatPct(yPct)};animation-timing-function:${timing}}`,
      );
      stops.push(
        `${formatPct(p1)}{background-position:${formatPct(xEnd)} ${formatPct(yPct)};${isLast ? '' : 'animation-timing-function:steps(1, end)'}}`,
      );
    }
  }

  return {
    name,
    cols,
    rows,
    frames,
    durationSeconds,
    css: `@keyframes ${name}{${stops.join('')}}`,
  };
}

function ensureSpriteKeyframes(
  keyframes: SpriteIconKeyframes,
  doc: Document | undefined = typeof document !== 'undefined' ? document : undefined,
): void {
  if (!doc || !keyframes.css) return;
  const head = doc.head;
  if (!head) return;
  let styleEl = head.querySelector(
    'style[data-swimmer-sprite-keyframes]',
  ) as KeyframeStyleElement | null;
  if (!styleEl) {
    styleEl = doc.createElement('style') as KeyframeStyleElement;
    styleEl.setAttribute('data-swimmer-sprite-keyframes', 'true');
    styleEl.__swimmerSpriteNames = new Set();
    head.appendChild(styleEl);
  }
  const names = (styleEl.__swimmerSpriteNames ??= new Set());
  if (names.has(keyframes.name)) return;
  names.add(keyframes.name);
  styleEl.appendChild(doc.createTextNode(keyframes.css));
}

function resolveRequestedClip(
  icon: SpriteIconSource,
  requested: SpriteIconState | undefined,
  hero: boolean,
): SpriteIconClipName | null {
  const clips = icon.clips;
  if (!clips) return null;
  switch (requested) {
    case undefined:
      return hero && clips.idle ? 'idle' : null;
    case 'rest':
      return null;
    case 'idle':
      return hero && clips.idle ? 'idle' : null;
    case 'hover':
    case 'focus':
      return clips.hover ? 'hover' : clips.act ? 'act' : null;
    case 'selection':
      return clips.act ? 'act' : clips.hover ? 'hover' : null;
    case 'act':
    case 'syncing':
    case 'done':
    case 'problem':
      return clips[requested] ? requested : null;
  }
}

function readWindowDpr(): number {
  if (typeof window === 'undefined') return 1;
  const ratio = window.devicePixelRatio;
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
}

function findInteractiveHost(element: HTMLElement): HTMLElement {
  const host = element.closest<HTMLElement>(INTERACTIVE_HOST_SELECTOR);
  return host ?? element;
}

type FrameCssStyle = CSSProperties & {
  '--swimmer-sprite-still'?: string;
};

/**
 * Animated or still WebP sprite-sheet icon for UIKit's tool family (no Three.js).
 * Selects 96 / 192 / 512 px tiers from rendered CSS size and DPR, plays one clip
 * per sheet with CSS `steps()`, starts and ends on the rest still, only idles when
 * marked `hero`, and falls back to the rest still under reduced motion.
 */
export function SpriteIcon({
  icon,
  size = 64,
  hero,
  state,
  selected = false,
  reducedMotion,
  dpr,
  label,
  onClipEnd,
  className,
  style,
  onAnimationEnd,
  ...rest
}: SpriteIconProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const systemReducedMotion = useSystemReducedMotion();
  const isReducedMotion = Boolean(reducedMotion) || systemReducedMotion;
  const isHero = hero ?? icon.role === 'hero';

  const [windowDpr, setWindowDpr] = useState<number>(readWindowDpr);
  const [measuredCssSize, setMeasuredCssSize] = useState<number | null>(null);
  const effectiveDpr = typeof dpr === 'number' && Number.isFinite(dpr) && dpr > 0 ? dpr : windowDpr;
  const effectiveCssSize = measuredCssSize ?? size;
  const preferredTier = pickSpriteIconTier(effectiveCssSize, effectiveDpr);

  const [oneShot, setOneShot] = useState<{ clip: SpriteIconClipName; runId: number } | null>(null);
  const [settledControlledKey, setSettledControlledKey] = useState<string | null>(null);
  const [settledHoverHold, setSettledHoverHold] = useState(false);

  const runCounterRef = useRef(0);
  const prevSelectedRef = useRef(Boolean(selected));
  const hoveredRef = useRef(false);
  const pointerDownRef = useRef(false);

  const primaryStillUrl = icon.still[96] ?? icon.still[192] ?? icon.still[512] ?? '';
  const controlledKey = state !== undefined ? `${state}@${primaryStillUrl}` : null;
  const isControlledSettled = controlledKey !== null && settledControlledKey === controlledKey;

  // Reset transient interaction holds whenever controlled `state` or `icon` identity changes.
  useEffect(() => {
    setSettledControlledKey(null);
    if (state !== undefined) {
      setOneShot(null);
      setSettledHoverHold(false);
    }
  }, [state, primaryStillUrl]);

  // Subscribe to DPR changes when `dpr` is not pinned.
  useEffect(() => {
    if (typeof dpr === 'number' && Number.isFinite(dpr) && dpr > 0) return;
    const syncDpr = () => setWindowDpr(readWindowDpr());
    syncDpr();
    if (typeof window === 'undefined') return;
    window.addEventListener('resize', syncDpr);
    let unwatchMedia: (() => void) | undefined;
    if (typeof window.matchMedia === 'function') {
      const currentDpr = readWindowDpr();
      const query = window.matchMedia(`(resolution: ${currentDpr}dppx)`);
      unwatchMedia = watchMediaQuery(query, syncDpr);
    }
    return () => {
      window.removeEventListener('resize', syncDpr);
      unwatchMedia?.();
    };
  }, [dpr, windowDpr]);

  // Observe rendered box size for CSS-driven responsive dimensions.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const updateFromRect = (width: number, height: number) => {
      const maxDim = Math.max(width, height);
      if (maxDim > 0) setMeasuredCssSize(Math.round(maxDim * 100) / 100);
    };
    const rect = node.getBoundingClientRect();
    updateFromRect(rect.width, rect.height);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      updateFromRect(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Immediately clear transient playback when reduced motion turns on.
  useEffect(() => {
    if (!isReducedMotion) return;
    setOneShot(null);
    setSettledHoverHold(false);
  }, [isReducedMotion]);

  // Selection rising edge triggers the selection/act clip once in uncontrolled mode.
  useEffect(() => {
    const isNowSelected = Boolean(selected);
    const wasSelected = prevSelectedRef.current;
    prevSelectedRef.current = isNowSelected;
    if (state !== undefined || isReducedMotion || !isNowSelected || wasSelected) return;
    const clipName = resolveRequestedClip(icon, 'selection', isHero);
    if (!clipName) return;
    runCounterRef.current += 1;
    setSettledHoverHold(false);
    setOneShot({ clip: clipName, runId: runCounterRef.current });
  }, [selected, state, isReducedMotion, icon, isHero]);

  // Attach hover and non-pointer focus triggers to the interactive host (or self).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const target = findInteractiveHost(root);
    let pointerResetTimer: number | undefined;

    const triggerClip = (kind: 'hover' | 'focus') => {
      if (state !== undefined || isReducedMotion) return;
      const clipName = resolveRequestedClip(icon, kind, isHero);
      if (!clipName) return;
      runCounterRef.current += 1;
      setSettledHoverHold(false);
      setOneShot({ clip: clipName, runId: runCounterRef.current });
    };

    const handlePointerEnter = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      if (hoveredRef.current) return;
      hoveredRef.current = true;
      triggerClip('hover');
    };

    const handleMouseEnter = () => {
      if (hoveredRef.current) return;
      hoveredRef.current = true;
      triggerClip('hover');
    };

    const handlePointerLeave = () => {
      hoveredRef.current = false;
      pointerDownRef.current = false;
      setSettledHoverHold(false);
    };

    const handlePointerDown = () => {
      pointerDownRef.current = true;
      if (pointerResetTimer !== undefined) window.clearTimeout(pointerResetTimer);
      pointerResetTimer = window.setTimeout(() => {
        pointerDownRef.current = false;
      }, 0);
    };

    const handleFocusIn = () => {
      if (pointerDownRef.current) return;
      triggerClip('focus');
    };

    target.addEventListener('pointerenter', handlePointerEnter);
    target.addEventListener('mouseenter', handleMouseEnter);
    target.addEventListener('pointerleave', handlePointerLeave);
    target.addEventListener('mouseleave', handlePointerLeave);
    target.addEventListener('pointerdown', handlePointerDown);
    target.addEventListener('mousedown', handlePointerDown);
    target.addEventListener('focusin', handleFocusIn);

    return () => {
      if (pointerResetTimer !== undefined) window.clearTimeout(pointerResetTimer);
      target.removeEventListener('pointerenter', handlePointerEnter);
      target.removeEventListener('mouseenter', handleMouseEnter);
      target.removeEventListener('pointerleave', handlePointerLeave);
      target.removeEventListener('mouseleave', handlePointerLeave);
      target.removeEventListener('pointerdown', handlePointerDown);
      target.removeEventListener('mousedown', handlePointerDown);
      target.removeEventListener('focusin', handleFocusIn);
    };
  }, [icon, isHero, state, isReducedMotion]);

  // Determine the active clip name for this render.
  let activeClipName: SpriteIconClipName | null = null;
  if (!isReducedMotion) {
    if (state !== undefined) {
      if (!isControlledSettled) {
        activeClipName = resolveRequestedClip(icon, state, isHero);
      }
    } else if (oneShot) {
      activeClipName = oneShot.clip;
    } else if (!settledHoverHold) {
      activeClipName = resolveRequestedClip(icon, undefined, isHero);
    }
  }

  const activeClipSpec = activeClipName ? icon.clips?.[activeClipName] : undefined;
  if (!activeClipSpec) activeClipName = null;

  const isLoop = Boolean(
    activeClipName && activeClipSpec && (activeClipSpec.loop ?? activeClipName === 'idle'),
  );
  const keyframes =
    activeClipName && activeClipSpec ? buildSpriteIconKeyframes(activeClipSpec) : null;
  const canAnimate = Boolean(
    activeClipName &&
    activeClipSpec &&
    keyframes &&
    keyframes.frames > 1 &&
    keyframes.durationSeconds > 0,
  );

  const stillResolved = resolveSpriteTierUrl(icon.still, preferredTier);
  const clipResolved =
    canAnimate && activeClipSpec
      ? resolveSpriteTierUrl(activeClipSpec.sheets, preferredTier)
      : stillResolved;
  const activeTier = canAnimate ? clipResolved.tier : stillResolved.tier;

  const displayState = canAnimate && activeClipName ? activeClipName : 'rest';

  // Register generated CSS keyframes before first paint whenever an animated clip is active.
  useInsertionEffect(() => {
    if (canAnimate && keyframes) {
      ensureSpriteKeyframes(keyframes, frameRef.current?.ownerDocument);
    }
  }, [canAnimate, keyframes]);

  // Restart CSS animations synchronously when a clip or sheet switches (even with matching grid names).
  const triggerRunId = oneShot?.runId ?? 0;
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !canAnimate || typeof frame.getAnimations !== 'function') return;
    for (const animation of frame.getAnimations()) {
      animation.currentTime = 0;
      animation.play();
    }
  }, [triggerRunId, canAnimate, activeClipName, clipResolved.url, keyframes?.name, isLoop]);

  const frameStyle: FrameCssStyle = {
    '--swimmer-sprite-still': stillResolved.url ? `url("${stillResolved.url}")` : 'none',
    backgroundImage:
      canAnimate && clipResolved.url
        ? `url("${clipResolved.url}")`
        : stillResolved.url
          ? `url("${stillResolved.url}")`
          : undefined,
    backgroundSize:
      canAnimate && keyframes ? `${keyframes.cols * 100}% ${keyframes.rows * 100}%` : '100% 100%',
    backgroundPosition: '0% 0%',
    animationName: canAnimate && keyframes ? keyframes.name : 'none',
    animationDuration: canAnimate && keyframes ? `${keyframes.durationSeconds}s` : '0s',
    animationTimingFunction: 'linear',
    animationIterationCount: canAnimate ? (isLoop ? 'infinite' : '1') : undefined,
    animationFillMode: 'both',
  };

  const rootStyle: FrameCssStyle = {
    width: size,
    height: size,
    '--swimmer-sprite-still': stillResolved.url ? `url("${stillResolved.url}")` : 'none',
    ...style,
  };

  return (
    <span
      {...rest}
      ref={rootRef}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={['game-ui-sprite-icon', className].filter(Boolean).join(' ')}
      data-sprite-hero={isHero ? 'true' : undefined}
      data-sprite-reduced-motion={isReducedMotion ? 'true' : undefined}
      data-sprite-state={displayState}
      data-sprite-tier={activeTier}
      role={label ? 'img' : undefined}
      style={rootStyle}
      onAnimationEnd={(event) => {
        onAnimationEnd?.(event);
        if (event.target !== frameRef.current) return;
        if (!canAnimate || !activeClipName || isLoop) return;
        const finishedClip = activeClipName;
        if (state !== undefined) {
          setSettledControlledKey(controlledKey);
        } else {
          setOneShot(null);
          if (isHero && hoveredRef.current) setSettledHoverHold(true);
        }
        onClipEnd?.(finishedClip);
      }}
    >
      <span
        ref={frameRef}
        aria-hidden="true"
        className="game-ui-sprite-icon-frame"
        style={frameStyle}
      />
    </span>
  );
}
