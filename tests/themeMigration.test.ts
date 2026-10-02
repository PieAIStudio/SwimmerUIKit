import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { describe, expect, it } from 'vitest';
import { findRetiredThemeValues, stripSourceComments } from '../bin/lib/retired-theme.mjs';

describe('3.0 dark theme migration diagnostic', () => {
  it.each([
    '<div data-game-ui-theme="night" />',
    '<div data-game-ui-theme={"night"} />',
    '<div data-game-ui-theme={dark ? "night" : "light"} />',
    '[data-game-ui-theme=night] { --game-ui-bg: #000; }',
    'element.closest(\'[data-game-ui-theme="night"]\')',
    'const selector = "[data-game-ui-theme=\\"night\\"]";',
    'const attrs = { "data-game-ui-theme": "night" };',
    'element.setAttribute("data-game-ui-theme", "night");',
    'element.dataset.gameUiTheme = "night";',
    'element.dataset["gameUiTheme"] = "night";',
  ])('rejects the removed theme value in %s', (source) => {
    expect(findRetiredThemeValues(source)).toHaveLength(1);
    expect(findRetiredThemeValues(source)[0]!.message).toContain('dark');
  });
  it('does not flag current themes, unrelated prose or historical comments', () => {
    const text = `// data-game-ui-theme="night" was removed.
/* el.dataset.gameUiTheme = 'night'; */
const description = 'A quiet night';
const url = 'https://example.com/';
const current = '<div data-game-ui-theme="dark">';`;
    expect(findRetiredThemeValues(text)).toEqual([]);
    expect(stripSourceComments(text)).toContain('https://example.com/');
  });
  it('fails the actual shipped CLI for source-only projects, without needing a CSS file', () => {
    const temporary = mkdtempSync(path.join(os.tmpdir(), 'swimmer-theme-migration-'));
    try {
      writeFileSync(
        path.join(temporary, 'captcha.tsx'),
        `export const theme = element.closest('[data-game-ui-theme="night"]') ? 'dark' : 'light';`,
      );
      let result: { status?: number; stderr?: string } = {};
      try {
        execFileSync('node', ['bin/swimmer-ui-check.mjs', temporary], {
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error) {
        result = error as typeof result;
      }
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('captcha.tsx:1');
      expect(result.stderr).toContain('请改成 data-game-ui-theme="dark"');
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });
  it('has no removed theme value in shipped UI, preview or Storybook source', () => {
    const walk = (directory: string): string[] =>
      readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(file) : [file];
      });
    const files = ['src', 'preview', '.storybook']
      .flatMap(walk)
      .filter((file) => /\.(?:ts|tsx|css|html)$/.test(file) && !/\.test\./.test(file));
    for (const file of files) {
      const code = stripSourceComments(readFileSync(file, 'utf8'));
      expect(findRetiredThemeValues(code), file).toEqual([]);
      expect(code, file).not.toMatch(/['"]night['"]/);
    }
  });
});
