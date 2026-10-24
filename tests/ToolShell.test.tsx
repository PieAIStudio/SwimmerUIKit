import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Button } from '../src/controls/Button/Button';
import { PageSurface } from '../src/containers/PageSurface/PageSurface';
import { Shell } from '../src/containers/Shell/Shell';

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

describe('B3 tool shell', () => {
  it('extends the existing Shell with tool chrome slots and explicit motion/platform state', () => {
    const html = compact(
      renderToStaticMarkup(
        <Shell
          compact
          layout="mobile"
          mobileNav={<nav aria-label="Mobile pages">Pages</nav>}
          platform="windows"
          reducedMotion
          sidebar={<nav aria-label="Pages">Home</nav>}
          title="Tool surface"
          windowBar={<span>Workspace</span>}
        >
          <PageSurface title="Home page">
            <p>Content</p>
          </PageSurface>
        </Shell>,
      ),
    );

    expect(html).toContain('data-tool-shell="true"');
    expect(html).toContain('data-platform="windows"');
    expect(html).toContain('data-density="dense"');
    expect(html).toContain('data-game-ui-density="compact"');
    expect(html).toContain('data-layout="mobile"');
    expect(html).toContain('data-reduced-motion="true"');
    expect(html).toContain('game-ui-shell-sidebar');
    expect(html).toContain('game-ui-shell-window-bar');
    expect(html).toContain('game-ui-shell-mobile-nav');
  });

  it('keeps PageSurface slots labelled and does not invent page state', () => {
    const html = compact(
      renderToStaticMarkup(
        <PageSurface
          aside={<aside>Groups</aside>}
          description="Host-owned copy"
          eyebrow="Review"
          footer={<Button>Back</Button>}
          layout="split"
          primaryAction={<Button variant="primary">Apply</Button>}
          title="Review changes"
        >
          <p>Host content</p>
        </PageSurface>,
      ),
    );

    expect(html).toContain('class="game-ui-page-surface"');
    expect(html).toContain('data-layout="split"');
    expect(html).toContain('aria-labelledby="game-ui-page-surface-');
    expect(html).toContain('<h1 id="game-ui-page-surface-');
    expect(html).toContain('game-ui-page-surface-primary');
    expect(html).toContain('game-ui-page-surface-aside');
    expect(html).toContain('game-ui-page-surface-footer');
    expect(html).toContain('Host content');
  });
});
