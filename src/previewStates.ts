import type { GameUiHistoryEntry } from './GameHistoryPanel';

export const GAME_UI_PREVIEW_MESSAGES: readonly GameUiHistoryEntry[] = [
  {
    id: 'history-human-long',
    kind: 'human',
    meta: 'Round 2 · public table',
    speaker: 'Mika',
    text: 'This answer feels rehearsed because it names every possibility but never risks a real preference.',
  },
  {
    id: 'history-zh-long',
    kind: 'mystery',
    meta: '第 2 局 · 桌边发言',
    speaker: 'Noa',
    text: '这段回答太顺了，像是在把所有安全选项都摆出来，却故意不留下能被追问的破绽。',
  },
  {
    id: 'history-system',
    kind: 'system',
    meta: 'Reveal soon',
    speaker: 'Table',
    text: 'Three votes are locked. One more read can still change the pact.',
  },
] as const;
