import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';

const baseline = JSON.parse(
  readFileSync(new URL('./fixtures/api-2.14.0.json', import.meta.url), 'utf8'),
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

describe('3.0 public contract and complete migration', () => {
  it('accounts for every removed or changed 2.14.0 name exactly once', () => {
    expect(baseline.exports).toHaveLength(295);
    const retained = new Map(current.map((item) => [item.name, item.kind]));
    const removed = baseline.exports
      .filter((item) => retained.get(item.name) !== item.kind)
      .map((item) => ({ name: item.name, kind: item.kind }));
    const migration = readFileSync(
      new URL('../docs/reference/migration-3.0.md', import.meta.url),
      'utf8',
    );
    const documented = [...migration.matchAll(/^\| `([^`]+)` \| (type|value) \| (.+) \|$/gm)].map(
      (row) => ({ name: row[1], kind: row[2] }),
    );
    expect(documented.sort((a, b) => a.name!.localeCompare(b.name!))).toEqual(
      removed.sort((a, b) => a.name.localeCompare(b.name)),
    );
    expect(new Set(documented.map((item) => item.name)).size).toBe(documented.length);
    expect(current.some((item) => item.name === 'GameOtpInput')).toBe(true);
    expect(current.some((item) => item.name === 'setLiquidGooeyBudget')).toBe(true);
    expect(current.some((item) => item.name === 'GameMaterialSwatches')).toBe(true);
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

  it('removes image assets and keeps styles, optional leaves and pure icon paths explicit', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    expect(pkg.exports).toEqual({
      '.': { types: './dist/index.d.ts', default: './dist/index.js' },
      './icon-paths': { types: './dist/icon-paths.d.ts', default: './dist/icon-paths.js' },
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
      './liquid-effects': {
        types: './dist/liquid-effects.d.ts',
        default: './dist/liquid-effects.js',
      },
      './preview': { types: './dist/preview.d.ts', default: './dist/preview.js' },
    });
    // The liquid body is deliberately opt-in, not a new root barrel export.
    // Keep the route allowlist exact: S8 explicitly retires image assets.
    // 2.7's one maintained headless dependency already supplies its positioning;
    // this feature must not introduce a renderer/agent dependency of its own.
    expect(pkg.dependencies).toEqual({ '@floating-ui/react': '0.27.20' });
  });
  it('ships the account menu only from the liquid-presence entry, never the root barrel', () => {
    expect(current.some((item) => item.name === 'GameAccountMenu')).toBe(false);
    const presence = readFileSync(new URL('../src/liquid-presence.ts', import.meta.url), 'utf8');
    expect(presence).toMatch(
      /export \{[^}]*\bGameAccountMenu\b[^}]*\} from '\.\/game\/GameAccountMenu\/GameAccountMenu'/,
    );
  });
});
