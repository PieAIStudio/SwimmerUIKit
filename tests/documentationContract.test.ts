import { readFileSync, readdirSync, lstatSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const read = (file: string) => readFileSync(file, 'utf8');
const entries = [
  'src/index.ts',
  'src/liquid-presence.ts',
  'src/liquid-effects.ts',
  'src/preview.ts',
];
function exportsOf(file: string): string[] {
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
  return source.statements.flatMap((node) =>
    ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)
      ? node.exportClause.elements.map((element) => element.name.text)
      : [],
  );
}
const guides = [
  'component-selection-guide.md',
  'theme-and-liquid.md',
  'design-tokens.md',
  'migration-3.0.md',
  'public-api-inventory.md',
  'documentation-map.md',
  'execution/current-work.md',
].map((file) => `docs/reference/${file}`);

describe('3.0 documentation convergence', () => {
  it('has one current guide per responsibility, with learning records kept off the startup shelf', () => {
    const walk = (directory: string): string[] =>
      readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        if (entry.name === 'learnings') return [];
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(file) : file.endsWith('.md') ? [file] : [];
      });
    expect(walk('docs/reference').sort()).toEqual([...guides].sort());
    for (const file of guides) expect(read(file), file).toContain('canonical: true');
  });

  it('does not advertise deleted public names or removed theme values in current instructions', () => {
    const available = new Set(entries.flatMap(exportsOf));
    const baseline = JSON.parse(read('tests/fixtures/api-2.14.0.json')) as {
      exports: Array<{ name: string }>;
    };
    const retired = baseline.exports
      .map((entry) => entry.name)
      .filter((name) => !available.has(name));
    const files = [
      ...guides.filter((file) => !file.endsWith('migration-3.0.md')),
      'README.md',
      'PRODUCT.md',
      'CONCEPTS.md',
    ];
    for (const file of files) {
      const body = read(file);
      for (const name of retired)
        expect(body, `${file}: ${name}`).not.toMatch(new RegExp(`\\b${name}\\b`));
      expect(body, file).not.toMatch(/data-game-ui-theme\s*=\s*["']night["']/);
      expect(body, file).not.toContain('src/theme.css');
      expect(body, file).not.toContain('零运行时依赖');
    }
  });

  it('preserves original archived evidence bytes rather than replacing screenshots with a new golden set', () => {
    const relocation = JSON.parse(read('docs/archive/relocations-3.0.json')) as {
      evidence: Array<{ from: string; to: string; sha256: string }>;
    };
    expect(relocation.evidence.length).toBe(276);
    for (const record of relocation.evidence) {
      expect(existsSync(record.to), record.to).toBe(true);
      if (record.from.endsWith('.md')) continue; // metadata and recovery links were added.
      expect(createHash('sha256').update(readFileSync(record.to)).digest('hex'), record.to).toBe(
        record.sha256,
      );
    }
  });

  it('retains actual site entries and linked governance, without reviving historical root scratch', () => {
    expect(lstatSync('CLAUDE.md').isSymbolicLink()).toBe(true);
    for (const name of readdirSync('docs/policy/shared-rules'))
      if (name.endsWith('.md'))
        expect(lstatSync(`docs/policy/shared-rules/${name}`).isSymbolicLink(), name).toBe(true);
    expect(read('vite.config.site.ts')).toContain('index.html');
    expect(read('vite.config.site.ts')).toContain('liquid.html');
    expect(read('.gitignore')).toContain('\nartifacts/\n');
    expect(read('.gitignore')).toContain('\nSCRATCH/\n');
    for (const folder of ['artifacts', 'SCRATCH']) {
      if (existsSync(folder))
        expect(readdirSync(folder).filter((name) => name !== '.DS_Store')).toEqual([]);
    }
  });
});
