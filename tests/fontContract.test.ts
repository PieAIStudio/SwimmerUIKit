import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import postcss from 'postcss';
import { expect, it } from 'vitest';
import { readCssSource } from '../scripts/lib/css-source.mjs';

const manifest = JSON.parse(readFileSync('src/tokens/fonts/zh/manifest.json', 'utf8')) as {
  family: string;
  totalBytes: number;
  chunks: {
    file: string;
    weight: string;
    unicodeRange: string;
    codepoints: number;
    bytes: number;
    sha256: string;
  }[];
};
const fontCss = readCssSource('src/tokens/fonts.css');
it('ships every deterministic Chinese chunk and its license without hidden stale files', () => {
  const files = readdirSync('src/tokens/fonts/zh').filter((file) => file.endsWith('.woff2'));
  expect(files.sort()).toEqual(manifest.chunks.map((chunk) => chunk.file).sort());
  expect(new Set(manifest.chunks.map((c) => c.weight))).toEqual(
    new Set(['400', '500', '600 700', '800 900']),
  );
  let bytes = 0;
  for (const chunk of manifest.chunks) {
    const data = readFileSync(`src/tokens/fonts/zh/${chunk.file}`);
    expect(data.subarray(0, 4).toString(), chunk.file).toBe('wOF2');
    expect(data.length, chunk.file).toBe(chunk.bytes);
    expect(createHash('sha256').update(data).digest('hex'), chunk.file).toBe(chunk.sha256);
    expect(chunk.codepoints).toBeGreaterThan(0);
    expect(chunk.codepoints).toBeLessThanOrEqual(512);
    expect(parseInt(chunk.unicodeRange.slice(2).split('-')[0]!, 16)).toBeGreaterThanOrEqual(0x2e80);
    bytes += data.length;
  }
  expect(bytes).toBe(manifest.totalBytes);
  expect(readFileSync('src/tokens/fonts/zh/OFL.txt', 'utf8')).toContain(
    'SIL OPEN FONT LICENSE Version 1.1',
  );
});
it('declares all three actual font families and no invented named fallbacks', () => {
  const families = new Set<string>();
  let chineseFaces = 0;
  postcss.parse(fontCss).walkAtRules('font-face', (rule) => {
    const values: Record<string, string> = {};
    rule.walkDecls((decl) => {
      values[decl.prop] = decl.value;
    });
    families.add(values['font-family']!.replace(/['"]/g, ''));
    expect(values['font-display']).toBe('swap');
    if (values['font-family']!.includes(manifest.family)) {
      chineseFaces++;
      expect(values['unicode-range']).toMatch(/^U\+[0-9A-F]+-[0-9A-F]+$/);
    }
  });
  expect(chineseFaces).toBe(manifest.chunks.length);
  expect(families).toEqual(new Set(['Baloo 2', 'Geist Variable', 'Swimmer Rounded CN']));
  postcss
    .parse(readFileSync('src/tokens/theme.css', 'utf8'))
    .walkDecls(/^--game-ui-font-(display|body|mono)$/, (decl) => {
      for (const entry of decl.value.split(',').map((value) => value.trim().replace(/['"]/g, '')))
        expect(
          families.has(entry) ||
            ['system-ui', 'sans-serif', 'ui-monospace', 'monospace'].includes(entry),
          entry,
        ).toBe(true);
    });
  expect(readFileSync('src/styles.css', 'utf8')).toContain("@import './tokens/fonts.css'");
});
