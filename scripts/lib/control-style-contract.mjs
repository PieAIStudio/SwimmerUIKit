import assert from 'node:assert/strict';
import postcss from 'postcss';

export const STYLE_NAMES = ['candy', 'pastel', 'mist', 'grey', 'outline', 'ink'];
export const STYLE_SEMANTICS = [
  'fill',
  'edge',
  'text',
  'edge-width',
  'danger-edge',
  'on-fill',
  'on-edge',
  'on-text',
  'on-edge-width',
  'meaning-fill',
  'meaning-edge',
  'meaning-text',
  'meaning-edge-width',
  'disabled-fill',
  'disabled-edge',
  'disabled-text',
];
export const HUES = ['coral', 'sun', 'leaf', 'sky', 'grape', 'pink'];

/** Validate actual CSS declarations, not a duplicate JSON palette. */
export function inspectControlStyleBlocks(css) {
  const root = postcss.parse(css);
  const blocks = [];
  root.walkAtRules('scope', (scope) => {
    const style = /data-game-ui-style=['"]([^'"]+)['"]/.exec(scope.params)?.[1];
    if (!style) return;
    for (const rule of scope.nodes.filter((node) => node.type === 'rule')) {
      const vars = new Map(
        rule.nodes.filter((node) => node.type === 'decl').map((decl) => [decl.prop, decl.value]),
      );
      const mode = vars.has('--game-ui-control-fill-light')
        ? 'light'
        : vars.has('--game-ui-control-fill-dark')
          ? 'dark'
          : null;
      assert.ok(mode, `${style}: no complete light/dark semantic block`);
      assert.ok(STYLE_NAMES.includes(style), `Unknown style block: ${style}`);
      for (const name of STYLE_SEMANTICS)
        assert.ok(
          vars.get(`--game-ui-control-${name}-${mode}`)?.trim(),
          `${style}/${mode}: missing ${name}`,
        );
      for (const hue of HUES)
        assert.ok(vars.get(`--game-ui-hue-${hue}`)?.trim(), `${style}/${mode}: missing hue ${hue}`);
      const duplicates = rule.nodes.filter((node) => node.type === 'decl').map((decl) => decl.prop);
      assert.equal(
        new Set(duplicates).size,
        duplicates.length,
        `${style}/${mode}: duplicate token declarations`,
      );
      blocks.push({ style, mode, variables: Object.fromEntries(vars) });
    }
  });
  assert.equal(blocks.length, 12, 'Six styles must each define exactly two complete mode blocks');
  assert.deepEqual(
    blocks.map((block) => `${block.style}/${block.mode}`).sort(),
    STYLE_NAMES.flatMap((style) => [`${style}/light`, `${style}/dark`]).sort(),
  );
  return blocks;
}

export { contrastRatio } from './contrast.mjs';
