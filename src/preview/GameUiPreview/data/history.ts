import type { GameUiHistoryEntry } from '../../../containers/GameHistoryPanel/GameHistoryPanel';

export const ZH_HISTORY_MESSAGES: readonly GameUiHistoryEntry[] = [
  {
    id: 'history-human-long',
    kind: 'human',
    meta: '第 2 局 · 公开桌',
    speaker: 'Mika',
    text: '这个回答像背稿——把每种可能都点了一遍,却从不押一个真实的偏好。',
  },
  {
    id: 'history-zh-long',
    kind: 'mystery',
    meta: '第 2 局 · 桌边发言',
    speaker: 'Noa',
    text: '这段回答太顺了,像是在把所有安全选项都摆出来,却故意不留下能被追问的破绽。',
  },
  {
    id: 'history-system',
    kind: 'system',
    meta: '即将揭晓',
    speaker: '牌桌',
    text: '三票已锁定。再读一轮,仍可能改写这份密约。',
  },
];
