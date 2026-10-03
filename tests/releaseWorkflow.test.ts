import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const script = fileURLToPath(new URL('../scripts/check-release-metadata.mjs', import.meta.url));
const workflow = readFileSync(
  new URL('../.github/workflows/npm-publish.yml', import.meta.url),
  'utf8',
);
const rc = '3.0.0-rc.1';
const before = () => ({
  version: '2.14.0',
  'dist-tags': { latest: '2.14.0' },
  versions: ['2.13.0', '2.14.0'],
});
const after = () => ({
  version: rc,
  'dist-tags': { latest: '2.14.0', next: rc },
  versions: ['2.13.0', '2.14.0', rc],
});

// The release guard only reads these private metadata fixtures. No network or publication.
function check(version: string, mode: 'before' | 'after', first: unknown, second?: unknown) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'uikit-release-guard-'));
  try {
    writeFileSync(
      path.join(directory, 'package.json'),
      JSON.stringify({ name: '@pieai/swimmer-ui-kit', version }),
    );
    writeFileSync(path.join(directory, 'before.json'), JSON.stringify(first));
    if (second !== undefined)
      writeFileSync(path.join(directory, 'after.json'), JSON.stringify(second));
    return spawnSync(
      process.execPath,
      [script, mode, 'before.json', ...(second === undefined ? [] : ['after.json'])],
      {
        cwd: directory,
        encoding: 'utf8',
        timeout: 10000,
      },
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe('one-shot release metadata guard', () => {
  it('selects next for a prerelease without moving latest', () => {
    const result = check(rc, 'before', before());
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain(`version=${rc}\ntag=next\nlatestBefore=2.14.0`);
  });
  it('selects latest for a stable version', () => {
    const result = check('3.0.0', 'before', before());
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('tag=latest');
  });
  it('rejects an already published version rather than pretending to publish', () => {
    const result = check(rc, 'before', after());
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('already published');
  });
  it('rejects incomplete registry data rather than treating failure as absence', () => {
    const result = check(rc, 'before', {});
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('registry metadata');
  });
  it('requires the specifically authorized rc.1 stable baseline', () => {
    const result = check(rc, 'before', { ...before(), 'dist-tags': { latest: '2.15.0' } });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('2.14.0');
  });
  it('accepts only a visible candidate with the exact next tag and unchanged latest', () => {
    const result = check(rc, 'after', before(), after());
    expect(result.status, result.stderr).toBe(0);
  });
  it('rejects a moved latest even when next is correct', () => {
    const result = check(rc, 'after', before(), {
      ...after(),
      'dist-tags': { latest: rc, next: rc },
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('latest changed');
  });
  it('rejects the wrong next tag', () => {
    const result = check(rc, 'after', before(), {
      ...after(),
      'dist-tags': { latest: '2.14.0', next: '3.0.0-rc.0' },
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('next does not match');
  });
  it('requires the requested version metadata, not only a tag', () => {
    const result = check(rc, 'after', before(), { ...after(), version: '2.14.0' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('version is not visible');
  });
  it('accepts a stable release through latest without modifying next', () => {
    const initial = { ...before(), 'dist-tags': { latest: '2.14.0', next: rc } };
    const final = {
      version: '3.0.0',
      versions: ['2.14.0', '3.0.0'],
      'dist-tags': { latest: '3.0.0', next: rc },
    };
    const result = check('3.0.0', 'after', initial, final);
    expect(result.status, result.stderr).toBe(0);
  });
  it('keeps the workflow manual with one explicitly tagged publishing command and both guards', () => {
    expect(workflow).toMatch(/on:\s*\n\s+workflow_dispatch:/);
    expect(workflow).not.toMatch(/^\s+(?:push|release|workflow_run):/m);
    expect(workflow.match(/\bnpm publish\b/g)).toHaveLength(1);
    expect(workflow).toContain('--tag "$RELEASE_TAG"');
    expect(workflow).toContain('NPM_CONFIG_FETCH_RETRIES: "0"');
    expect(workflow).toContain('check-release-metadata.mjs before');
    expect(workflow).toContain('check-release-metadata.mjs after');
    expect(workflow).toContain('pnpm check:next-consumer .scratch/release-candidate.tgz');
    expect(workflow.indexOf('check-release-metadata.mjs before')).toBeLessThan(
      workflow.indexOf('run: npm publish'),
    );
  });
});
