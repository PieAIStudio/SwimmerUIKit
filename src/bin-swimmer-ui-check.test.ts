import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

// End-to-end smoke test for the published `swimmer-ui-check` CLI (bin/swimmer-ui-check.mjs):
// spawns the real script against throwaway fixture files instead of importing
// its internals, since consumers invoke it exactly this way (`npx swimmer-ui-check`).
const SRC = dirname(fileURLToPath(import.meta.url));
const BIN = join(SRC, '..', 'bin', 'swimmer-ui-check.mjs');

function run(dir: string): { status: number; stdout: string } {
  try {
    const stdout = execFileSync('node', [BIN, dir], { encoding: 'utf8' });
    return { status: 0, stdout };
  } catch (error) {
    const e = error as { status: number; stdout: string };
    return { status: e.status, stdout: e.stdout };
  }
}

describe('bin/swimmer-ui-check.mjs', () => {
  let dir: string;

  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it('flags a raw color inside a component rule but not one inside :root', () => {
    dir = mkdtempSync(join(tmpdir(), 'swimmer-ui-check-'));
    writeFileSync(
      join(dir, 'app.css'),
      `:root {\n  --brand-accent: #7c5cff;\n}\n.card {\n  background: #123456;\n}\n`,
    );

    const { status, stdout } = run(dir);

    expect(status).toBe(1);
    expect(stdout).toContain('app.css:5');
    expect(stdout).toContain('#123456');
    expect(stdout).not.toContain('#7c5cff');
  });

  it('exits 0 on a file with no raw colors outside token blocks', () => {
    dir = mkdtempSync(join(tmpdir(), 'swimmer-ui-check-'));
    writeFileSync(
      join(dir, 'app.css'),
      `:root {\n  --brand-accent: #7c5cff;\n}\n.card {\n  background: var(--brand-accent);\n}\n`,
    );

    const { status, stdout } = run(dir);

    expect(status).toBe(0);
    expect(stdout).toContain('Clean');
  });

  it('also treats an attribute-selector theme block (e.g. night theme) as allowed', () => {
    dir = mkdtempSync(join(tmpdir(), 'swimmer-ui-check-'));
    writeFileSync(
      join(dir, 'theme.css'),
      `[data-game-ui-theme='night'] {\n  --brand-accent: #ef8148;\n}\n`,
    );

    const { status } = run(dir);

    expect(status).toBe(0);
  });
});
