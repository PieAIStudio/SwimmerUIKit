/** Only a moving meniscus, never a gooey filter or a scrolling texture. */
export function progressFrontPath(width: number, ratio: number, wave = 0, padding = 4): string {
  const value = Number.isFinite(ratio) ? Math.min(1, Math.max(0, ratio)) : 0;
  const w = Number.isFinite(width) ? Math.max(1, width) : 1;
  const p = padding,
    bottom = p + 10;
  if (value === 0) return 'M0 0Z';
  if (value === 1) return `M0 0H${w + 2 * p}V${bottom + p}H0Z`;
  const x = p + value * w;
  const curve = Math.min(1.2, value * w * 0.3);
  const movement = Math.min(1.4, Math.max(-1.4, Number.isFinite(wave) ? wave : 0));
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return `M0 0H${round(x)}V${p}C${round(x - curve + movement)} ${p + 2} ${round(x - curve - movement)} ${bottom - 2} ${round(x)} ${bottom}V${bottom + p}H0Z`;
}
