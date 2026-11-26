import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const authored = [
  'src/tokens/v12-parts.css',
  'src/game/v12LiquidBody.tsx',
  'src/game/v12LiquidBody.css',
  'src/game/RadialLiquidMenu/RadialLiquidMenu.tsx',
  'src/game/RadialLiquidMenu/component.css',
  'src/game/OrbTabBar/OrbTabBar.tsx',
  'src/game/OrbTabBar/component.css',
  'src/controls/FadeDivider/FadeDivider.tsx',
  'src/controls/FadeDivider/component.css',
  'src/showcase/V12PartsShowcase.tsx',
  'src/v12Showcase.css',
];
const builtDom = ['showcase-dist/index.html', 'artifacts/v12-dom.html'];
const forbidden = [
  /backdrop-filter\s*:/i,
  /filter\s*:\s*(?:blur|drop-shadow)/i,
  /drop-shadow\s*\(/i,
  /<filter\b/i,
  /LiquidSurface|LiquidGroup/,
];
const failures = [];
for (const relative of authored) {
  const path = resolve(root, relative);
  if (!existsSync(path)) {
    failures.push(relative + ' is missing');
    continue;
  }
  const text = readFileSync(path, 'utf8');
  for (const pattern of forbidden)
    if (pattern.test(text)) failures.push(relative + ' matches ' + pattern);
}
for (const relative of builtDom) {
  const path = resolve(root, relative);
  if (!existsSync(path)) continue;
  const text = readFileSync(path, 'utf8');
  for (const pattern of forbidden)
    if (pattern.test(text)) failures.push(relative + ' matches ' + pattern);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('v12 freeze guard: passed (TSX, styles, and built DOM snapshot scanned)');
}
