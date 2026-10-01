/*
 * Game panel system: collapsible panels, minimizable/maximizable windows, and
 * a real modal built on the native <dialog> element. Zero runtime deps —
 * the browser provides focus trap, Esc, top layer, and backdrop for modals;
 * CSS grid-row interpolation provides height animation everywhere.
 */

export function joinClasses(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
