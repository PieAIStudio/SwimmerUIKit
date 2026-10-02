import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { readCssSource } from '../scripts/lib/css-source.mjs';
import { cssRuleModel } from '../scripts/lib/css-rule-model.mjs';

const source = fileURLToPath(new URL('../src/', import.meta.url));
const walk = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });

describe('CSS assembly ownership', () => {
  it('lists every main component stylesheet exactly once, without optional leaves', () => {
    const entry = readFileSync(path.join(source, 'styles.css'), 'utf8').replace(
      /\/\*[\s\S]*?\*\//g,
      '',
    );
    const imports = [...entry.matchAll(/@import\s+['"]([^'"]+)['"];?/g)].map((match) =>
      path.resolve(source, match[1]!),
    );
    expect(entry.replace(/@import[^;]+;/g, '').trim()).toBe('');
    expect(new Set(imports).size).toBe(imports.length);
    const components = walk(source).filter(
      (file) =>
        file.endsWith('/component.css') && !/\/(presence|preview|liquid-effects)\//.test(file),
    );
    expect(imports.filter((file) => file.endsWith('/component.css')).sort()).toEqual(
      components.sort(),
    );
    expect(imports.some((file) => /\/(presence|preview|liquid-effects)\//.test(file))).toBe(false);
  });

  it('loads tokens and drawing primitives before component customizations', () => {
    const entry = readFileSync(path.join(source, 'styles.css'), 'utf8');
    const names = [...entry.matchAll(/@import\s+['"]([^'"]+)['"]/g)].map((match) => match[1]!);
    expect(names.slice(0, 3)).toEqual([
      './tokens/theme.css',
      './tokens/control-styles.css',
      './tokens/motion.css',
    ]);
    const firstComponent = names.findIndex(
      (file) => !/^\.\/(tokens|liquid)\/|DropletSurface\//.test(file),
    );
    expect(names.findIndex((file) => file.includes('DropletSurface/component.css'))).toBeLessThan(
      firstComponent,
    );
    expect(names.findIndex((file) => file.includes('LiquidGroup/component.css'))).toBeLessThan(
      firstComponent,
    );
    expect(names.findIndex((file) => file.includes('GameInput/component.css'))).toBeLessThan(
      names.findIndex((file) => file.includes('GameTextArea/component.css')),
    );
    expect(names.findIndex((file) => file.includes('GameIconButton/component.css'))).toBeLessThan(
      names.findIndex((file) => file.includes('GameWindowPanel/component.css')),
    );
  });

  it('normalizes selector grouping but still detects missing rules and changed declarations', () => {
    const combined =
      '@layer swimmer-ui { .a, .b { color: red; } @media (width < 600px) { .a { color: blue; } } }';
    const split =
      '@layer swimmer-ui { .b { color: red; } } @layer swimmer-ui { .a { color: red; } @media (width < 600px) { .a { color: blue; } } }';
    expect(cssRuleModel(split)).toEqual(cssRuleModel(combined));
    expect(cssRuleModel(split.replace('color: blue', 'color: green'))).not.toEqual(
      cssRuleModel(combined),
    );
    expect(
      cssRuleModel(split.replace('@media (width < 600px)', '@media (width < 500px)')),
    ).not.toEqual(cssRuleModel(combined));
    expect(cssRuleModel('.a { color: red; color: blue }')).not.toEqual(
      cssRuleModel('.a { color: blue; color: red }'),
    );
  });
});

describe('source CSS reader', () => {
  let temporary: string | undefined;
  afterEach(() => {
    if (temporary) rmSync(temporary, { recursive: true, force: true });
  });
  it('expands the actual imported sources and rejects missing imports or cycles', () => {
    temporary = mkdtempSync(path.join(os.tmpdir(), 'swimmer-css-source-'));
    const entry = path.join(temporary, 'entry.css');
    const child = path.join(temporary, 'child.css');
    writeFileSync(entry, '@import "./child.css"; .outer { display: grid; }');
    writeFileSync(child, '.inner { display: flex; }');
    expect(readCssSource(entry)).toContain('.inner');
    expect(readCssSource(entry)).not.toContain('@import');
    expect(readCssSource(entry, { exclude: [child] })).not.toContain('.inner');
    writeFileSync(child, '@import "./entry.css";');
    expect(() => readCssSource(entry)).toThrow('CSS import cycle');
    rmSync(child);
    expect(() => readCssSource(entry)).toThrow();
  });
});
