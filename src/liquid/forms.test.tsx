import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameButton } from '../controls/GameButton/GameButton';
import { LiquidSurface } from './LiquidSurface/LiquidSurface';
import { presets } from './spring';
import { blobPath, LIQUID_BLOB_MAX_FRACTION, silhouettePath, type CornerRadii } from './geometry';
import { LIQUID_FORM_NAMES, LIQUID_FORMS, liquidFormGroup, liquidFormItem } from './forms';
import {
  LIQUID_GOOEY_FILTER_DEFAULTS,
  LIQUID_GOOEY_MIN_EDGE_RAMP,
  liquidGooeyEdgeContrast,
} from './filter';
import { parseShadow, svgFilterShadows } from './shadow';
const themeCss = readFileSync(new URL('../tokens/theme.css', import.meta.url), 'utf8');
const materialShadow = /--game-ui-liquid-material-shadow:\s*([^;]+);/.exec(themeCss)![1]!;

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

function anchors(d: string): [number, number][] {
  const out: [number, number][] = [];
  for (const match of d.matchAll(/C [-\d.]+ [-\d.]+ [-\d.]+ [-\d.]+ ([-\d.]+) ([-\d.]+)/g))
    out.push([Number(match[1]), Number(match[2])]);
  return out;
}

function roundedBoxDistance(px: number, py: number, w: number, h: number, r: number): number {
  const qx = Math.abs(px - w / 2) - (w / 2 - r);
  const qy = Math.abs(py - h / 2) - (h / 2 - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

const PILL: CornerRadii = [22, 22, 22, 22];

describe('liquid blob outline', () => {
  it('actually deviates, rather than shifting the whole outline evenly', () => {
    const d = blobPath(0, 0, 130, 44, PILL, { amplitude: 5, seed: 7, lobes: 3 });
    const distances = anchors(d).map(([x, y]) => roundedBoxDistance(x, y, 130, 44, 22));
    const spread = Math.max(...distances) - Math.min(...distances);
    expect(spread).toBeGreaterThan(5 * 0.6);
  });

  it('never cuts inside the control box', () => {
    for (const amplitude of [2, 5, 8, 40]) {
      const d = blobPath(0, 0, 130, 44, PILL, { amplitude, seed: 3 });
      const inside = anchors(d).filter(([x, y]) => roundedBoxDistance(x, y, 130, 44, 22) < -0.02);
      expect(inside).toEqual([]);
    }
  });

  it('clamps the bulge on a thin box so a meter stays a meter', () => {
    const thin: CornerRadii = [7, 7, 7, 7];
    const d = blobPath(0, 0, 200, 14, thin, { amplitude: 8, seed: 7 });
    const far = Math.max(...anchors(d).map(([x, y]) => roundedBoxDistance(x, y, 200, 14, 7)));
    expect(far).toBeLessThanOrEqual(14 * LIQUID_BLOB_MAX_FRACTION + 0.01);
  });

  it('falls back to the plain rounded rectangle when no shape is asked for', () => {
    const plain = silhouettePath(0, 0, 130, 44, PILL, undefined);
    expect(plain).toBe(silhouettePath(0, 0, 130, 44, PILL, { amplitude: 0 }));
    expect(plain).not.toContain('C ');
  });

  it('is stable: one seed is one silhouette', () => {
    const a = blobPath(0, 0, 130, 44, PILL, { amplitude: 5, seed: 7 });
    const b = blobPath(0, 0, 130, 44, PILL, { amplitude: 5, seed: 7 });
    expect(a).toBe(b);
    expect(blobPath(0, 0, 130, 44, PILL, { amplitude: 5, seed: 11 })).not.toBe(a);
  });
});

describe('liquid edge ramp', () => {
  it('lowers a contrast that would leave a sub-pixel edge', () => {
    expect(liquidGooeyEdgeContrast(4, 24)).toBeLessThan(24);
    const ramp = ((1 / 0.3902) * 4) / liquidGooeyEdgeContrast(4, 24);
    expect(ramp).toBeCloseTo(LIQUID_GOOEY_MIN_EDGE_RAMP, 5);
  });

  it('leaves a contrast that is already soft enough alone', () => {
    expect(liquidGooeyEdgeContrast(10, 14)).toBe(14);
  });

  it('gives every form an edge wide enough to draw', () => {
    for (const form of LIQUID_FORM_NAMES) {
      const { blur, contrast } = LIQUID_FORMS[form].group;
      const ramp = ((1 / 0.3902) * blur) / liquidGooeyEdgeContrast(blur, contrast);
      expect(ramp).toBeGreaterThanOrEqual(LIQUID_GOOEY_MIN_EDGE_RAMP - 1e-9);
    }
  });

  it('keeps the unconfigured default flat', () => {
    expect(LIQUID_GOOEY_FILTER_DEFAULTS.waviness).toBe(0);
  });
});

const BODY_FORMS = LIQUID_FORM_NAMES.filter((form) => LIQUID_FORMS[form].kind === 'body');
const GROUP_FORMS = LIQUID_FORM_NAMES.filter((form) => LIQUID_FORMS[form].kind === 'group');

describe('liquid forms', () => {
  it('splits cleanly into bodies and relationships', () => {
    expect(BODY_FORMS.length + GROUP_FORMS.length).toBe(LIQUID_FORM_NAMES.length);
    expect(BODY_FORMS.length).toBeGreaterThan(0);
    expect(GROUP_FORMS.length).toBeGreaterThan(0);
  });

  it('shares one contour and thin lighting while preserving bridge blur', () => {
    for (const form of LIQUID_FORM_NAMES) {
      expect(LIQUID_FORMS[form].group.blob).toBe(3.5);
      expect(LIQUID_FORMS[form].group.lobes).toBe(3);
      expect(LIQUID_FORMS[form].group.gloss).toBe(1.5);
    }
    expect(LIQUID_FORMS.merge.group.blur).toBeGreaterThan(LIQUID_FORMS.press.group.blur);
  });

  it('pours every single-body form', () => {
    for (const form of BODY_FORMS)
      expect(LIQUID_FORMS[form].group.blob, `${form} is a plain rectangle`).toBeGreaterThan(0);
  });

  it('lets set actually stop being liquid', () => {
    const solid = liquidFormGroup('set', LIQUID_FORMS.set.groupEngaged);
    expect(solid.blob).toBe(0);
    expect(solid.blur).toBe(0);
    expect(solid.gloss).toBe(0);
    expect(LIQUID_FORMS.set.group.gloss).toBe(1.5);
  });

  it('puts merge at the reaching end and press at the crisp end', () => {
    const blurs = LIQUID_FORM_NAMES.map((form) => LIQUID_FORMS[form].group.blur);
    const contrasts = LIQUID_FORM_NAMES.map((form) => LIQUID_FORMS[form].group.contrast);
    expect(LIQUID_FORMS.merge.group.blur).toBe(Math.max(...blurs));
    expect(LIQUID_FORMS.merge.group.contrast).toBe(Math.min(...contrasts));
    expect(LIQUID_FORMS.press.group.contrast).toBe(Math.max(...contrasts));
  });

  it('gives every form a summary a picker can show', () => {
    const silent = LIQUID_FORM_NAMES.filter((form) => LIQUID_FORMS[form].summary.trim() === '');
    expect(silent).toEqual([]);
  });

  it('merges overrides into a form instead of replacing the bundle', () => {
    const group = liquidFormGroup('press', { blur: 9 });
    expect(group.blur).toBe(9);
    expect(group.contrast).toBe(LIQUID_FORMS.press.group.contrast);
    expect(group.blob).toBe(LIQUID_FORMS.press.group.blob);

    const item = liquidFormItem('press', { morph: { bounce: 0.9 } });
    expect(item.morph?.bounce).toBe(0.9);
    expect(item.morph?.shape).toBe(LIQUID_FORMS.press.item.morph?.shape);
    expect(item.transition).toBe(LIQUID_FORMS.press.item.transition);
  });
});

describe('3.0 fixed action surfaces', () => {
  it('makes primary the only liquid action without a surface option', () => {
    const primary = renderToStaticMarkup(<GameButton variant="primary">Go</GameButton>);
    expect(primary).toContain('data-game-ui-cta="true"');
    expect(primary).toContain('data-liquid-form="press"');
    for (const variant of ['secondary', 'ghost', 'success', 'danger'] as const) {
      const html = renderToStaticMarkup(<GameButton variant={variant}>Go</GameButton>);
      expect(html).not.toContain('data-liquid-gooey-silhouette');
      expect(html).toContain('class="game-ui-droplet"');
      expect(html).toContain('vector-effect="non-scaling-stroke"');
    }
  });

  it('keeps native semantics for meaningful flat actions', () => {
    const html = renderToStaticMarkup(<GameButton variant="danger">Delete</GameButton>);
    expect(html).toContain('game-ui-button game-ui-button--danger');
    expect(html).toContain('data-game-ui-meaning="true"');
    expect(html).toContain('Delete');
    expect(html).toContain('<button');
    expect(html).not.toContain('data-game-ui-cta="true"');
  });

  it('drops back to the flat button when disabled', () => {
    const html = compact(
      renderToStaticMarkup(
        <GameButton disabled variant="primary">
          Run
        </GameButton>,
      ),
    );
    expect(html).not.toContain('game-ui-liquid-surface');
    expect(html).toContain('disabled');
  });
});

describe('liquid cast shadow', () => {
  it('grounds every form whose subject is a body with weight', () => {
    for (const form of BODY_FORMS) {
      if (form === 'fill') continue;
      expect(LIQUID_FORMS[form].group.shadow, `${form} floats`).toBeTruthy();
    }
  });

  it('gives every form the same material rather than twelve shadow recipes', () => {
    for (const form of LIQUID_FORM_NAMES)
      expect(LIQUID_FORMS[form].group.shadow).toBe('var(--game-ui-liquid-material-shadow)');
  });

  it('keeps the one material shadow on the compositor and off SVG passes', () => {
    const layers = parseShadow(materialShadow);
    expect(layers).toHaveLength(1);
    expect(layers[0]).toMatchObject({ x: 0, y: 6, blur: 14, spread: 0, inset: false });
    expect(svgFilterShadows(layers)).toEqual([]);
  });

  it('keeps form paint token-only with one CSS material owner', () => {
    for (const form of LIQUID_FORM_NAMES) {
      expect(LIQUID_FORMS[form].group.shadow).toMatch(/^var\(--game-ui-liquid-material-shadow\)$/);
      expect(JSON.stringify(LIQUID_FORMS[form].group)).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    }
    expect(materialShadow).toBeTruthy();
  });

  it('does not keep a second engaged thickness recipe on press', () => {
    const rest = liquidFormGroup('press');
    const held = liquidFormGroup('press', LIQUID_FORMS.press.groupEngaged);
    expect(held.shadow).toBe(rest.shadow);
    expect(held.gloss).toBe(rest.gloss);
    expect(LIQUID_FORMS.press.item.transition).toBe('wobbly');
  });

  it('lets settle differ by motion rather than material thickness', () => {
    expect(LIQUID_FORMS.settle.group).toEqual(LIQUID_FORMS.press.group);
    expect(LIQUID_FORMS.settle.item.transition).toBeDefined();
    expect(
      renderToStaticMarkup(
        <LiquidSurface form="settle" active>
          <span />
        </LiquidSurface>,
      ),
    ).toContain('data-liquid-active="true"');
  });

  it('carries the shared material into the form without an opt-in flag', () => {
    const html = renderToStaticMarkup(
      <LiquidSurface form="press">
        <span />
      </LiquidSurface>,
    );
    expect(html).toContain('feSpecularLighting');
    expect(html).toContain('surfaceScale="1.5"');
    expect(html).not.toContain('data-liquid-finish');
  });

  it('lets a caller override or remove it', () => {
    const none = renderToStaticMarkup(
      <LiquidSurface form="press" shadow="none">
        <span />
      </LiquidSurface>,
    );
    expect(none).not.toContain('drop-shadow(');
  });
});

describe('press motion', () => {
  it('presses by spreading sideways, not by shrinking', () => {
    const engaged = renderToStaticMarkup(
      <LiquidSurface active form="press">
        <span />
      </LiquidSurface>,
    );
    expect(engaged).toContain('data-liquid-active="true"');
    expect(LIQUID_FORMS.press.item.transition).toBe('wobbly');
  });

  it('wobbles looser than it bounces', () => {
    const ratio = (p: { stiffness: number; damping: number; mass: number }): number =>
      p.damping / (2 * Math.sqrt(p.stiffness * p.mass));
    expect(ratio(presets.wobbly)).toBeLessThan(ratio(presets.bouncy));
    // Below about 0.2 it is still visibly moving when the next tap lands.
    expect(ratio(presets.wobbly)).toBeGreaterThan(0.2);
  });
});
