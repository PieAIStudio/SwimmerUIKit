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

const BUNDLE = 'dist/index.js';

/** Messages the kit promises to emit. `id` is what a failing check names. */
const PROMISED_WARNINGS = [
  {
    id: 'animation-budget',
    message: 'the liquid animation budget is insufficient',
  },
  {
    id: 'image-filter-budget',
    message: 'the Melt/dissolve image filter budget is insufficient',
  },
  {
    id: 'item-border',
    message: 'LiquidGroup.Item children should not have their own border',
  },
  {
    id: 'dissolve-on-move',
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

const bundle = readFileSync(BUNDLE, 'utf8');
const problems = [];

for (const warning of PROMISED_WARNINGS) {
  if (!bundle.includes(warning.message)) {
    problems.push(
      `[${warning.id}] missing from the bundle: "${warning.message}"\n` +
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

console.log(`warnings survive the build: ok (${PROMISED_WARNINGS.length} checked)`);
