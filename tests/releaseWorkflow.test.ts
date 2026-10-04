import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

const packageName = '@pieai/swimmer-ui-kit';
const query = (target: string, stdout: string, status = 0) => ({
  args: [
    'view',
    target,
    'version',
    'dist-tags',
    'versions',
    '--json',
    '--registry=https://registry.npmjs.org',
  ],
  status,
  signal: null as string | null,
  stdout,
  stderr: '',
});
const realBefore = () => ({
  registry: query(
    packageName,
    readFileSync(new URL('./fixtures/npm-12.2.0/registry.stdout.json', import.meta.url), 'utf8'),
  ),
  candidate: query(
    `${packageName}@${rc}`,
    readFileSync(new URL('./fixtures/npm-12.2.0/candidate.stdout.json', import.meta.url), 'utf8'),
    1,
  ),
});

function snapshot(value: unknown, version: string) {
  const metadata = value as ReturnType<typeof before>;
  if (value && typeof value === 'object' && 'registry' in value) return value;
  const present = metadata.versions?.includes(version);
  const target = `${packageName}@${version}`;
  return {
    registry: query(
      packageName,
      JSON.stringify([{ ...metadata, version: metadata['dist-tags']?.latest ?? metadata.version }]),
    ),
    candidate: present
      ? query(target, JSON.stringify([metadata]))
      : query(
          target,
          JSON.stringify({
            error: { code: 'E404', summary: `No match found for version ${version}` },
          }),
          1,
        ),
  };
}

// The release guard only reads these private metadata fixtures. No network or publication.
function check(version: string, mode: 'before' | 'after', first: unknown, second?: unknown) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'uikit-release-guard-'));
  try {
    writeFileSync(
      path.join(directory, 'package.json'),
      JSON.stringify({ name: '@pieai/swimmer-ui-kit', version }),
    );
    writeFileSync(path.join(directory, 'before.json'), JSON.stringify(snapshot(first, version)));
    if (second !== undefined)
      writeFileSync(path.join(directory, 'after.json'), JSON.stringify(snapshot(second, version)));
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
  it('accepts the exact npm 12.2.0 registry array and version-specific E404 captured from the real registry', () => {
    const result = check(rc, 'before', realBefore());
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain(`version=${rc}\ntag=next\nlatestBefore=2.14.0`);
  });
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
    const result = check(rc, 'before', {
      ...before(),
      version: '2.15.0',
      versions: [...before().versions, '2.15.0'],
      'dist-tags': { latest: '2.15.0' },
    });
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
  it.each(['E401', 'E403', 'E500', 'ENOTFOUND', 'ETIMEDOUT', 'EAI_AGAIN'])(
    'blocks a failed candidate query (%s), not treating it as absence',
    (code) => {
      const first = realBefore();
      first.candidate.stdout = JSON.stringify({ error: { code, summary: 'query failed' } });
      const result = check(rc, 'before', first);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Registry query failed');
    },
  );
  it('does not allow package-level E404 to masquerade as a missing candidate', () => {
    const first = realBefore();
    first.registry.status = 1;
    first.registry.stdout = first.candidate.stdout;
    const result = check(rc, 'before', first);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Registry query failed');
  });
  it.each(['', 'not json', '[]', '[{}, {}]', '{}'])(
    'blocks malformed successful registry output: %s',
    (stdout) => {
      const first = realBefore();
      first.registry.stdout = stdout;
      expect(check(rc, 'before', first).status).toBe(1);
    },
  );
  it('rejects version-looking E404 with a successful exit code', () => {
    const first = realBefore();
    first.candidate.status = 0;
    expect(check(rc, 'before', first).status).toBe(1);
  });
  it('rejects a generic package or permission E404 even though a version is absent', () => {
    const first = realBefore();
    first.candidate.stdout = JSON.stringify({ error: { code: 'E404', summary: 'Not found' } });
    expect(check(rc, 'before', first).status).toBe(1);
  });
  it('rejects signals and wrong-target queries', () => {
    const interrupted = realBefore();
    interrupted.candidate.signal = 'SIGTERM';
    expect(check(rc, 'before', interrupted).status).toBe(1);
    const wrong = realBefore();
    wrong.candidate.args[1] = `${packageName}@3.0.0-rc.0`;
    expect(check(rc, 'before', wrong).status).toBe(1);
  });
  it('requires actual candidate metadata after publication, not another E404', () => {
    expect(check(rc, 'after', realBefore(), realBefore()).status).toBe(1);
  });
  it('captures both actual command statuses and raw JSON while redacting accidental credentials', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'uikit-npm-capture-'));
    try {
      writeFileSync(
        path.join(directory, 'package.json'),
        JSON.stringify({ name: packageName, version: rc }),
      );
      const first = realBefore();
      const fake = path.join(directory, 'npm');
      writeFileSync(
        fake,
        '#!/usr/bin/env node\n' +
          `const replies = ${JSON.stringify([first.registry, first.candidate])};\n` +
          `const result = replies.find(r => JSON.stringify(r.args) === JSON.stringify(process.argv.slice(2)));\n` +
          `if (!result) process.exit(98);\n` +
          `process.stdout.write(result.stdout);\n` +
          `process.stderr.write('Authorization: Bearer fake-credential\\n');\n` +
          `process.exit(result.status);\n`,
      );
      chmodSync(fake, 0o755);
      const result = spawnSync(process.execPath, [script, 'capture', 'queries.json'], {
        cwd: directory,
        encoding: 'utf8',
        timeout: 10000,
        env: { ...process.env, PATH: `${directory}${path.delimiter}${process.env.PATH}` },
      });
      expect(result.status, result.stderr).toBe(0);
      const captured = JSON.parse(readFileSync(path.join(directory, 'queries.json'), 'utf8'));
      expect(captured.registry.status).toBe(0);
      expect(captured.registry.stdout).toBe(first.registry.stdout);
      expect(captured.candidate.status).toBe(1);
      expect(captured.candidate.stdout).toBe(first.candidate.stdout);
      expect(captured.candidate.stderr).toContain('[REDACTED]');
      expect(result.stderr).not.toContain('fake-credential');
      expect(check(rc, 'before', captured).status).toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
  it('keeps the workflow manual with one explicitly tagged publishing command and both guards', () => {
    expect(workflow).toMatch(/on:\s*\n\s+workflow_dispatch:/);
    expect(workflow).not.toMatch(/^\s+(?:push|release|workflow_run):/m);
    expect(workflow.match(/\bnpm publish\b/g)).toHaveLength(1);
    expect(workflow).toContain('--tag "$RELEASE_TAG"');
    expect(workflow).toContain('NPM_CONFIG_FETCH_RETRIES: "0"');
    expect(workflow).toContain('check-release-metadata.mjs before');
    expect(workflow).toContain('npm install -g npm@12.2.0');
    expect(workflow).not.toContain('npm@latest');
    expect(workflow).toContain('check-release-metadata.mjs capture .scratch/npm-before.json');
    expect(workflow).toContain('check-release-metadata.mjs capture .scratch/npm-after.json');
    expect(workflow).toContain('test "$GITHUB_RUN_ATTEMPT" = "1"');
    expect(workflow).toContain('check-release-metadata.mjs after');
    expect(workflow).toContain('pnpm check:next-consumer .scratch/release-candidate.tgz');
    expect(workflow.indexOf('check-release-metadata.mjs before')).toBeLessThan(
      workflow.indexOf('run: npm publish'),
    );
  });
});
