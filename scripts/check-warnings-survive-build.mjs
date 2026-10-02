#!/usr/bin/env node
/**
 * Verify that the kit's runtime warnings still exist after bundling.
 *
 * Why this check exists
 * --------------------
 * A library cannot gate code on `import.meta.env.DEV`. That flag is resolved
 * when *this package* is built, not when the app importing it is, so it is
 * baked to `false` in the published artifact and everything behind it becomes
 * unreachable. Version 1.11.1 shipped exactly that: two budget warnings, added
 * so that a group silently falling back to static rendering would be visible,
 * compiled down to `if (this.budgetWarningEmitted || !0) return;` — an
 * unconditional early return. No consumer could ever have seen them.
 *
 * 1.11.2 unblocked the budget warnings and added this check. It was still
 * incomplete: the item-border warning and the dissolve-on-move warning used
 * the same DEV gate, so they were deleted from the published bundle. Product
 * apps consume the published package; a miswired child border in University
 * therefore never warned. The check now covers every warning the kit promises.
 *
 * That failure is invisible in the source, invisible in the test suite, and
 * only appears in the built file. So the check has to read the built file.
 *
 * It is deliberately narrow: it proves the specific warnings the kit promises
 * are still reachable. A broad "no dead code anywhere" check would be a
 * check that fails for reasons nobody acts on, which is its own kind of lie.
 */
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { reachableChunks } from './lib/package-graph.mjs';

const BUNDLE = 'dist/index.js';

/** Messages the kit promises to emit. `id` is what a failing check names. */
const PROMISED_WARNINGS = [
  {
    id: 'animation-budget',
    entry: 'index.js',
    message: 'the liquid animation budget is insufficient',
  },
  {
    id: 'image-filter-budget',
    entry: 'liquid-effects.js',
    message: 'the Melt/dissolve image filter budget is insufficient',
  },
  {
    id: 'item-border',
    entry: 'index.js',
    message: 'LiquidGroup.Item children should not have their own border',
  },
  {
    id: 'group-form-on-surface',
    entry: 'index.js',
    message: 'it describes a relationship',
  },
  {
    id: 'dissolve-on-move',
    entry: 'liquid-effects.js',
    // Minifiers keep this as `effect=\"move\"` inside a JS string, so the
    // needle stops before the quotes. `dissolve is ignored for effect=` is
    // unique to this warning.
    message: 'dissolve is ignored for effect=',
  },
];

/**
 * A boolean literal sitting next to the guard flag means the guard was folded
 * to a constant, which is the signature of the bug described above.
 * Minifiers write `true`/`false` as `!0`/`!1`.
 */
const FOLDED_GUARD = /budgetWarningEmitted\s*(?:\|\||&&)\s*(?:!0|!1|true|false)/g;

if (!existsSync(BUNDLE)) {
  console.error(`ERROR: ${BUNDLE} not found; run the build before this check.`);
  process.exit(2);
}

const graph = JSON.parse(readFileSync('.scratch/build/module-graph.json', 'utf8'));
const reach = Object.fromEntries(
  ['index.js', 'liquid-presence.js', 'liquid-effects.js', 'preview.js'].map((entry) => [
    entry,
    reachableChunks(graph, entry),
  ]),
);
const code = Object.fromEntries(
  Object.entries(reach).map(([entry, chunks]) => [
    entry,
    chunks.map((file) => readFileSync(`dist/${file}`, 'utf8')).join('\n'),
  ]),
);
for (const entry of ['index.js', 'liquid-presence.js']) {
  const forbidden = reach[entry]
    .flatMap((file) => graph[file].modules)
    .filter((file) => /^src\/(?:liquid-effects|preview)\//.test(file));
  assert.deepEqual(forbidden, [], `${entry} must not ship optional effects or showroom code`);
}
assert.ok(
  reach['liquid-effects.js'].some((file) =>
    graph[file].modules.some((id) => id.startsWith('src/liquid-effects/')),
  ),
  'The optional effect entry must really contain its implementation',
);
const budgetOwners = Object.entries(graph)
  .filter(([, chunk]) => chunk.modules.includes('src/liquid/budget.ts'))
  .map(([file]) => file);
assert.equal(budgetOwners.length, 1, 'All entries must share one emitted budget owner');
for (const entry of ['index.js', 'liquid-presence.js', 'liquid-effects.js'])
  assert.ok(
    reach[entry].includes(budgetOwners[0]),
    `${entry} must use the shared budget, not a private copy`,
  );
const bundle = Object.values(code).join('\n');
const problems = [];

for (const warning of PROMISED_WARNINGS) {
  if (!code[warning.entry].includes(warning.message)) {
    problems.push(
      `[${warning.id}] missing from ${warning.entry} and its dependencies: "${warning.message}"\n` +
        '  This is the `import.meta.env.DEV` trap. Do not gate a library warning on a\n' +
        "  build-time flag — it resolves against this package's build, not the app's.",
    );
  }
}

const folded = bundle.match(FOLDED_GUARD);
if (folded) {
  problems.push(
    `[animation-budget] the budget warning guard was folded to a constant: ${[...new Set(folded)].join(', ')}\n` +
      '  This is the `import.meta.env.DEV` trap. Do not gate a library warning on a\n' +
      "  build-time flag — it resolves against this package's build, not the app's.",
  );
}

if (problems.length > 0) {
  console.error('FAIL: warnings did not survive the build.\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `warnings survive the build: ok (${PROMISED_WARNINGS.length} checked); core/presence exclude effects and preview`,
);
