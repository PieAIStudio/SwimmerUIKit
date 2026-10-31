import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ToolWindow, TOOL_WORLDS, type ToolWorld } from './ToolWindow';

const windowCss = readFileSync('src/containers/ToolWindow/component.css', 'utf8');
const themeCss = readFileSync('src/tokens/theme.css', 'utf8');
const WORLD_SLOTS = ['c1', 'c2', 'c3', 'acc', 'gem1', 'gem2'] as const;

function block(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return '';
  return css.slice(start, css.indexOf('}', start));
}

describe('Colour Worlds list', () => {
  it('has eight unique worlds with violet as the default', () => {
    expect(TOOL_WORLDS).toHaveLength(8);
    expect(new Set(TOOL_WORLDS).size).toBe(TOOL_WORLDS.length);
    expect(renderToStaticMarkup(<ToolWindow title="T">x</ToolWindow>)).toContain(
      'data-tool-world="violet"',
    );
  });

  it('declares every colour slot of every world in theme.css', () => {
    for (const world of TOOL_WORLDS) {
      for (const slot of WORLD_SLOTS) {
        expect(themeCss, `${world} ${slot}`).toMatch(
          new RegExp(`--swimmer-world-${world}-${slot}:\\s*[^;]+;`),
        );
      }
    }
  });

  it('maps every world to its own palette in the window CSS', () => {
    const base = block(windowCss, '.game-ui-tool-window');
    for (const slot of WORLD_SLOTS) {
      expect(base).toContain(`--swimmer-tool-${slot}: var(--swimmer-world-violet-${slot});`);
    }
    for (const world of TOOL_WORLDS.filter((name) => name !== 'violet')) {
      const rules = block(windowCss, `.game-ui-tool-window[data-tool-world='${world}']`);
      expect(rules, world).not.toBe('');
      for (const slot of WORLD_SLOTS) {
        expect(rules, `${world} ${slot}`).toContain(
          `--swimmer-tool-${slot}: var(--swimmer-world-${world}-${slot});`,
        );
      }
    }
  });
});

describe('ToolWindow', () => {
  it('flags known worlds and leaves an unknown world unflagged', () => {
    const known = renderToStaticMarkup(
      <ToolWindow title="Mail" world="teal">
        x
      </ToolWindow>,
    );
    expect(known).toContain('data-tool-world="teal"');
    expect(known).toContain('data-tool-world-known="true"');

    const unknown = renderToStaticMarkup(
      <ToolWindow title="Mail" world={'sepia' as ToolWorld}>
        x
      </ToolWindow>,
    );
    expect(unknown).toContain('data-tool-world="sepia"');
    expect(unknown).not.toContain('data-tool-world-known');
  });

  it('names the window and its sidebar from the title and passes host attributes', () => {
    const html = renderToStaticMarkup(
      <ToolWindow className="host" data-testid="w" reducedMotion sidebar={<b>nav</b>} title="Sync">
        <p>main</p>
      </ToolWindow>,
    );
    expect(html).toContain('aria-label="Sync"');
    expect(html).toContain('aria-label="Sync navigation"');
    expect(html).toContain('class="game-ui-tool-window host"');
    expect(html).toContain('data-testid="w"');
    expect(html).toContain('data-reduced-motion="true"');
    expect(html).toContain('data-tool-sidebar-mode="normal"');
    expect(html).toContain('<div class="game-ui-tool-window-main"><p>main</p></div>');
  });

  it('renders no sidebar landmark when no sidebar is given', () => {
    const html = renderToStaticMarkup(<ToolWindow title="Sync">x</ToolWindow>);
    expect(html).not.toContain('<aside');
    expect(html).not.toContain('data-reduced-motion');
  });
});
