import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { checkGuideCoverage } from '../scripts/lib/guide-coverage.mjs';
const inventory = readFileSync('docs/reference/public-api-inventory.md', 'utf8');
const guide = readFileSync('docs/reference/component-selection-guide.md', 'utf8');
it('covers every generated public value with a use-boundary row', () => {
  expect(checkGuideCoverage(inventory, guide)).toBeGreaterThan(0);
});
it('rejects a missing guide row even when its name is mentioned elsewhere', () => {
  const omitted = guide.replace(/^\| `GameBadge` \|[^\n]+\n/m, '');
  expect(omitted).not.toBe(guide);
  expect(() => checkGuideCoverage(inventory, omitted + '\nGameBadge')).toThrow('GameBadge');
  expect(() => checkGuideCoverage('', guide)).toThrow('no public values');
});
