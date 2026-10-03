import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Read-only guard shared by CI and fixture tests. It never publishes or edits tags.
try {
  const [mode, beforeFile, afterFile] = process.argv.slice(2);
  assert.ok(
    mode === 'before' || mode === 'after',
    'Use before or after with registry snapshot files',
  );
  assert.ok(beforeFile, 'A before snapshot is required');
  const { name, version } = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(name, '@pieai/swimmer-ui-kit');
  assert.match(version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
  const tag = version.includes('-') ? 'next' : 'latest';
  const readRegistry = (file) => {
    const value = JSON.parse(readFileSync(file, 'utf8'));
    assert.ok(
      value &&
        typeof value.version === 'string' &&
        value['dist-tags'] &&
        typeof value['dist-tags'].latest === 'string' &&
        Array.isArray(value.versions) &&
        value.versions.every((item) => typeof item === 'string'),
      'Invalid registry metadata; a failed lookup is not evidence of an unpublished version',
    );
    return value;
  };
  const before = readRegistry(beforeFile);
  assert.ok(
    !before.versions.includes(version),
    `${version} is already published; do not repeat publication`,
  );
  if (version === '3.0.0-rc.1') {
    assert.equal(
      before['dist-tags'].latest,
      '2.14.0',
      'Owner authorized rc.1 only with latest at 2.14.0',
    );
  }
  if (mode === 'before') {
    console.log(`version=${version}\ntag=${tag}\nlatestBefore=${before['dist-tags'].latest}`);
  } else {
    assert.ok(afterFile, 'An after snapshot is required');
    const after = readRegistry(afterFile);
    assert.ok(
      after.version === version && after.versions.includes(version),
      'Requested version is not visible',
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
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
