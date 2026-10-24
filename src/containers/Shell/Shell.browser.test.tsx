import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Button } from '../../controls/Button/Button';
import { PageSurface } from '../PageSurface/PageSurface';
import { Shell } from './Shell';
import '../../styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let host: HTMLDivElement | undefined;

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
});

async function mount(node: ReactNode): Promise<HTMLDivElement> {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(node));
  return host;
}

function SmokeSurface({
  reducedMotion,
  theme,
  layout,
}: {
  reducedMotion?: boolean;
  theme?: 'dark' | 'light';
  layout?: 'desktop' | 'mobile';
}): ReactNode {
  return (
    <div data-game-ui-theme={theme === 'dark' ? 'dark' : undefined} style={{ minHeight: '100vh' }}>
      <Shell
        {...(layout ? { layout } : {})}
        mobileNav={
          <nav aria-label="Mobile pages">
            <button type="button">Home</button>
          </nav>
        }
        platform="mac"
        {...(reducedMotion === undefined ? {} : { reducedMotion })}
        sidebar={
          <nav aria-label="Pages">
            <button type="button">Home</button>
          </nav>
        }
        title="Tool smoke"
        windowBar={<span>Workspace</span>}
      >
        <PageSurface
          description="Static cards and host-owned content."
          primaryAction={<Button variant="primary">Continue</Button>}
          title="Smoke page"
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <p>Host content</p>
            <Button>Secondary</Button>
          </div>
        </PageSurface>
      </Shell>
    </div>
  );
}

describe('tool shell representative browser smoke', () => {
  it.each([
    { name: 'desktop light', theme: 'light' as const },
    { name: 'desktop dark', theme: 'dark' as const },
    { name: 'narrow reduced-motion', layout: 'mobile' as const, reducedMotion: true },
  ])('$name keeps the shell usable', async (fixture) => {
    const container = await mount(<SmokeSurface {...fixture} />);
    const shell = container.querySelector('.game-ui-shell') as HTMLElement;
    expect(shell).not.toBeNull();
    expect(shell.dataset.toolShell).toBe('true');
    expect(shell.querySelector('.game-ui-page-surface')).not.toBeNull();
    expect(shell.querySelectorAll('[data-game-ui-cta="true"]')).toHaveLength(1);
    expect(document.documentElement.scrollWidth <= document.documentElement.clientWidth).toBe(true);

    if (fixture.reducedMotion) {
      expect(shell.dataset.reducedMotion).toBe('true');
      expect(shell.dataset.layout).toBe('mobile');
    }

    const focusTarget = shell.querySelector('[data-game-ui-cta="true"]');
    expect(focusTarget).not.toBeNull();
    await act(async () => {
      await userEvent.click(focusTarget!);
    });
    expect(document.activeElement).toBe(focusTarget);
  });
});
