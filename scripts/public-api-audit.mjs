/**
 * Public API discovery, backed by the installed TypeScript compiler rather than
 * name/regex guesses. The root barrel remains the contract. No "unused" finding
 * is permission to remove an export: unobserved consumers remain unobserved.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { renderMigration } from './lib/api-migration.mjs';

const root = process.cwd();
const packageName = '@pieai/swimmer-ui-kit';
const inventoryPath = 'docs/reference/public-api-inventory.md';
// Ownership follows the exporting module and its implementation, not the name
// of an individual symbol. Types inherit their API's audience, not a new tier.
const families = {
  './controls/LiquidMetalButton/': ['Decision-only effect', 'Separate metal CTA and WebGL budget'],
  './controls/': ['Controls', 'Native actions, selection and labelled form controls'],
  './feedback/': ['Feedback', 'Status, progress, help and non-modal notices'],
  './containers/': ['Containers', 'Panels, dialogs, shells and action compositions'],
  './game/construction/': ['Specialized compositions', 'Construction-job UI; no job execution'],
  './game/terrain/': ['Specialized compositions', 'Terrain/build UI; no terrain runtime'],
  './game/assets/': ['Specialized compositions', 'Asset library presentation; no asset service'],
  './game/audio/': ['Host integration', 'Opt-in sound; host owns settings'],
  './game/': ['Game display', 'Cards, avatars, opening screens and game compositions'],
  './liquid-effects/': ['Advanced liquid support', 'Optional effects and their supporting types'],
  './liquid/': ['Liquid primitives', 'Decorative bodies, motion, material and resource limits'],
  './tokens/': ['Theme integration', 'Token mirrors and theme contract'],
  './icons/': ['Asset integration', 'Asset setup, catalogs and resolution'],
  './preview/': ['Showcase support', 'Optional catalog and preview data; not product state'],
};
const familyOwners = Object.entries(families).sort(([a], [b]) => b.length - a.length);

const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const entry = program.getSourceFile(path.join(root, 'src/index.ts'));
if (!entry) throw new Error('src/index.ts was not loaded');
const dereference = (symbol) =>
  symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
const exports = checker.getExportsOfModule(checker.getSymbolAtLocation(entry));
const rows = [];
const symbols = new Map();
for (const statement of entry.statements) {
  if (!ts.isExportDeclaration(statement) || !statement.exportClause) continue;
  if (!ts.isNamedExports(statement.exportClause)) throw new Error('Review new export shape');
  const module = statement.moduleSpecifier.text;
  const familyOwner = familyOwners.find(([prefix]) => module.startsWith(prefix));
  const family = familyOwner?.[1];
  if (!family) throw new Error(`Classify the new public owner: ${module}`);
  for (const element of statement.exportClause.elements) {
    const symbol = dereference(checker.getSymbolAtLocation(element.name));
    if (!symbol?.declarations?.length) throw new Error(`Unresolved export: ${element.name.text}`);
    const declaration = symbol.declarations[0];
    const source = declaration.getSourceFile();
    const row = {
      name: element.name.text,
      kind: element.isTypeOnly || statement.isTypeOnly ? 'type' : 'value',
      module,
      owner: familyOwner[0],
      family: family[0],
      audience: family[1],
      declaration: `${path.relative(root, source.fileName)}:${source.getLineAndCharacterOfPosition(declaration.getStart()).line + 1}`,
      references: [],
      consumerImports: [],
    };
    rows.push(row);
    const aliases = symbols.get(symbol) ?? [];
    aliases.push(row);
    symbols.set(symbol, aliases);
  }
}
if (rows.length !== exports.length)
  throw new Error('Inventory does not cover all compiler exports');
const skipReference = (node, symbol) => {
  if (symbol.declarations?.some((declaration) => declaration.name === node)) return true;
  for (
    let ancestor = node.parent;
    ancestor && !ts.isSourceFile(ancestor);
    ancestor = ancestor.parent
  ) {
    if (ts.isImportDeclaration(ancestor) || ts.isExportDeclaration(ancestor)) return true;
  }
  return false;
};
// The inventory/check contract depends on declarations, not internal usage.
// Resolve every use site only for the explicit evidence report; doing this on
// every verify needlessly type-checks the entire preview implementation again.
for (const source of process.argv.includes('--evidence') ? program.getSourceFiles() : []) {
  const file = path.relative(root, source.fileName);
  if (source.isDeclarationFile || source === entry || !/^(src|preview)\//.test(file)) continue;
  const visit = (node) => {
    if (ts.isIdentifier(node)) {
      const symbol = dereference(checker.getSymbolAtLocation(node));
      const matches = symbols.get(symbol);
      if (matches && !skipReference(node, symbol)) {
        const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        for (const row of matches) row.references.push(`${file}:${line}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

const args = process.argv.slice(2);
const argument = (flag) => {
  const index = args.indexOf(flag);
  if (index < 0) return undefined;
  if (!args[index + 1] || args[index + 1].startsWith('--'))
    throw new Error(`${flag} needs a value`);
  return args[index + 1];
};
const consumerRoot = argument('--consumer');
const unknownConsumerAccess = [];
let consumerCommit = null;
if (consumerRoot) {
  consumerCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: consumerRoot,
    encoding: 'utf8',
  }).trim();
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: consumerRoot, encoding: 'utf8' })
    .split('\0')
    .filter((file) => /\.[cm]?[jt]sx?$/.test(file));
  const byName = new Map(rows.map((row) => [row.name, row]));
  for (const file of files) {
    const source = ts.createSourceFile(
      file,
      readFileSync(path.join(consumerRoot, file), 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const record = (name, node) => {
      const location = `${file}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`;
      const row = byName.get(name);
      if (row) row.consumerImports.push(location);
      else unknownConsumerAccess.push(`${location} unclassified access: ${name}`);
    };
    const visit = (node) => {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier?.text === packageName
      ) {
        const bindings = ts.isImportDeclaration(node)
          ? node.importClause?.namedBindings
          : node.exportClause;
        if (bindings && (ts.isNamedImports(bindings) || ts.isNamedExports(bindings))) {
          for (const element of bindings.elements)
            record((element.propertyName ?? element.name).text, element);
        } else {
          record('(namespace/default/star: inspect manually)', node);
        }
      }
      if (
        ts.isCallExpression(node) &&
        node.arguments.some((item) => ts.isStringLiteral(item) && item.text === packageName)
      ) {
        record('(dynamic import/require: inspect manually)', node);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
}
for (const row of rows) {
  row.references = [...new Set(row.references)].sort();
  row.consumerImports = [...new Set(row.consumerImports)].sort();
}

const lines = [
  '---',
  'id: REF-PUBLIC-API-INVENTORY',
  'title: Public API Inventory',
  'type: reference',
  'status: active',
  'canonical: true',
  'owner: project',
  'created: 2026-09-11',
  'last_reviewed: 2026-10-01',
  'domain: product',
  'tags:',
  '  - api',
  '  - generated',
  '  - discovery',
  'pinned: false',
  'related:',
  '  - REF-COMPONENT-SELECTION-GUIDE',
  '---',
  '',
  '# Public API Inventory',
  '',
  '<!-- Generated by pnpm api:inventory. Edit source exports / script ownership map, not this table. -->',
  '',
  'Start with the [component selection guide](component-selection-guide.md), not this exhaustive index.',
  '`src/index.ts` is the public membership authority; every name below remains supported.',
  'A supporting helper is not private just because beginners should not start there.',
  'Optional ./preview and ./liquid-effects implementations are outside this root inventory; use their explicit entry declarations.',
  '',
  `Compiler inventory: **${rows.length} named exports: ${rows.filter((row) => row.kind === 'value').length} values and ${rows.filter((row) => row.kind === 'type').length} types**.`,
  '',
];
const documentedNames = new Set();
for (const [module, [family, audience]] of Object.entries(families)) {
  const members = rows.filter((item) => item.owner === module);
  if (members.length === 0) continue;
  lines.push(
    `## ${module.slice(2)} — ${family}`,
    '',
    audience,
    '',
    '| Export | Kind | Definition |',
    '| --- | --- | --- |',
  );
  for (const row of members) {
    if (documentedNames.has(row.name)) throw new Error(`Duplicate inventory row: ${row.name}`);
    documentedNames.add(row.name);
    const file = row.declaration.replace(/:\d+$/, '');
    lines.push(`| \`${row.name}\` | ${row.kind} | [source](../../${file}) |`);
  }
  lines.push('');
}
if (documentedNames.size !== rows.length)
  throw new Error('Rendered inventory does not document every compiler export exactly once');
const inventory = lines.join('\n');
const migration = renderMigration(rows);
const migrationPath = 'docs/reference/migration-3.0.md';
if (args.includes('--check')) {
  if (readFileSync(inventoryPath, 'utf8') !== inventory)
    throw new Error('Public API inventory drift: run pnpm api:inventory');
  if (readFileSync(migrationPath, 'utf8') !== migration)
    throw new Error('Migration coverage drift: run pnpm api:inventory');
} else if (args.includes('--write')) {
  writeFileSync(inventoryPath, inventory);
  writeFileSync(migrationPath, migration);
}
const evidencePath = argument('--evidence');
if (evidencePath) {
  const resolved = path.resolve(root, evidencePath);
  if (!resolved.startsWith(`${root}/.scratch/`))
    throw new Error('Evidence must stay under this repository .scratch/');
  mkdirSync(path.dirname(resolved), { recursive: true });
  writeFileSync(
    resolved,
    `${JSON.stringify(
      {
        baselineCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
        consumer: consumerRoot ? path.basename(consumerRoot) : null,
        consumerCommit,
        scope:
          'Compiler-resolved local symbol references; tracked consumer named imports/re-exports, including aliases. Consumer imports are reachability evidence, not runtime invocation counts. Dynamic/namespace access is reported, not guessed. Other repositories, untracked files and external consumers are not observed.',
        unknownConsumerAccess,
        exports: rows,
      },
      null,
      2,
    )}\n`,
  );
}
console.log(
  JSON.stringify(
    {
      exports: rows.length,
      values: rows.filter((row) => row.kind === 'value').length,
      types: rows.filter((row) => row.kind === 'type').length,
      observedConsumerExports: rows.filter((row) => row.consumerImports.length).length,
      unknownConsumerAccess,
    },
    null,
    2,
  ),
);
