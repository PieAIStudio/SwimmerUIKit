import { fileURLToPath } from 'node:url';
import { readCssSource } from '../../scripts/lib/css-source.mjs';

/** Actual component sources, excluding only the separately checked token block. */
export function readComponentStyles(): string {
  return readCssSource(fileURLToPath(new URL('../../src/styles.css', import.meta.url)), {
    exclude: [fileURLToPath(new URL('../../src/tokens/theme.css', import.meta.url))],
  });
}
