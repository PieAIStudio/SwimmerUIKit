import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { CONTROL_RECIPES, recipeCode } from '../preview/catalog/recipes';

describe('copyable catalog examples', () => {
  it('typechecks every recipe, finish, and advertised state against the actual package API', () => {
    const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
    const files = new Map<string, string>();
    for (const recipe of CONTROL_RECIPES)
      for (const material of ['flat', 'matte', 'glossy'] as const)
        for (const state of ['ready', 'disabled', 'invalid'] as const) {
          files.set(
            path.resolve(`src/__recipe_${recipe.id}_${material}_${state}.tsx`),
            recipeCode({ recipe: recipe.id, material, state }),
          );
        }
    const options = {
      ...parsed.options,
      noEmit: true,
      baseUrl: process.cwd(),
      ignoreDeprecations: '6.0',
      paths: { '@pieai/swimmer-ui-kit': ['src/index.ts'] },
    };
    const host = ts.createCompilerHost(options);
    const read = host.readFile.bind(host),
      exists = host.fileExists.bind(host);
    host.readFile = (file) => files.get(file) ?? read(file);
    host.fileExists = (file) => files.has(file) || exists(file);
    host.getSourceFile = (file, language) => {
      const text = host.readFile(file);
      return text === undefined ? undefined : ts.createSourceFile(file, text, language, true);
    };
    // Same CSS-module environment as an ordinary Vite consumer, not a test-only
    // suppression of side-effect-import diagnostics.
    const program = ts.createProgram(
      [...files.keys(), path.resolve('src/vite-env.d.ts')],
      options,
      host,
    );
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter((item) => !item.file || files.has(item.file.fileName));
    expect(
      diagnostics.map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n')),
    ).toEqual([]);
  }, 20000);
});
