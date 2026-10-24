import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const script = path.resolve('migration/uikit-4-alpha-2/replace.mjs');

describe('UIKit 4.0 alpha.2 migration tool', () => {
  it('rewrites public names and conflict-safe token names', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'swimmer-uikit4-migration-'));
    try {
      const file = path.join(directory, 'consumer.tsx');
      writeFileSync(
        file,
        'import { GameButton } from "@pieai/swimmer-ui-kit";\n' +
          'const token = "--game-ui-space-2";\n',
      );
      const result = spawnSync(process.execPath, [script, '--write', directory], {
        encoding: 'utf8',
      });
      expect(result.status, result.stderr).toBe(0);
      expect(readFileSync(file, 'utf8')).toBe(
        'import { Button } from "@pieai/swimmer-ui-kit";\n' +
          'const token = "--swimmer-game-space-2";\n',
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('check mode rejects legacy names and accepts the rewritten fixture', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'swimmer-uikit4-migration-'));
    try {
      const file = path.join(directory, 'consumer.css');
      writeFileSync(file, '.button { color: var(--game-ui-text); }\n');
      const legacy = spawnSync(process.execPath, [script, '--check', directory], {
        encoding: 'utf8',
      });
      expect(legacy.status).toBe(1);
      const rewrite = spawnSync(process.execPath, [script, '--write', directory], {
        encoding: 'utf8',
      });
      expect(rewrite.status, rewrite.stderr).toBe(0);
      const current = spawnSync(process.execPath, [script, '--check', directory], {
        encoding: 'utf8',
      });
      expect(current.status, current.stderr).toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
