export function sanitizeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function finite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export function resolveCssVariable(
  value: string | undefined,
  element: HTMLElement | null,
): string | undefined {
  if (!value) return value;
  const variable = /^var\((--[\w-]+)\)$/.exec(value.trim());
  if (!variable || !element) return value;
  const view = element.ownerDocument.defaultView;
  if (!view) return value;
  const resolved = view
    .getComputedStyle(element)
    .getPropertyValue(variable[1] ?? '')
    .trim();
  return resolved || value;
}

export function readNumericCssToken(
  value: string,
  element: HTMLElement | null,
  fallback: number,
): number {
  const resolved = resolveCssVariable(value, element);
  const parsed = Number.parseFloat(resolved ?? '');
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function joinClasses(...classes: Array<string | undefined>): string | undefined {
  const result = classes.filter(Boolean).join(' ');
  return result || undefined;
}
