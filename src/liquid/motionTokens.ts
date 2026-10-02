import { liquidTokens } from '../tokens/references';

export type MoveTokenKey = keyof typeof liquidTokens;

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function finite(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

export function tokenName(reference: string): string | null {
  const match = /^var\((--[\w-]+)\)$/.exec(reference.trim());
  return match?.[1] ?? null;
}

export function readToken(group: HTMLElement | null, key: MoveTokenKey, fallback: number): number {
  const view = group?.ownerDocument.defaultView;
  const name = tokenName(liquidTokens[key]);
  if (!view || !name) return fallback;
  const raw = view.getComputedStyle(group).getPropertyValue(name);
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function format(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}
