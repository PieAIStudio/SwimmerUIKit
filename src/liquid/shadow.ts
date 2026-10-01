/** Parse the useful subset of CSS box-shadow syntax for SVG and compositor shadows. */

export interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

export interface StrokeLayer {
  width: number;
  color: string;
}

function splitTop(value: string, separator: ',' | ' '): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of value) {
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    if (depth === 0 && (separator === ',' ? char === ',' : /\s/.test(char))) {
      if (current.trim()) parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

const LENGTH = /^[+-]?(\d+\.?\d*|\.\d+)(px)?$/;

export function parseShadow(input?: string | null): ShadowLayer[] {
  if (!input || input.trim() === '' || input.trim() === 'none') return [];
  const output: ShadowLayer[] = [];
  for (const layer of splitTop(input, ',')) {
    const tokens = splitTop(layer, ' ');
    const inset = tokens.includes('inset');
    const numbers: number[] = [];
    const colorParts: string[] = [];
    for (const token of tokens) {
      if (token === 'inset') continue;
      if (numbers.length < 4 && LENGTH.test(token)) numbers.push(parseFloat(token));
      else colorParts.push(token);
    }
    const [x = 0, y = 0, blur = 0, spread = 0] = numbers;
    output.push({
      x,
      y,
      blur,
      spread,
      color: colorParts.join(' ') || 'var(--game-ui-shadow-color, transparent)',
      inset,
    });
  }
  return output;
}

export function parseStroke(input?: string | null): StrokeLayer | null {
  if (!input || input.trim() === '' || input.trim() === 'none') return null;
  const tokens = splitTop(input, ' ');
  let width = 0;
  const colorParts: string[] = [];
  for (const token of tokens) {
    if (token === 'solid') continue;
    if (width === 0 && LENGTH.test(token)) width = parseFloat(token);
    else colorParts.push(token);
  }
  return {
    width,
    color: colorParts.join(' ') || 'var(--game-ui-stroke, transparent)',
  };
}

/**
 * Outer shadows without spread are CSS `drop-shadow()` on the compositor.
 * Inset and spread stay in the SVG filter: CSS cannot express them, and they
 * do not carry the large-radius blur that makes SVG rasterisation expensive.
 */
export function isCompositorOuterShadow(shadow: ShadowLayer): boolean {
  return (
    !shadow.inset && shadow.spread === 0 && (shadow.blur > 0 || shadow.x !== 0 || shadow.y !== 0)
  );
}

export function compositorDropShadowFilter(shadows: ShadowLayer[]): string | undefined {
  const parts = shadows
    .filter(isCompositorOuterShadow)
    .map((shadow) => `drop-shadow(${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color})`);
  return parts.length > 0 ? parts.join(' ') : undefined;
}

export function svgFilterShadows(shadows: ShadowLayer[]): ShadowLayer[] {
  return shadows.filter((shadow) => !isCompositorOuterShadow(shadow));
}

/** How far SVG-resident layers (inset / spread) reach outside the silhouette. */
export function shadowExtentOf(shadows: ShadowLayer[]): number {
  return shadows.reduce(
    (extent, shadow) =>
      Math.max(
        extent,
        Math.max(Math.abs(shadow.x), Math.abs(shadow.y)) +
          shadow.blur * 1.5 +
          Math.max(0, shadow.spread),
      ),
    0,
  );
}
