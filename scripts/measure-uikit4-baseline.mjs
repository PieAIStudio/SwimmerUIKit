#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

const reportDir = path.resolve(
  process.env.BASELINE_REPORT_DIR ?? '.reports/2026-10-24-uikit4-plan',
);
const logsDir = path.join(reportDir, 'logs');
mkdirSync(logsDir, { recursive: true });

const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const codeExtensions = new Set(['.cjs', '.css', '.js', '.jsx', '.mjs', '.ts', '.tsx']);
const consumerCodeExtensions = new Set([
  '.cjs',
  '.css',
  '.js',
  '.jsx',
  '.mjs',
  '.ts',
  '.tsx',
  '.vue',
  '.svelte',
]);
const ignoredDirectoryNames = new Set([
  '.git',
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'site-dist',
  'storybook-static',
  '.devspace-reports',
  '.devspace-visual',
  '.reports',
  '.scratch',
  '.studio',
  '.worktrees',
  'SCRATCH',
  'TEMP',
  'artifacts',
]);

const consumers = [
  { name: 'University', path: '/Users/yuanfei/PieAI/University' },
  { name: 'ClaudeSync', path: '/Users/yuanfei/PieAI/MatrixAPPs/apps/ClaudeSync' },
  { name: 'OnePlace', path: '/Users/yuanfei/PieAI/MatrixAPPs/apps/OnePlace' },
  { name: 'SwimmerParty-Website', path: '/Users/yuanfei/PieAI/SwimmerParty-Website' },
  { name: 'OwnMySpace', path: '/Users/yuanfei/PieAI/OwnMySpace' },
  { name: 'AccountCenter', path: '/Users/yuanfei/PieAI/SwimmerBackend/apps/account-center' },
  { name: 'Directing', path: '/Users/yuanfei/PieAI/Directing' },
  { name: 'SwimInAI-Website', path: '/Users/yuanfei/PieAI/SwimInAI-Website' },
  { name: 'YaZu', path: '/Users/yuanfei/PieAI/YaZu' },
  { name: 'TuringPact', path: '/Users/yuanfei/PieAI/TuringPact' },
  { name: 'Break', path: '/Users/yuanfei/PieAI/Break' },
  { name: 'HQ-board', path: '/Users/yuanfei/PieAI/HQ/packages/hq' },
];

function walkFiles(rootDir, extensions, { skipIgnored = true } = {}) {
  if (!existsSync(rootDir)) return [];
  const files = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (skipIgnored && entry.isDirectory() && ignoredDirectoryNames.has(entry.name)) continue;
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (entry.isFile() && extensions.has(path.extname(entry.name))) files.push(target);
    }
  };
  visit(rootDir);
  return files.sort();
}

function runCommand(name, args, options = {}) {
  const startedAt = new Date().toISOString();
  const start = process.hrtime.bigint();
  const result = spawnSync('pnpm', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    ...options,
  });
  const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
  writeFileSync(
    path.join(logsDir, `${name}.log`),
    `${result.stdout ?? ''}\n${result.stderr ?? ''}`,
  );
  const receipt = {
    name,
    command: ['pnpm', ...args].join(' '),
    startedAt,
    durationMs: Math.round(durationMs),
    status: result.status,
    signal: result.signal,
  };
  if (result.error) receipt.error = result.error.message;
  if (result.status !== 0) {
    throw new Error(`${name} failed; inspect ${path.join(logsDir, `${name}.log`)}`);
  }
  return receipt;
}

function byteReceipt(file) {
  const data = readFileSync(file);
  return {
    bytes: data.byteLength,
    gzipBytes: gzipSync(data, { level: 9 }).byteLength,
    sha256: createHash('sha256').update(data).digest('hex'),
  };
}

function resolveExportTarget(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return null;
  return value.default ?? value.import ?? value.require ?? null;
}

function measurePublicEntries() {
  const entries = [];
  for (const [entry, value] of Object.entries(packageJson.exports)) {
    const target = resolveExportTarget(value);
    if (!target || target.startsWith('#')) continue;
    const file = path.resolve(root, target);
    assert.ok(existsSync(file), `${entry} target does not exist: ${target}`);
    entries.push({ entry, target, ...byteReceipt(file) });
  }
  return entries;
}

function parsePublicExports() {
  const leaves = [
    ['.', 'src/index.ts'],
    ['./liquid-presence', 'src/liquid-presence.ts'],
    ['./liquid-effects', 'src/liquid-effects.ts'],
    ['./preview', 'src/preview.ts'],
    ['./icon-paths', 'src/icon-paths.ts'],
  ];
  const names = [];
  for (const [entry, relativeFile] of leaves) {
    const source = readFileSync(path.join(root, relativeFile), 'utf8');
    const declarationPattern = /export\s+(type\s+)?\{([\s\S]*?)\}(?:\s+from\s+[^;]+)?\s*;/g;
    for (const match of source.matchAll(declarationPattern)) {
      const declarationIsType = Boolean(match[1]);
      for (const rawItem of match[2].split(',')) {
        const item = rawItem.trim();
        if (!item) continue;
        const itemIsType = declarationIsType || /^type\s+/.test(item);
        const withoutType = item.replace(/^type\s+/, '');
        const exported = withoutType
          .split(/\s+as\s+/)
          .at(-1)
          ?.trim();
        if (exported) names.push({ entry, name: exported, kind: itemIsType ? 'type' : 'value' });
      }
    }
  }
  return names;
}

function importTarget(sourceFile, specifier) {
  if (!specifier.startsWith('.')) return null;
  const base = path.resolve(path.dirname(sourceFile), specifier);
  const candidates = [
    base,
    ...['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css'].map((ext) => `${base}${ext}`),
    ...['index.ts', 'index.tsx', 'index.js', 'index.css'].map((name) => path.join(base, name)),
  ];
  return (
    candidates.find((candidate) => existsSync(candidate) && lstatSync(candidate).isFile()) ?? null
  );
}

function topLevelSourceDir(file) {
  const relative = path.relative(path.join(root, 'src'), file);
  return relative.split(path.sep)[0] || 'root';
}

function moduleReferences() {
  const edges = [];
  for (const file of walkFiles(path.join(root, 'src'), codeExtensions)) {
    const source = readFileSync(file, 'utf8');
    const runtime = !/\.(?:test|stories)\.[^.]+$/.test(file);
    const importPattern = /(?:from\s*|import\s*\(?\s*)['"]([^'"]+)['"]/g;
    for (const match of source.matchAll(importPattern)) {
      const targetFile = importTarget(file, match[1]);
      if (!targetFile) continue;
      const from = topLevelSourceDir(file);
      const to = topLevelSourceDir(targetFile);
      if (from === to) continue;
      const reason =
        runtime && from === 'game' && ['controls', 'feedback', 'containers'].includes(to)
          ? 'game-to-ui-layer'
          : runtime && ['controls', 'feedback', 'containers'].includes(from) && to === 'game'
            ? 'ui-to-game-layer'
            : runtime &&
                from === 'liquid' &&
                ['controls', 'feedback', 'containers', 'game'].includes(to)
              ? 'liquid-to-surface-layer'
              : runtime && from === 'tokens' && to !== 'tokens'
                ? 'tokens-to-runtime'
                : runtime && from === 'icons' && to !== 'icons'
                  ? 'icons-to-runtime'
                  : null;
      edges.push({
        runtime,
        from,
        to,
        importer: path.relative(root, file),
        imported: path.relative(root, targetFile),
        specifier: match[1],
        ...(reason ? { reason } : {}),
      });
    }
  }
  return {
    all: edges,
    suspects: edges.filter((edge) => edge.reason),
  };
}

function packageSpecifiersFromText(source) {
  const result = [];
  const pattern = /@pieai\/swimmer-ui-kit(?:\/(?:[A-Za-z0-9_.-]+))?/g;
  for (const match of source.matchAll(pattern)) result.push(match[0]);
  return [...new Set(result)];
}

function entryFromSpecifier(specifier) {
  const suffix = specifier.replace('@pieai/swimmer-ui-kit', '');
  return suffix ? `.${suffix}` : '.';
}

function namedItems(block) {
  return block
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) =>
      item
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0]
        .trim(),
    )
    .filter(Boolean);
}

function nearestPackageInfo(consumerPath) {
  const candidates = [];
  let current = consumerPath;
  for (let i = 0; i < 4; i += 1) {
    candidates.push(path.join(current, 'package.json'));
    current = path.dirname(current);
  }
  const packageFiles = walkFiles(consumerPath, new Set(['.json'])).filter(
    (file) => path.basename(file) === 'package.json',
  );
  for (const file of packageFiles.slice(0, 12)) candidates.push(file);
  for (const file of [...new Set(candidates)]) {
    if (!existsSync(file)) continue;
    try {
      const json = JSON.parse(readFileSync(file, 'utf8'));
      if (
        json.dependencies?.['@pieai/swimmer-ui-kit'] ||
        json.devDependencies?.['@pieai/swimmer-ui-kit'] ||
        json.peerDependencies?.['@pieai/swimmer-ui-kit']
      ) {
        return { file: path.relative(consumerPath, file) || 'package.json', package: json };
      }
    } catch {
      // Ignore non-JSON package manifests; source scanning remains read-only.
    }
  }
  return null;
}

function gitRead(consumerPath, args) {
  const result = spawnSync('git', ['-C', consumerPath, ...args], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}

function auditConsumers(publicNames) {
  const namesByEntry = new Map();
  for (const item of publicNames) {
    if (!namesByEntry.has(item.entry)) namesByEntry.set(item.entry, new Map());
    namesByEntry.get(item.entry).set(item.name, { ...item, uses: [], ambiguous: [] });
  }
  const entryUsage = new Map();
  const consumersReceipt = [];

  for (const consumer of consumers) {
    const consumerReceipt = {
      name: consumer.name,
      path: consumer.path,
      exists: existsSync(consumer.path),
      commit: existsSync(path.join(consumer.path, '.git'))
        ? gitRead(consumer.path, ['rev-parse', 'HEAD'])
        : null,
      dirty: existsSync(path.join(consumer.path, '.git'))
        ? gitRead(consumer.path, ['status', '--porcelain'])
        : null,
      package: null,
      files: 0,
    };
    if (!consumerReceipt.exists) {
      consumersReceipt.push(consumerReceipt);
      continue;
    }
    consumerReceipt.package = nearestPackageInfo(consumer.path);
    const files = walkFiles(consumer.path, consumerCodeExtensions);
    consumerReceipt.files = files.length;
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      if (file.endsWith('package.json')) {
        for (const specifier of packageSpecifiersFromText(source)) {
          const entry = entryFromSpecifier(specifier);
          if (!entryUsage.has(entry)) entryUsage.set(entry, []);
          entryUsage.get(entry).push({
            consumer: consumer.name,
            file: path.relative(consumer.path, file),
            kind: 'manifest',
          });
        }
        continue;
      }
      const relativeFile = path.relative(consumer.path, file);
      const packagePattern =
        /(?:from\s*|import\s*\(?\s*|require\s*\(\s*)['"](@pieai\/swimmer-ui-kit(?:\/[A-Za-z0-9_.-]+)?)['"]/g;
      for (const match of source.matchAll(packagePattern)) {
        const specifier = match[1];
        const entry = entryFromSpecifier(specifier);
        if (!entryUsage.has(entry)) entryUsage.set(entry, []);
        entryUsage.get(entry).push({ consumer: consumer.name, file: relativeFile, kind: 'import' });

        const entryNames = namesByEntry.get(entry);
        if (!entryNames) continue;
        const namedImports =
          /(?:import|export)\s+(?:type\s+)?\{([^{}]*?)\}\s+from\s*['"]([^'"]+)['"]/g;
        for (const namedMatch of source.matchAll(namedImports)) {
          if (namedMatch[2] !== specifier) continue;
          for (const name of namedItems(namedMatch[1])) {
            const item = entryNames.get(name);
            if (item) item.uses.push({ consumer: consumer.name, file: relativeFile });
          }
        }
        const namespaceImports =
          /(?:import|export)\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s*['"]([^'"]+)['"]/g;
        for (const namespaceMatch of source.matchAll(namespaceImports)) {
          if (namespaceMatch[2] !== specifier) continue;
          const namespace = namespaceMatch[1];
          const properties = [
            ...source.matchAll(new RegExp(`\\b${namespace}\\.([A-Za-z_$][\\w$]*)`, 'g')),
          ].map((property) => property[1]);
          if (properties.length) {
            for (const name of properties) {
              const item = entryNames.get(name);
              if (item)
                item.uses.push({ consumer: consumer.name, file: relativeFile, kind: 'namespace' });
            }
          } else {
            for (const item of entryNames.values())
              item.ambiguous.push({ consumer: consumer.name, file: relativeFile });
          }
        }
      }
    }
    consumersReceipt.push(consumerReceipt);
  }

  const entries = Object.fromEntries(
    [...entryUsage.entries()].map(([entry, uses]) => [entry, { count: uses.length, uses }]),
  );
  const names = {};
  for (const [entry, entryNames] of namesByEntry) {
    names[entry] = Object.fromEntries(
      [...entryNames.entries()].map(([name, item]) => [
        name,
        {
          kind: item.kind,
          uses: item.uses,
          ambiguous: item.ambiguous,
        },
      ]),
    );
  }
  const zero = [];
  const ambiguous = [];
  for (const [entry, entryNames] of namesByEntry) {
    for (const [name, item] of entryNames) {
      if (!item.uses.length && !item.ambiguous.length) zero.push({ entry, name, kind: item.kind });
      if (item.ambiguous.length)
        ambiguous.push({ entry, name, kind: item.kind, consumers: item.ambiguous });
    }
  }
  return { consumers: consumersReceipt, entries, names, zero, ambiguous };
}

function createMinimalConsumer() {
  const fixture = mkdtempSync(path.join(os.tmpdir(), 'swimmer-uikit4-button-'));
  const write = (relativeFile, content) => {
    const target = path.join(fixture, relativeFile);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  };
  write(
    'index.html',
    '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.js"></script></body></html>\n',
  );
  write(
    'src/main.js',
    `import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { GameButton } from '@pieai/swimmer-ui-kit';
import '@pieai/swimmer-ui-kit/styles.css';
createRoot(document.getElementById('root')).render(createElement(GameButton, { variant: 'primary' }, 'One button'));
`,
  );
  mkdirSync(path.join(fixture, 'node_modules/@pieai'), { recursive: true });
  const link = (name, target) => {
    const destination = path.join(fixture, 'node_modules', name);
    mkdirSync(path.dirname(destination), { recursive: true });
    symlinkSync(target, destination, 'dir');
  };
  link('@pieai/swimmer-ui-kit', root);
  for (const dependency of ['react', 'react-dom', '@floating-ui/react']) {
    const target = path.join(root, 'node_modules', dependency);
    if (existsSync(target)) link(dependency, target);
  }
  const vite = path.join(root, 'node_modules/vite/bin/vite.js');
  const result = spawnSync(process.execPath, [vite, 'build'], {
    cwd: fixture,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  writeFileSync(
    path.join(logsDir, 'minimal-consumer.log'),
    `${result.stdout ?? ''}\n${result.stderr ?? ''}`,
  );
  if (result.status !== 0) {
    rmSync(fixture, { recursive: true, force: true });
    throw new Error('minimal consumer build failed; inspect minimal-consumer.log');
  }
  const outputFiles = walkFiles(path.join(fixture, 'dist'), new Set(['.css', '.js']), {
    skipIgnored: false,
  });
  const byKind = (extension) => {
    const files = outputFiles.filter((file) => path.extname(file) === extension);
    return {
      files: files.map((file) => ({ file: path.relative(fixture, file), ...byteReceipt(file) })),
      bytes: files.reduce((sum, file) => sum + readFileSync(file).byteLength, 0),
      gzipBytes: files.reduce(
        (sum, file) => sum + gzipSync(readFileSync(file), { level: 9 }).byteLength,
        0,
      ),
    };
  };
  const resultReceipt = {
    fixture,
    js: byKind('.js'),
    css: byKind('.css'),
  };
  resultReceipt.total = {
    bytes: resultReceipt.js.bytes + resultReceipt.css.bytes,
    gzipBytes: resultReceipt.js.gzipBytes + resultReceipt.css.gzipBytes,
  };
  rmSync(fixture, { recursive: true, force: true });
  return resultReceipt;
}

const receipt = {
  task: 'UIKit 4.0 alpha A baseline',
  generatedAt: new Date().toISOString(),
  sourceCommit: spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim(),
  package: { name: packageJson.name, version: packageJson.version },
  timing: { builds: [], tests: [] },
};

try {
  for (let i = 1; i <= 3; i += 1) receipt.timing.builds.push(runCommand(`build-${i}`, ['build']));
  for (let i = 1; i <= 3; i += 1) receipt.timing.tests.push(runCommand(`test-${i}`, ['test']));
  receipt.entries = measurePublicEntries();
  receipt.pack = runCommand('pack', ['pack', '--out', path.join(reportDir, 'uikit-3.2.5.tgz')]);
  receipt.packArtifact = byteReceipt(path.join(reportDir, 'uikit-3.2.5.tgz'));
  receipt.minimalConsumer = createMinimalConsumer();
  receipt.publicNames = parsePublicExports();
  receipt.moduleReferences = moduleReferences();
  receipt.consumerAudit = auditConsumers(receipt.publicNames);
  receipt.status = 'passed';
} catch (error) {
  receipt.status = 'failed';
  receipt.error = error instanceof Error ? error.message : String(error);
  writeFileSync(path.join(reportDir, 'baseline.json'), JSON.stringify(receipt, null, 2) + '\n');
  throw error;
} finally {
  writeFileSync(path.join(reportDir, 'baseline.json'), JSON.stringify(receipt, null, 2) + '\n');
}

console.log(`Baseline receipt written to ${path.join(reportDir, 'baseline.json')}`);
console.log(
  `Source ${receipt.sourceCommit}; package ${packageJson.version}; status ${receipt.status}`,
);
