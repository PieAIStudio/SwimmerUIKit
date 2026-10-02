import assert from 'node:assert/strict';

/** Follow all emitted imports, including dynamic ones, rather than just one JS file. */
export function reachableChunks(graph, entry) {
  assert.ok(graph[entry], `Build evidence is missing entry ${entry}`);
  const seen = new Set();
  function visit(file) {
    if (seen.has(file)) return;
    assert.ok(graph[file], `Build evidence is missing internal chunk ${file}`);
    seen.add(file);
    for (const imported of [...graph[file].imports, ...graph[file].dynamicImports]) {
      if (graph[imported]) visit(imported);
      else
        assert.ok(
          !imported.endsWith('.js') || !imported.startsWith('.'),
          `Unresolved emitted import ${imported}`,
        );
    }
  }
  visit(entry);
  return [...seen];
}
