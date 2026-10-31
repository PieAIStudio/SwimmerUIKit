import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Tabs, type TabItem } from './Tabs';
import '../../styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

async function key(target: Element, name: string): Promise<KeyboardEvent> {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: name });
  await act(async () => target.dispatchEvent(event));
  return event;
}

const TABS: readonly TabItem[] = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
  { id: 'c', label: 'C' },
];

function ControlledTabs({
  orientation = 'horizontal',
}: {
  orientation?: 'horizontal' | 'vertical';
}) {
  const [active, setActive] = useState('a');
  return (
    <Tabs activeId={active} id="t" onSelect={setActive} orientation={orientation} tabs={TABS} />
  );
}

function tab(id: string): HTMLButtonElement {
  return host.querySelector<HTMLButtonElement>(`#t-${id}`)!;
}

describe('Tabs keyboard', () => {
  it('moves selection and focus with arrows, wrapping, Home and End', async () => {
    await act(async () => root.render(<ControlledTabs />));
    tab('a').focus();
    await key(tab('a'), 'ArrowLeft');
    expect(document.activeElement).toBe(tab('c'));
    expect(tab('c').getAttribute('aria-selected')).toBe('true');
    expect(tab('c').tabIndex).toBe(0);
    await key(tab('c'), 'ArrowRight');
    expect(document.activeElement).toBe(tab('a'));
    await key(tab('a'), 'End');
    expect(document.activeElement).toBe(tab('c'));
    await key(tab('c'), 'Home');
    expect(document.activeElement).toBe(tab('a'));
    expect(tab('a').getAttribute('aria-selected')).toBe('true');
  });

  it('uses up and down, not left and right, when vertical', async () => {
    await act(async () => root.render(<ControlledTabs orientation="vertical" />));
    tab('a').focus();
    expect((await key(tab('a'), 'ArrowRight')).defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(tab('a'));
    await key(tab('a'), 'ArrowDown');
    expect(document.activeElement).toBe(tab('b'));
    await key(tab('b'), 'ArrowUp');
    expect(document.activeElement).toBe(tab('a'));
  });
});
