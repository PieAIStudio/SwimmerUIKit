import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { GameHelpCard } from './GameHelpCard';
import { GameButton } from '../../controls/GameButton/GameButton';

it('renders a closed trigger with collapsed state and no card, media or request', () => {
  const html = renderToStaticMarkup(
    <GameHelpCard
      label="怎么用"
      topics={[
        {
          id: 'save',
          label: '保存',
          title: '点一下就保存',
          body: '第一行。\n第二行。',
          media: {
            kind: 'image',
            src: 'help.png',
            alt: '按钮',
            width: 480,
            height: 270,
          },
        },
      ]}
    >
      <GameButton>怎么用</GameButton>
    </GameHelpCard>,
  );
  expect(html).toContain('aria-expanded="false"');
  expect(html).not.toContain('aria-controls');
  expect(html).not.toContain('role="dialog"');
  expect(html).not.toContain('help.png');
  expect(html).not.toContain('点一下就保存');
});

/** A child as React Flight hands it over while its Server Component row is still streaming. */
function lazyChild(element: ReactElement): ReactElement {
  const payload = { status: 'resolved', value: element };
  return {
    $$typeof: Symbol.for('react.lazy'),
    _payload: payload,
    _init: (resolved: typeof payload) => resolved.value,
  } as unknown as ReactElement;
}

const topic = {
  id: 'share',
  label: '分享',
  title: '分享前先检查',
  body: '分享的是当前版本。',
};

it('renders a lazy button or link trigger without throwing, inside the trigger slot', () => {
  const button = renderToStaticMarkup(
    <GameHelpCard label="怎么用" topics={[topic]}>
      {lazyChild(<GameButton>怎么用</GameButton>)}
    </GameHelpCard>,
  );
  expect(button).toContain('class="game-ui-trigger-slot"');
  expect(button).toContain('<button');

  const link = renderToStaticMarkup(
    <GameHelpCard label="怎么用" topics={[topic]}>
      {lazyChild(<a href="/guide">怎么用</a>)}
    </GameHelpCard>,
  );
  expect(link).toContain('class="game-ui-trigger-slot"');
  expect(link).toContain('href="/guide"');
});
