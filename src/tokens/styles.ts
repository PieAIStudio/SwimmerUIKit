/** Appearance and illumination are independent host choices, not component variants. */
export const GAME_UI_STYLES = [
  'candy',
  'pastel',
  'mist',
  'grey',
  'outline',
  'ink',
  'quiet',
] as const;
export type UiStyle = (typeof GAME_UI_STYLES)[number];
export type UiTheme = 'light' | 'dark';
export const GAME_UI_DEFAULT_STYLE: UiStyle = 'pastel';
