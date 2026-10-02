/** Compare expanded CSS artifacts. Source order across different selectors is checked in the browser. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cssRuleModel } from './lib/css-rule-model.mjs';

const [before, after] = process.argv.slice(2);
assert.ok(before && after, 'Usage: node scripts/check-css-equivalence.mjs before.css after.css');
const a = cssRuleModel(readFileSync(before, 'utf8'));
const b = cssRuleModel(readFileSync(after, 'utf8'));
const differences = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(
  (key) => a[key] !== b[key],
);
assert.deepEqual(
  differences.map((key) => ({ key, before: a[key], after: b[key] })),
  [],
  'CSS rules changed beyond regrouping',
);
console.log(`CSS equivalence: ${Object.keys(a).length} atomic rules unchanged`);
