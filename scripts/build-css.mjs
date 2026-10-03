// Builds dist/styles.css from the explicit src/styles.css import order:
// tokens → liquid primitives → colocated components. Optional presence/preview
// stay on their own leaves. Fonts use src/tokens/fonts.css. Lightning CSS is the
// same engine Vite 8 consumers run — and FAILS the build on any warning.
// "Consumers see zero CSS warnings" is a 1.0 contract (SPEC-0002), so it is
// enforced here, not just documented.
import { cpSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, relative, sep } from 'node:path';
import assert from 'node:assert/strict';

import { bundle } from 'lightningcss';

function bundleOrExit(filename) {
  const { code, warnings, dependencies } = bundle({
    filename,
    minify: true,
    analyzeDependencies: true,
  });
  if (warnings.length > 0) {
    console.error(`[build-css] lightningcss warnings in ${filename} (contract: must be zero):`);
    for (const warning of warnings) {
      const loc = warning.loc ? `${warning.loc.filename}:${warning.loc.line}` : 'unknown';
      console.error(` - ${warning.message} (${loc})`);
    }
    process.exit(1);
  }
  let text = code.toString();
  for (const dependency of dependencies ?? []) {
    if (dependency.type === 'file' || dependency.type === 'glob') continue;
    assert.equal(dependency.type, 'url', 'CSS imports must be bundled, not left external');
    if (/^(?:data:|#)/.test(dependency.url)) {
      text = text.replaceAll(dependency.placeholder, dependency.url);
      continue;
    }
    const fontRoot = resolve('src/tokens/fonts');
    const source = resolve(dirname(dependency.loc.filePath), dependency.url);
    assert.ok(
      source.startsWith(fontRoot + sep) && existsSync(source),
      `Unowned or missing CSS resource: ${source}`,
    );
    // Imported font faces retain their original source location. Emit every
    // stylesheet relative to dist/, not relative to src/ or a nested import.
    text = text.replaceAll(
      dependency.placeholder,
      './fonts/' + relative(fontRoot, source).split(sep).join('/'),
    );
  }
  return Buffer.from(text);
}

mkdirSync('dist', { recursive: true });

const presenceCode = bundleOrExit('src/presence/presence.css');
writeFileSync('dist/liquid-presence.css', presenceCode);
console.log(
  `[build-css] dist/liquid-presence.css written (${presenceCode.length} bytes, 0 warnings)`,
);

const stylesCode = bundleOrExit('src/styles.css');
writeFileSync('dist/styles.css', stylesCode);
console.log(`[build-css] dist/styles.css written (${stylesCode.length} bytes, 0 warnings)`);

const previewCode = bundleOrExit('src/preview/preview.css');
writeFileSync('dist/preview.css', previewCode);
console.log(`[build-css] dist/preview.css written (${previewCode.length} bytes, 0 warnings)`);

const fontsCode = bundleOrExit('src/tokens/fonts.css');
writeFileSync('dist/fonts.css', fontsCode);
// Binaries + OFL license text referenced by relative url() in fonts.css;
// mirrors src/tokens/fonts/ so the ./fonts/*.woff2 paths keep resolving in dist.
cpSync('src/tokens/fonts', 'dist/fonts', { recursive: true });
console.log(`[build-css] dist/fonts.css written (${fontsCode.length} bytes, 0 warnings)`);
