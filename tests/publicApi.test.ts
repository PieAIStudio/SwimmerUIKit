import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';

const baseline = JSON.parse(
  readFileSync(new URL('../artifacts/api-audit/2.4.0.json', import.meta.url), 'utf8'),
) as {
  exports: { name: string; kind: string; module: string }[];
};
const entry = ts.createSourceFile(
  'index.ts',
  readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8'),
  ts.ScriptTarget.Latest,
  true,
);
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

describe('2.x public contract retained through discoverability work', () => {
  it('retains every 2.4.0 root export and its value/type kind', () => {
    expect(baseline.exports).toHaveLength(272);
    // Internal owner filenames are discovery evidence, not a public promise.
    // Moving an implementation must not require breaking this contract test.
    for (const { name, kind } of baseline.exports) expect(current).toContainEqual({ name, kind });
  });

  it('documents every current export exactly once with an existing definition link', () => {
    const inventoryUrl = new URL('../docs/reference/public-api-inventory.md', import.meta.url);
    const inventory = readFileSync(inventoryUrl, 'utf8');
    const rows = [
      ...inventory.matchAll(/^\| `([^`]+)` \| (type|value) \| \[source\]\(([^)]+)\) \|$/gm),
    ];
    const documented = rows.map((row) => ({ name: row[1], kind: row[2] }));
    expect(documented.sort((a, b) => a.name!.localeCompare(b.name!))).toEqual(
      [...current].sort((a, b) => a.name.localeCompare(b.name)),
    );
    for (const row of rows) expect(existsSync(new URL(row[3]!, inventoryUrl)), row[1]).toBe(true);
  });

  it('preserves existing routes and adds only the optional liquid-presence leaf', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    expect(pkg.exports).toEqual({
      '.': { types: './dist/index.d.ts', default: './dist/index.js' },
      './assets/*': './dist/assets/*',
      './styles.css': './dist/styles.css',
      './preview.css': './dist/preview.css',
      './fonts.css': './dist/fonts.css',
      './tailwind.css': './dist/tailwind.css',
      './package.json': './package.json',
      './liquid-presence': {
        types: './dist/liquid-presence.d.ts',
        default: './dist/liquid-presence.js',
      },
      './liquid-presence.css': './dist/liquid-presence.css',
    });
    // The liquid body is deliberately opt-in, not a new root barrel export.
    // Keep the route allowlist exact and preserve every preexisting path above.
    // 2.7's one maintained headless dependency already supplies its positioning;
    // this feature must not introduce a renderer/agent dependency of its own.
    expect(pkg.dependencies).toEqual({ '@floating-ui/react': '0.27.20' });
  });
});
