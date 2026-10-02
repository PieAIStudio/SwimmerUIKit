/** Appearance and illumination are independent host choices, not component variants. */
export const GAME_UI_STYLES = ['candy', 'pastel', 'mist', 'grey', 'outline', 'ink'] as const;
export type GameUiStyle = (typeof GAME_UI_STYLES)[number];
export type GameUiTheme = 'light' | 'dark';
export const GAME_UI_DEFAULT_STYLE: GameUiStyle = 'pastel';
