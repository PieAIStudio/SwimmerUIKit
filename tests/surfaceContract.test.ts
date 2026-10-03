import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { expect, it } from 'vitest';
import { GAME_UI_TOKENS } from '../src';
it('has one surface vocabulary, no retired aliases, and a matching Tailwind bridge', () => {
  const css = readFileSync('src/tokens/theme.css', 'utf8');
  expect(css).not.toMatch(/--game-ui-panel(?:-strong|-deep)?\s*:/);
  expect(css).not.toMatch(/--game-ui-shadow-(?:button|panel|modal|inset)\s*:/);
  for (const name of ['panel', 'panelStrong', 'button', 'modal', 'inset'])
    expect(GAME_UI_TOKENS).not.toHaveProperty(name);
  const required = [
    '--game-ui-bg',
    '--game-ui-surface',
    '--game-ui-surface-sunken',
    '--game-ui-surface-raised',
    '--game-ui-shadow-raised',
  ];
  postcss.parse(css).walkRules((rule) => {
    if (
      ![':root', "[data-game-ui-theme='dark']", "[data-game-ui-theme='light']"].includes(
        rule.selector,
      )
    )
      return;
    for (const name of required) {
      const declarations = rule.nodes.filter((n) => n.type === 'decl' && n.prop === name);
      expect(declarations, `${rule.selector}/${name}`).toHaveLength(1);
    }
  });
  const bridge = readFileSync('src/tokens/tailwind.css', 'utf8');
  expect(bridge).toContain('--color-card: var(--game-ui-surface)');
  expect(bridge).toContain('--color-muted: var(--game-ui-surface-sunken)');
  expect(bridge).toContain('--color-popover: var(--game-ui-surface-raised)');
});
