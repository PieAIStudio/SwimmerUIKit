import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { readComponentStyles } from './helpers/styles';

import {
  collectStructuralClaims,
  findOwnershipViolations,
  formatOwnershipViolation,
} from '../scripts/lib/cssOwnership';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));
const stylesCss = readComponentStyles();
const showcaseCss = readFileSync(join(SRC, 'showcase.css'), 'utf8');

describe('structural ownership analyzer', () => {
  it('reports a class whose layout is claimed by two rules', () => {
    const css = `
      .thing { position: absolute; white-space: nowrap; }
      .thing { display: grid; }
    `;

    const violations = findOwnershipViolations(css);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.selector).toBe('.thing');
    expect(formatOwnershipViolation(violations[0]!)).toContain('claims layout in 2 places');
  });

  it('allows a cosmetic or motion rule alongside the single structural rule', () => {
    const css = `
      .popover { position: absolute; display: grid; padding: 8px; }
      .popover { animation: pop 120ms both; transform-origin: top right; }
      .toast { padding: 12px; }
      .toast { animation: rise 160ms both; }
    `;

    expect(findOwnershipViolations(css)).toEqual([]);
  });

  it('exempts conditional overrides but sees through @layer', () => {
    const css = `
      @layer swimmer-ui {
        .card { display: grid; }
        @media (max-width: 600px) {
          .card { display: block; }
        }
      }
    `;

    expect(findOwnershipViolations(css)).toEqual([]);
    expect(collectStructuralClaims(css)).toHaveLength(1);
  });

  it('does not read a nested child rule as the parent class claim', () => {
    const css = `
      .panel { padding: 12px; & > .row { display: flex; } }
      .panel { display: grid; }
    `;

    expect(findOwnershipViolations(css)).toEqual([]);
  });

  it('ignores selectors that are not a single bare class', () => {
    const css = `
      .a, .b { display: grid; }
      .a .b { display: flex; }
      .a { position: relative; }
    `;

    expect(findOwnershipViolations(css)).toEqual([]);
  });
});

describe('kit stylesheets keep one owner per class', () => {
  it('styles.css has no class whose layout is claimed twice', () => {
    const violations = findOwnershipViolations(stylesCss);

    expect(violations.map(formatOwnershipViolation)).toEqual([]);
  });

  it('showcase.css has no class whose layout is claimed twice', () => {
    const violations = findOwnershipViolations(showcaseCss);

    expect(violations.map(formatOwnershipViolation)).toEqual([]);
  });

  it('keeps showcase composition classes out of the core styles leaf', () => {
    expect(stylesCss).not.toContain('.game-ui-showcase-shell');
    expect(showcaseCss).toContain('.game-ui-showcase-shell');
  });
});
