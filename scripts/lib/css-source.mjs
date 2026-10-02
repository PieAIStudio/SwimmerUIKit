/** Read local CSS imports for source-level guards; never inspect a stale dist. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

export function readCssSource(filename, { exclude = [] } = {}) {
  const skipped = new Set(exclude.map((file) => path.resolve(file)));
  const stack = new Set();
  function read(file) {
    const resolved = path.resolve(file);
    if (skipped.has(resolved)) return '';
    if (stack.has(resolved))
      throw new Error(`CSS import cycle: ${[...stack, resolved].join(' → ')}`);
    stack.add(resolved);
    const root = postcss.parse(readFileSync(resolved, 'utf8'), { from: resolved });
    root.walkAtRules('import', (rule) => {
      const match = /^(['"])(\.[^'"]+)\1$/.exec(rule.params);
      if (!match)
        throw new Error(
          `Expected one local, unconditional CSS import in ${resolved}: ${rule.params}`,
        );
      const imported = read(path.resolve(path.dirname(resolved), match[2]));
      rule.replaceWith(postcss.parse(imported, { from: resolved }).nodes);
    });
    stack.delete(resolved);
    return root.toString();
  }
  return read(filename);
}
