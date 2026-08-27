/** Parse the useful subset of CSS box-shadow syntax for SVG shadow passes. */

export interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
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
