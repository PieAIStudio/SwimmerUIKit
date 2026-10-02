/** Migration diagnostic only. This module never applies a theme or supplies a fallback. */
export function stripSourceComments(text) {
  let result = '',
    quote = '',
    mode = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i],
      next = text[i + 1];
    if (mode === 'line') {
      result += ch === '\n' ? '\n' : ' ';
      if (ch === '\n') mode = '';
    } else if (mode === 'block') {
      if (ch === '*' && next === '/') {
        result += '  ';
        i++;
        mode = '';
      } else result += ch === '\n' ? '\n' : ' ';
    } else if (quote) {
      result += ch;
      if (ch === '\\' && next !== undefined) {
        result += next;
        i++;
      } else if (ch === quote) quote = '';
    } else if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      result += ch;
    } else if (ch === '/' && (next === '/' || next === '*')) {
      mode = next === '/' ? 'line' : 'block';
      result += '  ';
      i++;
    } else result += ch;
  }
  return result;
}

export function findRetiredThemeValues(text) {
  // Preserve character offsets while making quoted CSS selectors inside JS
  // strings readable. Quotes need not share a delimiter with their JS host.
  const code = stripSourceComments(text).replace(/\\(?=['"`])/g, ' ');
  const patterns = [
    /data-game-ui-theme\s*=\s*['"`]?\s*night\s*['"`]?/g,
    /data-game-ui-theme\s*=\s*\{[^}]*?['"`]night['"`][^}]*\}/g,
    /['"`]data-game-ui-theme['"`]\s*:\s*['"`]night['"`]/g,
    /\bsetAttribute\s*\(\s*['"`]data-game-ui-theme['"`]\s*,\s*['"`]night['"`]/g,
    /\b(?:dataset\s*\.\s*gameUiTheme|dataset\s*\[\s*['"`]gameUiTheme['"`]\s*\])\s*=\s*['"`]night['"`]/g,
    /\bgameUiTheme\s*:\s*['"`]night['"`]/g,
  ];
  const matches = new Map();
  for (const pattern of patterns)
    for (const match of code.matchAll(pattern)) {
      const line = code.slice(0, match.index).split('\n').length;
      matches.set(line, {
        line,
        message: 'data-game-ui-theme="night" 已在 3.0 删除；请改成 data-game-ui-theme="dark"。',
      });
    }
  return [...matches.values()].sort((a, b) => a.line - b.line);
}
