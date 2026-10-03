/** Inspect the real local tarball. Never publishes or modifies a consumer repo. */
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { reachableChunks } from './lib/package-graph.mjs';

const root = process.cwd();
const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
assert.equal(manifest.name, '@pieai/swimmer-ui-kit', 'Run in the UIKit checkout');
const tarball = path.resolve(process.argv[2] ?? '');
assert.ok(
  process.argv[2] && tarball.startsWith(`${root}/.scratch/`) && tarball.endsWith('.tgz'),
  'Usage: pnpm check:packed .scratch/<candidate>.tgz [.scratch/<evidence>]',
);
const output = path.resolve(process.argv[3] ?? '.scratch/package-candidate');
assert.ok(output.startsWith(`${root}/.scratch/`));
mkdirSync(output, { recursive: true });
writeFileSync(
  path.join(output, 'receipt.json'),
  JSON.stringify(
    { status: 'checking', passed: false, tarball, checkedAt: new Date().toISOString() },
    null,
    2,
  ),
);
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const files = execFileSync('tar', ['-tf', tarball], { encoding: 'utf8' }).trim().split('\n');
assert.ok(files.length > 0);
assert.equal(new Set(files).size, files.length, 'The tarball must not contain duplicate entries');
for (const file of files) {
  assert.ok(file.startsWith('package/') && !file.split('/').includes('..'), file);
  assert.ok(
    !/(?:^|\/)(?:\.scratch|\.git|node_modules|tests|\.env|\.DS_Store)(?:\/|$)/.test(file),
    file,
  );
}
const inspection = mkdtempSync(path.join(output, 'inspection-'));
execFileSync('tar', ['-xf', tarball, '-C', inspection]);
const packedRoot = path.join(inspection, 'package');
const packed = JSON.parse(readFileSync(path.join(packedRoot, 'package.json'), 'utf8'));
for (const key of ['name', 'version', 'type', 'exports', 'peerDependencies', 'dependencies', 'bin'])
  assert.deepEqual(packed[key], manifest[key], `Packed ${key} must match the tested source`);
assert.equal(packed.type, 'module');

// Check both membership and bytes. Checking only files present in the tarball
// would miss an omitted chunk/CLI helper and could bless an incomplete package.
const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    // Finder may recreate metadata after build cleanup. It is not runtime input;
    // the tarball loop above still rejects it rather than allowing it to ship.
    if (entry.name === '.DS_Store') return [];
    return entry.isDirectory() ? walk(file) : entry.isFile() ? [file] : [];
  });
const shippedSourceFiles = ['dist', 'bin'].flatMap(walk).sort();
const packedRuntimeFiles = files
  .filter((file) => /^package\/(?:dist|bin)\//.test(file) && !file.endsWith('/'))
  .map((file) => file.slice('package/'.length))
  .sort();
assert.deepEqual(packedRuntimeFiles, shippedSourceFiles, 'Packed dist/bin file set is incomplete');
for (const relative of shippedSourceFiles) {
  assert.equal(
    sha(readFileSync(path.join(packedRoot, relative))),
    sha(readFileSync(relative)),
    relative,
  );
}
const matchingDistFiles = shippedSourceFiles.filter((file) => file.startsWith('dist/')).length;
const matchingBinFiles = shippedSourceFiles.length - matchingDistFiles;
assert.equal(packed.exports['./assets/*'], undefined, 'Removed asset entry must stay absent');
assert.equal(packed.bin['swimmer-ui-assets'], undefined, 'Removed asset copier must stay absent');
assert.ok(
  !files.some((file) => /^package\/dist\/assets\//.test(file)),
  'Removed image assets must not ship',
);
const publicFiles = execFileSync('git', ['ls-files', '-z', 'public'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);
for (const file of publicFiles) {
  const candidate = path.join(packedRoot, 'dist', file.slice('public/'.length));
  assert.ok(existsSync(candidate), `Missing public resource: ${file}`);
  assert.equal(sha(readFileSync(candidate)), sha(readFileSync(file)), file);
}
for (const file of [
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'NOTICE',
  'donors-individual.md',
  'donors-individual-lock.json',
  'dist/fonts/OFL-Baloo2.txt',
  'dist/fonts/OFL-Geist.txt',
  'dist/fonts/zh/OFL.txt',
]) {
  assert.ok(existsSync(path.join(packedRoot, file)), `Missing license/provenance: ${file}`);
  assert.equal(sha(readFileSync(path.join(packedRoot, file))), sha(readFileSync(file)), file);
}

const runtimeEntries = {};
for (const [entry, contract] of Object.entries(packed.exports)) {
  if (typeof contract !== 'object' || !contract.default?.endsWith('.js')) continue;
  const module = await import(pathToFileURL(path.join(packedRoot, contract.default)).href);
  runtimeEntries[entry] = Object.keys(module).sort();
  assert.ok(existsSync(path.join(packedRoot, contract.types)), `Missing types: ${entry}`);
}
assert.deepEqual(Object.keys(runtimeEntries).sort(), [
  '.',
  './icon-paths',
  './liquid-effects',
  './liquid-presence',
  './preview',
]);
assert.ok(runtimeEntries['.'].includes('GameButton'));
assert.ok(!runtimeEntries['.'].includes('GameUiPreview'));
assert.ok(!runtimeEntries['.'].includes('LiquidEffectsGroup'));
assert.ok(runtimeEntries['./liquid-effects'].includes('LiquidEffectsGroup'));
assert.ok(runtimeEntries['./liquid-presence'].includes('LiquidPresence'));

// A real package-name consumer, linked only inside this private scratch fixture.
const consumer = path.join(inspection, 'consumer');
mkdirSync(path.join(consumer, 'node_modules/@pieai'), { recursive: true });
symlinkSync(packedRoot, path.join(consumer, 'node_modules/@pieai/swimmer-ui-kit'), 'dir');
writeFileSync(path.join(consumer, 'package.json'), '{"private":true,"type":"module"}\n');
let fixture = readFileSync('tests/type-contracts/optional-entries.tsx', 'utf8');
for (const entry of ['index', 'icon-paths', 'liquid-effects', 'liquid-presence', 'preview'])
  fixture = fixture.replaceAll(
    `'../../src/${entry}'`,
    `'@pieai/swimmer-ui-kit${entry === 'index' ? '' : `/${entry}`}'`,
  );
fixture += `\nimport type { GameUiTheme } from '@pieai/swimmer-ui-kit';\nexport const currentTheme: GameUiTheme = 'dark';\n// @ts-expect-error The removed theme must not re-enter the packed type contract.\nexport const retiredTheme: GameUiTheme = 'night';\n`;
writeFileSync(path.join(consumer, 'consumer.tsx'), fixture);
const modes = ['NodeNext', 'Bundler'];
for (const mode of modes) {
  const config = {
    compilerOptions: {
      target: 'ES2022',
      lib: ['DOM', 'DOM.Iterable', 'ES2022'],
      module: mode === 'NodeNext' ? 'NodeNext' : 'ESNext',
      moduleResolution: mode,
      jsx: 'react-jsx',
      strict: true,
      exactOptionalPropertyTypes: true,
      noUncheckedIndexedAccess: true,
      skipLibCheck: false,
      noEmit: true,
      types: [],
    },
    files: ['consumer.tsx'],
  };
  const configFile = path.join(consumer, `tsconfig-${mode}.json`);
  writeFileSync(configFile, JSON.stringify(config, null, 2));
  const result = spawnSync(
    process.execPath,
    ['node_modules/typescript/bin/tsc', '-p', configFile],
    { encoding: 'utf8' },
  );
  writeFileSync(path.join(output, `consumer-${mode}.log`), `${result.stdout}\n${result.stderr}`);
  assert.equal(
    result.status,
    0,
    `Actual package consumer (${mode}): ${result.stdout}\n${result.stderr}`,
  );
}

const diagnostic = path.join(inspection, 'migration-source');
mkdirSync(diagnostic);
const source = path.join(diagnostic, 'theme.tsx');
const cli = path.join(packedRoot, packed.bin['swimmer-ui-check']);
writeFileSync(source, `const theme = element.closest('[data-game-ui-theme="night"]');\n`);
const rejected = spawnSync(process.execPath, [cli, diagnostic], { encoding: 'utf8' });
assert.equal(rejected.status, 1, 'Packed CLI must reject source-only retired theme usage');
assert.match(rejected.stderr + rejected.stdout, /dark/);
writeFileSync(source, `const theme = element.closest('[data-game-ui-theme="dark"]');\n`);
const accepted = spawnSync(process.execPath, [cli, diagnostic], { encoding: 'utf8' });
assert.equal(accepted.status, 0, accepted.stderr + accepted.stdout);
writeFileSync(
  path.join(output, 'packed-cli.log'),
  `REJECTED OLD VALUE:\n${rejected.stdout}${rejected.stderr}\nACCEPTED CURRENT VALUE:\n${accepted.stdout}${accepted.stderr}`,
);

const graph = JSON.parse(readFileSync('.scratch/build/module-graph.json', 'utf8'));
assert.deepEqual(
  Object.keys(graph).sort(),
  shippedSourceFiles
    .filter((file) => file.endsWith('.js'))
    .map((file) => file.slice(5))
    .sort(),
  'Build module graph must cover the exact emitted JavaScript files',
);
// Inspect the shipped bytes, including shared React chunks, not source directives.
const clientEntries = new Set([
  'index.js',
  'liquid-presence.js',
  'liquid-effects.js',
  'preview.js',
]);
const clientDirective = /^\s*['"]use client['"]\s*;/;
const clientChunks = [];
const serverDataChunks = [];
for (const [name, chunk] of Object.entries(graph)) {
  const code = readFileSync(path.join(packedRoot, 'dist', name), 'utf8');
  const hasReact =
    clientEntries.has(name) ||
    chunk.imports.some((id) => /^(?:react|react-dom)(?:\/|$)/.test(id)) ||
    chunk.modules.some((id) => /\.[jt]sx$/.test(id));
  if (hasReact) {
    assert.match(code, clientDirective, `Missing client boundary in packed React chunk: ${name}`);
    clientChunks.push(name);
  } else {
    assert.doesNotMatch(code, clientDirective, `Pure data must remain server-importable: ${name}`);
    serverDataChunks.push(name);
  }
}
for (const file of shippedSourceFiles.filter((file) => /(?:\.d\.ts|\.css)$/.test(file))) {
  assert.doesNotMatch(readFileSync(path.join(packedRoot, file), 'utf8'), clientDirective, file);
}
const rootChunks = reachableChunks(graph, 'index.js');
const receipt = {
  status: 'local release candidate, not published or product-accepted',
  checkedAt: new Date().toISOString(),
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  worktreeStatusAtCheck: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }),
  version: packed.version,
  tarball,
  sha256: sha(readFileSync(tarball)),
  packedBytes: statSync(tarball).size,
  fileCount: files.filter((file) => !file.endsWith('/')).length,
  matchingDistFiles,
  matchingBinFiles,
  preservedPublicPaths: publicFiles.length,
  runtimeEntries,
  typedConsumerModes: modes,
  clientChunks,
  serverDataChunks,
  rejectedLegacyContracts: true,
  packedCliMigration: true,
  rootChunks,
  rootRuntimeBytes: rootChunks.reduce(
    (sum, name) => sum + statSync(path.join(packedRoot, 'dist', name)).size,
    0,
  ),
  rootRuntimeGzipBytes: rootChunks.reduce(
    (sum, name) => sum + gzipSync(readFileSync(path.join(packedRoot, 'dist', name))).length,
    0,
  ),
  inspection,
  passed: true,
};
writeFileSync(path.join(output, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(
  JSON.stringify(
    {
      ...receipt,
      runtimeEntries: Object.fromEntries(
        Object.entries(runtimeEntries).map(([key, names]) => [key, names.length]),
      ),
    },
    null,
    2,
  ),
);
