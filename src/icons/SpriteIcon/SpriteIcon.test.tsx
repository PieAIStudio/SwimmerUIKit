import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  SpriteIcon,
  buildSpriteIconKeyframes,
  pickSpriteIconTier,
  resolveSpriteTierUrl,
} from './SpriteIcon';
import type { SpriteIconSource } from './types';

const HERO_SOURCE: SpriteIconSource = {
  still: {
    96: '/assets/hero-still-96.webp',
    192: '/assets/hero-still-192.webp',
    512: '/assets/hero-still-512.webp',
  },
  clips: {
    idle: {
      sheets: {
        96: '/assets/hero-idle-96.webp',
        192: '/assets/hero-idle-192.webp',
        512: '/assets/hero-idle-512.webp',
      },
      frames: 40,
      fps: 10,
      cols: 7,
      rows: 6,
      loop: true,
      seconds: 4,
    },
    act: {
      sheets: {
        96: '/assets/hero-act-96.webp',
        192: '/assets/hero-act-192.webp',
        512: '/assets/hero-act-512.webp',
      },
      frames: 21,
      fps: 15,
      cols: 5,
      rows: 5,
      loop: false,
      seconds: 1.4,
    },
  },
};

describe('pickSpriteIconTier', () => {
  it.each([
    [28, 1, 96],
    [28, 2, 96],
    [28, 3, 96],
    [64, 1, 96],
    [64, 1.5, 96],
    [64, 2, 192],
    [96, 1, 96],
    [96, 2, 192],
    [128, 1, 192],
    [128, 2, 512],
    [256, 1, 512],
  ] as const)('maps %ipx at %sx DPR to tier %i', (cssPx, dpr, expected) => {
    expect(pickSpriteIconTier(cssPx, dpr)).toBe(expected);
  });

  it('falls back to the nearest supplied tier when an exact tier is absent', () => {
    const partial = { 96: '/96.webp', 512: '/512.webp' };
    expect(resolveSpriteTierUrl(partial, 192)).toEqual({ tier: 512, url: '/512.webp' });
    expect(resolveSpriteTierUrl({ 96: '/96.webp' }, 512)).toEqual({ tier: 96, url: '/96.webp' });
  });
});

describe('buildSpriteIconKeyframes', () => {
  it('builds a single-row steps() keyframe rule with jump-none', () => {
    const kf = buildSpriteIconKeyframes({
      sheets: { 96: '/strip-96.webp' },
      frames: 12,
      fps: 12,
    });
    expect(kf.name).toBe('swimmer-sprite-c12-r1-f12');
    expect(kf.cols).toBe(12);
    expect(kf.rows).toBe(1);
    expect(kf.durationSeconds).toBe(1);
    expect(kf.css).toContain('steps(12, jump-none)');
    expect(kf.css).toContain('100%{background-position:100% 0%}');
  });

  it('builds a 2D multi-row keyframe rule including partial final rows cleanly', () => {
    const actClip = HERO_SOURCE.clips!.act!;
    const kf = buildSpriteIconKeyframes(actClip);
    expect(kf.name).toBe('swimmer-sprite-c5-r5-f21');
    expect(kf.cols).toBe(5);
    expect(kf.rows).toBe(5);
    expect(kf.durationSeconds).toBe(1.4);
    expect(kf.css).toContain('steps(5, jump-none)');
    expect(kf.css).toContain('steps(1, end)');
    expect(kf.css).toContain('100%{background-position:0% 100%;}');
  });
});

describe('SpriteIcon SSR and boundaries', () => {
  it('stays on rest still when not marked hero, even if idle clip is supplied or requested', () => {
    const ordinaryHtml = renderToStaticMarkup(<SpriteIcon icon={HERO_SOURCE} size={64} />);
    expect(ordinaryHtml).toContain('data-sprite-state="rest"');
    expect(ordinaryHtml).toContain('data-sprite-tier="96"');
    expect(ordinaryHtml).toContain('/assets/hero-still-96.webp');
    expect(ordinaryHtml).not.toContain('/assets/hero-idle-96.webp');

    const ignoredIdleHtml = renderToStaticMarkup(
      <SpriteIcon icon={HERO_SOURCE} size={64} state="idle" />,
    );
    expect(ignoredIdleHtml).toContain('data-sprite-state="rest"');
    expect(ignoredIdleHtml).not.toContain('/assets/hero-idle-96.webp');
  });

  it('only idles when hero is true, and respects reducedMotion', () => {
    const heroHtml = renderToStaticMarkup(<SpriteIcon dpr={2} hero icon={HERO_SOURCE} size={64} />);
    expect(heroHtml).toContain('data-sprite-hero="true"');
    expect(heroHtml).toContain('data-sprite-state="idle"');
    expect(heroHtml).toContain('data-sprite-tier="192"');
    expect(heroHtml).toContain('/assets/hero-idle-192.webp');
    expect(heroHtml).toContain('animation-iteration-count:infinite');

    const reducedHtml = renderToStaticMarkup(
      <SpriteIcon dpr={2} hero icon={HERO_SOURCE} reducedMotion size={64} />,
    );
    expect(reducedHtml).toContain('data-sprite-reduced-motion="true"');
    expect(reducedHtml).toContain('data-sprite-state="rest"');
    expect(reducedHtml).toContain('/assets/hero-still-192.webp');
    expect(reducedHtml).not.toContain('/assets/hero-idle-192.webp');
  });

  it('is decorative when unlabelled and image-role when labelled', () => {
    const plain = renderToStaticMarkup(<SpriteIcon icon={HERO_SOURCE} />);
    expect(plain).toContain('aria-hidden="true"');
    expect(plain).not.toContain('role="img"');

    const labelled = renderToStaticMarkup(
      <SpriteIcon className="extra" icon={HERO_SOURCE} label="Files" size={128} />,
    );
    expect(labelled).toContain('role="img"');
    expect(labelled).toContain('aria-label="Files"');
    expect(labelled).not.toMatch(/role="img"[^>]*aria-hidden/);
    expect(labelled).toContain('class="game-ui-sprite-icon extra"');
    expect(labelled).toContain('data-sprite-tier="192"');
  });

  it('uses no three.js and enforces prefers-reduced-motion in CSS', () => {
    const source = readFileSync(new URL('./SpriteIcon.tsx', import.meta.url), 'utf8');
    expect(source).not.toMatch(/from\s+['"]three|require\(\s*['"]three/);
    const css = readFileSync(new URL('./component.css', import.meta.url), 'utf8');
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain('var(--swimmer-sprite-still)');
  });
});
