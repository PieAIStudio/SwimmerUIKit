import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));
const walk = (directory: string): string[] =>
  readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const file = `${directory}/${entry.name}`;
    return entry.isDirectory() ? walk(file) : entry.isFile() ? [file] : [];
  });
const files = walk('src').filter(
  (file) => /\.tsx?$/.test(file) && !/\.(?:test|stories)\.tsx?$/.test(file),
);
const sourceSet = new Set(files);
const edges = files.flatMap((file) => {
  const source = ts.createSourceFile(
    file,
    readFileSync(path.join(root, file), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  return source.statements.flatMap((statement) => {
    if (
      (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !statement.moduleSpecifier.text.startsWith('.')
    )
      return [];
    const base = path.posix.normalize(
      path.posix.join(path.posix.dirname(file), statement.moduleSpecifier.text),
    );
    const target = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`].find((candidate) =>
      sourceSet.has(candidate),
    );
    if (!target) return []; // External assets are checked by the build, not this TS graph.
    const clause = ts.isImportDeclaration(statement) ? statement.importClause : undefined;
    const bindings =
      clause?.namedBindings ??
      (ts.isExportDeclaration(statement) ? statement.exportClause : undefined);
    const onlyNamedTypes =
      !clause?.name &&
      bindings &&
      (ts.isNamedImports(bindings) || ts.isNamedExports(bindings)) &&
      bindings.elements.length > 0 &&
      bindings.elements.every((element) => element.isTypeOnly);
    const typeOnly = Boolean(
      clause?.isTypeOnly ||
      (ts.isExportDeclaration(statement) && statement.isTypeOnly) ||
      onlyNamedTypes,
    );
    return [{ file, target, typeOnly }];
  });
});

describe('3.0 source ownership', () => {
  it('keeps tokens independent of component and game implementations, including type imports', () => {
    expect(
      edges.filter(
        ({ file, target }) => file.startsWith('src/tokens/') && !target.startsWith('src/tokens/'),
      ),
    ).toEqual([]);
  });

  it('does not make basic controls or rendering primitives depend on the game domain', () => {
    expect(
      edges.filter(
        ({ file, target }) =>
          /^src\/(?:controls|feedback|icons|liquid)\//.test(file) && target.startsWith('src/game/'),
      ),
    ).toEqual([]);
  });

  it('resolves implementation imports directly instead of through the public root barrel', () => {
    expect(
      edges.filter(
        ({ file, target }) => path.posix.dirname(file) !== 'src' && target === 'src/index.ts',
      ),
    ).toEqual([]);
  });

  it('has no runtime import cycles', () => {
    const pending = new Map(files.map((file) => [file, new Set<string>()]));
    for (const { file, target, typeOnly } of edges) if (!typeOnly) pending.get(file)!.add(target);
    let removed: boolean;
    do {
      removed = false;
      for (const [file, dependencies] of pending) {
        if (dependencies.size) continue;
        pending.delete(file);
        for (const others of pending.values()) others.delete(file);
        removed = true;
      }
    } while (removed);
    expect(
      [...pending].map(([file, dependencies]) => ({ file, dependencies: [...dependencies] })),
    ).toEqual([]);
  });
});
