import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

// Read-only evidence collection and guards. This script never publishes or edits tags.
const queryArgs = (target) => [
  'view',
  target,
  'version',
  'dist-tags',
  'versions',
  '--json',
  '--registry=https://registry.npmjs.org',
];
const redact = (text = '') =>
  String(text)
    .replace(/\b(?:npm_|gh[pousr]_|github_pat_)[A-Za-z0-9_]+/g, '[REDACTED]')
    .replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/g, '$1[REDACTED]@')
    .replace(/(Bearer\s+)\S+/gi, '$1[REDACTED]');

function capture(target) {
  const args = queryArgs(target);
  const result = spawnSync('npm', args, {
    encoding: 'utf8',
    timeout: 90000,
    maxBuffer: 1024 * 1024,
    env: { ...process.env, NPM_CONFIG_FETCH_RETRIES: '0' },
  });
  const evidence = {
    args,
    status: result.status,
    signal: result.signal,
    stdout: redact(result.stdout ?? ''),
    stderr: redact(result.stderr ?? ''),
    ...(result.error ? { error: redact(result.error.message) } : {}),
  };
  // Public metadata only. No environment, npmrc, authentication headers or debug logs.
  console.error(JSON.stringify(evidence, null, 2));
  return evidence;
}

function readQuery(query, target, allowMissingVersion) {
  assert.ok(query && typeof query === 'object', 'Missing registry query evidence');
  assert.deepEqual(query.args, queryArgs(target), 'Registry query target or fields do not match');
  assert.ok(
    query.signal === null && !query.error && Number.isInteger(query.status),
    'Registry query did not complete',
  );
  assert.equal(typeof query.stdout, 'string', 'Registry query output is missing');
  let value;
  try {
    value = JSON.parse(query.stdout);
  } catch {
    throw new Error('Invalid registry metadata: npm returned empty or non-JSON output');
  }
  if (query.status !== 0) {
    // Only the exact version miss is normal. The caller separately proves that
    // the package exists, latest is intact and its version list omits this version.
    const expectedVersion = target.slice(target.lastIndexOf('@') + 1);
    if (
      allowMissingVersion &&
      query.status === 1 &&
      value?.error?.code === 'E404' &&
      value.error.summary === `No match found for version ${expectedVersion}`
    )
      return null;
    throw new Error(
      `Registry query failed (${value?.error?.code ?? query.status}); not evidence of an unpublished version`,
    );
  }
  // npm 12 always returns an array for successful view --json. Never silently
  // select one result from an empty or ambiguous multi-version response.
  if (Array.isArray(value)) {
    assert.equal(value.length, 1, 'Invalid registry metadata: expected exactly one result');
    [value] = value;
  }
  assert.ok(
    value &&
      typeof value.version === 'string' &&
      value['dist-tags'] &&
      !Array.isArray(value['dist-tags']) &&
      typeof value['dist-tags'].latest === 'string' &&
      Object.values(value['dist-tags']).every((tag) => typeof tag === 'string') &&
      Array.isArray(value.versions) &&
      value.versions.every((item) => typeof item === 'string') &&
      value.versions.includes(value['dist-tags'].latest),
    'Invalid registry metadata; a failed lookup is not evidence of an unpublished version',
  );
  return value;
}

try {
  const [mode, beforeFile, afterFile] = process.argv.slice(2);
  assert.ok(
    ['capture', 'before', 'after'].includes(mode),
    'Use capture, before or after with snapshot files',
  );
  assert.ok(beforeFile, 'A snapshot path is required');
  const { name, version } = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(name, '@pieai/swimmer-ui-kit');
  assert.match(version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
  const target = `${name}@${version}`;
  const tag = version.includes('-') ? 'next' : 'latest';
  if (mode === 'capture') {
    // Capture preserves nonzero status as evidence. Only before/after decide
    // whether it represents normal absence or a release-blocking failure.
    const snapshot = { registry: capture(name), candidate: capture(target) };
    writeFileSync(beforeFile, JSON.stringify(snapshot, null, 2) + '\n');
  } else {
    const initial = JSON.parse(readFileSync(beforeFile, 'utf8'));
    const before = readQuery(initial.registry, name, false);
    assert.ok(
      !before.versions.includes(version),
      `${version} is already published; do not repeat publication`,
    );
    assert.equal(
      before.version,
      before['dist-tags'].latest,
      'Registry latest metadata is inconsistent',
    );
    if (version === '3.0.0-rc.1') {
      assert.equal(
        before['dist-tags'].latest,
        '2.14.0',
        'Owner authorized rc.1 only with latest at 2.14.0',
      );
    }
    assert.equal(
      readQuery(initial.candidate, target, true),
      null,
      `${version} is already published; do not repeat publication`,
    );
    if (mode === 'before') {
      console.log(`version=${version}\ntag=${tag}\nlatestBefore=${before['dist-tags'].latest}`);
    } else {
      assert.ok(afterFile, 'An after snapshot is required');
      const final = JSON.parse(readFileSync(afterFile, 'utf8'));
      const registry = readQuery(final.registry, name, false);
      const after = readQuery(final.candidate, target, false);
      assert.ok(
        after.version === version &&
          after.versions.includes(version) &&
          registry.versions.includes(version),
        'Requested version is not visible',
      );
      assert.deepEqual(
        registry['dist-tags'],
        after['dist-tags'],
        'Registry tag snapshots disagree',
      );
      assert.equal(after['dist-tags'][tag], version, `${tag} does not match the released version`);
      if (tag === 'next') {
        assert.equal(
          after['dist-tags'].latest,
          before['dist-tags'].latest,
          'latest changed during prerelease publication',
        );
      } else {
        assert.equal(
          after['dist-tags'].next,
          before['dist-tags'].next,
          'next changed during stable publication',
        );
      }
      console.log(
        JSON.stringify({ verified: true, name, version, tag, distTags: after['dist-tags'] }),
      );
    }
  }
} catch (error) {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
}
