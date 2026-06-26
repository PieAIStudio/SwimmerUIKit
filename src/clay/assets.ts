export const CLAY_ASSET_BASE_PATH = '/assets/game/ui/clay/phase03-clay-kit' as const;

const A = (relativePath: string): string => `${CLAY_ASSET_BASE_PATH}/${relativePath}`;

/**
 * Clay icons ship in two visual families, and which one you use is a deliberate
 * design choice:
 *
 * - 'game'  — the colorful, sculpted clay objects under `icons/common/*`
 *             (crown, scroll, trophy, key…). This is the primary, on-brand look
 *             and the default everywhere. Use it for anything the player sees.
 * - 'line'  — the flat, white, monochrome glyphs under `icons/function/*`
 *             (home, compass, chat…). This is the alternate/utility family for
 *             dense toolbars or places a sculpted object would feel too heavy.
 *
 * Not every semantic icon exists in both families: the game family is a curated
 * set of ~45 sculpted objects, while the line family covers ~230 generic UI
 * concepts. `getClayIconStyles()` reports which families a given icon has, and
 * resolution always prefers 'game' so cards get the on-brand look by default.
 */
export type ClayIconStyle = 'game' | 'line';

interface ClayIconVariants {
  /** Colorful sculpted clay object (icons/common/*). Primary, on-brand. */
  game?: string;
  /** Flat white monochrome glyph (icons/function/*). Alternate/utility. */
  line?: string;
}

export const CLAY_ICON_VARIANTS = {
  ai: { line: A('icons/function/brain-v1.png') },
  alert: { game: A('components/common/alert-v1.png'), line: A('icons/function/warning-v1.png') },
  card: { line: A('icons/function/card-v1.png') },
  chat: { line: A('icons/function/chat-v1.png') },
  check: { line: A('icons/function/check-v1.png') },
  close: { game: A('components/language/button-close-v1.png'), line: A('icons/function/cancel-v1.png') },
  compass: { line: A('icons/function/compass-v1.png') },
  copy: { line: A('icons/function/copy-v1.png') },
  crown: { game: A('icons/common/crown-v1.png'), line: A('icons/function/crown-v1.png') },
  energy: { game: A('icons/common/energy-v1.png'), line: A('icons/function/energy-v1.png') },
  globe: { line: A('icons/function/globe-v1.png') },
  history: { line: A('icons/function/list-v1.png') },
  home: { line: A('icons/function/home-v1.png') },
  lock: { game: A('icons/common/lock-v1.png'), line: A('icons/function/lock-v1.png') },
  mobile: { line: A('icons/function/mobile-v1.png') },
  // Portal/Tavern entry: the game family has no compass, so the on-brand
  // default is the sculpted key ("enter a code / unlock a table"). The flat
  // compass stays available as the line alternate.
  portal: { game: A('icons/common/key-v1.png'), line: A('icons/function/compass-v1.png') },
  scroll: { game: A('icons/common/scroll-v1.png'), line: A('icons/function/list-v1.png') },
  settings: { game: A('icons/common/setting-v1.png'), line: A('icons/function/setting-1-v1.png') },
  shirt: { line: A('icons/function/user-v1.png') },
  smile: { line: A('icons/function/emoji-good-v1.png') },
  timer: { game: A('icons/common/timer-v1.png'), line: A('icons/function/stopwatch-v1.png') },
  trophy: { game: A('icons/common/trophy-v1.png'), line: A('icons/function/trophy-v1.png') },
  vote: { game: A('icons/common/target-v1.png'), line: A('icons/function/target-v1.png') },
} satisfies Record<string, ClayIconVariants>;

export type ClayIconName = keyof typeof CLAY_ICON_VARIANTS;

export const CLAY_ICON_NAMES = Object.keys(CLAY_ICON_VARIANTS) as ClayIconName[];

function resolveVariant(icon: ClayIconName, style?: ClayIconStyle): string {
  const variants: ClayIconVariants = CLAY_ICON_VARIANTS[icon];
  if (style === 'line') return variants.line ?? variants.game ?? '';
  if (style === 'game') return variants.game ?? variants.line ?? '';
  // No explicit style: prefer the on-brand game family, fall back to line.
  return variants.game ?? variants.line ?? '';
}

/** Which visual families exist for an icon (in display order: game, then line). */
export function getClayIconStyles(icon: ClayIconName): ClayIconStyle[] {
  const variants: ClayIconVariants = CLAY_ICON_VARIANTS[icon];
  const styles: ClayIconStyle[] = [];
  if (variants.game) styles.push('game');
  if (variants.line) styles.push('line');
  return styles;
}

export const CLAY_ASSETS = {
  buttons: {
    primary: A('buttons/button-brown-large-v2.png'),
    blue: A('buttons/button-blue-large-v2.png'),
    brown: A('buttons/button-brown-large-v2.png'),
    green: A('buttons/button-green-large-v2.png'),
    purple: A('buttons/button-purple-large-v2.png'),
    red: A('buttons/button-red-large-v2.png'),
  },
  panels: {
    popup: A('components/popup/popup-v1.png'),
    commonTitle: A('components/settings/common-popup-title-v1.png'),
    language: A('components/language/language-v1.png'),
  },
  controls: {
    switchOn: A('components/common/switch-on-v1.png'),
    switchOff: A('components/common/switch-off-v1.png'),
    slider: A('components/settings/slidebar-v1.png'),
    tabSelected: A('components/common/tab-s-v1.png'),
    tabNormal: A('components/common/tab-n-v1.png'),
  },
  // The default (game-preferred) path for every semantic icon, derived from the
  // variant table above so there is a single source of truth.
  icons: Object.fromEntries(CLAY_ICON_NAMES.map((name) => [name, resolveVariant(name)])) as Record<ClayIconName, string>,
  catalog: {
    manifest: '/assets/game/ui/clay/asset-manifest.json',
    sourceCatalog: A('catalog/phase03-clay-ui-catalog.json'),
    contactSheetCommon: A('catalog/common-icons-contact-sheet-v1.png'),
    contactSheetComponents: A('catalog/component-candidates-contact-sheet-v1.png'),
    contactSheetFunction: A('catalog/function-icons-contact-sheet-v1.png'),
  },
};

export type ClayAssetGroup = keyof typeof CLAY_ASSETS;

const INLINE_ICON_LABELS: Record<ClayIconName, string> = {
  ai: 'AI',
  alert: '!',
  card: '▣',
  chat: '··',
  check: '✓',
  close: '×',
  compass: '⌖',
  copy: '⧉',
  crown: '♛',
  energy: 'ϟ',
  globe: '◎',
  history: '≡',
  home: '⌂',
  lock: '⌘',
  mobile: '▯',
  portal: '◇',
  scroll: '☰',
  settings: '⚙',
  shirt: '◔',
  smile: '☺',
  timer: '◷',
  trophy: '★',
  vote: '⌾',
};

const INLINE_ICON_ACCENTS: Record<ClayIconName, string> = {
  ai: '#9b6dd6',
  alert: '#d85a45',
  card: '#f2b35c',
  chat: '#5ca6d8',
  check: '#4f9d6b',
  close: '#d85a45',
  compass: '#1d9a8b',
  copy: '#6c4f38',
  crown: '#f2b35c',
  energy: '#e8743b',
  globe: '#1d9a8b',
  history: '#7b6652',
  home: '#6c4f38',
  lock: '#3b2d23',
  mobile: '#5ca6d8',
  portal: '#1d9a8b',
  scroll: '#9b6dd6',
  settings: '#7b6652',
  shirt: '#5ca6d8',
  smile: '#f2b35c',
  timer: '#e8743b',
  trophy: '#f2b35c',
  vote: '#d85a45',
};

function inlineClayIcon(icon: ClayIconName): string {
  const label = INLINE_ICON_LABELS[icon];
  const accent = INLINE_ICON_ACCENTS[icon];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#4c341c" flood-opacity=".22"/></filter></defs><rect x="10" y="8" width="76" height="76" rx="25" fill="#fff8ec" filter="url(#s)"/><circle cx="48" cy="46" r="28" fill="${accent}" opacity=".88"/><path d="M23 28c10-12 36-16 52 0" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".38"/><text x="48" y="58" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="900" fill="#fff8ec">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export type ClayAssetMode = 'inline' | 'source';

let clayAssetMode: ClayAssetMode = 'inline';

/**
 * Switch how clay icons resolve globally.
 * - 'inline' (default): zero-dependency SVG placeholders, no assets required.
 * - 'source': the real clay game-icon PNG paths under CLAY_ASSET_BASE_PATH.
 *   The host app must serve those assets (e.g. copy them into its public/).
 */
export function setClayAssetMode(mode: ClayAssetMode): void {
  clayAssetMode = mode;
}

export function getClayAssetMode(): ClayAssetMode {
  return clayAssetMode;
}

export interface ClayIconResolveOptions {
  /** Force a specific visual family. Defaults to game-preferred resolution. */
  style?: ClayIconStyle;
  /** Force inline SVG placeholder (true) or real PNG path (false). */
  inline?: boolean;
}

export function getClayIconPath(icon: ClayIconName, options: ClayIconResolveOptions = {}): string {
  const inline = options.inline ?? (clayAssetMode === 'inline');
  if (inline) return inlineClayIcon(icon);
  return resolveVariant(icon, options.style);
}

export function getClaySourceAssetPath(icon: ClayIconName, style?: ClayIconStyle): string {
  return resolveVariant(icon, style);
}
