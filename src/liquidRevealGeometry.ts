/** Only decoration moves. Neither text layout nor the native hit area uses this path. */
export function liquidRevealContour(w: number, h: number, input: boolean, phase = 0) {
  const r = Math.max(0, Math.min(28, h / 2 - 6, w / 2 - 6));
  const wave = input ? Math.sin(phase) * 1.5 : 3 + Math.sin(phase) * 3;
  return `M ${w - 6} ${h - r - 6} Q ${w - 4} ${h - 5} ${w - r - 6} ${h - 6} C ${w * 0.66} ${h - 6 - wave} ${w * 0.3} ${h - 6 + wave} ${r + 6} ${h - 6} Q 5 ${h - 4} 6 ${h - r - 6} C ${6 + wave} ${h * 0.67} ${6 - wave} ${h * 0.3} 6 ${r + 6} Q 4 5 ${r + 6} 6 C ${w * 0.34} ${6 - wave} ${w * 0.66} ${6 + wave} ${w - r - 6} 6 Q ${w - 5} 4 ${w - 6} ${r + 6} C ${w - 6 - wave} ${h * 0.3} ${w - 6 + wave} ${h * 0.67} ${w - 6} ${h - r - 6} Z`;
}
