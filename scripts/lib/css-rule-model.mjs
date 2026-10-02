/** Atomic rule membership and per-selector declaration order, independent of file/group order. */
import postcss from 'postcss';
import { transform } from 'lightningcss';

export function cssRuleModel(css) {
  const rules = new Map();
  function visit(nodes, context = []) {
    for (const node of nodes) {
      if (node.type === 'comment') continue;
      if (node.type === 'atrule') {
        if (node.name === 'import') throw new Error('Expand imports before comparing CSS rules');
        const scope = `@${node.name} ${node.params.replace(/\s+/g, ' ').trim()}`;
        if (node.nodes && !node.name.endsWith('keyframes') && node.name !== 'property') {
          visit(node.nodes, [...context, scope]);
        } else {
          const key = JSON.stringify([...context, scope]);
          const existing = rules.get(key) ?? [];
          existing.push(node.toString());
          rules.set(key, existing);
        }
      } else if (node.type === 'rule') {
        for (const selector of node.selectors) {
          const key = JSON.stringify([...context, selector.replace(/\s+/g, ' ').trim()]);
          const existing = rules.get(key) ?? [];
          existing.push(...node.nodes.map((child) => child.toString()));
          rules.set(key, existing);
        }
      } else throw new Error(`Unexpected standalone ${node.type}`);
    }
  }
  visit(postcss.parse(css).nodes);
  return Object.fromEntries(
    [...rules]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, declarations]) => {
        const context = JSON.parse(key);
        const leaf = context.at(-1);
        const source = leaf.startsWith('@')
          ? declarations.join('\n')
          : `.contract { ${declarations.join(';\n')} }`;
        const compiled = transform({
          filename: 'rule.css',
          code: Buffer.from(source),
          minify: true,
        });
        if (compiled.warnings.length) throw new Error(`CSS normalization warning: ${key}`);
        return [key, compiled.code.toString()];
      }),
  );
}
