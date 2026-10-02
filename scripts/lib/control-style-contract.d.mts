export const STYLE_NAMES: readonly string[];
export const STYLE_SEMANTICS: readonly string[];
export const HUES: readonly string[];
export function inspectControlStyleBlocks(
  css: string,
): Array<{ style: string; mode: string; variables: Record<string, string> }>;
export function contrastRatio(foreground: number[], background: number[]): number;
