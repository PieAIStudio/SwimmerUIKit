import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';

const baseline = JSON.parse(
  readFileSync(new URL('../artifacts/api-audit/2.4.0.json', import.meta.url), 'utf8'),
) as {
  exports: { name: string; kind: string; module: string }[];
};
const entry = ts.createSourceFile(
  'index.ts',
  readFileSync(new URL('./index.ts', import.meta.url), 'utf8'),
  ts.ScriptTarget.Latest,
  true,
);

describe('2.x public contract retained through discoverability work', () => {
  it('retains every 2.4.0 root export and its value/type kind', () => {
    const current = entry.statements.flatMap((statement) => {
      if (
        !ts.isExportDeclaration(statement) ||
        !statement.exportClause ||
        !ts.isNamedExports(statement.exportClause)
      )
        return [];
      return statement.exportClause.elements.map((element) => ({
        name: element.name.text,
        kind: element.isTypeOnly || statement.isTypeOnly ? 'type' : 'value',
      }));
    });
    expect(baseline.exports).toHaveLength(272);
    // Internal owner filenames are discovery evidence, not a public promise.
    // Moving an implementation must not require breaking this contract test.
    for (const { name, kind } of baseline.exports) expect(current).toContainEqual({ name, kind });
  });

  it('preserves the existing package export-map routes', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    expect(pkg.exports).toEqual({
      '.': { types: './dist/index.d.ts', default: './dist/index.js' },
      './assets/*': './dist/assets/*',
      './styles.css': './dist/styles.css',
      './preview.css': './dist/preview.css',
      './fonts.css': './dist/fonts.css',
      './tailwind.css': './dist/tailwind.css',
      './package.json': './package.json',
    });
    // 2.7 explicitly adopts one maintained headless dependency for contextual
    // help. Keep the allowlist exact; this is not permission for other engines
    // or an export-map change. The earlier zero-dependency failure is retained
    // in this release's evidence as a reviewed contract change.
    expect(pkg.dependencies).toEqual({ '@floating-ui/react': '0.27.20' });
  });
});
