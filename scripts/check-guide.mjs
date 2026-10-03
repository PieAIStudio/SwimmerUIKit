import { readFileSync } from 'node:fs';
import { checkGuideCoverage } from './lib/guide-coverage.mjs';
const count = checkGuideCoverage(
  readFileSync('docs/reference/public-api-inventory.md', 'utf8'),
  readFileSync('docs/reference/component-selection-guide.md', 'utf8'),
);
console.log(`Selection guide: all ${count} public values explained`);
