import { CLAY_COLOR_TOKENS } from './tokens';

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
  close: {
    game: A('components/language/button-close-v1.png'),
    line: A('icons/function/cancel-v1.png'),
  },
  coin: { game: A('icons/common/gold-v1.png'), line: A('icons/function/gold-v1.png') },
  compass: { line: A('icons/function/compass-v1.png') },
  copy: { line: A('icons/function/copy-v1.png') },
  crown: { game: A('icons/common/crown-v1.png'), line: A('icons/function/crown-v1.png') },
  energy: { game: A('icons/common/energy-v1.png'), line: A('icons/function/energy-v1.png') },
  gem: { game: A('icons/common/gem-v1.png'), line: A('icons/function/gem-v1.png') },
  gift: { game: A('icons/common/gift-red-v1.png'), line: A('icons/function/gift-v1.png') },
  globe: { line: A('icons/function/globe-v1.png') },
  history: { line: A('icons/function/list-v1.png') },
  home: { line: A('icons/function/home-v1.png') },
  hourglass: {
    game: A('icons/common/sandglass-v1.png'),
    line: A('icons/function/sandglass-v1.png'),
  },
  laurel: { game: A('icons/common/laurel-v1.png') },
  lock: { game: A('icons/common/lock-v1.png'), line: A('icons/function/lock-v1.png') },
  lucky: { game: A('icons/common/lucky-v1.png') },
  mail: { game: A('icons/common/envelope-v1.png'), line: A('icons/function/mail-unread-v1.png') },
  medal: { game: A('icons/common/medal-gold-v1.png'), line: A('icons/function/medal-v1.png') },
  mission: { game: A('icons/common/mission-v1.png') },
  mobile: { line: A('icons/function/mobile-v1.png') },
  // Portal/Tavern entry: the game family has no compass, so the on-brand
  // default is the sculpted key ("enter a code / unlock a table"). The flat
  // compass stays available as the line alternate.
  portal: { game: A('icons/common/key-v1.png'), line: A('icons/function/compass-v1.png') },
  scroll: { game: A('icons/common/scroll-v1.png'), line: A('icons/function/list-v1.png') },
  settings: { game: A('icons/common/setting-v1.png'), line: A('icons/function/setting-1-v1.png') },
  shirt: { line: A('icons/function/user-v1.png') },
  shop: { game: A('icons/common/shop-v1.png'), line: A('icons/function/shop-v1.png') },
  smile: { line: A('icons/function/emoji-good-v1.png') },
  timer: { game: A('icons/common/timer-v1.png'), line: A('icons/function/stopwatch-v1.png') },
  trophy: { game: A('icons/common/trophy-v1.png'), line: A('icons/function/trophy-v1.png') },
  undo: { line: A('icons/function/back-v1.png') },
  redo: { line: A('icons/function/refresh-v1.png') },
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

/**
 * Decorative game-content sprites — sculpted clay objects from the same source
 * pack that read as *game content* (loot, weapons, shields, potions, currency
 * variants) rather than UI affordances. They are deliberately kept OUT of
 * CLAY_ICON_VARIANTS so the semantic icon API stays a clean, product-agnostic UI
 * vocabulary. Reach for these in reward popups, inventories, win screens, or
 * decorative flourishes — never for buttons or toolbars. Game family only; these
 * have no flat line equivalents.
 */
export const CLAY_GAME_SPRITES = {
  anvil: A('icons/common/anvil-v1.png'),
  arrow: A('icons/common/arrow-v1.png'),
  bomb: A('icons/common/bomb-v1.png'),
  candle: A('icons/common/candle-v1.png'),
  chicken: A('icons/common/chicken-v1.png'),
  giftBlue: A('icons/common/gift-blue-v1.png'),
  hammer: A('icons/common/hammer-v1.png'),
  horn: A('icons/common/horner-v1.png'),
  horseshoe: A('icons/common/horseshoes-v1.png'),
  letter: A('icons/common/letter-v1.png'),
  medalBronze: A('icons/common/medal-bronze-v1.png'),
  medalSilver: A('icons/common/medal-silver-v1.png'),
  pickaxe: A('icons/common/pickax-v1.png'),
  potionPurple: A('icons/common/poiton-purple-v1.png'),
  potionRed: A('icons/common/poition-red-v1.png'),
  purpleGem: A('icons/common/purplegem-v1.png'),
  shieldA: A('icons/common/shield-a-v1.png'),
  shieldB: A('icons/common/shield-b-v1.png'),
  shieldC: A('icons/common/shield-c-v1.png'),
  shieldD: A('icons/common/shield-d-v1.png'),
  skull: A('icons/common/skull-v1.png'),
  soulGem: A('icons/common/soulgem-v1.png'),
  swordA: A('icons/common/sword-a-v1.png'),
  swordB: A('icons/common/sword-b-v1.png'),
  talaria: A('icons/common/talaria-v1.png'),
  treasure: A('icons/common/treasure-v1.png'),
} satisfies Record<string, string>;

export type ClayGameSpriteName = keyof typeof CLAY_GAME_SPRITES;

export const CLAY_GAME_SPRITE_NAMES = Object.keys(CLAY_GAME_SPRITES) as ClayGameSpriteName[];

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
  icons: Object.fromEntries(CLAY_ICON_NAMES.map((name) => [name, resolveVariant(name)])) as Record<
    ClayIconName,
    string
  >,
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
  coin: '◉',
  compass: '⌖',
  copy: '⧉',
  crown: '♛',
  energy: 'ϟ',
  gem: '◆',
  gift: '❦',
  globe: '◎',
  history: '≡',
  redo: '↻',
  undo: '↶',
  home: '⌂',
  hourglass: '⧗',
  laurel: '❧',
  lock: '⌘',
  lucky: '✲',
  mail: '✉',
  medal: '✦',
  mission: '❖',
  mobile: '▯',
  portal: '◇',
  scroll: '☰',
  settings: '⚙',
  shirt: '◔',
  shop: '⊞',
  smile: '☺',
  timer: '◷',
  trophy: '★',
  vote: '⌾',
};

/*
 * Inline SVG icons are data URIs, so they cannot read CSS variables at
 * runtime. They therefore reference the TypeScript color constants, which
 * tokens.test.ts keeps in sync with theme.css.
 */
const INLINE_ICON_ACCENTS: Record<ClayIconName, string> = {
  ai: CLAY_COLOR_TOKENS.berry,
  alert: CLAY_COLOR_TOKENS.red,
  card: CLAY_COLOR_TOKENS.honey,
  chat: CLAY_COLOR_TOKENS.sky,
  check: CLAY_COLOR_TOKENS.green,
  close: CLAY_COLOR_TOKENS.red,
  coin: CLAY_COLOR_TOKENS.honey,
  compass: CLAY_COLOR_TOKENS.teal,
  copy: CLAY_COLOR_TOKENS.wood,
  crown: CLAY_COLOR_TOKENS.honey,
  energy: CLAY_COLOR_TOKENS.orange,
  gem: CLAY_COLOR_TOKENS.sky,
  gift: CLAY_COLOR_TOKENS.red,
  globe: CLAY_COLOR_TOKENS.teal,
  history: CLAY_COLOR_TOKENS.inkMuted,
  redo: CLAY_COLOR_TOKENS.wood,
  undo: CLAY_COLOR_TOKENS.wood,
  home: CLAY_COLOR_TOKENS.wood,
  hourglass: CLAY_COLOR_TOKENS.orange,
  laurel: CLAY_COLOR_TOKENS.green,
  lock: CLAY_COLOR_TOKENS.ink,
  lucky: CLAY_COLOR_TOKENS.green,
  mail: CLAY_COLOR_TOKENS.sky,
  medal: CLAY_COLOR_TOKENS.honey,
  mission: CLAY_COLOR_TOKENS.berry,
  mobile: CLAY_COLOR_TOKENS.sky,
  portal: CLAY_COLOR_TOKENS.teal,
  scroll: CLAY_COLOR_TOKENS.berry,
  settings: CLAY_COLOR_TOKENS.inkMuted,
  shirt: CLAY_COLOR_TOKENS.sky,
  shop: CLAY_COLOR_TOKENS.inkMuted,
  smile: CLAY_COLOR_TOKENS.honey,
  timer: CLAY_COLOR_TOKENS.orange,
  trophy: CLAY_COLOR_TOKENS.honey,
  vote: CLAY_COLOR_TOKENS.red,
};

function inlineClayIcon(icon: ClayIconName): string {
  const label = INLINE_ICON_LABELS[icon];
  const accent = INLINE_ICON_ACCENTS[icon];
  const paper = CLAY_COLOR_TOKENS.parchment;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#4c341c" flood-opacity=".22"/></filter></defs><rect x="10" y="8" width="76" height="76" rx="25" fill="${paper}" filter="url(#s)"/><circle cx="48" cy="46" r="28" fill="${accent}" opacity=".88"/><path d="M23 28c10-12 36-16 52 0" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".38"/><text x="48" y="58" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="900" fill="${paper}">${label}</text></svg>`;
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
  const inline = options.inline ?? clayAssetMode === 'inline';
  if (inline) return inlineClayIcon(icon);
  return resolveVariant(icon, options.style);
}

export function getClaySourceAssetPath(icon: ClayIconName, style?: ClayIconStyle): string {
  return resolveVariant(icon, style);
}
