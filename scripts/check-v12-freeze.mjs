import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const files = [
  'src/v12PartsTokens.css',
  'src/game/RadialLiquidMenu/component.css',
  'src/game/OrbTabBar/component.css',
  'src/controls/FadeDivider/component.css',
  'src/v12Showcase.css',
];
const forbidden = [
  /backdrop-filter\s*:/i,
  /filter\s*:\s*(?:blur|drop-shadow)/i,
  /drop-shadow\s*\(/i,
  /<filter\b/i,
];
const failures = [];
for (const relative of files) {
  const path = resolve(root, relative);
  const text = readFileSync(path, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(text)) failures.push(relative + ' matches ' + pattern);
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('v12 freeze guard: passed (' + files.length + ' authored stylesheets)');
}
