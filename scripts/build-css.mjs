// Builds dist/styles.css from src/styles.css (bundling the theme.css
// @import) and dist/fonts.css from src/fonts.css with lightningcss — the
// same engine Vite 8 consumers run — and FAILS the build on any warning.
// "Consumers see zero CSS warnings" is a 1.0 contract (SPEC-0002), so it is
// enforced here, not just documented.
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';

import { bundle } from 'lightningcss';

function bundleOrExit(filename) {
  const { code, warnings } = bundle({ filename, minify: true });
  if (warnings.length > 0) {
    console.error(`[build-css] lightningcss warnings in ${filename} (contract: must be zero):`);
    for (const warning of warnings) {
      const loc = warning.loc ? `${warning.loc.filename}:${warning.loc.line}` : 'unknown';
      console.error(` - ${warning.message} (${loc})`);
    }
    process.exit(1);
  }
  return code;
}

mkdirSync('dist', { recursive: true });

const stylesCode = bundleOrExit('src/styles.css');
writeFileSync('dist/styles.css', stylesCode);
console.log(`[build-css] dist/styles.css written (${stylesCode.length} bytes, 0 warnings)`);

const previewCode = bundleOrExit('src/preview.css');
writeFileSync('dist/preview.css', previewCode);
console.log(`[build-css] dist/preview.css written (${previewCode.length} bytes, 0 warnings)`);

const fontsCode = bundleOrExit('src/fonts.css');
writeFileSync('dist/fonts.css', fontsCode);
// Binaries + OFL license text referenced by relative url() in fonts.css;
// mirrors src/fonts/ so the ./fonts/*.woff2 paths keep resolving in dist.
cpSync('src/fonts', 'dist/fonts', { recursive: true });
console.log(`[build-css] dist/fonts.css written (${fontsCode.length} bytes, 0 warnings)`);
