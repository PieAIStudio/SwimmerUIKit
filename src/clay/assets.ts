export const CLAY_ASSET_BASE_PATH = '/assets/game/ui/clay/phase03-clay-kit' as const;

export const CLAY_ASSETS = {
  buttons: {
    primary: `${CLAY_ASSET_BASE_PATH}/buttons/button-brown-large-v2.png`,
    blue: `${CLAY_ASSET_BASE_PATH}/buttons/button-blue-large-v2.png`,
    brown: `${CLAY_ASSET_BASE_PATH}/buttons/button-brown-large-v2.png`,
    green: `${CLAY_ASSET_BASE_PATH}/buttons/button-green-large-v2.png`,
    purple: `${CLAY_ASSET_BASE_PATH}/buttons/button-purple-large-v2.png`,
    red: `${CLAY_ASSET_BASE_PATH}/buttons/button-red-large-v2.png`,
  },
  panels: {
    popup: `${CLAY_ASSET_BASE_PATH}/components/popup/popup-v1.png`,
    commonTitle: `${CLAY_ASSET_BASE_PATH}/components/settings/common-popup-title-v1.png`,
    language: `${CLAY_ASSET_BASE_PATH}/components/language/language-v1.png`,
  },
  controls: {
    switchOn: `${CLAY_ASSET_BASE_PATH}/components/common/switch-on-v1.png`,
    switchOff: `${CLAY_ASSET_BASE_PATH}/components/common/switch-off-v1.png`,
    slider: `${CLAY_ASSET_BASE_PATH}/components/settings/slidebar-v1.png`,
    tabSelected: `${CLAY_ASSET_BASE_PATH}/components/common/tab-s-v1.png`,
    tabNormal: `${CLAY_ASSET_BASE_PATH}/components/common/tab-n-v1.png`,
  },
  icons: {
    ai: `${CLAY_ASSET_BASE_PATH}/icons/function/brain-v1.png`,
    alert: `${CLAY_ASSET_BASE_PATH}/components/common/alert-v1.png`,
    card: `${CLAY_ASSET_BASE_PATH}/icons/function/card-v1.png`,
    chat: `${CLAY_ASSET_BASE_PATH}/icons/function/chat-v1.png`,
    check: `${CLAY_ASSET_BASE_PATH}/icons/function/check-v1.png`,
    close: `${CLAY_ASSET_BASE_PATH}/components/language/button-close-v1.png`,
    compass: `${CLAY_ASSET_BASE_PATH}/icons/function/compass-v1.png`,
    copy: `${CLAY_ASSET_BASE_PATH}/icons/function/copy-v1.png`,
    crown: `${CLAY_ASSET_BASE_PATH}/icons/common/crown-v1.png`,
    energy: `${CLAY_ASSET_BASE_PATH}/icons/common/energy-v1.png`,
    globe: `${CLAY_ASSET_BASE_PATH}/icons/function/globe-v1.png`,
    history: `${CLAY_ASSET_BASE_PATH}/icons/function/list-v1.png`,
    home: `${CLAY_ASSET_BASE_PATH}/icons/function/home-v1.png`,
    lock: `${CLAY_ASSET_BASE_PATH}/icons/common/lock-v1.png`,
    mobile: `${CLAY_ASSET_BASE_PATH}/icons/function/mobile-v1.png`,
    portal: `${CLAY_ASSET_BASE_PATH}/icons/function/compass-v1.png`,
    scroll: `${CLAY_ASSET_BASE_PATH}/icons/common/scroll-v1.png`,
    settings: `${CLAY_ASSET_BASE_PATH}/icons/common/setting-v1.png`,
    shirt: `${CLAY_ASSET_BASE_PATH}/icons/function/user-v1.png`,
    smile: `${CLAY_ASSET_BASE_PATH}/icons/function/emoji-good-v1.png`,
    timer: `${CLAY_ASSET_BASE_PATH}/icons/common/timer-v1.png`,
    trophy: `${CLAY_ASSET_BASE_PATH}/icons/common/trophy-v1.png`,
    vote: `${CLAY_ASSET_BASE_PATH}/icons/function/target-v1.png`,
  },
  catalog: {
    manifest: '/assets/game/ui/clay/asset-manifest.json',
    sourceCatalog: `${CLAY_ASSET_BASE_PATH}/catalog/phase03-clay-ui-catalog.json`,
    contactSheetCommon: `${CLAY_ASSET_BASE_PATH}/catalog/common-icons-contact-sheet-v1.png`,
    contactSheetComponents: `${CLAY_ASSET_BASE_PATH}/catalog/component-candidates-contact-sheet-v1.png`,
    contactSheetFunction: `${CLAY_ASSET_BASE_PATH}/catalog/function-icons-contact-sheet-v1.png`,
  },
} as const;

export type ClayAssetGroup = keyof typeof CLAY_ASSETS;
export type ClayIconName = keyof typeof CLAY_ASSETS.icons;

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

export function getClayIconPath(icon: ClayIconName, options: { inline?: boolean } = {}): string {
  if (options.inline ?? true) return inlineClayIcon(icon);
  return CLAY_ASSETS.icons[icon];
}

export function getClaySourceAssetPath(icon: ClayIconName): string {
  return CLAY_ASSETS.icons[icon];
}
