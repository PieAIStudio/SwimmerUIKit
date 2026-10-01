import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameSplash } from './GameSplash';

const LINES = [
  { text: 'Learn how to ask, not just what to ask', highlight: 'how to ask' },
  { text: 'Every lesson is a real example' },
];

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

describe('GameSplash', () => {
  it('lights the highlighted phrase inside its line', () => {
    const html = compact(
      renderToStaticMarkup(
        <GameSplash
          title="University"
          lines={LINES}
          progress={0.4}
          progressLabel="Preparing · 40%"
          ready={false}
        />,
      ),
    );
    expect(html).toContain('<mark class="game-ui-splash-mark">how to ask</mark>');
    expect(html).toContain('Learn ');
  });

  it('tracks real progress and offers entering only when ready', () => {
    const loading = compact(
      renderToStaticMarkup(
        <GameSplash
          title="University"
          lines={LINES}
          progress={0.4}
          progressLabel="Preparing · 40%"
          ready={false}
          startLabel="Tap to start"
          onStart={() => {}}
        />,
      ),
    );
    expect(loading).toContain('aria-valuenow="40"');
    expect(loading).toContain('aria-busy="true"');
    expect(loading).not.toContain('Tap to start');

    const ready = compact(
      renderToStaticMarkup(
        <GameSplash
          title="University"
          lines={LINES}
          progress={1}
          progressLabel="Ready · 100%"
          ready
          startLabel="Tap to start"
          onStart={() => {}}
        />,
      ),
    );
    expect(ready).toContain('Tap to start');
    expect(ready).toContain('aria-busy="false"');
  });

  it('clamps a progress value outside 0–1', () => {
    const html = renderToStaticMarkup(
      <GameSplash title="U" lines={LINES} progress={3} progressLabel="x" ready={false} />,
    );
    expect(html).toContain('aria-valuenow="100"');
    const nan = renderToStaticMarkup(
      <GameSplash title="U" lines={LINES} progress={Number.NaN} progressLabel="x" ready={false} />,
    );
    expect(nan).toContain('aria-valuenow="0"');
  });

  it('shows one line, no title and no button over a scene change', () => {
    const html = compact(
      renderToStaticMarkup(
        <GameSplash
          mode="transition"
          title="University"
          lines={LINES}
          progress={1}
          progressLabel="Ready"
          ready
          startLabel="Tap to start"
          onStart={() => {}}
        />,
      ),
    );
    expect(html).not.toContain('game-ui-splash-title');
    expect(html).not.toContain('Tap to start');
    expect(html).not.toContain('Every lesson is a real example');
  });

  it('never shows the button to an app shell that enters by itself', () => {
    const html = renderToStaticMarkup(
      <GameSplash
        title="University"
        lines={LINES}
        progress={1}
        progressLabel="Ready"
        ready
        autoStart
        startLabel="Tap to start"
        onStart={() => {}}
      />,
    );
    expect(html).not.toContain('Tap to start');
  });
});
