import { build } from 'vite';
import { readFileSync, existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { GAME_ICON_NAMES } from '../src/icons/registry';

it('retains every listed semantic name, adds thirteen, and removes the old distribution', () => {
  const names =
    'ai alert card chat check close coin compass copy crown energy gem gift globe history redo undo home hourglass laurel lock lucky mail medal mission mobile portal scroll settings shirt shop smile timer trophy vote arrow-left arrow-right chevron-down chevron-up download external menu minus moon plus search sun user'.split(
      ' ',
    );
  expect([...GAME_ICON_NAMES].sort()).toEqual(names.sort());
  expect(new Set(GAME_ICON_NAMES).size).toBe(48);
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  expect(pkg.exports['./assets/*']).toBeUndefined();
  expect(pkg.bin['swimmer-ui-assets']).toBeUndefined();
  expect(existsSync('src/icons/assets.ts')).toBe(false);
});

it('tree-shakes a single named path without any registry, renderer or other icons', async () => {
  const temporary = mkdtempSync(resolve(tmpdir(), 'swimmer-icon-consumer-'));
  const entry = resolve(temporary, 'consumer.ts');
  writeFileSync(
    entry,
    `export { CHECK_ICON } from ${JSON.stringify(resolve('src/icon-paths.ts'))};`,
  );
  try {
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      publicDir: false,
      build: { write: false, minify: true, lib: { entry, formats: ['es'] } },
    });
    const outputs = Array.isArray(result) ? result : [result];
    const js = outputs
      .flatMap((item) => ('output' in item ? item.output : []))
      .filter((item) => item.type === 'chunk')
      .map((item) => item.code)
      .join('\n');
    expect(js).toContain('check');
    expect(js).not.toMatch(/trophy|brain|React|GAME_ICONS|createElement/);
    expect(js.length).toBeLessThan(500);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
