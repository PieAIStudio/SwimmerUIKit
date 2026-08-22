#!/usr/bin/env node
// Copy the sculpted clay asset set out of the package and into a directory the
// consuming app actually serves.
//
// The kit resolves sculpted icons to absolute URLs under CLAY_ASSET_BASE_PATH
// ('/assets/game/ui/clay/…'), which is a path on the *host's* origin. The files
// themselves ship inside the package, in dist/assets. Nothing was closing that
// gap, so every consumer had to discover it, and the default placeholder mode
// meant the failure looked like a design choice rather than a missing step.
//
// Usage: swimmer-ui-assets [targetDir] [--base=/assets/game/ui/clay/...] [--force]
//   targetDir  where the host serves static files from. Default "public".
//   --base     the URL path to mirror under targetDir. Defaults to the kit's
//              CLAY_ASSET_BASE_PATH, which is what setClayAssetMode('source')
//              expects with no further configuration.
//   --force    overwrite files that already exist (default: skip them).
//
// After running this, call setClayAssetMode('source') once at your app entry.
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_BASE = '/assets/game/ui/clay/phase03-clay-kit';
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const positional = args.filter((a) => !a.startsWith('--'));

// Two different paths that are easy to conflate: where the files sit inside
// this package (fixed, mirrors the default URL under dist/) and where the host
// will serve them from (--base, defaults to the same thing so the common case
// needs no configuration).
const trim = (p) => p.replace(/^\/+|\/+$/g, '');
const baseFlag = args.find((a) => a.startsWith('--base='));
const servedBase = trim(baseFlag ? baseFlag.slice('--base='.length) : DEFAULT_BASE);
const targetRoot = resolve(process.cwd(), positional[0] ?? 'public');
const force = flags.has('--force');

const source = join(packageRoot, 'dist', trim(DEFAULT_BASE));
if (!existsSync(source)) {
  console.error(`swimmer-ui-assets: nothing to copy — ${source} does not exist.`);
  console.error('This package may have been installed without its dist/assets tree.');
  process.exit(1);
}

const destination = join(targetRoot, servedBase);

function count(dir) {
  let files = 0;
  let bytes = 0;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      const inner = count(full);
      files += inner.files;
      bytes += inner.bytes;
    } else {
      files += 1;
      bytes += stat.size;
    }
  }
  return { files, bytes };
}

const { files, bytes } = count(source);

mkdirSync(dirname(destination), { recursive: true });
cpSync(source, destination, { recursive: true, force, errorOnExist: false });

const megabytes = (bytes / 1024 / 1024).toFixed(1);
console.log(`swimmer-ui-assets: copied ${files} files (${megabytes} MB)`);
console.log(`  from  ${source}`);
console.log(`  to    ${destination}`);
console.log('');
console.log('Now call this once at your app entry, or the kit keeps drawing placeholders:');
console.log("  import { setClayAssetMode } from '@pieai/swimmer-ui-kit';");
console.log("  setClayAssetMode('source');");
if (!force) {
  console.log('');
  console.log('Existing files were left alone. Re-run with --force to overwrite.');
}
