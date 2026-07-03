// Builds dist/styles.css from src/styles.css (bundling the theme.css
// @import) with lightningcss — the same engine Vite 8 consumers run — and
// FAILS the build on any warning. "Consumers see zero CSS warnings" is a
// 1.0 contract (SPEC-0002), so it is enforced here, not just documented.
import { mkdirSync, writeFileSync } from 'node:fs';

import { bundle } from 'lightningcss';

const { code, warnings } = bundle({
  filename: 'src/styles.css',
  minify: true,
});

if (warnings.length > 0) {
  console.error('[build-css] lightningcss warnings (contract: must be zero):');
  for (const warning of warnings) {
    const loc = warning.loc ? `${warning.loc.filename}:${warning.loc.line}` : 'unknown';
    console.error(` - ${warning.message} (${loc})`);
  }
  process.exit(1);
}

mkdirSync('dist', { recursive: true });
writeFileSync('dist/styles.css', code);
console.log(`[build-css] dist/styles.css written (${code.length} bytes, 0 warnings)`);
