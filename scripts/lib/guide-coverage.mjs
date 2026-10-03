/** The generated root inventory owns membership; the guide owns when to use it. */
export function checkGuideCoverage(inventory, guide) {
  const names = [...inventory.matchAll(/^\| `([^`]+)` \| value \|/gm)].map((match) => match[1]);
  if (!names.length) throw new Error('API inventory has no public values');
  const explained = new Set(
    [...guide.matchAll(/^\| `([^`]+)` \| [^|\n]+ \|/gm)].map((match) => match[1]),
  );
  const missing = names.filter((name) => !explained.has(name));
  if (missing.length)
    throw new Error(`Selection guide missing public values: ${missing.join(', ')}`);
  return names.length;
}
