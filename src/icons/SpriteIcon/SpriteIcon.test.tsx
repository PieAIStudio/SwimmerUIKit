import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  SpriteIcon,
  buildSpriteIconKeyframes,
  pickSpriteIconTier,
  resolveSpriteTierUrl,
  spriteIconFromManifest,
} from './SpriteIcon';
import type { SpriteIconManifest, SpriteIconSource } from './types';

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

  it('builds 2D keyframes for every manifest grid shape (6x6 36f, 5x4 18f, 5x4 20f, 4x4 15f, 5x5 21f)', () => {
    const actClip = HERO_SOURCE.clips!.act!;
    const kf21 = buildSpriteIconKeyframes(actClip);
    expect(kf21.name).toBe('swimmer-sprite-c5-r5-f21');
    expect(kf21.durationSeconds).toBe(1.4);
    expect(kf21.css).toContain('steps(5, jump-none)');
    expect(kf21.css).toContain('steps(1, end)');
    expect(kf21.css).toContain('100%{background-position:0% 100%;}');

    const kf36 = buildSpriteIconKeyframes({
      sheets: { 96: '/idle-96.webp' },
      frames: 36,
      fps: 15,
      cols: 6,
      rows: 6,
      seconds: 2.4,
    });
    expect(kf36.name).toBe('swimmer-sprite-c6-r6-f36');
    expect(kf36.durationSeconds).toBe(2.4);
    expect(kf36.css).toContain('100%{background-position:100% 100%;}');

    const kf18 = buildSpriteIconKeyframes({
      sheets: { 96: '/hover-96.webp' },
      frames: 18,
      fps: 15,
      cols: 5,
      rows: 4,
      seconds: 1.2,
    });
    expect(kf18.name).toBe('swimmer-sprite-c5-r4-f18');
    expect(kf18.css).toContain('steps(3, jump-none)');
    expect(kf18.css).toContain('100%{background-position:50% 100%;}');

    const kf20 = buildSpriteIconKeyframes({
      sheets: { 96: '/settings-96.webp' },
      frames: 20,
      fps: 15,
      cols: 5,
      rows: 4,
      seconds: 1.3,
    });
    expect(kf20.name).toBe('swimmer-sprite-c5-r4-f20');
    expect(kf20.durationSeconds).toBe(1.3);
    expect(kf20.css).toContain('100%{background-position:100% 100%;}');

    const kf15 = buildSpriteIconKeyframes({
      sheets: { 96: '/done-96.webp' },
      frames: 15,
      fps: 15,
      cols: 4,
      rows: 4,
      seconds: 1,
    });
    expect(kf15.name).toBe('swimmer-sprite-c4-r4-f15');
    expect(kf15.css).toContain('steps(3, jump-none)');
    expect(kf15.css).toContain('100%{background-position:66.6667% 100%;}');
  });
});

describe('spriteIconFromManifest', () => {
  it('resolves role, stills (ignoring hero 1024), and partial clip sheets via prefix or function', () => {
    const heroManifest: SpriteIconManifest = {
      asset: 'oneplace_hero',
      role: 'hero',
      still: {
        96: { file: 'still-96.webp' },
        192: { file: 'still-192.webp' },
        512: { file: 'still-512.webp' },
        hero: { file: 'still-1024.webp' },
      },
      clips: {
        idle: {
          sheets: {
            96: { file: 'idle-96.webp' },
            192: { file: 'idle-192.webp' },
            512: { file: 'idle-512.webp' },
          },
          frames: 36,
          fps: 15,
          cols: 6,
          rows: 6,
          loop: true,
          seconds: 2.4,
        },
      },
    };
    const heroSource = spriteIconFromManifest(heroManifest, '/icons/oneplace_hero/');
    expect(heroSource.role).toBe('hero');
    expect(heroSource.still).toEqual({
      96: '/icons/oneplace_hero/still-96.webp',
      192: '/icons/oneplace_hero/still-192.webp',
      512: '/icons/oneplace_hero/still-512.webp',
    });
    expect(heroSource.clips?.idle?.sheets[512]).toBe('/icons/oneplace_hero/idle-512.webp');

    const autoHeroHtml = renderToStaticMarkup(<SpriteIcon icon={heroSource} size={64} />);
    expect(autoHeroHtml).toContain('data-sprite-hero="true"');
    expect(autoHeroHtml).toContain('data-sprite-state="idle"');
    const overrideHtml = renderToStaticMarkup(
      <SpriteIcon hero={false} icon={heroSource} size={64} />,
    );
    expect(overrideHtml).toContain('data-sprite-state="rest"');

    const ordinaryManifest: SpriteIconManifest = {
      asset: 'settings',
      role: 'ordinary',
      still: { 96: 'still-96.webp', 192: 'still-192.webp', 512: 'still-512.webp' },
      clips: {
        act: {
          sheets: { 96: 'act-96.webp', 192: 'act-192.webp' },
          frames: 20,
          fps: 15,
          cols: 5,
          rows: 4,
          loop: false,
          seconds: 1.3,
        },
      },
    };
    const ordinarySource = spriteIconFromManifest(ordinaryManifest, (file) => `/cdn/${file}`);
    expect(ordinarySource.role).toBe('ordinary');
    expect(ordinarySource.clips?.act?.sheets).toEqual({
      96: '/cdn/act-96.webp',
      192: '/cdn/act-192.webp',
    });
    const ordinaryHtml = renderToStaticMarkup(<SpriteIcon icon={ordinarySource} size={64} />);
    expect(ordinaryHtml).toContain('data-sprite-state="rest"');
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
